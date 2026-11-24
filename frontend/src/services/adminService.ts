import { adminApi } from './api';
import type {
  AppointmentRequest,
  AppointmentFilters,
  ApiResponse,
  PageResponse,
  UpdateStatusDto,
  DashboardStats,
  DailyStats,
  LoginRequest,
  LoginResponse,
  AdminNotification,
  Patient,
} from '@/types';
import {
  clearSession,
  getToken,
  getUsername,
  isAuthenticated as hasValidSession,
  setSession,
} from '@/utils/authStorage';

export const authService = {
  /** Authenticates and stores the JWT plus its expiry. */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await adminApi.post<ApiResponse<LoginResponse>>('/auth/login', data);
    const payload = response.data?.data;

    if (!payload?.token) {
      throw new Error('INVALID_LOGIN_RESPONSE');
    }

    setSession(payload.token, payload.expiresIn, payload.username);
    return payload;
  },

  logout: (): void => {
    clearSession();
  },

  isAuthenticated: (): boolean => hasValidSession(),

  getToken: (): string | null => getToken(),

  getUsername: (): string | null => getUsername(),
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await adminApi.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  getDailyStats: async (days = 7): Promise<DailyStats[]> => {
    const response = await adminApi.get<DailyStats[]>('/dashboard/daily-stats', {
      params: { days },
    });
    return Array.isArray(response.data) ? response.data : [];
  },
};

export const adminAppointmentService = {
  getAll: async (filters: AppointmentFilters = {}): Promise<PageResponse<AppointmentRequest>> => {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.size !== undefined) params.set('size', String(filters.size));
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);

    const query = params.toString();
    const response = await adminApi.get<PageResponse<AppointmentRequest>>(
      `/appointment-requests${query ? `?${query}` : ''}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<AppointmentRequest> => {
    const response = await adminApi.get<ApiResponse<AppointmentRequest>>(
      `/appointment-requests/${id}`
    );
    const payload = response.data?.data;
    if (!payload) {
      throw new Error('INVALID_APPOINTMENT_RESPONSE');
    }
    return payload;
  },

  updateStatus: async (id: number, data: UpdateStatusDto): Promise<AppointmentRequest> => {
    const response = await adminApi.patch<ApiResponse<AppointmentRequest>>(
      `/appointment-requests/${id}/status`,
      data
    );
    const payload = response.data?.data;
    if (!payload) {
      throw new Error('INVALID_APPOINTMENT_RESPONSE');
    }
    return payload;
  },

  getSchedule: async (startDate: string, endDate: string): Promise<AppointmentRequest[]> => {
    try {
      const response = await adminApi.get<AppointmentRequest[]>('/appointment-requests/schedule', {
        params: { startDate, endDate },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  createAppointment: async (data: any): Promise<AppointmentRequest> => {
    const response = await adminApi.post<ApiResponse<AppointmentRequest>>(
      '/appointment-requests',
      data
    );
    const payload = response.data?.data;
    if (!payload) {
      throw new Error('INVALID_CREATE_RESPONSE');
    }
    return payload;
  },

  checkConflict: async (date: string, startTime: string, excludeId?: number): Promise<boolean> => {
    try {
      const response = await adminApi.get<{ conflict: boolean }>(
        '/appointment-requests/check-conflict',
        { params: { date, startTime, excludeId } }
      );
      return Boolean(response.data?.conflict);
    } catch {
      return false;
    }
  },
};

export const adminNotificationService = {
  /** Récupère toutes les notifications actives (demandes EN_ATTENTE non supprimées). */
  getAll: async (): Promise<AdminNotification[]> => {
    try {
      const response = await adminApi.get<AdminNotification[]>('/notifications');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  /** Nombre de notifications actives pour le badge du header. */
  getCount: async (): Promise<number> => {
    try {
      const response = await adminApi.get<{ count: number }>('/notifications/count');
      return response.data?.count ?? 0;
    } catch {
      return 0;
    }
  },

  /** Supprime (dismiss) une notification de manière persistante dans la BD. */
  dismiss: async (id: number): Promise<void> => {
    await adminApi.delete(`/notifications/${id}`);
  },

  /** Supprime toutes les notifications actives (laisse les demandes intactes). */
  dismissAll: async (): Promise<void> => {
    await adminApi.delete('/notifications');
  },
};

export const adminPatientService = {
  /** Récupère la liste de tous les dossiers patients confirmés. */
  getAll: async (search?: string): Promise<Patient[]> => {
    try {
      const response = await adminApi.get<Patient[]>('/patients', {
        params: search ? { search } : undefined,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  /** Récupère un dossier patient par son identifiant. */
  getById: async (id: number): Promise<Patient | null> => {
    try {
      const response = await adminApi.get<ApiResponse<Patient>>(`/patients/${id}`);
      return response.data?.data ?? null;
    } catch {
      return null;
    }
  },

  /** Enregistre les observations / notes médicales d'un patient. */
  updateNotes: async (id: number, notes: string): Promise<Patient | null> => {
    try {
      const response = await adminApi.put<ApiResponse<Patient>>(`/patients/${id}/notes`, { notes });
      return response.data?.data ?? null;
    } catch {
      return null;
    }
  },

  /** Crée manuellement un nouveau dossier patient. */
  create: async (data: { fullName: string; phoneNumber: string; notes?: string }): Promise<Patient | null> => {
    try {
      const response = await adminApi.post<ApiResponse<Patient>>('/patients', data);
      return response.data?.data ?? null;
    } catch {
      return null;
    }
  },
};
