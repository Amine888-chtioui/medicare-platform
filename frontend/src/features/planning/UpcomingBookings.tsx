import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import type { AppointmentRequest } from '@/types';

interface UpcomingBookingsProps {
  bookings: AppointmentRequest[];
  onSelectBooking?: (booking: AppointmentRequest) => void;
  onViewAll?: () => void;
}

export const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({
  bookings,
  onSelectBooking,
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between">
      {/* Header matching reference */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FDE8EF] text-[#A61935] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)]">
            Prochaines réservations
          </h3>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-[#A61935] hover:text-[#7E1026] inline-flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>Voir tout</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* List matching reference */}
      <div className="flex flex-col divide-y divide-[var(--color-border-soft)]">
        {bookings.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-6 italic">
            Aucune réservation à venir
          </p>
        ) : (
          bookings.slice(0, 4).map((item, idx) => {
            const initials = item.fullName
              .trim()
              .split(/\s+/)
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'PA';

            // Compute badge label dynamically from appointmentDate
            const todayStr = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            let badgeLabel = "Aujourd'hui";
            let badgeStyle = 'bg-[#FDE8EF] text-[#A61935]';

            if (item.appointmentDate === todayStr) {
              badgeLabel = "Aujourd'hui";
              badgeStyle = 'bg-[#FDE8EF] text-[#A61935]';
            } else if (item.appointmentDate === tomorrowStr) {
              badgeLabel = 'Demain';
              badgeStyle = 'bg-[#EDE9FE] text-[#7C3AED]';
            } else if (item.appointmentDate) {
              const d = new Date(item.appointmentDate);
              const months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
              badgeLabel = `${d.getDate()} ${months[d.getMonth()] || ''}`;
              badgeStyle = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
            }

            const computeEndTime = (startStr: string) => {
              try {
                const [h, m] = startStr.split(':').map(Number);
                const endMinutes = m + 30;
                const endH = endMinutes >= 60 ? h + 1 : h;
                const endM = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
                return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
              } catch {
                return '';
              }
            };
            const start = item.startTime || '09:00';
            const end = item.endTime || computeEndTime(start);
            const timeRange = `${start} - ${end}`;

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectBooking?.(item)}
                className="py-2.5 px-1.5 flex items-center justify-between gap-3 rounded-xl hover:bg-[#FFF9FA] cursor-pointer transition-colors group"
              >
                {/* Left: Avatar + Name + Time */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FDE8EF] text-[#A61935] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate group-hover:text-[#A61935] transition-colors">
                      {item.fullName}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
                      {timeRange}
                    </p>
                  </div>
                </div>

                {/* Right: Pill Badge (Aujourd'hui / Demain) */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${badgeStyle}`}>
                  {badgeLabel}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
