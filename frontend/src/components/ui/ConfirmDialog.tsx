import React, { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';
import { useScrollLock } from '@/hooks/useScrollLock';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'success';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    confirmBtnRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    primary: {
      icon: <AlertTriangle className="w-6 h-6 text-[#A61935]" />,
      iconBg: 'bg-[#FDE8EF]',
      btnBg: 'bg-[#A61935] hover:bg-[#8D142C] text-white',
    },
    danger: {
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      iconBg: 'bg-red-50',
      btnBg: 'bg-red-600 hover:bg-red-700 text-white',
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[var(--color-border)] flex flex-col gap-5 animate-scaleIn">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${variantStyles.iconBg} flex items-center justify-center shrink-0`}>
            {variantStyles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-gray-900 font-serif">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--color-border-soft)]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 ${variantStyles.btnBg}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
