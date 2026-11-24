/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin. Leave empty to use same-origin `/api` (Vite proxy / nginx). */
  readonly VITE_API_BASE_URL?: string;

  readonly VITE_DOCTOR_PHONE?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CLINIC_NAME?: string;
  readonly VITE_CLINIC_ADDRESS?: string;
  readonly VITE_CLINIC_CITY?: string;
  readonly VITE_HOURS_WEEK?: string;
  readonly VITE_HOURS_SATURDAY?: string;
  readonly VITE_MAP_EMBED_URL?: string;
  readonly VITE_MAP_LINK_URL?: string;
  readonly VITE_SOCIAL_FACEBOOK?: string;
  readonly VITE_SOCIAL_INSTAGRAM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
