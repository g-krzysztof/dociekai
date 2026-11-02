export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  confirmed: boolean;
  blocked: boolean;
  emailVerified?: boolean;
  provider?: string;
  role: {
    id: number;
    name: string;
    type: string;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  jwt: string;
  isNew?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  identifier: string; // email lub username
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  code: string;
  password: string;
  passwordConfirmation: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
