import { publicApi } from './api';
import type { AppointmentRequest, CreateAppointmentRequestDto, ApiResponse } from '@/types';

export const appointmentService = {
  create: async (data: CreateAppointmentRequestDto): Promise<AppointmentRequest> => {
    const response = await publicApi.post<ApiResponse<AppointmentRequest>>(
      '/appointment-requests',
      data
    );
    const payload = response.data?.data;
    if (!payload) {
      throw new Error('INVALID_APPOINTMENT_RESPONSE');
    }
    return payload;
  },
};
