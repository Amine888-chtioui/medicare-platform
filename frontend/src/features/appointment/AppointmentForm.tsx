import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  User,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  ChevronDown,
  Send,
  CheckCircle,
} from 'lucide-react';
import { createAppointmentSchema, type AppointmentFormData } from './appointmentSchema';
import { appointmentService } from '@/services/appointmentService';
import { getApiErrorMessage } from '@/utils/errors';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface AppointmentFormProps {
  onSuccess?: () => void;
  className?: string;
}

const TIME_OPTIONS_WEEKDAY = [
  '08:00',
  '08:30',
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

const TIME_OPTIONS_SATURDAY = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
];

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, className = '' }) => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = createAppointmentSchema(t);

  // Minimum date selectable is today
  const todayIso = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      appointmentDate: '',
      startTime: '',
      description: '',
    },
  });

  const selectedDateStr = watch('appointmentDate');
  const dayOfWeek = selectedDateStr ? new Date(`${selectedDateStr}T00:00:00`).getDay() : null;
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const availableTimeOptions = isSaturday ? TIME_OPTIONS_SATURDAY : TIME_OPTIONS_WEEKDAY;

  const descriptionValue = watch('description') || '';

  const onSubmit = async (data: AppointmentFormData) => {
    setServerError(null);
    try {
      await appointmentService.create({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        description: data.description || undefined,
      });
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      setServerError(getApiErrorMessage(error, t('appointment.errors.serverError', { defaultValue: 'Une erreur est survenue lors de la soumission.' })));
    }
  };

  const handleReset = () => {
    reset();
    setIsSubmitted(false);
    setServerError(null);
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-[#F0FFF4] to-[#ECFDF5] rounded-3xl p-8 sm:p-10 border border-green-200 text-center flex flex-col items-center justify-center animate-fadeIn gap-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-xs">
          <CheckCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#1A5C38] mb-1.5">
            {t('appointment.successTitle', { defaultValue: 'Demande envoyée !' })}
          </h3>
          <p className="text-[#3D7A58] text-sm max-w-md leading-relaxed">
            {t('appointment.successMessage', { defaultValue: 'Nous avons bien reçu votre demande avec votre créneau souhaité. Le cabinet vous contactera très prochainement pour confirmer votre rendez-vous.' })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="rounded-xl mt-2">
          {t('appointment.newRequest', { defaultValue: 'Nouvelle demande' })}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-5 ${className}`}
      noValidate
    >
      {serverError && (
        <Alert variant="error" title={t('common.error', { defaultValue: 'Erreur' })}>
          {serverError}
        </Alert>
      )}

      {/* Row 1: Nom complet & Numéro de téléphone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Nom complet */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#A61935]" />
            <span>Nom complet <span className="text-[#A61935]">*</span></span>
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            maxLength={100}
            placeholder="Votre nom complet"
            aria-invalid={Boolean(errors.fullName)}
            {...register('fullName')}
            className={`w-full px-4 py-2.5 sm:py-3 rounded-2xl border text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none transition-all duration-200 bg-white ${
              errors.fullName
                ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-[var(--color-border)] focus:border-[#A61935] focus:ring-2 focus:ring-[#FDE8EF]'
            }`}
          />
          {errors.fullName && (
            <span className="text-xs text-red-500 font-medium" role="alert">{errors.fullName.message}</span>
          )}
        </div>

        {/* Numéro de téléphone */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phoneNumber" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-[#A61935]" />
            <span>Numéro de téléphone <span className="text-[#A61935]">*</span></span>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="06XXXXXXXX"
            dir="ltr"
            aria-invalid={Boolean(errors.phoneNumber)}
            {...register('phoneNumber')}
            className={`w-full px-4 py-2.5 sm:py-3 rounded-2xl border text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none transition-all duration-200 bg-white ${
              errors.phoneNumber
                ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-[var(--color-border)] focus:border-[#A61935] focus:ring-2 focus:ring-[#FDE8EF]'
            }`}
          />
          {errors.phoneNumber && (
            <span className="text-xs text-red-500 font-medium" role="alert">{errors.phoneNumber.message}</span>
          )}
        </div>
      </div>

      {/* Row 2: Date souhaitée & Heure souhaitée matching reference screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Date souhaitée */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="appointmentDate" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#A61935]" />
            <span>Date souhaitée <span className="text-[#A61935]">*</span></span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-500">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              id="appointmentDate"
              type="date"
              min={todayIso}
              aria-invalid={Boolean(errors.appointmentDate)}
              {...register('appointmentDate')}
              className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-2xl border text-sm text-[var(--color-text-primary)] focus:outline-none transition-all duration-200 bg-white cursor-pointer ${
                errors.appointmentDate
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-[var(--color-border)] focus:border-[#A61935] focus:ring-2 focus:ring-[#FDE8EF]'
              }`}
            />
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-700">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {isSunday && (
            <span className="text-xs text-amber-600 font-semibold" role="alert">
              Le cabinet est fermé le dimanche. Choisissez du lundi au samedi.
            </span>
          )}
          {errors.appointmentDate && (
            <span className="text-xs text-red-500 font-medium" role="alert">{errors.appointmentDate.message}</span>
          )}
        </div>

        {/* Heure souhaitée */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="startTime" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#A61935]" />
            <span>Heure souhaitée <span className="text-[#A61935]">*</span></span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-500">
              <Clock className="w-4 h-4" />
            </div>
            <select
              id="startTime"
              disabled={isSunday}
              aria-invalid={Boolean(errors.startTime)}
              {...register('startTime')}
              className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-2xl border text-sm text-[var(--color-text-primary)] focus:outline-none transition-all duration-200 bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.startTime
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-[var(--color-border)] focus:border-[#A61935] focus:ring-2 focus:ring-[#FDE8EF]'
              }`}
            >
              <option value="">
                {isSunday ? 'Fermé le dimanche' : isSaturday ? 'Choisir (08:00 - 13:00)' : 'Choisir une heure'}
              </option>
              {!isSunday &&
                availableTimeOptions.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-700">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {errors.startTime && (
            <span className="text-xs text-red-500 font-medium" role="alert">{errors.startTime.message}</span>
          )}
        </div>
      </div>

      {/* Row 3: Description (optionnel) with character count 0/500 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-[#A61935]" />
          <span>Description (optionnel)</span>
        </label>
        <div className="relative">
          <textarea
            id="description"
            rows={3}
            maxLength={500}
            placeholder="Décrivez brièvement le motif de votre rendez-vous..."
            aria-invalid={Boolean(errors.description)}
            {...register('description')}
            className={`w-full px-4 py-3 pb-7 rounded-2xl border text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none resize-none transition-all duration-200 bg-white ${
              errors.description
                ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-[var(--color-border)] focus:border-[#A61935] focus:ring-2 focus:ring-[#FDE8EF]'
            }`}
          />
          {/* Character counter at bottom-right inside textarea matching reference screenshot */}
          <div className="absolute right-3.5 bottom-2.5 text-[11px] font-medium text-gray-400 pointer-events-none select-none">
            {descriptionValue.length} / 500
          </div>
        </div>
        {errors.description && (
          <span className="text-xs text-red-500 font-medium" role="alert">{errors.description.message}</span>
        )}
      </div>

      {/* Privacy note */}
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
        {t('appointment.consentNote', { defaultValue: 'En envoyant ce formulaire, vous acceptez que vos coordonnées soient utilisées uniquement pour vous recontacter au sujet de votre demande.' })}{' '}
        <Link to="/confidentialite" className="text-[#A61935] font-medium hover:underline">
          {t('footer.privacy', { defaultValue: 'Politique de confidentialité' })}
        </Link>
      </p>

      {/* Bouton d'envoi */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={isSubmitting}
        className="w-full py-3.5 text-sm sm:text-base font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
        rightIcon={<Send className="w-4 h-4 ml-1" />}
      >
        {isSubmitting ? t('appointment.submitting', { defaultValue: 'Envoi en cours...' }) : t('appointment.submit', { defaultValue: 'Envoyer la demande' })}
      </Button>
    </form>
  );
};
