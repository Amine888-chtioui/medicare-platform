import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  if (totalElements === 0) return null;

  const firstItem = page * pageSize + 1;
  const lastItem = Math.min((page + 1) * pageSize, totalElements);
  const canGoPrevious = page > 0 && !disabled;
  const canGoNext = page + 1 < totalPages && !disabled;

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
      aria-label={t('common.pagination')}
    >
      <p className="text-xs text-[var(--color-text-muted)]">
        {t('common.paginationSummary', {
          first: firstItem,
          last: lastItem,
          total: totalElements,
        })}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t('common.previous')}
        </button>

        <span className="text-xs font-medium text-[var(--color-text-secondary)] px-2">
          {t('common.pageOf', { page: page + 1, total: Math.max(totalPages, 1) })}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t('common.next')}
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};
