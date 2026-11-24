import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, User, Phone, FileText, AlertCircle, Check } from 'lucide-react';
import type { CreateAppointmentRequestDto } from '@/types';
import { useScrollLock } from '@/hooks/useScrollLock';

interface AddClientModalProps {
  isOpen: boolean;
  initialDate?: string;
  initialTime?: string;
  initialFullName?: string;
  initialPhone?: string;
  onClose: () => void;
  onSubmit: (data: CreateAppointmentRequestDto) => Promise<void>;
  checkConflict?: (date: string, time: string) => Promise<boolean> | boolean;
}

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
];

const SERVICES = [
  'Consultation gynécologique',
  'Suivi de grossesse & maternité',
  'Échographie obstétricale',
  'Contraception & planification',
  'Bilan de santé féminine',
  'Consultation post-natale',
];

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  initialDate = '',
  initialTime = '09:00',
  initialFullName = '',
  initialPhone = '',
  onClose,
  onSubmit,
  checkConflict,
}) => {
  const [fullName, setFullName] = useState(initialFullName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [appointmentDate, setAppointmentDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialTime);
  const [serviceType, setServiceType] = useState(SERVICES[0]);
  const [description, setDescription] = useState('');

  const [hasConflict, setHasConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (initialDate) setAppointmentDate(initialDate);
    if (initialTime) setStartTime(initialTime);
    if (initialFullName) setFullName(initialFullName);
    if (initialPhone) setPhoneNumber(initialPhone);
  }, [initialDate, initialTime, initialFullName, initialPhone]);

  // Real-time conflict validation
  useEffect(() => {
    if (!appointmentDate || !startTime || !checkConflict) {
      setHasConflict(false);
      return;
    }
    const check = async () => {
      try {
        const conflict = await checkConflict(appointmentDate, startTime);
        setHasConflict(conflict);
      } catch {
        setHasConflict(false);
      }
    };
    check();
  }, [appointmentDate, startTime, checkConflict]);

  if (!isOpen) return null;

  // Compute end time (+30 min)
  const computeEndTime = (start: string) => {
    const [h, m] = start.split(':').map(Number);
    const date = new Date(2000, 0, 1, h, m + 30);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Le nom complet du patient est obligatoire (au moins 2 caractères).');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Le numéro de téléphone est obligatoire.');
      return;
    }

    if (hasConflict) {
      setError('Ce créneau horaire est déjà occupé. Veuillez choisir une autre heure.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endTime = computeEndTime(startTime);
      await onSubmit({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        appointmentDate,
        startTime,
        endTime,
        serviceType,
        description: description.trim() || undefined,
      });
      onClose();
      // Reset form
      setFullName('');
      setPhoneNumber('');
      setDescription('');
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la création du rendez-vous.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-client-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto overscroll-contain p-6 sm:p-7 shadow-2xl border border-[var(--color-border)] relative flex flex-col gap-5 animate-scaleIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDE8EF] text-[#A61935] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-client-title" className="font-serif text-lg font-bold text-gray-900">
                Ajouter un client / Rendez-vous
              </h3>
              <p className="text-xs text-gray-500">Planifiez un nouveau rendez-vous dans l'agenda</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {hasConflict && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Attention : ce créneau horaire est déjà occupé par un autre rendez-vous.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs sm:text-sm">
          {/* Nom complet */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Nom complet du patient *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Fatima Zahra"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935] transition-all"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Numéro de téléphone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 0612345678"
                dir="ltr"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935] transition-all"
              />
            </div>
          </div>

          {/* Date & Heure Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Date du rendez-vous *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Heure de début *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935] transition-all appearance-none cursor-pointer"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t} (fin: {computeEndTime(t)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Service / Motif */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Motif / Service
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935] transition-all cursor-pointer"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Remarques / Description (optionnel)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisions sur la consultation..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935] transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasConflict}
              className="px-5 py-2.5 rounded-xl bg-[#A61935] hover:bg-[#8D142C] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistrer le rendez-vous</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
