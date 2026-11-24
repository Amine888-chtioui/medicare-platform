import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppointmentForm } from '@/features/appointment/AppointmentForm';

const AppointmentPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-12 md:py-20 bg-[#FFF9FA] min-h-[85vh] flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-[#FFF5F7] via-white to-[#FDF0F4] rounded-[2.5rem] p-6 sm:p-10 border border-[#F6D7DF] shadow-[0_8px_32px_rgba(155,35,53,0.06)]">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-widest text-[#9B2335] font-semibold block mb-1">
              Dr. Ilham Boughaza
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#24181B] mt-1 mb-2">
              {t('appointment.sectionTitle')}
            </h1>
            <p className="text-sm text-[#6B5C62]">
              {t('appointment.sectionSubtitle')}
            </p>
          </div>

          <AppointmentForm />
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
