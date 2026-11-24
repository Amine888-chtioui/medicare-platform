/**
 * Professional contact details.
 *
 * IMPORTANT: no real phone number, address, opening hours, social account or
 * map location is invented in the code. Every value comes from an environment
 * variable and remains hidden until it is explicitly configured.
 *
 * See `.env.example` for the full list of variables.
 */

const PLACEHOLDER_MARKERS = ['[À CONFIRMER]', '[A CONFIRMER]', 'TODO', 'CHANGEME'];

export function isConfigured(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !PLACEHOLDER_MARKERS.some((marker) => trimmed.toUpperCase().includes(marker));
}

function optional(value: string | undefined): string | null {
  return isConfigured(value) ? value!.trim() : null;
}

export const siteConfig = {
  doctorName: 'Dr. Ilham Boughaza',
  phone: optional(import.meta.env.VITE_DOCTOR_PHONE),
  whatsapp: optional(import.meta.env.VITE_WHATSAPP_NUMBER),
  email: optional(import.meta.env.VITE_CONTACT_EMAIL),
  clinicName: optional(import.meta.env.VITE_CLINIC_NAME),
  address: optional(import.meta.env.VITE_CLINIC_ADDRESS),
  city: optional(import.meta.env.VITE_CLINIC_CITY),
  hoursWeek: optional(import.meta.env.VITE_HOURS_WEEK),
  hoursSaturday: optional(import.meta.env.VITE_HOURS_SATURDAY),
  mapEmbedUrl: optional(import.meta.env.VITE_MAP_EMBED_URL),
  mapLinkUrl: optional(import.meta.env.VITE_MAP_LINK_URL),
  facebookUrl: optional(import.meta.env.VITE_SOCIAL_FACEBOOK),
  instagramUrl: optional(import.meta.env.VITE_SOCIAL_INSTAGRAM),
};

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}`;
}
