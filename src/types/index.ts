export type UserRole = 
  | 'registered_user'
  | 'student_user'
  | 'senior_citizen'
  | 'cybersecurity_analyst'
  | 'administrator';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'OPEN' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status?: UserStatus;
}

export interface IndicatorItem {
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  confidenceScore: number;
  threatType: string;
  indicators: IndicatorItem[];
  explanation: string;
  recommendation: string;
  engineType: 'AI_LLM' | 'SECURITY_HEURISTICS_ENGINE';
  familyAlertRecommended?: boolean;
}

export interface JobScamInput {
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  contactNumber?: string;
  recruitmentMessage?: string;
  salaryOffer?: string;
  websiteUrl?: string;
  additionalDetails?: string;
}

export interface PhoneCallInput {
  callerNumber?: string;
  callerName?: string;
  transcript?: string;
  callDuration?: string;
  callContext?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  type: string;
  read: boolean;
  createdDate: string;
}

export interface EmergencyContactItem {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string | null;
  relationship: string;
  notifyOnCritical: boolean;
  createdAt: string;
}

export interface InvestigationNoteItem {
  id: string;
  caseId?: string | null;
  incidentId?: string | null;
  analystId: string;
  analystName?: string;
  note: string;
  createdAt: string;
}

export interface CaseItem {
  id: string;
  incidentId: string;
  analystId?: string | null;
  analystName?: string | null;
  title?: string | null;
  status: IncidentStatus;
  priority: IncidentPriority;
  notes?: string | null;
  createdDate: string;
  updatedDate: string;
  caseNotes?: InvestigationNoteItem[];
}

export interface ReportedIncidentItem {
  id: string;
  userId: string;
  reporterName?: string;
  reporterEmail?: string;
  title: string;
  description: string;
  incidentType: string;
  evidence?: string | null;
  riskLevel: RiskLevel;
  status: IncidentStatus;
  priority: IncidentPriority;
  assignedToId?: string | null;
  assignedToName?: string | null;
  resolution?: string | null;
  createdDate: string;
  updatedDate: string;
  cases?: CaseItem[];
  notes?: InvestigationNoteItem[];
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName?: string | null;
  role?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  timestamp: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    urlChecks: number;
    scamReports: number;
    phoneCallChecks: number;
    reportedIncidents: number;
    assignedCases: number;
  };
}
