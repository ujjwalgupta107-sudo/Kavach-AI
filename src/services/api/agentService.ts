import { apiClient } from './client';

export type AgentRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AgentFinding {
  id: string;
  agent_type: string;
  finding_type: string;
  content: string; // JSON string from backend
  confidence: number | null;
  source_refs: string[];
}

export interface FinalBrief {
  executive_summary?: string;
  confirmed_facts?: string[];
  key_system_signals?: string[];
  network_connections?: string[];
  ai_assessment?: string[];
  evidence_gaps?: string[];
  recommended_next_actions?: string[];
  priority?: string;
  source_refs?: string[];
}

export interface AgentRun {
  id: string;
  case_id: string;
  status: AgentRunStatus;
  provider: string;
  model: string;
  started_at: string | null;
  completed_at: string | null;
  created_at?: string;
  error_message: string | null;
  final_brief: FinalBrief | null;
  findings?: AgentFinding[];
}

export const agentService = {
  startInvestigation: async (caseId: string): Promise<{ id: string; status: AgentRunStatus; message: string }> => {
    const response = await apiClient.post(`/api/v1/agents/investigations/${caseId}`) as any;
    return response.data;
  },

  getRun: async (runId: string): Promise<AgentRun> => {
    const response = await apiClient.get(`/api/v1/agents/runs/${runId}`) as any;
    return response.data;
  },

  getCaseRuns: async (caseId: string): Promise<AgentRun[]> => {
    const response = await apiClient.get(`/api/v1/agents/runs`, { params: { case_id: caseId } }) as any;
    return response.data;
  }
};
