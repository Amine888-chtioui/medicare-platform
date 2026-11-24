import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Plus,
  ArrowRight,
  User,
  Check,
} from 'lucide-react';
import type {
  AppointmentRequest,
  AppointmentStatus,
  CreateAppointmentRequestDto,
} from '@/types';
import { adminAppointmentService } from '@/services/adminService';
import { getApiErrorMessage } from '@/utils/errors';
import { RequestDetailsModal } from '@/features/admin/RequestDetailsModal';
import { AddClientModal } from '@/features/planning/AddClientModal';
import { Alert } from '@/components/ui/Alert';

// ── Work schedule ─────────────────────────────────────────────────────────────
// Mon-Fri: 08:00–17:00  |  Sat: 08:00–13:00  |  Sun: closed
const WORK_HOURS: Record<number, { start: number; end: number; label: string } | null> = {
  0: null,                                         // Sunday – closed
  1: { start: 8, end: 17, label: '08:00 – 17:00' }, // Monday
  2: { start: 8, end: 17, label: '08:00 – 17:00' }, // Tuesday
  3: { start: 8, end: 17, label: '08:00 – 17:00' }, // Wednesday
  4: { start: 8, end: 17, label: '08:00 – 17:00' }, // Thursday
  5: { start: 8, end: 17, label: '08:00 – 17:00' }, // Friday
  6: { start: 8, end: 13, label: '08:00 – 13:00' }, // Saturday
};

