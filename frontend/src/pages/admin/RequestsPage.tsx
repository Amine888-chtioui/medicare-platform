import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import type { AppointmentRequest, AppointmentStatus, DashboardStats } from '@/types';
import { adminAppointmentService, dashboardService } from '@/services/adminService';
import { getApiErrorMessage } from '@/utils/errors';
import { useAppointments } from '@/hooks/useAppointments';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { RequestTable } from '@/features/admin/RequestTable';
import { RequestDetailsModal } from '@/features/admin/RequestDetailsModal';
import { Alert } from '@/components/ui/Alert';

const REQUESTS_PAGE_SIZE = 10;

const RequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>(() => {
    const s = searchParams.get('status');
    return s === 'EN_ATTENTE' || s === 'CONFIRMEE' || s === 'REFUSEE' ? s : '';
  });
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(searchQuery);

  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const highlightId = searchParams.get('requestId') ? Number(searchParams.get('requestId')) : undefined;

  // React to URL query params e.g. from notification clicks
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam === 'EN_ATTENTE' || statusParam === 'CONFIRMEE' || statusParam === 'REFUSEE') {
      setStatusFilter(statusParam);
    }
    const reqIdParam = searchParams.get('requestId');
    if (reqIdParam) {
      const id = Number(reqIdParam);
      if (!Number.isNaN(id)) {
        adminAppointmentService.getById(id)
          .then((req) => {
            if (req) {
              setSelectedRequest(req);
            }
          })
          .catch(() => {});
      }
    }
  }, [searchParams]);

  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    enAttente: 0,
    confirmees: 0,
    refusees: 0,
  });

  const { data, isLoading, error, reload } = useAppointments({
    search: debouncedSearch,
    status: statusFilter,
    page,
    size: REQUESTS_PAGE_SIZE,
  });

  // Load stats for filter counts and header badge
  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch(() => {});
  }, [data]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleStatusFilterChange = (value: AppointmentStatus | '') => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleUpdateStatus = async (
    id: number,
    newStatus: AppointmentStatus,
    appointmentDate?: string,
    startTime?: string
  ) => {
    setUpdatingId(id);
    setActionError(null);
    try {
      const updated = await adminAppointmentService.updateStatus(id, {
        status: newStatus,
        appointmentDate,
        startTime,
      });
      if (selectedRequest?.id === id) {
        setSelectedRequest(updated);
      }
      reload();
    } catch (updateError) {
      setActionError(getApiErrorMessage(updateError, t('common.error')));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      {/* Header matching Image 1: Vertical line + Title + Badge + Subtitle */}
      <div className="flex items-start gap-2.5">
        <div className="w-1.5 h-7 sm:h-8 bg-[#800020] rounded-full shrink-0 mt-1" />
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              Gestion des demandes
            </h1>
            {stats.enAttente > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FDE8EF] text-[#A61935] border border-[#FBCFE8]/50">
                {stats.enAttente} en attente
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium mt-1">
            Consultez et gérez l'ensemble des demandes de rendez-vous reçues en temps réel.
          </p>
        </div>
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      <RequestTable
        requests={data.content}
        onViewDetails={setSelectedRequest}
        onUpdateStatus={handleUpdateStatus}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        stats={stats}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        updatingId={updatingId}
        highlightId={highlightId}
        page={page}
        pageSize={REQUESTS_PAGE_SIZE}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        onPageChange={setPage}
      />

      <RequestDetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updatingId === selectedRequest?.id}
        error={actionError}
      />
    </div>
  );
};

export default RequestsPage;
