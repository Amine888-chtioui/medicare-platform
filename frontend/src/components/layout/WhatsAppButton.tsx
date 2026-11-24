// Floating WhatsApp button — rendered only when a number is configured.
import React from 'react';
import { siteConfig, whatsappHref } from '@/config/site';

export const WhatsAppButton: React.FC = () => {
  if (!siteConfig.whatsapp) return null;

  const url = whatsappHref(siteConfig.whatsapp);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
    >
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2C6.477 2 2 6.477 2 12.004a9.962 9.962 0 0 0 1.456 5.187L2 22l4.979-1.432A9.962 9.962 0 0 0 12.004 22C17.527 22 22 17.523 22 12.004 22 6.477 17.527 2 12.004 2zm0 18.154a8.138 8.138 0 0 1-4.197-1.163l-.301-.179-3.12.898.883-3.045-.196-.313A8.137 8.137 0 0 1 3.846 12c0-4.503 3.655-8.154 8.158-8.154 4.503 0 8.154 3.651 8.154 8.154 0 4.503-3.651 8.154-8.154 8.154z" />
      </svg>
      <span className="absolute right-16 rtl:right-auto rtl:left-16 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        WhatsApp
      </span>
    </a>
  );
};
