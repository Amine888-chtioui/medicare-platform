import { z } from 'zod';

// Moroccan phone number regex: accepts 06XXXXXXXX, 07XXXXXXXX, 05XXXXXXXX, or international format +2126XXXXXXXX / +2127XXXXXXXX
const moroccoPhoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;

export const createAppointmentSchema = (t: (key: string, options?: any) => string) =>
  z.object({
    fullName: z
      .string()
      .min(1, t('appointment.errors.fullNameRequired', { defaultValue: 'Le nom complet est requis' }))
      .min(2, t('appointment.errors.fullNameMin', { defaultValue: 'Le nom doit contenir au moins 2 caractères' }))
      .max(100, 'Le nom ne peut pas dépasser 100 caractères')
      .trim(),
    phoneNumber: z
      .string()
      .min(1, t('appointment.errors.phoneRequired', { defaultValue: 'Le numéro de téléphone est requis' }))
      .regex(moroccoPhoneRegex, t('appointment.errors.phoneInvalid', { defaultValue: 'Numéro de téléphone invalide (ex: 06XXXXXXXX)' }))
      .trim(),
    appointmentDate: z
      .string()
      .min(1, t('appointment.errors.dateRequired', { defaultValue: 'La date souhaitée est requise' }))
      .trim(),
    startTime: z
      .string()
      .min(1, t('appointment.errors.timeRequired', { defaultValue: "L'heure souhaitée est requise" }))
      .trim(),
    description: z
      .string()
      .max(500, t('appointment.errors.descriptionMax', { defaultValue: 'La description ne peut pas dépasser 500 caractères' }))
      .optional()
      .or(z.literal('')),
  });

export type AppointmentFormData = z.infer<ReturnType<typeof createAppointmentSchema>>;
