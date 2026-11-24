import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  Trash2,
  AlertCircle,
  RotateCw,
  Calendar,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminNotification } from '@/types';
import { adminNotificationService } from '@/services/adminService';
import { formatReceiptDate } from '@/utils/date';

interface NotificationDropdownProps {
  /** Called from outside when count changes (e.g. to refresh sidebar badge). */
  onCountChange?: (count: number) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onCountChange }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);

  // badgeCount is maintained separately so the bell shows a number
  // even before the panel is opened (the list is only fetched on open).
  const [badgeCount, setBadgeCount] = useState<number>(0);

  // Swipe state per item
  const [swipeStates, setSwipeStates] = useState<Record<number, number>>({});
  const touchStartX = useRef<Record<number, number>>({});
  const touchStartY = useRef<Record<number, number>>({});
  const isScrolling = useRef<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // count = loaded list length, used inside the open panel
  const count = notifications.length;

  // Helper: update badge and notify parent together
  const updateBadge = useCallback((n: number) => {
    setBadgeCount(n);
    onCountChange?.(n);
  }, [onCountChange]);

  // On mount: fetch badge count immediately so bell shows the right number
  useEffect(() => {
    adminNotificationService.getCount().then(updateBadge).catch(() => {});
  }, [updateBadge]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminNotificationService.getAll();
      setNotifications(data);
      // Sync badge with actual list length
      updateBadge(data.length);
    } catch {
      setError('Impossible de charger les notifications');
    } finally {
      setIsLoading(false);
    }
  }, [updateBadge]);

  // Load when panel opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Polling every 30s to pick up new submissions while panel is closed
  useEffect(() => {
    if (isOpen) return;
    const timer = setInterval(() => {
      adminNotificationService.getCount().then(updateBadge).catch(() => {});
    }, 30_000);
    return () => clearInterval(timer);
  }, [isOpen, updateBadge]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowConfirmClearAll(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  // ── Dismiss single notification ──
  const handleDismiss = useCallback(async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Optimistic removal from list AND badge
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      updateBadge(next.length);
      return next;
    });
    setSwipeStates((prev) => { const s = { ...prev }; delete s[id]; return s; });
    try {
      await adminNotificationService.dismiss(id);
    } catch {
      // Reload on error to resync
      loadNotifications();
    }
  }, [loadNotifications, updateBadge]);

  // ── Dismiss all ──
  const handleDismissAll = useCallback(async () => {
    setShowConfirmClearAll(false);
    setNotifications([]);
    updateBadge(0);
    try {
      await adminNotificationService.dismissAll();
    } catch {
      loadNotifications();
    }
  }, [loadNotifications, updateBadge]);

  // ── Navigate on notification click ──
  const handleNotifClick = useCallback((notif: AdminNotification) => {
    setIsOpen(false);
    setShowConfirmClearAll(false);
    navigate(`/admin/requests?status=EN_ATTENTE&requestId=${notif.appointmentRequestId}`);
  }, [navigate]);

  // ── Swipe to dismiss (touch events) ──
  const handleTouchStart = (id: number, e: React.TouchEvent) => {
    touchStartX.current[id] = e.touches[0].clientX;
    touchStartY.current[id] = e.touches[0].clientY;
    isScrolling.current[id] = false;
  };

  const handleTouchMove = (id: number, e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - (touchStartX.current[id] ?? 0);
    const dy = e.touches[0].clientY - (touchStartY.current[id] ?? 0);

    // Determine scroll vs swipe intent early
    if (!isScrolling.current[id] && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      isScrolling.current[id] = true;
    }
    if (isScrolling.current[id]) return;

    // Clamp swipe to prevent over-drag
    const clampedDx = Math.max(-140, Math.min(140, dx));
    setSwipeStates((prev) => ({ ...prev, [id]: clampedDx }));
  };

  const handleTouchEnd = (id: number) => {
    if (isScrolling.current[id]) {
      setSwipeStates((prev) => ({ ...prev, [id]: 0 }));
      return;
    }
    const dx = swipeStates[id] ?? 0;
    // Threshold: swipe >80px left or right triggers dismiss
    if (Math.abs(dx) > 80) {
      handleDismiss(id);
    } else {
      setSwipeStates((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  // ── Date formatting for desired appointment ──
  const formatAppointmentDate = (notif: AdminNotification) => {
    if (!notif.appointmentDate) return null;
    const date = new Date(`${notif.appointmentDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    const months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Bell Button ── */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setShowConfirmClearAll(false); }}
        aria-label="Centre de notifications"
        aria-expanded={isOpen}
        className={`relative p-2.5 rounded-2xl transition-all cursor-pointer ${
          isOpen ? 'bg-[#FFF0F4] text-[#800020] shadow-xs' : 'text-gray-500 hover:text-[#800020] hover:bg-[#FFF0F4]'
        }`}
      >
        <Bell className="w-5 h-5" />
        {badgeCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#800020] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {/* ── Mobile backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm sm:hidden"
          onClick={() => { setIsOpen(false); setShowConfirmClearAll(false); }}
          aria-hidden="true"
        />
      )}

      {/* ── Notification Panel ── */}
      {isOpen && (
        <div
          ref={panelRef}
          role="region"
          aria-label="Panneau de notifications"
          className={[
            // Mobile: fills width with safe margins, never cut off
            'fixed inset-x-3 top-[4.25rem] z-50 flex flex-col bg-white rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden',
            'max-h-[min(calc(100vh-5.5rem),34rem)]',
            // Desktop/tablet: floating card under bell icon
            'sm:fixed-none sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-[400px] sm:rounded-2xl sm:shadow-[0_12px_40px_rgba(128,0,32,0.14)]',
          ].join(' ')}
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          {/* ══ Header ══ */}
          <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border-soft)] bg-white shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-serif font-extrabold text-base text-gray-900 tracking-tight shrink-0">
                  Nouvelles demandes
                </span>
                {count > 0 ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDF2F4] text-[#800020] border border-[#FCE7EB] shrink-0">
                    {count}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                    À jour
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={loadNotifications}
                  disabled={isLoading}
                  title="Actualiser"
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#800020]' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setShowConfirmClearAll(false); }}
                  aria-label="Fermer"
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-header: "Tout supprimer" */}
            {count > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-[var(--color-border-soft)]/60">
                {!showConfirmClearAll ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmClearAll(true)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Tout supprimer
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-medium text-gray-600">Supprimer toutes les notifications ?</span>
                    <button
                      type="button"
                      onClick={handleDismissAll}
                      className="font-bold text-rose-600 hover:text-rose-800 cursor-pointer underline"
                    >
                      Confirmer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmClearAll(false)}
                      className="font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══ Body ══ */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isLoading && notifications.length === 0 ? (
              /* Loading */
              <div className="py-10 flex flex-col items-center gap-2.5">
                <RotateCw className="w-6 h-6 animate-spin text-[#800020]" />
                <p className="text-xs text-gray-500 font-medium">Chargement…</p>
              </div>
            ) : error ? (
              /* Error */
              <div className="py-8 px-4 flex flex-col items-center gap-2 text-center">
                <AlertCircle className="w-7 h-7 text-rose-500" />
                <p className="text-xs font-semibold text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={loadNotifications}
                  className="mt-1 px-3 py-1.5 rounded-xl bg-[#FFF0F4] text-[#800020] text-xs font-bold hover:bg-[#FDE8EF] cursor-pointer"
                >
                  Réessayer
                </button>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty */
              <div className="py-10 px-4 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-gray-800">Aucune nouvelle demande en attente</p>
                <p className="text-xs text-gray-400 max-w-[220px]">
                  Toutes les demandes de rendez-vous ont été traitées ou supprimées.
                </p>
              </div>
            ) : (
              /* Notification list */
              <div className="p-2 space-y-1.5">
                {notifications.map((notif) => {
                  const dx = swipeStates[notif.id] ?? 0;
                  const appointmentStr = formatAppointmentDate(notif);

                  return (
                    <div
                      key={notif.id}
                      className="relative overflow-hidden rounded-2xl"
                    >
                      {/* Swipe-reveal trash background */}
                      <div
                        className="absolute inset-0 rounded-2xl flex items-center justify-end px-5 bg-rose-500"
                        aria-hidden="true"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </div>
                      {/* Left swipe indicator */}
                      <div
                        className="absolute inset-0 rounded-2xl flex items-center px-5 bg-rose-500"
                        aria-hidden="true"
                        style={{ opacity: dx > 0 ? 1 : 0 }}
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </div>

                      {/* Notification card — translates during swipe */}
                      <div
                        className="relative bg-[#FFF8FA] border border-[#FCE7EB] rounded-2xl px-3.5 py-3 flex items-start gap-3 cursor-pointer select-none transition-transform"
                        style={{
                          transform: `translateX(${dx}px)`,
                          transition: Math.abs(dx) === 0 ? 'transform 0.2s ease-out' : 'none',
                        }}
                        onClick={() => {
                          if (Math.abs(swipeStates[notif.id] ?? 0) > 10) return; // ignore after swipe
                          handleNotifClick(notif);
                        }}
                        onTouchStart={(e) => handleTouchStart(notif.id, e)}
                        onTouchMove={(e) => handleTouchMove(notif.id, e)}
                        onTouchEnd={() => handleTouchEnd(notif.id)}
                      >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                                  Nouvelle demande
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#800020] shrink-0" />
                              </div>
                              <p className="text-sm font-extrabold text-gray-900 truncate leading-tight">
                                {notif.fullName}
                              </p>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
                              {formatReceiptDate(notif.createdAt)}
                            </span>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#800020] font-semibold">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span dir="ltr">{notif.phoneNumber}</span>
                          </div>

                          {/* Desired appointment date/time */}
                          {appointmentStr && (
                            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-gray-700">
                              <Calendar className="w-3 h-3 shrink-0 text-gray-400" />
                              <span>
                                Souhaité : <span className="text-[#800020]">{appointmentStr}</span>
                                {notif.startTime && <> à <span className="text-[#800020] font-bold">{notif.startTime}</span></>}
                              </span>
                            </div>
                          )}

                          {/* Description excerpt */}
                          {notif.description && (
                            <p className="mt-1 text-[11px] text-gray-500 italic line-clamp-1">
                              « {notif.description} »
                            </p>
                          )}
                        </div>

                        {/* Desktop dismiss button (hover) */}
                        <button
                          type="button"
                          aria-label="Supprimer cette notification"
                          onClick={(e) => handleDismiss(notif.id, e)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer sm:opacity-100"
                          title="Supprimer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ Footer ══ */}
          <div className="px-3 py-2.5 border-t border-[var(--color-border-soft)] bg-[#FAF7F5] shrink-0">
            <button
              type="button"
              onClick={() => { setIsOpen(false); navigate('/admin/requests?status=EN_ATTENTE'); }}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#800020] hover:bg-[#FFF0F4] transition-all flex items-center justify-center gap-1.5 bg-white border border-[#FCE7EB] shadow-xs cursor-pointer"
            >
              Voir toutes les demandes en attente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
