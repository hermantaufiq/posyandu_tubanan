import api from '../lib/api';

export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterPayload {
  kategori_warga: 'sasaran' | 'pengunjung';
  name: string;
  nik?: string;
  phone: string;
  email?: string;
  password: string;
  password_confirmation: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  address: string;
  alamat_asal?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string | null;
  nik: string | null;
  phone: string | null;
  gender: 'male' | 'female' | null;
  avatar: string | null;
  date_of_birth: string | null;
  address: string | null;
  role: 'admin' | 'nakes' | 'kader' | 'masyarakat';
  needs_nik_completion?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
    token_type: string;
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  async me(): Promise<AuthUser> {
    const response = await api.get<{ success: boolean; data: AuthUser }>('/auth/me');
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  async getGoogleAuthUrl(): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>('/auth/google');
    return response.data;
  },

  saveSession(token: string, user: AuthUser): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  getDashboardUrl(role: string, token?: string, user?: AuthUser): string {
    // In development each portal runs on its own Vite port
    // In production these will be separate Vercel deployments
    const urls: Record<string, string> = {
      admin:      'http://localhost:5181',
      nakes:      'http://localhost:5178',
      kader:      'http://localhost:5179',
      masyarakat: 'http://localhost:5177',
    };
    const baseUrl = urls[role] || '/';
    
    if (token && user) {
      // Pass auth data via URL since localStorage is not shared across different ports
      return `${baseUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    }
    return baseUrl;
  },
};
