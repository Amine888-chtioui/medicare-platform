import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  Crosshair,
  Plus,
  Clock,
} from 'lucide-react';
import type { AppointmentRequest } from '@/types';

interface WeeklyCalendarProps {
  currentWeekStart: Date;
  selectedDate: Date;
  appointments: AppointmentRequest[];
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
  onTodayClick: () => void;
  onSelectAppointment: (appointment: AppointmentRequest) => void;
  onAddSlotClick: (dateStr: string, timeStr: string) => void;
}

// ── Work schedule ─────────────────────────────────────────────────────────────
// Mon-Fri: 08:00–17:00  |  Sat: 08:00–13:00  |  Sun: closed
const WORK_HOURS: Record<number, { start: number; end: number; label: string } | null> = {
  0: null,
  1: { start: 8, end: 17, label: '08:00 – 17:00' },
  2: { start: 8, end: 17, label: '08:00 – 17:00' },
  3: { start: 8, end: 17, label: '08:00 – 17:00' },
  4: { start: 8, end: 17, label: '08:00 – 17:00' },
  5: { start: 8, end: 17, label: '08:00 – 17:00' },
  6: { start: 8, end: 13, label: '08:00 – 13:00' },
};

function generateTimeSlots(dayOfWeek: number): string[] {
  const h = WORK_HOURS[dayOfWeek];
  if (!h) return [];
  const slots: string[] = [];
  for (let i = h.start; i < h.end; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`);
    slots.push(`${String(i).padStart(2, '0')}:30`);
  }
  return slots;
}

// Time slots for the FULL week grid (08:00–17:00 — widest range)
const FULL_TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 8; h < 17; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

const DAY_NAMES = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
const DAY_NAMES_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTH_NAMES_SHORT = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'
];

function getBadgeStyle(_appointment: AppointmentRequest, name: string) {
  const n = name.toLowerCase();
  if (n.includes('benali') || n.includes('fassi') || n.includes('saber'))
    return { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]', dot: 'bg-[#16A34A]' };
  if (n.includes('belkacem') || n.includes('mansouri') || n.includes('moutaouakil'))
    return { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]', border: 'border-[#DDD6FE]', dot: 'bg-[#7C3AED]' };
  return { bg: 'bg-[#FDE8EF]', text: 'text-[#A61935]', border: 'border-[#FBCFE8]', dot: 'bg-[#A61935]' };
}

function computeEndTime(start: string): string {
  try {
    const [h, m] = start.split(':').map(Number);
    const em = m + 30;
    return `${String(em >= 60 ? h + 1 : h).padStart(2, '0')}:${String(em >= 60 ? em - 60 : em).padStart(2, '0')}`;
  } catch { return ''; }
}

// ── Mobile single-day view ─────────────────────────────────────────────────────
interface MobileDayViewProps {
  day: Date;
  appointments: AppointmentRequest[];
  onSelectAppointment: (a: AppointmentRequest) => void;
  onAddSlotClick: (dateStr: string, timeStr: string) => void;
}

function formatDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MobileDayView: React.FC<MobileDayViewProps> = ({
  day, appointments, onSelectAppointment, onAddSlotClick,
}) => {
  const dow = day.getDay();
  const isSunday = dow === 0;
  const workH = WORK_HOURS[dow];
  const timeSlots = generateTimeSlots(dow);
  const dateKey = formatDateKey(day);

  const findAtSlot = (time: string) =>
    appointments.find(a => a.status === 'CONFIRMEE' && a.appointmentDate?.startsWith(dateKey) && a.startTime?.startsWith(time));

  if (isSunday) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF0F4] flex items-center justify-center">
          <CalendarIcon className="w-7 h-7 text-[#A61935] opacity-40" />
        </div>
        <p className="text-sm font-bold text-[var(--color-text-secondary)]">Cabinet fermé le dimanche</p>
      </div>
    );
  }

  return (
    <div>
      {workH && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#FFF8FA] border-b border-[var(--color-border-soft)]">
          <Clock className="w-3.5 h-3.5 text-[#A61935]" />
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
            Horaires : {workH.label}
          </span>
        </div>
      )}
      <div className="divide-y divide-[var(--color-border-soft)]">
        {timeSlots.map((time) => {
          const appt = findAtSlot(time);
          const isHalf = time.endsWith(':30');
          return (
            <div key={time} className="flex items-stretch min-h-[52px] group">
              <div className={`w-16 flex-shrink-0 flex items-center justify-center border-r border-[var(--color-border-soft)] ${isHalf ? 'opacity-40' : ''}`}>
                <span className="text-[11px] font-bold text-[var(--color-text-muted)]">{time}</span>
              </div>
              <div className="flex-1 p-1.5 flex items-center">
                {appt ? (() => {
                  const badge = getBadgeStyle(appt, appt.fullName);
                  const start = appt.startTime || time;
                  const end   = appt.endTime   || computeEndTime(start);
                  return (
                    <div
                      onClick={() => onSelectAppointment(appt)}
                      className={`w-full py-2 px-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] shadow-2xs flex items-center gap-2.5 ${badge.bg} ${badge.border} ${badge.text}`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate leading-tight">{appt.fullName}</p>
                        <p className="text-xs font-medium opacity-80">{start} – {end}</p>
                      </div>
                    </div>
                  );
                })() : (
                  <button
                    type="button"
                    onClick={() => onAddSlotClick(dateKey, time)}
                    className="w-full h-full min-h-[36px] opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 text-gray-400 hover:text-[#A61935] hover:bg-[#FDE8EF]/30 rounded-lg transition-all text-xs"
                    title={`Ajouter un rendez-vous à ${time}`}
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>Ajouter</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main WeeklyCalendar ───────────────────────────────────────────────────────
export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  currentWeekStart,
  selectedDate,
  appointments,
  viewMode,
  onViewModeChange,
  onTodayClick,
  onSelectAppointment,
  onAddSlotClick,
}) => {
  const [mobileDayIndex, setMobileDayIndex] = useState(0);

  // Keep mobileDayIndex in sync with selectedDate
  React.useEffect(() => {
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      return d;
    });
    const idx = weekDays.findIndex(d => formatDateKey(d) === formatDateKey(selectedDate));
    if (idx >= 0) setMobileDayIndex(idx);
  }, [selectedDate, currentWeekStart]);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return d;
  });

  const findAppointment = (dateKey: string, time: string) => {
    return appointments.find((a) => {
      if (!a.appointmentDate || a.status !== 'CONFIRMEE') return false;
      return a.appointmentDate.startsWith(dateKey) && a.startTime?.startsWith(time);
    });
  };

  const selectedDay = weekDays[mobileDayIndex] ?? selectedDate;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FDE8EF] text-[#A61935] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
            Agenda de la Semaine
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => onViewModeChange('week')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'week' ? 'bg-[#A61935] text-white shadow-xs' : 'bg-white border border-[var(--color-border)] text-gray-700 hover:bg-[#FFF8FA]'
            }`}>
            <CalendarIcon className="w-3.5 h-3.5" /><span>Semaine</span>
          </button>
          <button type="button" onClick={() => onViewModeChange('month')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'month' ? 'bg-[#A61935] text-white shadow-xs' : 'bg-white border border-[var(--color-border)] text-gray-700 hover:bg-[#FFF8FA]'
            }`}>
            <LayoutGrid className="w-3.5 h-3.5" /><span>Mois</span>
          </button>
          <button type="button" onClick={onTodayClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[var(--color-border)] text-gray-700 hover:bg-[#FFF8FA] transition-all cursor-pointer">
            <Crosshair className="w-3.5 h-3.5" /><span>Aujourd'hui</span>
          </button>
        </div>
      </div>

      {/* ── MOBILE: Day tabs + single-day view ───────────────────── */}
      <div className="lg:hidden">
        {/* Day selector tabs */}
        <div className="flex overflow-x-auto border-b border-[var(--color-border)] scrollbar-hide">
          {weekDays.map((d, i) => {
            const dow = d.getDay();
            const isClosed = dow === 0;
            const isSelected = i === mobileDayIndex;
            const confirmedCount = appointments.filter(
              a => a.status === 'CONFIRMEE' && a.appointmentDate?.startsWith(formatDateKey(d))
            ).length;
            return (
              <button
                key={i}
                type="button"
                onClick={() => { setMobileDayIndex(i); onTodayClick(); }}
                disabled={isClosed}
                className={[
                  'flex flex-col items-center gap-0.5 px-3 py-3 min-w-[52px] transition-all shrink-0 relative border-b-2',
                  isSelected
                    ? 'border-[#A61935] text-[#A61935]'
                    : isClosed
                    ? 'border-transparent text-gray-300 cursor-not-allowed'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[#A61935] cursor-pointer',
                ].join(' ')}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  {DAY_NAMES[i]}
                </span>
                <span className={`text-sm font-extrabold ${isSelected ? 'text-[#A61935]' : ''}`}>
                  {d.getDate()}
                </span>
                {confirmedCount > 0 && (
                  <span className="w-1 h-1 rounded-full bg-[#A61935]" />
                )}
                {isClosed && (
                  <span className="text-[8px] opacity-50">Fermé</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Single-day schedule */}
        <MobileDayView
          day={selectedDay}
          appointments={appointments}
          onSelectAppointment={onSelectAppointment}
          onAddSlotClick={onAddSlotClick}
        />
      </div>

      {/* ── DESKTOP: Full week grid ───────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Table Header */}
          <div className="grid grid-cols-8 border-b border-[var(--color-border)] py-2 text-center">
            <div className="flex items-center justify-center">
              <span className="text-[11px] font-bold text-[var(--color-text-muted)]">Heure</span>
            </div>
            {weekDays.map((d, i) => {
              const dow = d.getDay();
              const isClosed = dow === 0;
              const isSat = dow === 6;
              const workH = WORK_HOURS[dow];
              return (
                <div key={i} className={`flex flex-col items-center justify-center py-1 rounded-xl ${isClosed ? 'bg-gray-50/60' : ''}`}>
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {DAY_NAMES[i]} {d.getDate()}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                    {MONTH_NAMES_SHORT[d.getMonth()]}
                  </span>
                  {workH && (
                    <span className="text-[9px] text-[var(--color-text-muted)] opacity-70">
                      {workH.label}
                    </span>
                  )}
                  {isClosed && (
                    <span className="text-[9px] text-rose-400 font-semibold">Fermé</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[var(--color-border-soft)]">
            {FULL_TIME_SLOTS.map((time, rowIdx) => (
              <div key={time} className="grid grid-cols-8 min-h-[48px] items-stretch">
                {/* Time label */}
                <div className={`text-[11px] font-bold text-[var(--color-text-muted)] flex items-center justify-center border-r border-[var(--color-border-soft)] py-2 ${time.endsWith(':30') ? 'opacity-50' : ''}`}>
                  {time}
                </div>

                {weekDays.map((day, colIdx) => {
                  const dow = day.getDay();
                  const dateKey = formatDateKey(day);
                  const isClosed = dow === 0;
                  const workH = WORK_HOURS[dow];

                  // Check if this time slot is within work hours for this day
                  const slotHour = parseInt(time.split(':')[0]);
                  const isOutOfHours = !workH || slotHour < workH.start || slotHour >= workH.end;

                  const appointment = findAppointment(dateKey, time);

                  return (
                    <div
                      key={colIdx}
                      className={`relative border-r border-[var(--color-border-soft)] p-1 flex items-center justify-center transition-colors group ${
                        isClosed || isOutOfHours ? 'bg-gray-50/50' : 'hover:bg-[#FFF9FA]/60'
                      }`}
                    >
                      {isClosed ? null : isOutOfHours ? (
                        rowIdx === 0 && (
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] text-gray-300 font-medium">—</span>
                        )
                      ) : appointment ? (
                        (() => {
                          const badge = getBadgeStyle(appointment, appointment.fullName);
                          const start = appointment.startTime || time;
                          const end   = appointment.endTime   || computeEndTime(start);
                          return (
                            <div
                              onClick={() => onSelectAppointment(appointment)}
                              className={`w-full py-1.5 px-2 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs flex flex-col justify-center leading-tight ${badge.bg} ${badge.border} ${badge.text}`}
                            >
                              <div className="flex items-center gap-1 min-w-0">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                                <span className="font-bold text-[10px] sm:text-[11px] truncate">{appointment.fullName}</span>
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-medium opacity-85 pl-2.5">
                                {start} – {end}
                              </span>
                            </div>
                          );
                        })()
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddSlotClick(dateKey, time)}
                          className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-gray-400 hover:text-[#A61935] hover:bg-[#FDE8EF]/40 rounded-lg transition-all"
                          title={`Ajouter un rendez-vous à ${time}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
