import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppointmentStatus } from '@/types';

interface BadgeProps {
  status: AppointmentStatus;
  className?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<AppointmentStatus, {
  bg: string;
  text: string;
  dot: string;
  border: string;
}> = {
  EN_ATTENTE: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    dot: 'bg-[#F59E0B]',
    border: 'border-[#FDE68A]/60',
  },
  CONFIRMEE: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#16A34A]',
    dot: 'bg-[#22C55E]',
    border: 'border-[#BBF7D0]/60',
  },
  REFUSEE: {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    dot: 'bg-[#EF4444]',
    border: 'border-[#FECACA]/60',
  },
};

export const StatusBadge: React.FC<BadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation();
  const label = t(`admin.status.${status}`, { defaultValue: status });
  const config = statusConfig[status] || statusConfig.EN_ATTENTE;

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 text-[11px]'
    : 'px-3 py-1 text-xs';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-semibold border transition-colors',
        sizeClasses,
        config.bg,
        config.text,
        config.border,
        className,
      ].join(' ')}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
