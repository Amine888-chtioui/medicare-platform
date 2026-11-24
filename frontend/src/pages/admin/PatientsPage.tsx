import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Search,
  Phone,
  Calendar,
  Eye,
  Plus,
  Download,
  SlidersHorizontal,
  X,
  FileText,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { adminAppointmentService, adminPatientService } from '@/services/adminService';
import type { AppointmentRequest, CreateAppointmentRequestDto, Patient } from '@/types';
import { formatDate, formatDateTime } from '@/utils/date';
import { AddClientModal } from '@/features/planning/AddClientModal';
import { useScrollLock } from '@/hooks/useScrollLock';

interface PatientSummary {
  id?: number;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  notes?: string | null;
  totalAppointments: number;
  confirmedAppointments: number;
  lastVisit: string;
  latestStatus: AppointmentRequest['status'];
  history: AppointmentRequest[];
}

/** Formats a phone number for display with clean spacing (e.g. 06 06 06 45 76) */
function formatPhoneNumber(phone: string): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

/** Formats a phone number for WhatsApp international URL */
function formatWhatsAppLink(phone: string): string {
  if (!phone) return '#';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return `https://wa.me/${cleaned.replace('+', '')}`;
  }
  if (cleaned.startsWith('0')) {
    // Moroccan standard (06... / 07... -> 2126... / 2127...)
    return `https://wa.me/212${cleaned.substring(1)}`;
  }
  return `https://wa.me/${cleaned}`;
}

