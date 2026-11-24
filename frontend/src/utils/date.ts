const LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  ar: 'ar-MA',
};

export function resolveLocale(language: string): string {
  return LOCALES[language] ?? LOCALES.fr;
}

export function formatDate(value: string, language: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(resolveLocale(language), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(value: string, language: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(resolveLocale(language), {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function formatShortDay(isoDate: string, language: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(resolveLocale(language), {
    weekday: 'short',
  });
}

export function formatShortDate(isoDate: string, language: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(resolveLocale(language), {
    day: '2-digit',
    month: '2-digit',
  });
}

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_SHORT_FR = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

/** Formats date into e.g. "Samedi 28 Nov 2026" */
export function formatFullFrenchDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const clean = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
  const d = new Date(clean);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dayName = DAYS_FR[d.getDay()];
  const dayNum = String(d.getDate()).padStart(2, '0');
  const monthName = MONTHS_SHORT_FR[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

/** Formats date into e.g. "Samedi 28/11/2026" */
export function formatFrenchDateSlash(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const clean = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
  const d = new Date(clean);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dayName = DAYS_FR[d.getDay()];
  const dayNum = String(d.getDate()).padStart(2, '0');
  const monthNum = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${dayName} ${dayNum}/${monthNum}/${year}`;
}

/** Formats receipt date into e.g. "Reçu le 23/11/2026" or relative time */
export function formatReceiptDate(isoStr?: string | null): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes >= 0 && diffMinutes < 60) {
    return diffMinutes <= 1 ? "Reçu à l'instant" : `Reçu il y a ${diffMinutes} min`;
  }
  if (diffHours >= 0 && diffHours < 24 && now.getDate() === d.getDate()) {
    return `Reçu il y a ${diffHours} h`;
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `Reçu le ${day}/${month}/${year}`;
}

/** Computes end time 30 mins after start */
export function computeEndTime(startTime?: string | null, durationMinutes = 30): string {
  if (!startTime) return '';
  try {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  } catch {
    return '';
  }
}
