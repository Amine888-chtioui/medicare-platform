import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminAppointmentService } from '@/services/adminService';
import type { AppointmentRequest, AppointmentStatus, CreateAppointmentRequestDto } from '@/types';
import { WeeklyCalendar } from '@/features/planning/WeeklyCalendar';
import { UpcomingBookings } from '@/features/planning/UpcomingBookings';
import { MiniMonthCalendar } from '@/features/planning/MiniMonthCalendar';
import { AddClientModal } from '@/features/planning/AddClientModal';
import { RequestDetailsModal } from '@/features/admin/RequestDetailsModal';

// Initial reference week starts at today's Monday
const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const PlanningPage: React.FC = () => {
  const { t } = useTranslation();

  // Selected date and week state — start from actual today
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Appointments data strictly from backend / database
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSlotInfo, setModalSlotInfo] = useState<{ date: string; time: string }>({
    date: '2026-11-24',
    time: '09:00',
  });
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);

  // Helper to format date YYYY-MM-DD
  const formatIsoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper to get Monday of any date
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  // Navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
    setSelectedDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
    setSelectedDate(next);
  };

  const handleSelectDateFromMiniCalendar = (date: Date) => {
    setSelectedDate(date);
    setCurrentWeekStart(getMonday(date));
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const handleMonthChange = (delta: number) => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1));
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentWeekStart(getMonday(today));
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Week range label e.g. "Semaine du 24 - 30 Nov. 2026"
  const weekRangeLabel = useMemo(() => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(start.getDate() + 6);

    const startDay = start.getDate();
    const endDay = end.getDate();
    const months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    const monthName = months[end.getMonth()];
    const year = end.getFullYear();

    return `Semaine du ${startDay} - ${endDay} ${monthName} ${year}`;
  }, [currentWeekStart]);

  // Load appointments from backend
  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(start.getDate() + 6);

    try {
      const data = await adminAppointmentService.getSchedule(
        formatIsoDate(start),
        formatIsoDate(end)
      );
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Add client submit handler
  const handleCreateAppointment = async (dto: CreateAppointmentRequestDto) => {
    try {
      const created = await adminAppointmentService.createAppointment(dto);
      setAppointments((prev) => [created, ...prev]);
      loadSchedule();
    } catch (err) {
      console.error('Erreur lors de la création du rendez-vous', err);
      throw err;
    }
  };

  // Conflict check handler strictly using backend
  const handleCheckConflict = async (date: string, time: string) => {
    return adminAppointmentService.checkConflict(date, time);
  };

  // Open Add modal with specific pre-filled slot
  const handleOpenAddSlot = (dateStr: string, timeStr: string) => {
    setModalSlotInfo({ date: dateStr, time: timeStr });
    setIsAddModalOpen(true);
  };

  // Stats calculation based strictly on real backend data
  const totalRdvCount = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMEE').length;
  const todayIso = formatIsoDate(selectedDate);
  const todayRdvCount = appointments.filter((a) => a.appointmentDate === todayIso).length;
  const occupiedHoursPercent = totalRdvCount > 0 ? Math.min(Math.round((totalRdvCount / 35) * 100), 100) : 0;

  // Upcoming bookings list strictly from real appointments
  const upcomingBookings = useMemo(() => {
    return [...appointments]
      .filter((a) => a.status === 'CONFIRMEE')
      .sort((a, b) => {
        const dateA = `${a.appointmentDate || ''} ${a.startTime || ''}`;
        const dateB = `${b.appointmentDate || ''} ${b.startTime || ''}`;
        return dateA.localeCompare(dateB);
      })
      .slice(0, 4);
  }, [appointments]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ══════════════════════════════════════════════════
          1. TITLE HEADER & WEEK NAVIGATION (matching reference)
          ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Title Block with Vertical Accent Bar */}
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-7 sm:h-8 bg-[#800020] rounded-full shrink-0" />
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              Planning Hebdomadaire
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium mt-0.5">
              Gérez les rendez-vous et consultez votre agenda
            </p>
          </div>
        </div>

        {/* Date navigation pill matching reference */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[var(--color-border)] shadow-2xs">
          <CalendarIcon className="w-4 h-4 text-[#A61935]" />
          <span className="text-xs sm:text-sm font-bold text-gray-800">
            {weekRangeLabel}
          </span>
          <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
            <button
              type="button"
              onClick={handlePrevWeek}
              aria-label="Semaine précédente"
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              aria-label="Semaine suivante"
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          2. MAIN LAYOUT: CENTER CALENDAR + RIGHT SIDE PANEL
          ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center (8 cols): Large Weekly Agenda Grid */}
        <div className="lg:col-span-8">
          <WeeklyCalendar
            currentWeekStart={currentWeekStart}
            selectedDate={selectedDate}
            appointments={appointments}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onTodayClick={handleTodayClick}
            onSelectAppointment={setSelectedAppointment}
            onAddSlotClick={handleOpenAddSlot}
          />
        </div>

        {/* Right (4 cols): Prochaines réservations + Button + Mini Month Calendar */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Prochaines réservations Card */}
          <UpcomingBookings
            bookings={upcomingBookings}
            onSelectBooking={setSelectedAppointment}
            onViewAll={() => setViewMode('week')}
          />

          {/* Button: + Ajouter un client matching reference */}
          <button
            type="button"
            onClick={() => handleOpenAddSlot(formatIsoDate(selectedDate), '09:00')}
            className="w-full py-3 px-4 rounded-2xl bg-[#A61935] hover:bg-[#8D142C] text-white font-bold text-sm shadow-[0_4px_16px_rgba(166,25,53,0.22)] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Ajouter un client</span>
          </button>

          {/* Calendrier du mois Card */}
          <MiniMonthCalendar
            currentMonth={calendarMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDateFromMiniCalendar}
            onMonthChange={handleMonthChange}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          4. MODALS
          ══════════════════════════════════════════════════ */}
      {/* Add Client / Appointment Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        initialDate={modalSlotInfo.date}
        initialTime={modalSlotInfo.time}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateAppointment}
        checkConflict={handleCheckConflict}
      />

      {/* View Appointment Details Modal */}
      <RequestDetailsModal
        request={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdateStatus={async (id, newStatus, appointmentDate, startTime) => {
          try {
            const updated = await adminAppointmentService.updateStatus(id, {
              status: newStatus,
              appointmentDate,
              startTime,
            });
            setAppointments((prev) =>
              prev.map((a) => (a.id === id ? { ...a, ...updated, status: newStatus } : a))
            );
            if (selectedAppointment?.id === id) {
              setSelectedAppointment((prev) =>
                prev ? { ...prev, ...updated, status: newStatus } : null
              );
            }
          } catch {
            // Local fallback
            setAppointments((prev) =>
              prev.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      status: newStatus,
                      ...(appointmentDate ? { appointmentDate } : {}),
                      ...(startTime ? { startTime } : {}),
                    }
                  : a
              )
            );
          }
          loadSchedule();
        }}
      />
    </div>
  );
};

export default PlanningPage;
