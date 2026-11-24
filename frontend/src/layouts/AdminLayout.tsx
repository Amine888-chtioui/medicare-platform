import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  FileText,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { SidebarMaternityArt } from '@/components/ui/SidebarMaternityArt';
import { NotificationDropdown } from '@/features/admin/NotificationDropdown';
import { authService, adminNotificationService } from '@/services/adminService';
import { useScrollLock } from '@/hooks/useScrollLock';

const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [notifCount, setNotifCount] = useState<number>(0);

  useScrollLock(sidebarOpen);

  useEffect(() => {
    adminNotificationService.getCount().then(setNotifCount).catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login', { replace: true });
  };

  const navGroups = [
    {
      category: 'CLINIQUE',
      items: [
        {
          href: '/admin/dashboard',
          label: 'Accueil',
          icon: <LayoutGrid className="w-4 h-4 shrink-0" />,
        },
        {
          href: '/admin/requests',
          label: 'Gestion des demandes',
          icon: <FileText className="w-4 h-4 shrink-0" />,
          hasBadge: true,
        },
        {
          href: '/admin/patients',
          label: 'Dossiers Patientes',
          icon: <Users className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      category: 'GESTION & ANALYSE',
      items: [
        {
          href: '/admin/reports',
          label: 'Rapports & Stats',
          icon: <BarChart2 className="w-4 h-4 shrink-0" />,
        },
        {
          href: '/admin/settings',
          label: 'Paramètres Cabinet',
          icon: <Settings className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white select-none relative justify-between overflow-hidden">
      {/* Top: Logo area */}
      <div className="p-5 pb-4 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
        <Logo size="sm" />
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
          className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Middle: Navigation links & Maternal Illustration */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Navigation links structured by categories */}
        <nav className="p-4 flex flex-col gap-4" aria-label={t('admin.sidebar.navigation')}>
          {navGroups.map((group) => (
            <div key={group.category} className="flex flex-col gap-1">
              <span className="px-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">
                {group.category}
              </span>
              {group.items.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 relative group',
                      active && item.href === '/admin/dashboard'
                        ? 'bg-[#A61935] text-white shadow-[0_4px_16px_rgba(166,25,53,0.22)]'
                        : active
                        ? 'bg-[#FFF0F4] text-[#A61935]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[#FFF0F4] hover:text-[#A61935]',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      {/* Vertical red indicator bar on left when active */}
                      {active && item.href !== '/admin/dashboard' && (
                        <span className="w-1 h-5 bg-[#A61935] rounded-full absolute left-1" />
                      )}
                      {item.icon}
                      <span>{item.label}</span>
                    </div>

                    {/* Dynamic counter badge for Demandes */}
                    {item.hasBadge && notifCount > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          active && item.href === '/admin/dashboard'
                            ? 'bg-white text-[#A61935]'
                            : 'bg-[#FDE8EF] text-[#A61935]'
                        }`}
                      >
                        {notifCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Authentic Maternity Silhouette illustration */}
        <div className="w-full pl-0 pr-3 pointer-events-none select-none mt-auto flex items-end">
          <SidebarMaternityArt className="w-full" />
        </div>
      </div>

      {/* Bottom: Logout Button - Always visible at the end of the sidebar */}
      <div className="p-4 border-t border-[var(--color-border-soft)] bg-white shrink-0 z-20">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#800020] hover:bg-[#FFF0F4] transition-all cursor-pointer group"
        >
          <div className="p-1.5 rounded-xl bg-gray-100 group-hover:bg-[#FDE8EF] text-gray-500 group-hover:text-[#800020] transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
          </div>
          <span>{t('admin.sidebar.logout', { defaultValue: 'Déconnexion' })}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[var(--color-border)] shadow-[0_2px_20px_rgba(166,25,53,0.02)] fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity overscroll-contain"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={[
          'lg:hidden fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out overscroll-contain',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
        {/* Universal Top Header (Fixed h-16, identical across mobile & desktop) */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-2xs gap-3">
          {/* Left: Hamburger Button + Mobile Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-md">
            <button
              type="button"
              className="lg:hidden w-9 h-9 rounded-xl bg-white border border-[var(--color-border)] text-gray-700 hover:bg-[#FFF0F4] hover:text-[#A61935] flex items-center justify-center transition-colors shrink-0 shadow-2xs cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={t('admin.sidebar.openMenu')}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile brand logo: shown on small mobile header */}
            <Link to="/admin/dashboard" className="lg:hidden flex items-center shrink-0">
              <Logo size="sm" />
            </Link>

            {/* Desktop search bar */}
            <div className="relative flex-1 hidden sm:block">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Rechercher une patiente, un rendez-vous..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#FFF8FA] border border-[var(--color-border)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none focus:border-[#A61935] focus:bg-white shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Right: Notification Center */}
          <div className="flex items-center gap-2.5 sm:gap-4 ml-auto shrink-0">
            {/* Notification Center */}
            <NotificationDropdown onCountChange={setNotifCount} />
          </div>
        </header>

        {/* Universal Page Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* ── Universal Mobile Bottom Navigation Bar (Fixed h-16, identical across ALL pages) ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[var(--color-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-16 flex items-center">
        <div className="flex items-center justify-around w-full max-w-md mx-auto px-2">
          {/* 1. Accueil */}
          <Link
            to="/admin/dashboard"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-all min-w-[50px] ${
              isActive('/admin/dashboard') ? 'text-[#800020]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${isActive('/admin/dashboard') ? 'bg-[#FDE8EF]' : ''}`}>
              <LayoutGrid className="w-5 h-5" />
              {isActive('/admin/dashboard') && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#800020] ring-1 ring-white" />
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive('/admin/dashboard') ? 'text-[#800020]' : 'text-gray-400'}`}>Accueil</span>
          </Link>

          {/* 2. Demandes */}
          <Link
            to="/admin/requests"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-all min-w-[50px] ${
              isActive('/admin/requests') ? 'text-[#800020]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${isActive('/admin/requests') ? 'bg-[#FDE8EF]' : ''}`}>
              <FileText className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.2 bg-[#A61935] text-white rounded-full min-w-[16px] text-center shadow-xs">
                  {notifCount}
                </span>
              )}
              {isActive('/admin/requests') && notifCount === 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#800020] ring-1 ring-white" />
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive('/admin/requests') ? 'text-[#800020]' : 'text-gray-400'}`}>Demandes</span>
          </Link>

          {/* 3. Patients */}
          <Link
            to="/admin/patients"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-all min-w-[50px] ${
              isActive('/admin/patients') ? 'text-[#800020]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${isActive('/admin/patients') ? 'bg-[#FDE8EF]' : ''}`}>
              <Users className="w-5 h-5" />
              {isActive('/admin/patients') && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#800020] ring-1 ring-white" />
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive('/admin/patients') ? 'text-[#800020]' : 'text-gray-400'}`}>Patientes</span>
          </Link>

          {/* 4. Rapports */}
          <Link
            to="/admin/reports"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-all min-w-[50px] ${
              isActive('/admin/reports') ? 'text-[#800020]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${isActive('/admin/reports') ? 'bg-[#FDE8EF]' : ''}`}>
              <BarChart2 className="w-5 h-5" />
              {isActive('/admin/reports') && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#800020] ring-1 ring-white" />
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive('/admin/reports') ? 'text-[#800020]' : 'text-gray-400'}`}>Rapports</span>
          </Link>

          {/* 5. Paramètres */}
          <Link
            to="/admin/settings"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-all min-w-[50px] ${
              isActive('/admin/settings') ? 'text-[#800020]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${isActive('/admin/settings') ? 'bg-[#FDE8EF]' : ''}`}>
              <Settings className="w-5 h-5" />
              {isActive('/admin/settings') && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#800020] ring-1 ring-white" />
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive('/admin/settings') ? 'text-[#800020]' : 'text-gray-400'}`}>Paramètres</span>
          </Link>
        </div>
      </nav>

    </div>
  );
};

export default AdminLayout;
