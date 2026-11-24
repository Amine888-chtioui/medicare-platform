import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  authService,
  dashboardService,
  adminAppointmentService,
  adminNotificationService,
  adminPatientService,
} from './adminService';
import { adminApi } from './api';
import * as authStorage from '@/utils/authStorage';

vi.mock('./api', () => ({
  adminApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('authService', () => {
    it('authenticates and calls setSession on success', async () => {
      const setSessionSpy = vi.spyOn(authStorage, 'setSession');
      vi.mocked(adminApi.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            token: 'jwt-xyz',
            expiresIn: 3600,
            username: 'admin',
          },
        },
      });

      const result = await authService.login({ username: 'admin', password: 'password' });

      expect(result.token).toBe('jwt-xyz');
      expect(setSessionSpy).toHaveBeenCalledWith('jwt-xyz', 3600, 'admin');
    });

    it('clears session on logout', () => {
      const clearSessionSpy = vi.spyOn(authStorage, 'clearSession');
      authService.logout();
      expect(clearSessionSpy).toHaveBeenCalled();
    });
  });

  describe('dashboardService', () => {
    it('fetches dashboard stats', async () => {
      const mockStats = { total: 10, enAttente: 3, confirmees: 6, refusees: 1 };
      vi.mocked(adminApi.get).mockResolvedValueOnce({ data: mockStats });

      const stats = await dashboardService.getStats();
      expect(stats).toEqual(mockStats);
      expect(adminApi.get).toHaveBeenCalledWith('/dashboard/stats');
    });

    it('fetches daily stats with query parameters', async () => {
      const mockDaily = [{ date: '2026-11-24', count: 5 }];
      vi.mocked(adminApi.get).mockResolvedValueOnce({ data: mockDaily });

      const result = await dashboardService.getDailyStats(7);
      expect(result).toEqual(mockDaily);
      expect(adminApi.get).toHaveBeenCalledWith('/dashboard/daily-stats', { params: { days: 7 } });
    });
  });

  describe('adminAppointmentService', () => {
    it('fetches paginated appointment requests with filters', async () => {
      const mockPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 };
      vi.mocked(adminApi.get).mockResolvedValueOnce({ data: mockPage });

      const result = await adminAppointmentService.getAll({
        page: 0,
        size: 10,
        status: 'CONFIRMEE',
        search: 'Amina',
      });

      expect(result).toEqual(mockPage);
      expect(adminApi.get).toHaveBeenCalledWith(
        '/appointment-requests?page=0&size=10&status=CONFIRMEE&search=Amina'
      );
    });

    it('updates request status and returns updated data', async () => {
      const mockUpdated = { id: 2, status: 'CONFIRMEE' };
      vi.mocked(adminApi.patch).mockResolvedValueOnce({
        data: { success: true, data: mockUpdated },
      });

      const result = await adminAppointmentService.updateStatus(2, { status: 'CONFIRMEE' });
      expect(result).toEqual(mockUpdated);
      expect(adminApi.patch).toHaveBeenCalledWith('/appointment-requests/2/status', {
        status: 'CONFIRMEE',
      });
    });

    it('checks slot conflict via checkConflict', async () => {
      vi.mocked(adminApi.get).mockResolvedValueOnce({ data: { conflict: true } });

      const hasConflict = await adminAppointmentService.checkConflict('2026-11-28', '10:00');
      expect(hasConflict).toBe(true);
    });
  });

  describe('adminNotificationService', () => {
    it('fetches active notification count', async () => {
      vi.mocked(adminApi.get).mockResolvedValueOnce({ data: { count: 4 } });

      const count = await adminNotificationService.getCount();
      expect(count).toBe(4);
    });

    it('dismisses single notification', async () => {
      vi.mocked(adminApi.delete).mockResolvedValueOnce({ data: { success: true } });

      await adminNotificationService.dismiss(12);
      expect(adminApi.delete).toHaveBeenCalledWith('/notifications/12');
    });
  });

  describe('adminPatientService', () => {
    it('fetches patients list with optional search query', async () => {
      const mockPatients = [{ id: 1, fullName: 'Fatima', phoneNumber: '0612345678' }];
      vi.mocked(adminApi.get).mockResolvedValueOnce({ data: mockPatients });

      const patients = await adminPatientService.getAll('Fatima');
      expect(patients).toEqual(mockPatients);
      expect(adminApi.get).toHaveBeenCalledWith('/patients', { params: { search: 'Fatima' } });
    });

    it('updates notes for patient', async () => {
      const mockPatient = { id: 1, fullName: 'Fatima', notes: 'Observation test' };
      vi.mocked(adminApi.put).mockResolvedValueOnce({
        data: { success: true, data: mockPatient },
      });

      const updated = await adminPatientService.updateNotes(1, 'Observation test');
      expect(updated).toEqual(mockPatient);
      expect(adminApi.put).toHaveBeenCalledWith('/patients/1/notes', { notes: 'Observation test' });
    });
  });
});
