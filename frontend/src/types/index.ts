export type Severity = "Grave" | "Moderada" | "Leve";

export interface DrugInteraction {
  id: number;
  drug1: string;
  drug2: string;
  description: string;
  severity: Severity;
}

export interface InteractionCheckRequest {
  drug1: string;
  drug2: string;
}

export interface InteractionCheckResponse {
  drug1: string;
  drug2: string;
  severity: Severity;
  description: string;
  confidence?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "pharmacist" | "patient";
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "pharmacist" | "patient";
}

export interface HistoryEntry {
  id: string;
  drug1: string;
  drug2: string;
  severity: Severity;
  timestamp: string;
}

export interface DashboardStats {
  totalInteractions: number;
  graveCount: number;
  moderadaCount: number;
  leveCount: number;
  topDrugs: { drug: string; count: number }[];
  recentQueries: HistoryEntry[];
}