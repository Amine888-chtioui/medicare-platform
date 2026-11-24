import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Building,
  Clock,
  Bell,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CabinetSettings {
  doctorName: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  openDays: string[];
  enableWhatsAppNotifications: boolean;
  enableSmsReminders: boolean;
  minAdvanceBookingHours: number;
}

const DEFAULT_SETTINGS: CabinetSettings = {
  doctorName: 'Dr. Ilham Boughaza',
  specialty: 'Gynécologue Obstétricienne',
  phone: '0522123456',
  email: 'cabinet@dr-boughaza.ma',
  address: 'Boulevard d’Anfa, Casablanca, Maroc',
  openingTime: '08:00',
  closingTime: '17:00',
  slotDurationMinutes: 30,
  openDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  enableWhatsAppNotifications: true,
  enableSmsReminders: true,
  minAdvanceBookingHours: 24,
};

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CabinetSettings>(DEFAULT_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'cabinet' | 'schedule' | 'notifications' | 'security'>('cabinet');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('medicare_cabinet_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('medicare_cabinet_settings', JSON.stringify(settings));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Success simulation
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  const toggleDay = (day: string) => {
    setSettings((prev) => {
      const exists = prev.openDays.includes(day);
      return {
        ...prev,
        openDays: exists ? prev.openDays.filter((d) => d !== day) : [...prev.openDays, day],
      };
    });
  };

  const ALL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* ══════════════════════════════════════════════════
          1. HEADER
          ══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-7 sm:h-8 bg-[#800020] rounded-full shrink-0" />
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Paramètres du Cabinet
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium mt-0.5">
            Configurez les coordonnées du praticien, les horaires de rendez-vous et la sécurité
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Paramètres du cabinet enregistrés avec succès !</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          2. NAVIGATION TABS
          ══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('cabinet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'cabinet'
              ? 'bg-[#A61935] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:bg-[#FFF0F4] hover:text-[#A61935]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Cabinet & Praticien</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'schedule'
              ? 'bg-[#A61935] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:bg-[#FFF0F4] hover:text-[#A61935]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Horaires & Créneaux</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'notifications'
              ? 'bg-[#A61935] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:bg-[#FFF0F4] hover:text-[#A61935]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'security'
              ? 'bg-[#A61935] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:bg-[#FFF0F4] hover:text-[#A61935]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Sécurité & Accès</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          3. TAB CONTENT
          ══════════════════════════════════════════════════ */}
      {/* Tab 1: Cabinet & Praticien */}
      {activeTab === 'cabinet' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
            <Building className="w-5 h-5 text-[#A61935]" />
            <h3 className="font-serif text-base font-bold text-[var(--color-text-primary)]">
              Informations du Praticien & Coordonnées
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Nom du Praticien</label>
              <input
                type="text"
                value={settings.doctorName}
                onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Spécialité Médicale</label>
              <input
                type="text"
                value={settings.specialty}
                onChange={(e) => setSettings({ ...settings, specialty: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#A61935]" />
                <span>Téléphone du Cabinet</span>
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#A61935]" />
                <span>Email Professionnel</span>
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935]"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#A61935]" />
                <span>Adresse du Cabinet</span>
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#A61935]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--color-border)]">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#A61935] hover:bg-[#851329] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les coordonnées</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Horaires & Créneaux */}
      {activeTab === 'schedule' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
            <Clock className="w-5 h-5 text-[#A61935]" />
            <h3 className="font-serif text-base font-bold text-[var(--color-text-primary)]">
              Horaires d'Ouverture & Gestion des Créneaux
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Heure de début des consultations</label>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Heure de fin des consultations</label>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Durée standard de consultation</label>
              <select
                value={settings.slotDurationMinutes}
                onChange={(e) => setSettings({ ...settings, slotDurationMinutes: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none"
              >
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes (Recommandé)</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Délai d'anticipation minimum</label>
              <select
                value={settings.minAdvanceBookingHours}
                onChange={(e) => setSettings({ ...settings, minAdvanceBookingHours: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none"
              >
                <option value={12}>12 heures</option>
                <option value={24}>24 heures à l'avance</option>
                <option value={48}>48 heures à l'avance</option>
              </select>
            </div>

            {/* Jours ouvrés */}
            <div className="sm:col-span-2 flex flex-col gap-2 pt-2">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Jours d'ouverture du cabinet</label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const isSelected = settings.openDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#A61935] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note sur les horaires standards */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#FFF8FA] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#A61935] shrink-0" />
              <span>
                <strong>Horaires officiels du cabinet :</strong> Du lundi au vendredi de 08:00 à 17:00, le samedi de 08:00 à 13:00. Le cabinet est fermé le dimanche.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--color-border)]">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#A61935] hover:bg-[#851329] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les horaires</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
            <Bell className="w-5 h-5 text-[#A61935]" />
            <h3 className="font-serif text-base font-bold text-[var(--color-text-primary)]">
              Canaux de Notification & Alertes Patientes
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFF8FA] border border-[var(--color-border)] cursor-pointer hover:border-[#A61935] transition-all">
              <input
                type="checkbox"
                checked={settings.enableWhatsAppNotifications}
                onChange={(e) => setSettings({ ...settings, enableWhatsAppNotifications: e.target.checked })}
                className="mt-0.5 rounded text-[#A61935] focus:ring-[#A61935]"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] block">
                  Confirmation par WhatsApp automatique
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Prépare un message WhatsApp prêt à être envoyé à la patiente lors de la validation du rendez-vous.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFF8FA] border border-[var(--color-border)] cursor-pointer hover:border-[#A61935] transition-all">
              <input
                type="checkbox"
                checked={settings.enableSmsReminders}
                onChange={(e) => setSettings({ ...settings, enableSmsReminders: e.target.checked })}
                className="mt-0.5 rounded text-[#A61935] focus:ring-[#A61935]"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] block">
                  Rappel SMS 24h avant consultation
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Envoie un rappel automatisé la veille du rendez-vous fixé dans le planning.
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--color-border)]">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#A61935] hover:bg-[#851329] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les préférences</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Sécurité */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
            <Shield className="w-5 h-5 text-[#A61935]" />
            <h3 className="font-serif text-base font-bold text-[var(--color-text-primary)]">
              Sécurité du Compte & Mot de passe Administrateur
            </h3>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Mot de passe administrateur mis à jour avec succès !</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm bg-[#FFF8FA] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--color-border)]">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#A61935] hover:bg-[#851329] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Mettre à jour le mot de passe</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
