import { GetUserEntry } from "../api";

export interface ApiError {
  errorCode: string;
  message: string;
  httpStatus: number;
}

export interface AuthState {
  user: GetUserEntry | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}