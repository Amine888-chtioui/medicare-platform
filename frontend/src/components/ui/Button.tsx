import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)]',
  outline:
    'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-accent)] bg-transparent',
  ghost:
    'text-[var(--color-primary)] hover:bg-[var(--color-accent)] bg-transparent',
  danger:
    'bg-[var(--color-danger)] text-white hover:bg-red-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-btn)] transition-all duration-200 cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
};
