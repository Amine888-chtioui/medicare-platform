import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { BackToTopButton } from '@/components/layout/BackToTopButton';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <PublicHeader />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-28">
        <Outlet />
      </main>
      <PublicFooter />
      <WhatsAppButton />
      <BackToTopButton />
    </div>
  );
};

export default PublicLayout;
