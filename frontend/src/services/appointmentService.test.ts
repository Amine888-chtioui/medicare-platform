import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appointmentService } from './appointmentService';
import { publicApi } from './api';

vi.mock('./api', () => ({
  publicApi: {
    post: vi.fn(),
  },
}));

describe('appointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an appointment request and returns payload', async () => {
    const mockCreated = {
      id: 1,
      fullName: 'Salma El Amrani',
      phoneNumber: '0612345678',
      status: 'EN_ATTENTE',
    };

    vi.mocked(publicApi.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Demande enregistrée',
        data: mockCreated,
      },
    });

    const result = await appointmentService.create({
      fullName: 'Salma El Amrani',
      phoneNumber: '0612345678',
      appointmentDate: '2026-11-25',
      startTime: '10:00',
    });

    expect(result).toEqual(mockCreated);
    expect(publicApi.post).toHaveBeenCalledWith('/appointment-requests', {
      fullName: 'Salma El Amrani',
      phoneNumber: '0612345678',
      appointmentDate: '2026-11-25',
      startTime: '10:00',
    });
  });

  it('throws INVALID_APPOINTMENT_RESPONSE if data is missing in response', async () => {
    vi.mocked(publicApi.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Missing data',
        data: null,
      },
    });

    await expect(
      appointmentService.create({
        fullName: 'Salma El Amrani',
        phoneNumber: '0612345678',
      })
    ).rejects.toThrow('INVALID_APPOINTMENT_RESPONSE');
  });
});
