import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { loginSchema, type LoginFormData } from '@/features/admin/authSchema';
import { authService } from '@/services/adminService';
import { getApiErrorMessage, isRateLimited, isUnauthorized } from '@/utils/errors';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const schema = loginSchema(t);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      await authService.login(data);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      if (isUnauthorized(error)) {
        setLoginError(t('admin.login.errors.invalidCredentials'));
      } else if (isRateLimited(error)) {
        setLoginError(getApiErrorMessage(error, t('common.error')));
      } else {
        setLoginError(getApiErrorMessage(error, t('admin.login.errors.serverError')));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6F7] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Central Login Card (Split 2-Panel Layout on desktop, streamlined on mobile) */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-auto md:min-h-[520px]">
        {/* Left Side: Brand Visual Panel (5 cols on desktop, hidden on mobile) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-[#FCEBEF] via-[#FDF0F3] to-[#FCEBEF] p-8 flex-col justify-between relative overflow-hidden">
          {/* Subtle floral background decor */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-25 text-[var(--color-primary)] pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C60 30 80 40 100 50 C80 60 60 70 50 100 C40 70 20 60 0 50 C20 40 40 30 50 0 Z" />
            </svg>
          </div>

          {/* Top Logo */}
          <div>
            <Logo size="md" />
          </div>

          {/* Center: Slogan & Fine Line Art */}
          <div className="my-8 text-center flex flex-col items-center">
            <p className="font-serif italic text-base sm:text-lg text-[var(--color-primary-dark)] leading-relaxed max-w-xs mb-6">
              « Une santé épanouie, une vie plus sereine »
            </p>

            {/* Mother and child delicate fine line vector */}
            <div className="w-36 h-36 relative flex items-center justify-center">
              <svg viewBox="0 0 160 160" fill="none" className="w-full h-full text-[var(--color-primary)] stroke-current">
                {/* Mother head */}
                <circle cx="80" cy="50" r="22" strokeWidth="2" strokeDasharray="1 0" />
                <path d="M72 45 C75 35, 95 38, 92 50 C90 58, 70 65, 80 75" strokeWidth="1.8" strokeLinecap="round" />
                {/* Mother embrace */}
                <path d="M58 85 C58 120, 105 130, 115 100 C120 85, 110 70, 95 72" strokeWidth="2" strokeLinecap="round" />
                {/* Baby head and body */}
                <circle cx="102" cy="95" r="13" strokeWidth="1.8" />
                <path d="M102 108 C102 122, 85 125, 78 115" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Bottom Back Link */}
          <div className="text-center md:text-left rtl:md:text-right">
            <Link
              to="/"
              className="text-xs font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1.5"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au site public
            </Link>
          </div>
        </div>

        {/* Right Side: Form Panel (7 cols on desktop, full width on mobile) */}
        <div className="md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Mobile Header Logo */}
            <div className="md:hidden flex flex-col items-center mb-6">
              <Logo size="md" />
            </div>

            {/* Title */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)]">
                {t('admin.login.title')}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5">
                {t('admin.login.subtitle')}
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
              {/* Username Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {t('admin.login.username')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 rtl:left-auto rtl:right-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    autoComplete="username"
                    autoFocus
                    placeholder="admin"
                    aria-invalid={Boolean(errors.username)}
                    {...register('username')}
                    className={`w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-3 rounded-xl border bg-white text-base sm:text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none transition-all ${
                      errors.username
                        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]'
                    }`}
                  />
                </div>
                {errors.username && (
                  <span className="text-xs text-red-500 font-medium">{errors.username.message}</span>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {t('admin.login.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 rtl:left-auto rtl:right-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    {...register('password')}
                    className={`w-full pl-11 pr-11 rtl:pl-11 rtl:pr-11 py-3 rounded-xl border bg-white text-base sm:text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none transition-all ${
                      errors.password
                        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3.5 rtl:right-auto rtl:left-3.5 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label="Afficher ou masquer mot de passe"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                className="w-full py-3.5 mt-2 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
                rightIcon={
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              >
                {isSubmitting ? t('admin.login.submitting') : t('admin.login.submit')}
              </Button>

              <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
                {t('admin.login.help')}
              </p>

              {/* Mobile Back to Public Site Link */}
              <div className="md:hidden text-center mt-6 pt-4 border-t border-pink-100">
                <Link
                  to="/"
                  className="text-xs font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1.5"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour au site public
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
