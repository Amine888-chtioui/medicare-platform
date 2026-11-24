import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAppointmentService } from '@/services/adminService';
import { getApiErrorMessage } from '@/utils/errors';
import type { AppointmentRequest, AppointmentStatus, PageResponse } from '@/types';

interface UseAppointmentsOptions {
  search: string;
  status: AppointmentStatus | '';
  page: number;
  size: number;
}

const EMPTY_PAGE: PageResponse<AppointmentRequest> = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

export function useAppointments({ search, status, page, size }: UseAppointmentsOptions) {
  const { t } = useTranslation();
  const [data, setData] = useState<PageResponse<AppointmentRequest>>(EMPTY_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestId = useRef(0);

  const reload = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    let active = true;

    setIsLoading(true);
    setError(null);

    adminAppointmentService
      .getAll({
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        size,
      })
      .then((response) => {
        if (!active || currentRequest !== requestId.current) return;
        setData(response);
      })
      .catch((err) => {
        if (!active || currentRequest !== requestId.current) return;
        setError(getApiErrorMessage(err, t('common.error')));
      })
      .finally(() => {
        if (!active || currentRequest !== requestId.current) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, status, page, size, refreshKey, t]);

  return { data, isLoading, error, reload };
}
