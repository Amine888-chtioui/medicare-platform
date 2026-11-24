import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Phone,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCheck,
} from 'lucide-react';
import type { AppointmentRequest, AppointmentStatus, DashboardStats } from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatFullFrenchDate, formatReceiptDate } from '@/utils/date';

interface RequestTableProps {
  requests: AppointmentRequest[];
  onViewDetails: (request: AppointmentRequest) => void;
  onUpdateStatus: (
    id: number,
    newStatus: AppointmentStatus,
    appointmentDate?: string,
    startTime?: string
  ) => Promise<void>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: AppointmentStatus | '';
  onStatusFilterChange: (status: AppointmentStatus | '') => void;
  stats?: DashboardStats;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  updatingId?: number | null;
  highlightId?: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

// Pastel avatar color palette matching Image 1
function getAvatarStyle(name: string) {
  const n = name.trim().toLowerCase();
  const charCode = n.charCodeAt(0) || 0;
  if (charCode % 3 === 0) {
    return { bg: 'bg-[#E6F9F0]', text: 'text-[#059669]' }; // soft mint
  }
  if (charCode % 3 === 1) {
    return { bg: 'bg-[#FEF9C3]', text: 'text-[#CA8A04]' }; // soft yellow / cream
  }
  return { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]' }; // soft lavender
}

export const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  onViewDetails,
  onUpdateStatus,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  stats,
  isLoading = false,
  error = null,
  onRetry,
  updatingId = null,
  highlightId,
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const [markedAllRead, setMarkedAllRead] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    requestId: number | null;
    requestName: string;
    newStatus: AppointmentStatus | null;
    appointmentDate?: string;
    startTime?: string;
  }>({
    isOpen: false,
    requestId: null,
    requestName: '',
    newStatus: null,
  });

  // Calculate patient frequency to determine "Patiente récurrente" vs "Nouveau patient"
  const phoneFrequency = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach((r) => {
      const clean = r.phoneNumber?.replace(/[^\d]/g, '') || r.fullName.toLowerCase();
      map[clean] = (map[clean] || 0) + 1;
    });
    return map;
  }, [requests]);

  const openConfirmDialog = (request: AppointmentRequest, newStatus: AppointmentStatus) => {
    setConfirmDialog({
      isOpen: true,
      requestId: request.id,
      requestName: request.fullName,
      newStatus,
      appointmentDate: request.appointmentDate,
      startTime: request.startTime,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.requestId || !confirmDialog.newStatus) return;
    try {
      await onUpdateStatus(
        confirmDialog.requestId,
        confirmDialog.newStatus,
        confirmDialog.appointmentDate,
        confirmDialog.startTime
      );
    } finally {
      setConfirmDialog({
        isOpen: false,
        requestId: null,
        requestName: '',
        newStatus: null,
      });
    }
  };

  const actionDisabled = (request: AppointmentRequest) => updatingId === request.id;

  const handleMarkAllRead = () => {
    setMarkedAllRead(true);
    setTimeout(() => setMarkedAllRead(false), 2500);
  };

  // Filter definitions with real counts
  const filterPills = [
    {
      label: 'Tous',
      value: '' as const,
      count: stats?.total ?? totalElements,
      pillStyle:
        statusFilter === ''
          ? 'bg-[#111827] text-white shadow-xs'
          : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200',
    },
    {
      label: 'En attente',
      value: 'EN_ATTENTE' as const,
      count: stats?.enAttente ?? 0,
      pillStyle:
        statusFilter === 'EN_ATTENTE'
          ? 'bg-[#D97706] text-white shadow-xs'
          : 'bg-[#FEF3C7]/60 text-[#D97706] border border-[#FDE68A]/60 hover:bg-[#FEF3C7]',
    },
    {
      label: 'Confirmés',
      value: 'CONFIRMEE' as const,
      count: stats?.confirmees ?? 0,
      pillStyle:
        statusFilter === 'CONFIRMEE'
          ? 'bg-[#059669] text-white shadow-xs'
          : 'bg-[#DCFCE7]/60 text-[#16A34A] border border-[#BBF7D0]/60 hover:bg-[#DCFCE7]',
    },
    {
      label: 'Refusés',
      value: 'REFUSEE' as const,
      count: stats?.refusees ?? 0,
      pillStyle:
        statusFilter === 'REFUSEE'
          ? 'bg-[#DC2626] text-white shadow-xs'
          : 'bg-[#FEE2E2]/60 text-[#DC2626] border border-[#FECACA]/60 hover:bg-[#FEE2E2]',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ══════════════════════════════════════════════════
          1. DEMANDES RÉCENTES & SEARCH / FILTERS CARD
          ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_4px_20px_rgba(166,25,53,0.04)] flex flex-col gap-3.5">
        {/* Top Header: Title + Tout marquer lu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FDE8EF] text-[#A61935] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
              Demandes récentes
            </span>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-[#A61935] hover:text-[#8D142C] transition-colors cursor-pointer flex items-center gap-1"
          >
            {markedAllRead ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Tout est à jour</span>
              </>
            ) : (
              <span>Tout marquer lu</span>
            )}
          </button>
        </div>

        {/* Search bar + Filtrer button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par nom ou téléphone..."
              aria-label="Rechercher"
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-[var(--color-border)] bg-[#FFF8FA] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none focus:border-[#A61935] focus:bg-white focus:ring-1 focus:ring-[#A61935] transition-all"
            />
          </div>

          <button
            type="button"
            className="px-3.5 py-2.5 rounded-2xl border border-[var(--color-border)] bg-white hover:bg-[#FFF8FA] text-xs font-bold text-gray-700 transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden xs:inline">Filtrer</span>
          </button>
        </div>

        {/* Rounded Pill Filters with Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterPills.map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => onStatusFilterChange(pill.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${pill.pillStyle}`}
            >
              <span>{pill.label}</span>
              <span className="opacity-80">({pill.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-bold text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t('common.retry')}</span>
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          2. INDEPENDENT REQUEST CARDS LIST (Image 1 design)
          ══════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2.5">
          <div className="w-7 h-7 border-2 border-[#A61935] border-t-transparent rounded-full animate-spin" />
          <span>Chargement des demandes...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-[var(--color-text-muted)] italic border border-[var(--color-border)] shadow-[0_4px_20px_rgba(166,25,53,0.04)]">
          Aucune demande ne correspond à vos critères.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => {
            const avatar = getAvatarStyle(req.fullName);
            const initial = req.fullName.trim()[0]?.toUpperCase() || 'P';
            const cleanPhone = req.phoneNumber?.replace(/[^\d]/g, '') || '';
            const isRecurring = (phoneFrequency[cleanPhone] || 1) > 1;

            // Channel / recurrence indicator
            const channelInfo = req.serviceType
              ? `Canal: ${req.serviceType}`
              : isRecurring
              ? 'Patiente récurrente'
              : 'Nouveau patient';

            // Top colored accent border matching Image 1
            const topBorderClass =
              req.status === 'CONFIRMEE'
                ? 'border-t-4 border-t-[#059669]'
                : req.status === 'REFUSEE'
                ? 'border-t-4 border-t-[#E11D48]'
                : 'border-t-4 border-t-[#D97706]';

            // Status badge styling matching section 2.E
            const statusBadge =
              req.status === 'CONFIRMEE' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F8EF] text-[#059669] border border-[#A7F3D0] inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  <span>Confirmée</span>
                </span>
              ) : req.status === 'REFUSEE' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                  <span>Refusée</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                  <span>En attente</span>
                </span>
              );

            // Format desired appointment date and time
            const formattedDate = formatFullFrenchDate(req.appointmentDate);
            const startTimeStr = req.startTime || '09:00';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-3xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_4px_20px_rgba(166,25,53,0.04)] flex flex-col gap-3.5 transition-all hover:shadow-[0_8px_25px_rgba(166,25,53,0.08)] ${topBorderClass} ${
                  highlightId === req.id ? 'ring-2 ring-[#800020] shadow-[0_0_25px_rgba(128,0,32,0.18)]' : ''
                }`}
              >
                {/* ── Line 1: Avatar + Name + Receipt Date + Status Badge ── */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs ${avatar.bg} ${avatar.text}`}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm sm:text-base text-[var(--color-text-primary)] truncate leading-tight">
                        {req.fullName}
                      </h4>
                      <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                        {formatReceiptDate(req.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">{statusBadge}</div>
                </div>

                {/* ── Line 2: Phone number + Channel / Recurrence ── */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FDE8EF] text-[#A61935] flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-[#A61935]" dir="ltr">
                      {req.phoneNumber}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-gray-500">
                    {channelInfo}
                  </span>
                </div>

                {/* ── Line 3: Soft light pink card with desired slot ── */}
                <div className="bg-[#FFF4F7] rounded-2xl p-3 border border-[#FDE8EF] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#A61935] flex items-center justify-center shrink-0 border border-[#FDE8EF] shadow-2xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-gray-500 block leading-none mb-1">
                      Souhaité :
                    </span>
                    <p className="text-xs sm:text-sm text-gray-800 font-bold truncate">
                      {formattedDate}{' '}
                      <span className="text-[#A61935] font-extrabold">
                        à {startTimeStr}
                      </span>
                    </p>
                  </div>
                </div>

                {/* ── Line 4: Motif / Description in light gray box ── */}
                {req.description && (
                  <div className="bg-[#F8F9FA] rounded-2xl px-4 py-2.5 text-xs text-gray-700 italic border border-gray-100 flex items-start gap-1">
                    <span className="text-gray-400 font-serif text-sm leading-none">“</span>
                    <span className="line-clamp-2 flex-1">{req.description}</span>
                    <span className="text-gray-400 font-serif text-sm leading-none">”</span>
                  </div>
                )}

                {/* ── Line 5: Actions adapted to status (Image 1) ── */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--color-border-soft)]">
                  {/* Status: CONFIRMEE -> Détail + Refuser */}
                  {req.status === 'CONFIRMEE' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onViewDetails(req)}
                        className="px-4 py-2 rounded-full sm:rounded-xl bg-white border border-[var(--color-border)] text-xs font-bold text-gray-700 hover:bg-[#FFF8FA] hover:text-[#A61935] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>Détail</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openConfirmDialog(req, 'REFUSEE')}
                        disabled={actionDisabled(req)}
                        className="px-4 py-2 rounded-full sm:rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Refuser</span>
                      </button>
                    </>
                  )}

                  {/* Status: REFUSEE -> Détail + Confirmer */}
                  {req.status === 'REFUSEE' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onViewDetails(req)}
                        className="px-4 py-2 rounded-full sm:rounded-xl bg-white border border-[var(--color-border)] text-xs font-bold text-gray-700 hover:bg-[#FFF8FA] hover:text-[#A61935] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>Détail</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openConfirmDialog(req, 'CONFIRMEE')}
                        disabled={actionDisabled(req)}
                        className="px-4 py-2 rounded-full sm:rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirmer</span>
                      </button>
                    </>
                  )}

                  {/* Status: EN_ATTENTE -> Détail + Refuser + Confirmer */}
                  {req.status === 'EN_ATTENTE' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onViewDetails(req)}
                        className="px-4 py-2 rounded-full sm:rounded-xl bg-white border border-[var(--color-border)] text-xs font-bold text-gray-700 hover:bg-[#FFF8FA] hover:text-[#A61935] transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Détail</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openConfirmDialog(req, 'REFUSEE')}
                        disabled={actionDisabled(req)}
                        className="px-4 py-2 rounded-full sm:rounded-xl bg-white border border-[#FECACA] text-[#DC2626] hover:bg-rose-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Refuser</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openConfirmDialog(req, 'CONFIRMEE')}
                        disabled={actionDisabled(req)}
                        className="px-5 py-2 rounded-full sm:rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Confirmer</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          3. PAGINATION
          ══════════════════════════════════════════════════ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-gray-500">
          <span>
            Page {page + 1} sur {totalPages} ({totalElements} demandes)
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 0 || isLoading}
              className="p-2 rounded-xl bg-white border border-[var(--color-border)] text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page + 1 >= totalPages || isLoading}
              className="p-2 rounded-xl bg-white border border-[var(--color-border)] text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.newStatus === 'CONFIRMEE'
            ? 'Confirmer cette demande ?'
            : 'Refuser cette demande ?'
        }
        message={`Êtes-vous sûr de vouloir ${
          confirmDialog.newStatus === 'CONFIRMEE' ? 'confirmer' : 'refuser'
        } la demande de ${confirmDialog.requestName} ?`}
        confirmLabel={
          confirmDialog.newStatus === 'CONFIRMEE' ? 'Confirmer' : 'Refuser'
        }
        variant={
          confirmDialog.newStatus === 'CONFIRMEE' ? 'success' : 'danger'
        }
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setConfirmDialog({
            isOpen: false,
            requestId: null,
            requestName: '',
            newStatus: null,
          })
        }
      />
    </div>
  );
};

export default RequestTable;