export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  userStatus: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}; 