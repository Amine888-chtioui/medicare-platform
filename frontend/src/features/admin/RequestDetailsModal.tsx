import React, { useEffect, useRef, useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Phone,
  Calendar,
  Clock,
  FileText,
  Copy,
  Check,
  CheckCheck,
  CalendarCheck,
  AlertCircle,
  MoreVertical,
  ArrowLeft,
  User,
  ExternalLink,
} from 'lucide-react';
import type { AppointmentRequest, AppointmentStatus } from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useScrollLock } from '@/hooks/useScrollLock';
import {
  formatFrenchDateSlash,
  computeEndTime,
} from '@/utils/date';
import { adminAppointmentService } from '@/services/adminService';

interface RequestDetailsModalProps {
  request: AppointmentRequest | null;
  onClose: () => void;
  onUpdateStatus: (
    id: number,
    newStatus: AppointmentStatus,
    appointmentDate?: string,
    startTime?: string
  ) => Promise<void>;
  isUpdating?: boolean;
  error?: string | null;
}

const TIME_SLOTS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

function formatWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  let intlDigits = digits;
  if (intlDigits.startsWith('+')) {
    intlDigits = intlDigits.slice(1);
  } else if (intlDigits.startsWith('0')) {
    intlDigits = '212' + intlDigits.slice(1);
  }
  return `https://wa.me/${intlDigits}`;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  onClose,
  onUpdateStatus,
  isUpdating = false,
  error = null,
}) => {
  const { t } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Agenda slot scheduling state ("Gérer dans l'agenda")
  const [isManagingAgenda, setIsManagingAgenda] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('09:00');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    status: AppointmentStatus | null;
    customDate?: string;
    customTime?: string;
  }>({ status: null });

  const dateInputId = useId();
  const timeSelectId = useId();

  useScrollLock(Boolean(request));

  useEffect(() => {
    if (request) {
      setCustomDate(request.appointmentDate || '');
      setCustomTime(request.startTime || '09:00');
      setIsManagingAgenda(false);
      setConflictWarning(null);
      setShowMoreMenu(false);
    }
  }, [request]);

  useEffect(() => {
    if (!request) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isUpdating && !confirmState.status) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [request, isUpdating, confirmState.status, onClose]);

  if (!request) return null;

  const initial = request.fullName.trim()[0]?.toUpperCase() || 'P';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(request.phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Conflict check and validation for agenda schedule
  const handleScheduleConfirm = async () => {
    if (!customDate || !customTime) {
      setConflictWarning('Veuillez renseigner une date et une heure valides.');
      return;
    }

    setConflictWarning(null);
    setIsCheckingConflict(true);

    try {
      const hasConflict = await adminAppointmentService.checkConflict(
        customDate,
        customTime,
        request.id
      );
      if (hasConflict) {
        setConflictWarning(
          `Ce créneau (${customTime} le ${customDate}) est déjà occupé dans l'agenda. Veuillez choisir un autre horaire.`
        );
        setIsCheckingConflict(false);
        return;
      }
    } catch {
      // Proceed if conflict service is temporarily unavailable
    } finally {
      setIsCheckingConflict(false);
    }

    setConfirmState({
      status: 'CONFIRMEE',
      customDate,
      customTime,
    });
  };

  const handleDirectConfirm = () => {
    setConfirmState({
      status: 'CONFIRMEE',
      customDate: request.appointmentDate,
      customTime: request.startTime,
    });
  };

  const handleDirectRefuse = () => {
    setConfirmState({
      status: 'REFUSEE',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.status) return;
    try {
      await onUpdateStatus(
        request.id,
        confirmState.status,
        confirmState.customDate,
        confirmState.customTime
      );
      setIsManagingAgenda(false);
    } finally {
      setConfirmState({ status: null });
    }
  };

  // Receipt date & time
  const receiptDateObj = new Date(request.createdAt);
  const formattedReceiptDate = !Number.isNaN(receiptDateObj.getTime())
    ? `${String(receiptDateObj.getDate()).padStart(2, '0')}/${String(
        receiptDateObj.getMonth() + 1
      ).padStart(2, '0')}/${receiptDateObj.getFullYear()}`
    : '23/11/2026';

  const receiptTime = !Number.isNaN(receiptDateObj.getTime())
    ? receiptDateObj.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '17:30';

  // Desired slot
  const formattedDesiredDate = formatFrenchDateSlash(request.appointmentDate);
  const desiredStart = request.startTime || '08:30';
  const desiredEnd = request.endTime || computeEndTime(desiredStart, 30);

  // Status badge element matching Image 2
  const statusBadge =
    request.status === 'CONFIRMEE' ? (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F8EF] text-[#059669] border border-[#A7F3D0] inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
        <span>Confirmée</span>
      </span>
    ) : request.status === 'REFUSEE' ? (
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

  const desiredSlotBadge =
    request.status === 'CONFIRMEE' ? (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6F8EF] text-[#059669] border border-[#A7F3D0] inline-flex items-center gap-1">
        <Check className="w-3.5 h-3.5" />
        <span>Validé & Planifié</span>
      </span>
    ) : request.status === 'REFUSEE' ? (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] inline-flex items-center gap-1">
        <X className="w-3.5 h-3.5" />
        <span>Non retenu</span>
      </span>
    ) : (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] inline-flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        <span>En attente</span>
      </span>
    );

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn p-0 sm:p-4 overscroll-contain"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isUpdating && !confirmState.status) onClose();
        }}
      >
        {/* Main Modal Container */}
        <div
          role="dialog"
          aria-modal="true"
          className="bg-[#FCF9FA] sm:bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full h-[96vh] sm:h-auto sm:max-h-[92vh] overflow-hidden shadow-2xl border border-[var(--color-border)] relative flex flex-col animate-scaleIn"
        >
          {/* ══════════════════════════════════════════════════
              HEADER (Image 2 design: X + Title + Menu)
              ══════════════════════════════════════════════════ */}
          <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[var(--color-border-soft)] shrink-0">
            {/* Close / Return button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-2xs hover:bg-[#FFF0F4] hover:text-[#A61935] flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title Block */}
            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#A61935] block leading-none">
                Détail patient
              </span>
              <h3 className="font-serif text-lg font-extrabold text-[var(--color-text-primary)] mt-1">
                Demande #{request.id}
              </h3>
            </div>

            {/* Options Menu button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-2xs hover:bg-[#FFF0F4] hover:text-[#A61935] flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] py-1.5 z-30 animate-fadeIn text-xs font-semibold">
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="w-full text-left px-4 py-2 hover:bg-[#FFF8FA] text-gray-700 hover:text-[#A61935] flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier téléphone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#FFF8FA] text-gray-700 hover:text-[#A61935] flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Imprimer la fiche</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SCROLLABLE BODY WITH CARDS (Image 2)
              ══════════════════════════════════════════════════ */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 overscroll-contain">
            {/* External error alert */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Conflict warning */}
            {conflictWarning && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{conflictWarning}</span>
              </div>
            )}

            {/* ── CARD 1: IDENTITÉ DU PATIENT (Image 2) ── */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Square avatar with initial and green online dot */}
                <div className="w-14 h-14 rounded-2xl bg-[#FDE8EF] text-[#A61935] font-serif font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-2xs relative">
                  <span>{initial}</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white absolute -bottom-0.5 -right-0.5" />
                </div>

                <div className="min-w-0">
                  <h4 className="font-serif text-xl font-extrabold text-[var(--color-text-primary)] truncate">
                    {request.fullName}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span>Demande #{request.id}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[#A61935] font-bold">
                      <User className="w-3 h-3" />
                      <span>Patiente récurrente</span>
                    </span>
                  </p>
                </div>
              </div>

              <div className="shrink-0">{statusBadge}</div>
            </div>

            {/* ── CARD 2: TÉLÉPHONE PATIENTE (Image 2) ── */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col gap-3.5">
              {/* Header row: Label + Phone Number + Copier */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                    Téléphone patiente
                  </span>
                  <span
                    className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight block mt-0.5"
                    dir="ltr"
                  >
                    {request.phoneNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  {copiedPhone ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: Appeler + WhatsApp */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Button: Appeler */}
                <a
                  href={`tel:${request.phoneNumber.replace(/[^\d+]/g, '')}`}
                  className="py-3 px-4 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>Appeler</span>
                </a>

                {/* Button: WhatsApp */}
                <a
                  href={formatWhatsAppUrl(request.phoneNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-2xl bg-[#E6F9F0] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {/* Official WhatsApp SVG Icon */}
                  <svg
                    className="w-4 h-4 fill-current shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12.004 2C6.477 2 2 6.477 2 12.004a9.962 9.962 0 0 0 1.456 5.187L2 22l4.979-1.432A9.962 9.962 0 0 0 12.004 22C17.527 22 22 17.523 22 12.004 22 6.477 17.527 2 12.004 2zm0 18.154a8.138 8.138 0 0 1-4.197-1.163l-.301-.179-3.12.898.883-3.045-.196-.313A8.137 8.137 0 0 1 3.846 12c0-4.503 3.655-8.154 8.158-8.154 4.503 0 8.154 3.651 8.154 8.154 0 4.503-3.651 8.154-8.154 8.154z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* ── CARD 3: 2 INFORMATIONS DE LA DEMANDE (Statut + Reçue le) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Statut actuel */}
              <div className="bg-white rounded-3xl p-4 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A61935]">
                  <Clock className="w-4 h-4" />
                  <span>Statut actuel</span>
                </div>
                <div className="pt-1">{statusBadge}</div>
              </div>

              {/* Demande reçue le */}
              <div className="bg-white rounded-3xl p-4 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between gap-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A61935]">
                  <Calendar className="w-4 h-4" />
                  <span>Demande reçue le</span>
                </div>
                <div>
                  <span className="text-base font-extrabold text-gray-900 block">
                    {formattedReceiptDate}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    à {receiptTime} (Reçue en ligne)
                  </span>
                </div>
              </div>
            </div>

            {/* ── CARD 4: CRÉNEAU SOUHAITÉ (Image 2) ── */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col gap-3.5">
              {/* Header: Icon + Title + Status */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-soft)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0F4] text-[#A61935] flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#A61935]">
                      Créneau souhaité
                    </h5>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Par la patiente
                    </p>
                  </div>
                </div>

                {desiredSlotBadge}
              </div>

              {/* Box 1: Date souhaitée */}
              <div className="bg-[#F8F9FA] rounded-2xl p-3 sm:p-3.5 border border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-gray-600 flex items-center justify-center shrink-0 shadow-2xs border border-gray-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                    Date souhaitée
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                    {formattedDesiredDate}
                  </p>
                </div>
              </div>

              {/* Box 2: Heure souhaitée */}
              <div className="bg-[#F8F9FA] rounded-2xl p-3 sm:p-3.5 border border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-gray-600 flex items-center justify-center shrink-0 shadow-2xs border border-gray-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                    Heure souhaitée
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                    {desiredStart}{' '}
                    <span className="text-gray-500 font-medium text-xs">
                      (Fin prévue à {desiredEnd} • 30 min)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* ── CARD 5: MOTIF & DESCRIPTION DE LA DEMANDE ── */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#A61935]">
                <FileText className="w-4 h-4" />
                <span className="uppercase tracking-wider text-[11px]">
                  Motif & description de la demande
                </span>
              </div>
              {request.serviceType && (
                <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-[#FDE8EF]/60 px-3.5 py-2 rounded-2xl border border-[#FAD4E0]">
                  <span className="text-[10px] font-bold text-[#A61935] uppercase tracking-wider">
                    Prestation :
                  </span>
                  <span>{request.serviceType}</span>
                </div>
              )}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 text-xs sm:text-sm text-gray-800 border border-gray-100 leading-relaxed break-words whitespace-pre-wrap">
                {request.description ? (
                  <span>« {request.description} »</span>
                ) : (
                  <span className="text-gray-400 italic">
                    Aucun motif ou description renseigné par la patiente.
                  </span>
                )}
              </div>
            </div>

            {/* ── AGENDA SCHEDULING INTERFACE (Expanded upon clicking "Gérer dans l'agenda") ── */}
            {isManagingAgenda && (
              <div className="bg-[#FFF8FA] rounded-3xl p-4 sm:p-5 border border-[#F5D6DF] shadow-md flex flex-col gap-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-[#F5D6DF]">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#A61935]">
                    <CalendarCheck className="w-4 h-4" />
                    <span>Planification dans l'agenda</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManagingAgenda(false)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Annuler
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={dateInputId}
                      className="text-xs font-bold text-gray-700 block mb-1"
                    >
                      Date du rendez-vous
                    </label>
                    <input
                      id={dateInputId}
                      type="date"
                      min={todayStr}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-xs font-bold text-gray-900 focus:outline-none focus:border-[#A61935]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={timeSelectId}
                      className="text-xs font-bold text-gray-700 block mb-1"
                    >
                      Heure de début (créneaux de 30 min)
                    </label>
                    <select
                      id={timeSelectId}
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-xs font-bold text-gray-900 focus:outline-none focus:border-[#A61935]"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t} - {computeEndTime(t, 30)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isCheckingConflict || isUpdating}
                    onClick={handleScheduleConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-[#A61935] hover:bg-[#8D142C] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {isCheckingConflict
                        ? 'Vérification…'
                        : 'Confirmer ce rendez-vous'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleDirectRefuse}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#FECACA] text-[#DC2626] hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              BOTTOM ACTION BAR (Image 2)
              ══════════════════════════════════════════════════ */}
          <div className="p-3 sm:p-4 bg-white border-t border-[var(--color-border)] flex items-center gap-3 shrink-0 z-10">
            {/* Secondary button: Retour */}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            {/* Primary button: Gérer dans l'agenda */}
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => {
                if (isManagingAgenda) {
                  handleScheduleConfirm();
                } else {
                  setIsManagingAgenda(true);
                }
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#A61935] hover:bg-[#8D142C] text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(166,25,53,0.22)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <Calendar className="w-4 h-4" />
              <span>
                {isManagingAgenda ? 'Valider le créneau' : "Gérer dans l'agenda"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmState.status)}
        title={
          confirmState.status === 'CONFIRMEE'
            ? 'Confirmer ce rendez-vous ?'
            : 'Refuser cette demande ?'
        }
        message={
          confirmState.status === 'CONFIRMEE'
            ? `Le rendez-vous pour ${request.fullName} sera planifié le ${
                confirmState.customDate || request.appointmentDate
              } à ${confirmState.customTime || request.startTime}.`
            : `Confirmez-vous le refus de la demande de ${request.fullName} ?`
        }
        confirmLabel={
          confirmState.status === 'CONFIRMEE' ? 'Confirmer' : 'Refuser'
        }
        variant={
          confirmState.status === 'CONFIRMEE' ? 'success' : 'danger'
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState({ status: null })}
      />
    </>
  );
};

export default RequestDetailsModal;