export const PatientsPage: React.FC = () => {
  const { i18n } = useTranslation();

  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMEE' | 'EN_ATTENTE' | 'REFUSEE'>('ALL');

  // Selected patient for detail dossier
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [patientNotes, setPatientNotes] = useState<Record<string, string>>({});
  const [currentNote, setCurrentNote] = useState('');

  useScrollLock(Boolean(selectedPatient));

  // Add new patient / appointment modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefilledPatient, setPrefilledPatient] = useState<{ fullName?: string; phoneNumber?: string } | undefined>(undefined);

  // Load patient dossiers from backend
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminPatientService.getAll();
      if (Array.isArray(data)) {
        setPatients(
          data.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            phoneNumber: p.phoneNumber,
            email: p.email,
            notes: p.notes,
            totalAppointments: p.totalAppointments || 0,
            confirmedAppointments: p.confirmedAppointments || 0,
            lastVisit: p.lastVisit || p.createdAt,
            latestStatus: (p.latestStatus as AppointmentRequest['status']) || 'CONFIRMEE',
            history: p.history || [],
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load patients data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Load local stored practitioner notes if available
    try {
      const saved = localStorage.getItem('medicare_patient_notes');
      if (saved) setPatientNotes(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Save notes handler (both in backend database and local storage)
  const handleSaveNote = async (phoneKey: string) => {
    const updated = { ...patientNotes, [phoneKey]: currentNote };
    setPatientNotes(updated);
    try {
      localStorage.setItem('medicare_patient_notes', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (selectedPatient?.id) {
      try {
        await adminPatientService.updateNotes(selectedPatient.id, currentNote);
        setPatients((prev) =>
          prev.map((p) => (p.id === selectedPatient.id ? { ...p, notes: currentNote } : p))
        );
      } catch (err) {
        console.error('Failed to save notes on server', err);
      }
    }
  };

  // Real counts for status filter pills
  const countAll = patients.length;
  const countConfirmed = patients.filter((p) => p.latestStatus === 'CONFIRMEE' || p.confirmedAppointments > 0).length;
  const countPending = patients.filter((p) => p.latestStatus === 'EN_ATTENTE').length;
  const countRefused = patients.filter((p) => p.latestStatus === 'REFUSEE').length;

  // Filtered patients based on search and status filter
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const cleanSearch = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !cleanSearch ||
        p.fullName.toLowerCase().includes(cleanSearch) ||
        p.phoneNumber.replace(/\s+/g, '').includes(cleanSearch.replace(/\s+/g, ''));

      if (!matchesSearch) return false;

      if (statusFilter === 'CONFIRMEE') {
        return p.latestStatus === 'CONFIRMEE' || p.confirmedAppointments > 0;
      }
      if (statusFilter === 'EN_ATTENTE') {
        return p.latestStatus === 'EN_ATTENTE';
      }
      if (statusFilter === 'REFUSEE') {
        return p.latestStatus === 'REFUSEE';
      }
      return true;
    });
  }, [patients, searchQuery, statusFilter]);

  // Active patients count (confirmed in planning)
  const activePatientsCount = countConfirmed;

  const handleOpenPatient = (p: PatientSummary) => {
    setSelectedPatient(p);
    setCurrentNote(p.notes || patientNotes[p.phoneNumber] || '');
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCreateAppointment = async (dto: CreateAppointmentRequestDto) => {
    await adminAppointmentService.createAppointment(dto);
    loadData();
    setIsAddModalOpen(false);
    setPrefilledPatient(undefined);
  };

  const handleExportCsv = () => {
    const headers = ['Nom complet', 'Téléphone', 'Total Rendez-vous', 'Dernière visite', 'Dernier statut'];
    const rows = filteredPatients.map((p) => [
      `"${p.fullName.replace(/"/g, '""')}"`,
      `"${p.phoneNumber}"`,
      p.totalAppointments,
      `"${formatDate(p.lastVisit, i18n.language)}"`,
      `"${p.latestStatus}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `patientes_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto w-full">
      {/* ══════════════════════════════════════════════════
          1. HEADER WITH BURGUNDY ACCENT & ACTIVE BADGE
          ══════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-7 sm:h-8 bg-[#800020] rounded-full shrink-0" />
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>Dossiers Patientes</span>
            <span className="text-[11px] font-bold text-[#800020] bg-[#FDF2F4] border border-[#FCE7EB] px-2.5 py-0.5 rounded-full">
              {activePatientsCount} actives
            </span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium pl-4 sm:pl-4">
          Consultez le fichier des patientes, leur historique médical et planifiez leurs soins.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════
          2. ACTION BUTTONS: EXPORTER CSV & NOUVEAU RDV
          ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredPatients.length === 0}
          className="w-full py-2.5 px-3 rounded-2xl border border-[#EBE3E5] bg-white hover:bg-[#FAF7F5] text-xs font-semibold text-gray-800 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-40"
        >
          <Download className="w-4 h-4 text-gray-700 shrink-0" />
          <span className="truncate">Exporter CSV</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPrefilledPatient(undefined);
            setIsAddModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-[#800020] hover:bg-[#6B0F24] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
          <span className="truncate">Nouveau rdv</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          3. SEARCH & HORIZONTAL FILTER PILLS CARD
          ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F2E7EA] shadow-[0_2px_15px_rgba(128,0,32,0.03)] flex flex-col gap-3.5">
        {/* Search input with filter button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou numéro..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#FAF7F5] text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-transparent focus:border-[#800020] focus:bg-white transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            title="Filtres"
            onClick={() => setStatusFilter('ALL')}
            className="w-10 h-10 rounded-2xl border border-[#EBE3E5] bg-white hover:bg-[#FAF7F5] flex items-center justify-center text-gray-600 hover:text-[#800020] transition-colors shrink-0 shadow-2xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills with real counts */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {/* Toutes */}
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-[#800020] text-white font-bold shadow-xs'
                : 'bg-[#F3F4F6] text-gray-700 font-semibold hover:bg-gray-200'
            }`}
          >
            Toutes ({countAll})
          </button>

          {/* Confirmées */}
          <button
            type="button"
            onClick={() => setStatusFilter('CONFIRMEE')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              statusFilter === 'CONFIRMEE'
                ? 'bg-[#800020] text-white font-bold shadow-xs'
                : 'bg-[#F3F4F6] text-gray-700 font-semibold hover:bg-gray-200'
            }`}
          >
            Confirmées ({countConfirmed})
          </button>

          {/* En attente */}
          <button
            type="button"
            onClick={() => setStatusFilter('EN_ATTENTE')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              statusFilter === 'EN_ATTENTE'
                ? 'bg-[#800020] text-white font-bold shadow-xs'
                : 'bg-[#F3F4F6] text-gray-700 font-semibold hover:bg-gray-200'
            }`}
          >
            En attente ({countPending})
          </button>

          {/* Refusées */}
          <button
            type="button"
            onClick={() => setStatusFilter('REFUSEE')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              statusFilter === 'REFUSEE'
                ? 'bg-[#800020] text-white font-bold shadow-xs'
                : 'bg-[#F3F4F6] text-gray-700 font-semibold hover:bg-gray-200'
            }`}
          >
            Refusées ({countRefused})
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          4. RÉPERTOIRE MÉDICAL HEADER
          ══════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#FDF2F4] text-[#800020] flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-gray-900">
            Répertoire Médical
          </h2>
        </div>

        <span className="text-xs text-gray-400 font-medium">
          {filteredPatients.length} dossier{filteredPatients.length > 1 ? 's' : ''} enregistré{filteredPatients.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════
          5. PATIENT CARDS LIST
          ══════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="flex flex-col gap-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-5 border border-[#F2E7EA] shadow-xs animate-pulse flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                  <div className="space-y-1.5">
                    <div className="w-28 h-4 bg-gray-200 rounded-md" />
                    <div className="w-16 h-3 bg-gray-100 rounded-md" />
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-100 rounded-full" />
              </div>
              <div className="h-4 bg-gray-100 rounded-md w-3/4" />
              <div className="h-9 bg-gray-100 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#F2E7EA] text-center shadow-xs flex flex-col items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F4] text-[#800020] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-800">Aucune patiente trouvée</p>
          <p className="text-xs text-gray-500 max-w-xs">
            {searchQuery
              ? `Aucun résultat pour « ${searchQuery} ». Vérifiez l'orthographe ou réinitialisez les filtres.`
              : 'Aucun dossier patient dans cette catégorie pour le moment.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="mt-1 px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#6B0F24] transition-colors"
            >
              Réinitialiser la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filteredPatients.map((p) => {
            // Patient initials for avatar
            const initials =
              p.fullName
                .trim()
                .split(/\s+/)
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'PA';

            // Clean phone numbers
            const rawDigits = p.phoneNumber.replace(/\D/g, '');
            const cleanPhone = p.phoneNumber.replace(/[^\d+]/g, '');
            const displayPhone = formatPhoneNumber(p.phoneNumber);
            const waLink = formatWhatsAppLink(p.phoneNumber);
            const referenceNumber = rawDigits.length >= 4 ? rawDigits.slice(-4) : p.history[0]?.id ? String(p.history[0]?.id) : '—';

            // Top colored indicator & status badge configuration
            const isConfirmed = p.latestStatus === 'CONFIRMEE' || (p.confirmedAppointments > 0 && p.latestStatus !== 'REFUSEE');
            const isRefused = p.latestStatus === 'REFUSEE';
            const isPending = p.latestStatus === 'EN_ATTENTE';

            let topBarColor = 'bg-[#10B981]'; // Green default for confirmed
            let badgeStyle = 'bg-[#ECFDF5] text-[#059669] border border-emerald-100';
            let dotColor = 'bg-[#10B981]';
            let statusLabel = 'Confirmée';

            if (isRefused) {
              topBarColor = 'bg-[#F43F5E]';
              badgeStyle = 'bg-[#FFF1F2] text-[#E11D48] border border-rose-100';
              dotColor = 'bg-[#F43F5E]';
              statusLabel = 'Refusée';
            } else if (isPending) {
              topBarColor = 'bg-[#F59E0B]';
              badgeStyle = 'bg-[#FEF3C7] text-[#D97706] border border-amber-100';
              dotColor = 'bg-[#F59E0B]';
              statusLabel = 'En attente';
            } else if (isConfirmed) {
              topBarColor = 'bg-[#10B981]';
              badgeStyle = 'bg-[#ECFDF5] text-[#059669] border border-emerald-100';
              dotColor = 'bg-[#10B981]';
              statusLabel = 'Confirmée';
            }

            return (
              <div
                key={p.phoneNumber}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F2E7EA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col gap-3 transition-all hover:shadow-[0_4px_20px_rgba(128,0,32,0.06)]"
              >
                {/* Top colored indicator line */}
                <div className={`h-1 ${topBarColor} absolute top-0 left-0 right-0`} />

                {/* Line 1: Avatar + Name & Ref + Status Badge */}
                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#FDF2F4] text-[#800020] flex items-center justify-center font-serif font-bold text-base shadow-2xs shrink-0 select-none">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
                        {p.fullName}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        Réf: {referenceNumber}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 ${badgeStyle}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <span>{statusLabel}</span>
                  </span>
                </div>

                {/* Line 2: Phone number & Total RDV */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold" dir="ltr">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{displayPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="text-[11px] text-gray-400 font-medium">Total RDV :</span>
                    <span className="bg-gray-100 text-gray-800 font-bold text-[11px] px-2 py-0.5 rounded-md min-w-[20px] text-center">
                      {p.totalAppointments}
                    </span>
                  </div>
                </div>

                {/* Line 3: Dernière visite */}
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-400 font-medium">Dernière visite</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {p.lastVisit ? formatDate(p.lastVisit, i18n.language) : '—'}
                  </span>
                </div>

                {/* Line 4: Action Buttons (Appeler, WhatsApp, Dossier) */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                  {/* Appeler */}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-100 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>Appeler</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    title="Ouvrir WhatsApp"
                    className="w-11 h-10 rounded-2xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] flex items-center justify-center transition-colors border border-emerald-100 shrink-0 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.77.818 2.791.819 3.18 0 5.767-2.587 5.768-5.766.001-3.18-2.585-5.765-5.768-5.765zm3.385 8.163c-.144.405-.837.774-1.17.823-.312.046-.719.071-2.18-.534-1.745-.722-2.868-2.5-2.955-2.616-.087-.116-.71-1.026-.71-1.956 0-.93.486-1.385.66-1.579.173-.193.376-.242.501-.242.126 0 .252.002.362.008.118.006.277-.044.433.332.162.391.55 1.343.599 1.44.049.098.082.213.016.342-.066.13-.1.21-.197.327-.098.116-.206.26-.295.35-.1.1-.205.21-.088.41.117.2.52.859 1.116 1.39.77.686 1.417.899 1.62.998.203.1.322.083.441-.054.12-.137.513-.596.65-.802.138-.205.275-.172.463-.102.188.07 1.192.562 1.398.664.205.103.342.154.392.24.049.086.049.499-.095.904z" />
                    </svg>
                  </a>

                  {/* Dossier */}
                  <button
                    type="button"
                    onClick={() => handleOpenPatient(p)}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#18181B] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          6. PATIENT DETAILS DOSSIER MODAL
          ══════════════════════════════════════════════════ */}
      {selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fadeIn overscroll-contain"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedPatient(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto overscroll-contain p-5 sm:p-6 shadow-2xl border border-[#F2E7EA] relative flex flex-col gap-4.5 animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF2F4] text-[#800020] flex items-center justify-center font-serif font-bold text-base shrink-0 shadow-2xs">
                  {selectedPatient.fullName
                    .trim()
                    .split(/\s+/)
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight">
                    {selectedPatient.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Dossier patiente • {selectedPatient.totalAppointments} rendez-vous au cabinet
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Card */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#F2E7EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Numéro de contact
                </span>
                <span className="text-sm font-bold text-gray-900" dir="ltr">
                  {formatPhoneNumber(selectedPatient.phoneNumber)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPhone(selectedPatient.phoneNumber)}
                  title="Copier le numéro"
                  className="p-2 rounded-xl bg-white border border-[#EBE3E5] text-gray-600 hover:text-[#800020] cursor-pointer"
                >
                  {copiedPhone ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`tel:${selectedPatient.phoneNumber.replace(/[^\d+]/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>Appeler</span>
                </a>
                <a
                  href={formatWhatsAppLink(selectedPatient.phoneNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-emerald-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.77.818 2.791.819 3.18 0 5.767-2.587 5.768-5.766.001-3.18-2.585-5.765-5.768-5.765zm3.385 8.163c-.144.405-.837.774-1.17.823-.312.046-.719.071-2.18-.534-1.745-.722-2.868-2.5-2.955-2.616-.087-.116-.71-1.026-.71-1.956 0-.93.486-1.385.66-1.579.173-.193.376-.242.501-.242.126 0 .252.002.362.008.118.006.277-.044.433.332.162.391.55 1.343.599 1.44.049.098.082.213.016.342-.066.13-.1.21-.197.327-.098.116-.206.26-.295.35-.1.1-.205.21-.088.41.117.2.52.859 1.116 1.39.77.686 1.417.899 1.62.998.203.1.322.083.441-.054.12-.137.513-.596.65-.802.138-.205.275-.172.463-.102.188.07 1.192.562 1.398.664.205.103.342.154.392.24.049.086.049.499-.095.904z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Medical Notes */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#800020]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>NOTES DU PRATICIEN</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveNote(selectedPatient.phoneNumber)}
                  className="text-xs font-bold text-[#800020] hover:underline cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
              <textarea
                rows={2}
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Ajoutez des observations médicales confidentielles sur cette patiente..."
                className="w-full p-3 rounded-2xl border border-[#F2E7EA] text-xs text-gray-800 focus:outline-none focus:border-[#800020] bg-[#FAF7F5]"
              />
            </div>

            {/* Consultation History */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Historique des Consultations ({selectedPatient.history.length})
              </h4>

              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                {selectedPatient.history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl bg-white border border-[#F2E7EA] shadow-2xs flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <Calendar className="w-3.5 h-3.5 text-[#800020]" />
                        <span>
                          {h.appointmentDate
                            ? formatDate(h.appointmentDate, i18n.language)
                            : formatDate(h.createdAt, i18n.language)}
                        </span>
                        {h.startTime && (
                          <span className="text-[11px] font-semibold text-[#800020] bg-[#FDF2F4] px-2 py-0.5 rounded-md">
                            {h.startTime}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.status === 'CONFIRMEE'
                            ? 'bg-[#ECFDF5] text-[#059669]'
                            : h.status === 'REFUSEE'
                            ? 'bg-[#FFF1F2] text-[#E11D48]'
                            : 'bg-[#FEF3C7] text-[#D97706]'
                        }`}
                      >
                        {h.status === 'CONFIRMEE' ? 'Confirmée' : h.status === 'REFUSEE' ? 'Refusée' : 'En attente'}
                      </span>
                    </div>

                    {h.description && (
                      <p className="text-[11px] text-gray-600 italic bg-[#FAF7F5] p-2 rounded-xl">
                        « {h.description} »
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setPrefilledPatient({
                    fullName: selectedPatient.fullName,
                    phoneNumber: selectedPatient.phoneNumber,
                  });
                  setSelectedPatient(null);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-2xl bg-[#800020] hover:bg-[#6B0F24] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau RDV pour cette patiente</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client / Appointment Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPrefilledPatient(undefined);
        }}
        onSubmit={handleCreateAppointment}
        initialFullName={prefilledPatient?.fullName}
        initialPhone={prefilledPatient?.phoneNumber}
      />
    </div>
  );
};

export default PatientsPage;
