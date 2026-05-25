import type { TokenResponse, InteractionCheck, MultiInteractionCheck, HistoryEntry, Stats, ModelsCompare, User, Drug } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refreshToken");
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      document.cookie = "accessToken=; path=/; max-age=0";
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const fetchOptions: RequestInit = {
      method: options.method || "GET",
      headers,
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        return this.request(endpoint, options);
      } catch {
        this.clearTokens();
        throw new Error("Sessão expirada");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      this.clearTokens();
      throw new Error("Sessão expirada");
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error("Sessão expirada");
    }

    const data: TokenResponse = await response.json() as TokenResponse;
    this.setTokens(data.access_token, data.refresh_token);
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const data = await this.request<TokenResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async register(email: string, password: string, name: string, role: "pharmacist" | "patient"): Promise<TokenResponse> {
    const data = await this.request<TokenResponse>("/auth/register", {
      method: "POST",
      body: { email, password, name, role },
    });
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.clearTokens();
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async getAllDrugs(): Promise<{ drugs: Drug[]; count: number }> {
    return this.request<{ drugs: Drug[]; count: number }>("/medicamentos/all");
  }

  async searchDrugs(query: string): Promise<{ drugs: Drug[]; count: number }> {
    return this.request<{ drugs: Drug[]; count: number }>(
      `/medicamentos?search=${encodeURIComponent(query)}`
    );
  }

  async checkInteraction(drug1: string, drug2: string): Promise<InteractionCheck> {
    return this.request<InteractionCheck>("/interactions/check", {
      method: "POST",
      body: { drug1, drug2 },
    });
  }

  async checkMultiInteraction(drugs: string[]): Promise<MultiInteractionCheck> {
    return this.request<MultiInteractionCheck>("/interactions/check-multi", {
      method: "POST",
      body: { drugs },
    });
  }

  async getInteractionsHistory(): Promise<HistoryEntry[]> {
    return this.request<HistoryEntry[]>("/interactions/history");
  }

  async getStats(): Promise<Stats> {
    return this.request<Stats>("/interactions/stats");
  }

  async getModelsCompare(): Promise<ModelsCompare> {
    return this.request<ModelsCompare>("/models/compare");
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/admin/users");
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    return this.request<User>(`/admin/users/${userId}`, {
      method: "PUT",
      body: { role },
    });
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    pharmacists: number;
    patients: number;
    admins: number;
  }> {
    return this.request("/admin/stats");
  }
}

export const api = new ApiClient();