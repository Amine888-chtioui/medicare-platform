// Application types

export type AppointmentStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'REFUSEE';

export interface AppointmentRequest {
  id: number;
  fullName: string;
  phoneNumber: string;
  description?: string;
  status: AppointmentStatus;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  serviceType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequestDto {
  fullName: string;
  phoneNumber: string;
  description?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  serviceType?: string;
}

export interface UpdateStatusDto {
  status: AppointmentStatus;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface DashboardStats {
  total: number;
  enAttente: number;
  confirmees: number;
  refusees: number;
}

export interface DailyStats {
  /** ISO date (yyyy-MM-dd) */
  date: string;
  count: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  username: string;
}

/** Standard backend envelope for single-resource responses. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}

/** Stable pagination envelope returned by the backend. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AppointmentFilters {
  status?: AppointmentStatus | '';
  search?: string;
  page?: number;
  size?: number;
}

export interface AdminNotification {
  id: number;
  appointmentRequestId: number;
  fullName: string;
  phoneNumber: string;
  description?: string | null;
  appointmentDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  serviceType?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  dismissed: boolean;
}

export interface Patient {
  id: number;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  notes?: string | null;
  totalAppointments: number;
  confirmedAppointments: number;
  lastVisit?: string | null;
  latestStatus?: AppointmentStatus | string;
  createdAt: string;
  history?: AppointmentRequest[];
}