function generateTimeSlots(dayOfWeek: number): string[] {
  const hours = WORK_HOURS[dayOfWeek];
  if (!hours) return [];
  const slots: string[] = [];
  for (let h = hours.start; h < hours.end; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

const DAY_NAMES_DISPLAY = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MONTH_NAMES_DISPLAY = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'
];

function formatIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(d: Date) {
  const date = new Date(d);
  const dow = date.getDay();
  const diff = date.getDate() - dow + (dow === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function getAppointmentColor(name: string) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const variant = Math.abs(hash) % 3;
  if (variant === 0) {
    return {
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#16A34A]',
      border: 'border-[#BBF7D0]',
      dot: 'bg-[#16A34A]',
    };
  }
  if (variant === 1) {
    return {
      bg: 'bg-[#EDE9FE]',
      text: 'text-[#7C3AED]',
      border: 'border-[#DDD6FE]',
      dot: 'bg-[#7C3AED]',
    };
  }
  return {
    bg: 'bg-[#FDE8EF]',
    text: 'text-[#A61935]',
    border: 'border-[#FBCFE8]',
    dot: 'bg-[#A61935]',
  };
}

function computeEndTime(start: string): string {
  try {
    const [h, m] = start.split(':').map(Number);
    const em = m + 30;
    return `${String(em >= 60 ? h + 1 : h).padStart(2, '0')}:${String(em >= 60 ? em - 60 : em).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  // Navigation states
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));

  // Appointments data
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Week dropdown
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const weekDropdownRef = useRef<HTMLDivElement>(null);

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSlotInfo, setModalSlotInfo] = useState({ date: formatIsoDate(new Date()), time: '09:00' });
  const [actionError, setActionError] = useState<string | null>(null);

  // Outside click for week dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (weekDropdownRef.current && !weekDropdownRef.current.contains(e.target as Node)) {
        setWeekDropdownOpen(false);
      }
    };
    if (weekDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [weekDropdownOpen]);

  // Week range label e.g. "Semaine du 23 – 29 Nov."
  const weekRangeLabel = useMemo(() => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(start.getDate() + 6);
    if (start.getMonth() === end.getMonth()) {
      return `Semaine du ${start.getDate()} – ${end.getDate()} ${MONTH_NAMES_DISPLAY[end.getMonth()]}`;
    }
    return `Semaine du ${start.getDate()} ${MONTH_NAMES_DISPLAY[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES_DISPLAY[end.getMonth()]}`;
  }, [currentWeekStart]);

  // Day label e.g. "Lun. 24 Nov."
  const dayLabel = useMemo(() => {
    const dow = DAY_NAMES_DISPLAY[selectedDate.getDay()];
    const dayNum = selectedDate.getDate();
    const month = MONTH_NAMES_DISPLAY[selectedDate.getMonth()];
    return `${dow} ${dayNum} ${month}`;
  }, [selectedDate]);

  // Load appointments for the week (or selected day range)
  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(start.getDate() + 6);
    try {
      const data = await adminAppointmentService.getSchedule(formatIsoDate(start), formatIsoDate(end));
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule, refreshKey]);

  const refreshDashboard = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Day navigation with automatic week synchronization
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
    const newMonday = getMonday(prev);
    if (formatIsoDate(newMonday) !== formatIsoDate(currentWeekStart)) {
      setCurrentWeekStart(newMonday);
    }
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
    const newMonday = getMonday(next);
    if (formatIsoDate(newMonday) !== formatIsoDate(currentWeekStart)) {
      setCurrentWeekStart(newMonday);
    }
  };

  // Week dropdown actions
  const handleSelectWeekOffset = (offsetWeeks: number) => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + offsetWeeks * 7);
    setCurrentWeekStart(newWeekStart);

    // Keep same day of week
    const currentDow = selectedDate.getDay();
    const daysFromMon = currentDow === 0 ? 6 : currentDow - 1;
    const newDate = new Date(newWeekStart);
    newDate.setDate(newWeekStart.getDate() + daysFromMon);
    setSelectedDate(newDate);
    setWeekDropdownOpen(false);
  };

  const handleSelectCurrentWeek = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentWeekStart(getMonday(today));
    setWeekDropdownOpen(false);
  };

  // Work hours for selected day
  const isSunday = selectedDate.getDay() === 0;
  const workHours = WORK_HOURS[selectedDate.getDay()];
  const timeSlots = useMemo(() => generateTimeSlots(selectedDate.getDay()), [selectedDate]);

  // Confirmed appointments for selected day strictly
  const confirmedForSelectedDay = useMemo(() => {
    const key = formatIsoDate(selectedDate);
    return appointments.filter(
      (a) => a.status === 'CONFIRMEE' && a.appointmentDate?.startsWith(key)
    );
  }, [appointments, selectedDate]);

  // Find appointment at specific slot
  const findAtSlot = (time: string) =>
    confirmedForSelectedDay.find((a) => a.startTime?.startsWith(time));

  // Upcoming confirmed appointments (across all loaded data)
  const upcomingBookings = useMemo(() => {
    return [...appointments]
      .filter((a) => a.status === 'CONFIRMEE')
      .sort((a, b) =>
        `${a.appointmentDate || ''} ${a.startTime || ''}`.localeCompare(
          `${b.appointmentDate || ''} ${b.startTime || ''}`
        )
      )
      .slice(0, 5);
  }, [appointments]);

  // Modal actions
  const handleOpenAddSlot = (dateStr: string, timeStr: string) => {
    setModalSlotInfo({ date: dateStr, time: timeStr });
    setIsAddModalOpen(true);
  };

  const handleCreateAppointment = async (dto: CreateAppointmentRequestDto) => {
    await adminAppointmentService.createAppointment(dto);
    refreshDashboard();
  };

  const handleUpdateStatus = async (
    id: number,
    newStatus: AppointmentStatus,
    appointmentDate?: string,
    startTime?: string
  ) => {
    setActionError(null);
    try {
      const updated = await adminAppointmentService.updateStatus(id, {
        status: newStatus,
        appointmentDate,
        startTime,
      });
      if (selectedAppointment?.id === id) setSelectedAppointment(updated);
      refreshDashboard();
    } catch (error) {
      setActionError(getApiErrorMessage(error, t('common.error')));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Planning Hebdomadaire (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-[var(--color-border)] shadow-[0_4px_24px_rgba(166,25,53,0.04)] p-4 sm:p-6 overflow-hidden">
        {/* Top Header: Title + Week Selector */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-soft)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F4] text-[#A61935] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-[#A61935]" />
            </div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
              Planning Hebdomadaire
            </h2>
          </div>

          {/* Week Selector Dropdown Pill matching reference */}
          <div className="relative" ref={weekDropdownRef}>
            <button
              type="button"
              onClick={() => setWeekDropdownOpen(!weekDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[var(--color-border)] text-xs font-semibold text-gray-700 shadow-2xs hover:bg-[#FFF8FA] transition-all cursor-pointer"
            >
              <span>{weekRangeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {weekDropdownOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] py-1.5 z-30 animate-fadeIn">
                <button
                  type="button"
                  onClick={handleSelectCurrentWeek}
                  className="w-full text-left rtl:text-right px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF8FA] hover:text-[#A61935] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Cette semaine</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectWeekOffset(-1)}
                  className="w-full text-left rtl:text-right px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF8FA] hover:text-[#A61935] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Semaine précédente</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectWeekOffset(1)}
                  className="w-full text-left rtl:text-right px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF8FA] hover:text-[#A61935] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Semaine suivante</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Day Navigation: < Day > matching reference screenshot */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 py-3 sm:py-4">
          <button
            type="button"
            onClick={handlePrevDay}
            aria-label="Jour précédent"
            className="w-8 h-8 rounded-full bg-white border border-[var(--color-border)] shadow-2xs flex items-center justify-center text-gray-600 hover:text-[#A61935] hover:bg-[#FFF0F4] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm sm:text-base font-extrabold text-[var(--color-text-primary)] min-w-[140px] text-center tracking-tight select-none">
            {dayLabel}
          </span>

          <button
            type="button"
            onClick={handleNextDay}
            aria-label="Jour suivant"
            className="w-8 h-8 rounded-full bg-white border border-[var(--color-border)] shadow-2xs flex items-center justify-center text-gray-600 hover:text-[#A61935] hover:bg-[#FFF0F4] transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Work Hours indicator */}
        <div className="text-center pb-3">
          {isSunday ? (
            <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
              Cabinet fermé le dimanche
            </span>
          ) : workHours ? (
            <span className="text-[11px] font-medium text-[var(--color-text-muted)] bg-[#FFF8FA] px-3 py-1 rounded-full border border-[var(--color-border-soft)]">
              Horaires de travail : {workHours.label}
            </span>
          ) : null}
        </div>

        {/* Schedule Grid: Full width, no horizontal scrolling */}
        {isSunday ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-[#A61935] opacity-40" />
            </div>
            <p className="text-sm font-bold text-[var(--color-text-secondary)]">
              Cabinet fermé le dimanche
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Utilisez les flèches pour consulter un jour ouvrable.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16 text-xs text-[var(--color-text-muted)]">
            Chargement de l'agenda…
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)] border-t border-[var(--color-border-soft)]">
            {confirmedForSelectedDay.length === 0 && (
              <div className="py-3 px-4 text-center text-xs text-[var(--color-text-muted)] italic bg-[#FFF8FA]/60">
                Aucun rendez-vous confirmé pour cette journée
              </div>
            )}

            {timeSlots.map((time) => {
              const appt = findAtSlot(time);
              const isHalfHour = time.endsWith(':30');

              return (
                <div key={time} className="flex items-stretch min-h-[50px] sm:min-h-[54px] group">
                  {/* Left Column: Time label */}
                  <div
                    className={`w-14 sm:w-16 flex-shrink-0 flex items-center justify-center border-r border-[var(--color-border-soft)] ${
                      isHalfHour ? 'opacity-40' : ''
                    }`}
                  >
                    <span className="text-[11px] font-bold text-[var(--color-text-muted)]">
                      {time}
                    </span>
                  </div>

                  {/* Right Column: Full width slot */}
                  <div className="flex-1 p-1.5 flex items-center">
                    {appt ? (
                      (() => {
                        const color = getAppointmentColor(appt.fullName);
                        const start = appt.startTime || time;
                        const end = appt.endTime || computeEndTime(start);

                        return (
                          <div
                            onClick={() => setSelectedAppointment(appt)}
                            className={`w-full py-2 px-3 sm:px-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] shadow-2xs flex items-center gap-2.5 ${color.bg} ${color.border} ${color.text}`}
                          >
                            <div className="w-6 h-6 rounded-full bg-white/70 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs sm:text-sm truncate leading-tight">
                                {appt.fullName}
                              </p>
                              <p className="text-[10px] sm:text-xs font-medium opacity-80 mt-0.5">
                                {start} – {end}
                              </p>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* Empty Slot: Clickable to add new booking */
                      <button
                        type="button"
                        onClick={() => handleOpenAddSlot(formatIsoDate(selectedDate), time)}
                        className="w-full h-full min-h-[38px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-[#A61935] hover:bg-[#FDE8EF]/30 rounded-xl transition-all border border-transparent hover:border-dashed hover:border-[#FBCFE8]"
                        title={`Ajouter un rendez-vous à ${time}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Ajouter un rendez-vous</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>

        {/* Right Column: Prochains Rendez-vous & Quick Actions (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Section Prochains rendez-vous */}
          <div className="bg-white rounded-3xl border border-[var(--color-border)] shadow-[0_4px_24px_rgba(166,25,53,0.04)] p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-soft)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FDE8EF] text-[#A61935] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
              Prochains Rendez-vous
            </h3>
          </div>

          <Link
            to="/admin/requests"
            className="text-xs font-bold text-[#A61935] hover:text-[#7E1026] inline-flex items-center gap-1 group transition-colors cursor-pointer"
          >
            <span>Voir tout</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* List of upcoming bookings matching reference design */}
        <div className="flex flex-col divide-y divide-[var(--color-border-soft)]">
          {upcomingBookings.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-6 italic">
              Aucun rendez-vous à venir
            </p>
          ) : (
            upcomingBookings.map((item, idx) => {
              const initials =
                item.fullName
                  .trim()
                  .split(/\s+/)
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'PA';

              // Date badge label
              let dateBadge = '';
              if (item.appointmentDate) {
                const [y, m, d] = item.appointmentDate.split('-').map(Number);
                const monthName = MONTH_NAMES_DISPLAY[(m || 1) - 1];
                dateBadge = `${d} ${monthName}`;
              }

              const start = item.startTime || '09:00';
              const end = item.endTime || computeEndTime(start);

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setSelectedAppointment(item)}
                  className="py-3 px-2 flex items-center justify-between gap-3 rounded-2xl hover:bg-[#FFF9FA] cursor-pointer transition-colors group"
                >
                  {/* Left: Avatar initial + Name + Time */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#FDE8EF] text-[#A61935] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[#A61935] transition-colors leading-tight">
                        {item.fullName}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                        {start} – {end}
                      </p>
                    </div>
                  </div>

                  {/* Right: Date badge (e.g. "25 Nov.") matching reference */}
                  {dateBadge && (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] shrink-0">
                      {dateBadge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Action Button on Desktop */}
      <button
        type="button"
        onClick={() => handleOpenAddSlot(formatIsoDate(selectedDate), '09:00')}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#A61935] hover:bg-[#8D142C] text-white text-xs sm:text-sm font-bold transition-all shadow-[0_4px_16px_rgba(166,25,53,0.22)] hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Planifier un rendez-vous</span>
      </button>
    </div>
  </div>

      {/* ══════════════════════════════════════════════════
          3. MODALS
          ══════════════════════════════════════════════════ */}
      <RequestDetailsModal
        request={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <AddClientModal
        isOpen={isAddModalOpen}
        initialDate={modalSlotInfo.date}
        initialTime={modalSlotInfo.time}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateAppointment}
        checkConflict={(date, time) => adminAppointmentService.checkConflict(date, time)}
      />
    </div>
  );
};

export default DashboardPage;
