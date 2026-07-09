import { apiClient } from './client';
import { AgentRun, AgentRunStatus } from '../../types';

export const agentService = {
  startInvestigation: async (caseId: string): Promise<{ id: string; status: AgentRunStatus; message: string }> => {
    return apiClient.post(`/api/v1/agents/investigations/${caseId}`);
  },

  getRun: async (runId: string): Promise<AgentRun> => {
    return apiClient.get(`/api/v1/agents/runs/${runId}`);
  },

  getCaseRuns: async (caseId: string): Promise<AgentRun[]> => {
    return apiClient.get(`/api/v1/agents/runs`, { params: { case_id: caseId } });
  },
};
