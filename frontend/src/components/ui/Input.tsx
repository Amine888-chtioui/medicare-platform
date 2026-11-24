import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
            {props.required && (
              <span className="text-[var(--color-primary)] ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full px-4 py-3 rounded-lg border bg-white text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]',
              'transition-all duration-200 outline-none',
              leftAddon ? 'pl-10 rtl:pl-4 rtl:pr-10' : '',
              error
                ? 'border-[var(--color-danger)] focus:ring-2 focus:ring-red-200'
                : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)] flex items-center gap-1">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
            {props.required && (
              <span className="text-[var(--color-primary)] ml-1">*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={[
            'w-full px-4 py-3 rounded-lg border bg-white text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]',
            'transition-all duration-200 outline-none resize-none',
            error
              ? 'border-[var(--color-danger)] focus:ring-2 focus:ring-red-200'
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--color-danger)] flex items-center gap-1">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
