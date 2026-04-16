const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
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
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken();
      return this.request(endpoint, options);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
      throw new Error(error.detail || "Erro na requisição");
    }

    return response.json();
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      this.clearTokens();
      throw new Error("Sessão expirada");
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error("Sessão expirada");
    }

    const data = await response.json();
    this.setTokens(data.accessToken, this.refreshToken);
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request<{ user: any; accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async register(email: string, password: string, name: string, role: "pharmacist" | "patient") {
    const data = await this.request<{ user: any; accessToken: string; refreshToken: string }>("/auth/register", {
      method: "POST",
      body: { email, password, name, role },
    });
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.clearTokens();
    }
  }

  async getMe() {
    return this.request<any>("/auth/me");
  }

  // Drugs endpoints
  async searchDrugs(query: string) {
    return this.request<{ drugs: string[] }>(`/medicamentos?search=${encodeURIComponent(query)}`);
  }

  async getAllDrugs() {
    return this.request<{ drugs: string[] }>("/medicamentos");
  }

  // Interactions endpoints
  async checkInteraction(drug1: string, drug2: string) {
    return this.request<{
      drug1: string;
      drug2: string;
      severity: string;
      description: string;
      confidence?: number;
    }>("/interactions/check", {
      method: "POST",
      body: { drug1, drug2 },
    });
  }

  async getInteractionsHistory() {
    return this.request<any[]>("/history");
  }

  async getInteraction(id: string) {
    return this.request<any>(`/interactions/${id}`);
  }

  // Admin endpoints
  async getStats() {
    return this.request<any>("/admin/stats");
  }

  async getAllUsers() {
    return this.request<any[]>("/admin/users");
  }

  async updateUserRole(userId: string, role: string) {
    return this.request<any>(`/admin/users/${userId}`, {
      method: "PUT",
      body: { role },
    });
  }
}

export const api = new ApiClient();