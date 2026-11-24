import React from 'react';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-[var(--color-accent)] border-[var(--color-border)] text-[var(--color-primary-dark)]',
};

const icons: Record<AlertVariant, React.ReactNode> = {
  error: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  success: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'error',
  title,
  children,
  onRetry,
  retryLabel,
  className = '',
}) => (
  <div
    role={variant === 'error' ? 'alert' : 'status'}
    className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${variantClasses[variant]} ${className}`}
  >
    <span className="shrink-0 mt-0.5">{icons[variant]}</span>
    <div className="flex-1 min-w-0">
      {title && <p className="font-semibold mb-0.5">{title}</p>}
      <div>{children}</div>
    </div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:opacity-80"
      >
        {retryLabel}
      </button>
    )}
  </div>
);
