export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ScamType = 'DIGITAL_ARREST' | 'OTP_THEFT' | 'UPI_FRAUD' | 'INVESTMENT' | 'COURIER' | 'JOB' | 'LOAN' | 'PHISHING';
export type EntityType = 'PHONE' | 'UPI' | 'BANK_ACCOUNT' | 'DOMAIN' | 'DEVICE' | 'ORGANIZATION' | 'LOCATION';
export type CaseStatus = 'OPEN' | 'INVESTIGATING' | 'CLOSED' | 'FLAGGED';
export type AgentRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface GeoLocation {
  lat: number;
  lng: number;
  city: string;
}

export interface Case {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  scamType: ScamType;
  status: CaseStatus;
  createdAt: string;
  location?: GeoLocation;
  evidenceCount: number;
  entityIds: string[];
  clusterId?: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  value: string;
  maskedValue?: string;
  riskScore: number;
  firstSeen: string;
  lastSeen: string;
  connectedCaseIds: string[];
  clusterId?: string;
}

export interface AnalysisResult {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  predictedType: ScamType;
  confidence: number;
  redFlags: string[];
  extractedEntities: Entity[];
  recommendedActions: string[];
  explanation?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'CITIZEN' | 'INVESTIGATOR' | 'ADMIN';
  name?: string;
}

export interface AgentFinding {
  id: string;
  agent_type: string;
  finding_type: string;
  content: string;
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

export interface Alert {
  id: string;
  title?: string;
  alert_type?: string;
  text?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status?: string;
  case_id?: string;
  entity_id?: string;
  created_at: string;
}

export interface DashboardMetrics {
  active_high_risk_cases: number;
  reports_today: number;
  suspicious_entities_tracked: number;
  emerging_clusters: number;
  average_risk_score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
