import { 
  User, 
  AuthResponse, 
  RegisterData, 
  LoginData, 
  ForgotPasswordData, 
  ResetPasswordData, 
  ChangePasswordData, 
  UpdateProfileData
} from '@/types/auth';

import { getAuthToken } from '@/lib/auth-token';
// NOTE: client-side code should call Next.js API routes which act as a server-side proxy
// to the real backend. This avoids exposing backend URLs via NEXT_PUBLIC_* variables.
const API_PREFIX = '/api/auth';

class ApiErrorClass extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// Pomocnicza funkcja do obsługi odpowiedzi API
async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const rec = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    
    // Obsługa różnych formatów błędów z API
    let msg = 'Wystąpił błąd';
    
    if (typeof rec['error'] === 'string') {
      // API zwraca { error: "komunikat" }
      msg = rec['error'] as string;
    } else if (typeof rec['error'] === 'object' && rec['error']) {
      // API zwraca { error: { message: "komunikat" } }
      const errorObj = rec['error'] as Record<string, unknown>;
      msg = (errorObj['message'] as string) || msg;
    } else if (rec['message']) {
      // API zwraca { message: "komunikat" }
      msg = rec['message'] as string;
    }
    
    throw new ApiErrorClass(msg, response.status);
  }

  return data as T;
}

// Pomocnicza funkcja do tworzenia nagłówków z autoryzacją
function createAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export const authApi = {
  // Publiczne endpointy
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_PREFIX}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<AuthResponse>(response);
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_PREFIX}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<AuthResponse>(response);
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${API_PREFIX}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<{ message: string }>(response);
  },

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    const response = await fetch(`${API_PREFIX}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<AuthResponse>(response);
  },

  // Chronione endpointy
  async getProfile(): Promise<{ user: User }> {
    const response = await fetch(`${API_PREFIX}/profile`, {
      headers: createAuthHeaders(),
    });
    
    return handleResponse<{ user: User }>(response);
  },

  async updateProfile(data: UpdateProfileData): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_PREFIX}/profile`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return handleResponse<{ message: string; user: User }>(response);
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await fetch(`${API_PREFIX}/change-password`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return handleResponse<{ message: string }>(response);
  },

  async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await fetch(`${API_PREFIX}/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    return handleResponse<AuthResponse>(response);
  },

  async verifyEmail(code: string): Promise<{ message: string; user?: User }> {
    const response = await fetch(`${API_PREFIX}/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    return handleResponse<{ message: string; user?: User }>(response);
  },

  async resendVerification(): Promise<{ message: string }> {
    const response = await fetch(`${API_PREFIX}/resend-verification`, {
      method: 'POST',
      headers: createAuthHeaders(),
    });

    return handleResponse<{ message: string }>(response);
  },
};

export { ApiErrorClass };
