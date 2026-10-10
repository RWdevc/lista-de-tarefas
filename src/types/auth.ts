export type AuthMode = 'login' | 'signup' | 'forgot' | 'reset-password';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: string;
  colorClass: string;
  bgGradient: string;
  requirements: PasswordRequirement[];
}
