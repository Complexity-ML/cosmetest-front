// Types génériques pour l'API

export interface ApiResponse<T = any> {
  data?: T;
  success?: boolean;
  message?: string;
  error?: string;
  status?: number;
}

export interface PaginatedResponse<T = any> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface QueryParams {
  page?: number;
  size?: number;
  sort?: string;
  [key: string]: any;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

export interface FileUploadResponse {
  success: boolean;
  filename?: string;
  url?: string;
  message?: string;
}
