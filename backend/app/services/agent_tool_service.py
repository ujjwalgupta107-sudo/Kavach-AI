import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.case import Case, CaseTimelineEvent, Evidence
from app.models.entity import Entity, CaseEntityLink, FraudCluster
from app.models.alert import Alert
from app.models.audit import InvestigatorNote
from app.services.semantic_service import SemanticService
from app.services.graph_service import GraphService

class AgentToolService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_case_intelligence(self, case_id: uuid.UUID) -> Dict[str, Any]:
        case = await self.db.get(Case, case_id)
        if not case:
            return {"error": "Case not found"}
        
        return {
            "id": str(case.id),
            "scam_type": case.scam_type.value if case.scam_type else None,
            "status": case.status.value if case.status else None,
            "risk_score": case.risk_score,
            "risk_level": case.risk_level.value if case.risk_level else None,
            "description": case.description,
            "report_location": case.report_location,
            "cluster_id": str(case.cluster_id) if case.cluster_id else None,
            "created_at": case.created_at.isoformat() if case.created_at else None
        }

    async def get_case_entities(self, case_id: uuid.UUID) -> List[Dict[str, Any]]:
        result = await self.db.execute(
            select(Entity)
            .join(CaseEntityLink)
            .where(CaseEntityLink.case_id == case_id)
        )
        entities = result.scalars().all()
        return [
            {
                "id": str(e.id),
                "type": e.type.value,
                "value": e.value,
                "risk_score": e.risk_score
            } for e in entities
        ]

    async def get_semantically_similar_cases(self, case_id: uuid.UUID, top_k: int = 5) -> List[Dict[str, Any]]:
        # Reuse Phase 1 semantic service
        try:
            return await SemanticService.get_similar_cases(case_id, self.db, top_k=top_k)
        except Exception as e:
            return [{"error": f"Semantic similarity failed: {str(e)}"}]

    async def get_case_alerts(self, case_id: uuid.UUID) -> List[Dict[str, Any]]:
        result = await self.db.execute(
            select(Alert).where(Alert.case_id == case_id)
        )
        alerts = result.scalars().all()
        return [
            {
                "id": str(a.id),
                "alert_type": a.alert_type,
                "severity": a.severity,
                "title": a.title,
                "description": a.description,
                "is_acknowledged": a.is_acknowledged
            } for a in alerts
        ]

    async def get_case_cluster_context(self, case_id: uuid.UUID) -> Dict[str, Any]:
        case = await self.db.get(Case, case_id)
        if not case or not case.cluster_id:
            return {"status": "No cluster associated with this case"}
        
        cluster = await self.db.get(FraudCluster, case.cluster_id)
        if not cluster:
            return {"status": "Cluster not found"}
            
        result = await self.db.execute(
            select(Case.id, Case.scam_type, Case.risk_score).where(Case.cluster_id == cluster.id)
        )
        cluster_cases = result.all()
        
        return {
            "cluster_id": str(cluster.id),
            "risk_score": cluster.risk_score,
            "case_count": len(cluster_cases),
            "cases_in_cluster": [{"id": str(c[0]), "scam_type": c[1].value if c[1] else None, "risk_score": c[2]} for c in cluster_cases]
        }

    async def get_case_graph_context(self, case_id: uuid.UUID) -> Dict[str, Any]:
        """Returns local graph neighborhood for the case."""
        # Using existing GraphService to get full graph, then filter to 1-hop or 2-hop
        try:
            gs = GraphService(self.db)
            graph = await gs.get_cytoscape_graph()
            
            # Simple 1-hop filter
            nodes = {n.data.id: n.data for n in graph.nodes}
            edges = [e.data for e in graph.edges]
            
            case_node_id = f"case_{case_id}"
            if case_node_id not in nodes:
                return {"status": "Case not found in graph"}
                
            connected_edges = [e for e in edges if e.source == case_node_id or e.target == case_node_id]
            connected_node_ids = set([case_node_id])
            for e in connected_edges:
                connected_node_ids.add(e.source)
                connected_node_ids.add(e.target)
                
            local_nodes = [nodes[nid] for nid in connected_node_ids if nid in nodes]
            
            return {
                "nodes": local_nodes,
                "edges": connected_edges
            }
        except Exception as e:
            return {"error": f"Failed to get graph context: {str(e)}"}

    async def get_case_evidence(self, case_id: uuid.UUID) -> List[Dict[str, Any]]:
        result = await self.db.execute(
            select(Evidence).where(Evidence.case_id == case_id)
        )
        evidence = result.scalars().all()
        return [
            {
                "id": str(e.id),
                "type": e.evidence_type.value,
                "file_name": e.file_name,
                "extracted_text": e.extracted_text,
                "metadata": e.metadata_json
            } for e in evidence
        ]

    async def get_case_timeline(self, case_id: uuid.UUID) -> List[Dict[str, Any]]:
        result = await self.db.execute(
            select(CaseTimelineEvent).where(CaseTimelineEvent.case_id == case_id).order_by(CaseTimelineEvent.created_at)
        )
        events = result.scalars().all()
        return [
            {
                "event_type": ev.event_type,
                "description": ev.description,
                "created_at": ev.created_at.isoformat() if ev.created_at else None
            } for ev in events
        ]

    async def get_investigator_notes(self, case_id: uuid.UUID) -> List[Dict[str, Any]]:
        result = await self.db.execute(
            select(InvestigatorNote).where(InvestigatorNote.case_id == case_id)
        )
        notes = result.scalars().all()
        return [
            {
                "content": n.content,
                "created_at": n.created_at.isoformat() if n.created_at else None
            } for n in notes
        ]

    async def build_investigation_context(self, case_id: uuid.UUID) -> Dict[str, Any]:
        """Gathers a structured investigation packet for LLM consumption."""
        return {
            "case_facts": await self.get_case_intelligence(case_id),
            "entities_extracted": await self.get_case_entities(case_id),
            "evidence": await self.get_case_evidence(case_id),
            "timeline": await self.get_case_timeline(case_id),
            "investigator_notes": await self.get_investigator_notes(case_id),
            "system_signals": {
                "alerts": await self.get_case_alerts(case_id)
            },
            "network_context": {
                "cluster": await self.get_case_cluster_context(case_id),
                "graph_neighborhood": await self.get_case_graph_context(case_id),
                "semantic_similar_cases": await self.get_semantically_similar_cases(case_id, top_k=3)
            }
        }
