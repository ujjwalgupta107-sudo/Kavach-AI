import json
import uuid
import re
import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.agent_run import AgentRun, AgentFinding, AgentRunStatus, AgentType
from app.services.agent_tool_service import AgentToolService
from app.core.llm_provider import get_llm_provider, LLMProviderException
from app.core.config import settings
from app.core.agent_prompts import INVESTIGATION_AGENT_SYSTEM_PROMPT

class OrchestratorException(Exception):
    pass

class InvestigationOrchestrator:
    def __init__(self, db: AsyncSession, run_id: uuid.UUID, allow_mock: bool = False):
        self.db = db
        self.run_id = run_id
        self.allow_mock = allow_mock
        self.tool_service = AgentToolService(db)
        
    def _clean_json(self, text: str) -> str:
        """Strip markdown fences to safely parse JSON."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def _parse_and_validate_json(self, raw: str) -> Dict[str, Any]:
        cleaned = self._clean_json(raw)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON. Raw output: {raw[:1000]}")
            raise Exception(f"Failed to parse LLM JSON output: {str(e)}\nRaw output preview: {raw[:200]}")

    def _validate_source_refs(self, refs: List[str], valid_ids: set) -> List[str]:
        """Keep only refs that exist in the context."""
        valid_refs = []
        for ref in refs:
            if ref in valid_ids:
                valid_refs.append(ref)
        return valid_refs

    def _extract_all_ids(self, context: Dict[str, Any]) -> set:
        """Recursively extract all string IDs from context to validate source refs."""
        ids = set()
        if isinstance(context, dict):
            if "id" in context and isinstance(context["id"], str):
                ids.add(context["id"])
            if "cluster_id" in context and isinstance(context["cluster_id"], str):
                ids.add(context["cluster_id"])
            if "case_id" in context and isinstance(context["case_id"], str):
                ids.add(context["case_id"])
            for k, v in context.items():
                ids.update(self._extract_all_ids(v))
        elif isinstance(context, list):
            for item in context:
                ids.update(self._extract_all_ids(item))
        return ids

    async def execute_run(self):
        run = await self.db.get(AgentRun, self.run_id)
        if not run:
            return
            
        try:
            llm = get_llm_provider(allow_mock=self.allow_mock)
            
            # Update provider info on run
            run.provider = settings.AI_PROVIDER
            run.model = settings.AI_MODEL if settings.AI_PROVIDER == "gemini" else settings.OLLAMA_MODEL
            run.status = AgentRunStatus.RUNNING
            run.started_at = datetime.datetime.utcnow()
            await self.db.commit()
            
            # 1. Fetch Full Context
            context = await self.tool_service.build_investigation_context(run.case_id)
            valid_ids = self._extract_all_ids(context)
            
            # 2. Stage 1: Investigation + Network Analysis
            stage1_prompt = json.dumps({
                "case_facts": context["case_facts"],
                "system_signals": context["system_signals"],
                "entities_extracted": context["entities_extracted"],
                "network_context": context["network_context"]
            }, default=str)
            
            stage1_req = (
                "Analyze the provided case facts, signals, entities, and network context. "
                "Output strictly a JSON object with these keys: "
                "executive_case_assessment (string), confirmed_facts (list of strings), "
                "system_signals (list of strings), network_findings (list of strings), "
                "ai_inferences (list of strings), uncertainties (list of strings), source_refs (list of strings)."
            )
            
            stage1_raw = await llm.generate(INVESTIGATION_AGENT_SYSTEM_PROMPT, f"Context:\n{stage1_prompt}\n\nTask:\n{stage1_req}", max_tokens=3000)
            stage1_json = self._parse_and_validate_json(stage1_raw)
            
            # Filter refs
            valid_stage1_refs = self._validate_source_refs(stage1_json.get("source_refs", []), valid_ids)
            
            # Save Stage 1 Findings
            finding_inv = AgentFinding(
                run_id=self.run_id,
                agent_type=AgentType.INVESTIGATION,
                finding_type="case_assessment",
                content=json.dumps({
                    "assessment": stage1_json.get("executive_case_assessment"),
                    "facts": stage1_json.get("confirmed_facts"),
                    "inferences": stage1_json.get("ai_inferences"),
                    "uncertainties": stage1_json.get("uncertainties")
                }),
                source_refs=valid_stage1_refs
            )
            
            finding_net = AgentFinding(
                run_id=self.run_id,
                agent_type=AgentType.NETWORK,
                finding_type="network_analysis",
                content=json.dumps({
                    "network_findings": stage1_json.get("network_findings"),
                    "signals": stage1_json.get("system_signals")
                }),
                source_refs=valid_stage1_refs
            )
            self.db.add(finding_inv)
            self.db.add(finding_net)
            
            # 3. Stage 2: Evidence + Timeline Analysis
            stage2_prompt = json.dumps({
                "case_facts": context["case_facts"],
                "evidence": context["evidence"],
                "timeline": context["timeline"],
                "investigator_notes": context["investigator_notes"],
                "stage1_key_findings": stage1_json.get("executive_case_assessment")
            }, default=str)
            
            stage2_req = (
                "Analyze evidence and timeline. "
                "Output strictly a JSON object with these keys: "
                "chronology_summary (string), evidence_strengths (list of strings), "
                "evidence_gaps (list of strings), contradictions_or_uncertainties (list of strings), "
                "recommended_evidence_actions (list of strings), source_refs (list of strings)."
            )
            
            stage2_raw = await llm.generate(INVESTIGATION_AGENT_SYSTEM_PROMPT, f"Context:\n{stage2_prompt}\n\nTask:\n{stage2_req}", max_tokens=2500)
            stage2_json = self._parse_and_validate_json(stage2_raw)
            valid_stage2_refs = self._validate_source_refs(stage2_json.get("source_refs", []), valid_ids)
            
            finding_evid = AgentFinding(
                run_id=self.run_id,
                agent_type=AgentType.EVIDENCE,
                finding_type="evidence_timeline",
                content=json.dumps({
                    "chronology": stage2_json.get("chronology_summary"),
                    "strengths": stage2_json.get("evidence_strengths"),
                    "gaps": stage2_json.get("evidence_gaps"),
                    "contradictions": stage2_json.get("contradictions_or_uncertainties"),
                    "recommendations": stage2_json.get("recommended_evidence_actions")
                }),
                source_refs=valid_stage2_refs
            )
            self.db.add(finding_evid)
            
            # 4. Stage 3: Supervisor Brief
            stage3_prompt = json.dumps({
                "case_id": str(run.case_id),
                "stage1": stage1_json,
                "stage2": stage2_json
            }, default=str)
            
            stage3_req = (
                "Synthesize Stage 1 and Stage 2 outputs into a final brief. "
                "Output strictly a JSON object with keys: "
                "executive_summary (string), confirmed_facts (list), key_system_signals (list), "
                "network_connections (list), ai_assessment (list), evidence_gaps (list), "
                "recommended_next_actions (list), priority (string), source_refs (list)."
            )
            
            stage3_raw = await llm.generate(INVESTIGATION_AGENT_SYSTEM_PROMPT, f"Context:\n{stage3_prompt}\n\nTask:\n{stage3_req}", max_tokens=3500)
            stage3_json = self._parse_and_validate_json(stage3_raw)
            valid_stage3_refs = self._validate_source_refs(stage3_json.get("source_refs", []), valid_ids)
            stage3_json["source_refs"] = valid_stage3_refs
            
            run.final_brief = stage3_json
            run.status = AgentRunStatus.COMPLETED
            run.completed_at = datetime.datetime.utcnow()
            
            await self.db.commit()

        except LLMProviderException as e:
            await self.db.rollback()
            run.status = AgentRunStatus.FAILED
            run.error_message = str(e)
            run.completed_at = datetime.datetime.utcnow()
            self.db.add(run)
            await self.db.commit()
            
        except OrchestratorException as e:
            await self.db.rollback()
            run.status = AgentRunStatus.FAILED
            run.error_message = str(e)
            run.completed_at = datetime.datetime.utcnow()
            self.db.add(run)
            await self.db.commit()
            
        except Exception as e:
            await self.db.rollback()
            run.status = AgentRunStatus.FAILED
            run.error_message = f"Unexpected error: {str(e)}"
            run.completed_at = datetime.datetime.utcnow()
            self.db.add(run)
            await self.db.commit()
