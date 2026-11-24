// Loading spinner
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <div
    className={[
      'rounded-full border-[var(--color-primary-light)] border-t-[var(--color-primary)] animate-spin',
      sizeClasses[size],
      className,
    ].join(' ')}
    role="status"
    aria-label="Chargement"
  />
);

export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-[var(--color-text-secondary)] text-sm">Chargement...</p>
    </div>
  </div>
);
