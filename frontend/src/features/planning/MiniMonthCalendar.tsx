import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniMonthCalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (deltaMonths: number) => void;
}

export const MiniMonthCalendar: React.FC<MiniMonthCalendarProps> = ({
  currentMonth,
  selectedDate,
  onSelectDate,
  onMonthChange,
}) => {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // First day of current month (0: Sunday, 1: Monday, ... 6: Saturday)
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Convert to Monday = 0, Sunday = 6
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay === -1) startDay = 6;

  // Build grid days (42 cells: 6 rows of 7 days)
  const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

  // Trailing days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({
      day: d,
      isCurrentMonth: false,
      date: new Date(year, month - 1, d),
    });
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Leading days from next month
  const remaining = 35 - cells.length; // 5 rows = 35 cells, or 42
  const totalTarget = remaining < 0 ? 42 : 35;
  const needNext = totalTarget - cells.length;
  for (let i = 1; i <= needNext; i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const isSelected = (d: Date) => {
    return (
      d.getFullYear() === selectedDate.getFullYear() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getDate() === selectedDate.getDate()
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between select-none">
      {/* Header matching reference */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FDE8EF] text-[#A61935] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)]">
            Calendrier du mois
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(-1)}
            aria-label="Mois précédent"
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(1)}
            aria-label="Mois suivant"
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month & Year Title matching reference */}
      <div className="text-center py-1.5">
        <p className="text-xs font-extrabold text-[var(--color-text-primary)]">
          {monthNames[month]} {year}
        </p>
      </div>

      {/* Day Labels Row */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[var(--color-text-muted)] py-1">
        {dayLabels.map((lbl) => (
          <span key={lbl}>{lbl}</span>
        ))}
      </div>

      {/* Days Numbers Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {cells.map((cell, idx) => {
          const selected = isSelected(cell.date);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(cell.date)}
              className="flex flex-col items-center justify-center py-1 cursor-pointer group"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all relative ${
                  selected
                    ? 'bg-[#A61935] text-white shadow-xs font-bold'
                    : cell.isCurrentMonth
                    ? 'text-gray-800 group-hover:bg-[#FDE8EF] group-hover:text-[#A61935]'
                    : 'text-gray-300 group-hover:text-gray-600'
                }`}
              >
                <span>{cell.day}</span>
              </div>
              {/* Little red dot below active day matching reference */}
              {selected && (
                <span className="w-1 h-1 bg-[#A61935] rounded-full mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
