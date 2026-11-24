import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Printer,
  TrendingUp,
  Activity,
  FileCheck,
  RefreshCw,
  Users,
  Percent,
} from 'lucide-react';
import { dashboardService, adminAppointmentService } from '@/services/adminService';
import type { DashboardStats, DailyStats } from '@/types';
import { formatShortDate, formatShortDay } from '@/utils/date';

const PERIOD_OPTIONS = [
  { label: 'Jour', days: 1 as const },
  { label: 'Semaine', days: 7 as const },
  { label: 'Mois', days: 30 as const },
  { label: 'Année', days: 365 as const },
];

export const ReportsPage: React.FC = () => {
  const { i18n } = useTranslation();

  const [days, setDays] = useState<1 | 7 | 30 | 365>(30);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [uniquePatientsCount, setUniquePatientsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const [statsRes, dailyRes, requestsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getDailyStats(days),
        adminAppointmentService.getAll({ size: 1000 }).catch(() => ({ content: [] })),
      ]);
      setStats(statsRes);
      setDailyStats(dailyRes);

      // Compute distinct real patients count from requests
      if (requestsRes?.content) {
        const uniqueSet = new Set(
          requestsRes.content.map(
            (r) => r.phoneNumber?.trim() || r.fullName?.trim().toLowerCase()
          )
        );
        setUniquePatientsCount(uniqueSet.size);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [days]);

  // Derived metrics
  const total = stats?.total ?? 0;
  const confirmees = stats?.confirmees ?? 0;
  const enAttente = stats?.enAttente ?? 0;
  const refusees = stats?.refusees ?? 0;

  const confirmationRate = total > 0 ? Math.round((confirmees / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((enAttente / total) * 100) : 0;
  const refusalRate = total > 0 ? Math.round((refusees / total) * 100) : 0;

  // Real occupancy rate calculation (confirmed / total demand or theoretical slots)
  // Theoretical slots: ~14.3 working slots/day on average (Mon-Fri: 18, Sat: 10, Sun: 0)
  const theoreticalSlotsInPeriod = Math.max(Math.round(days * 14.3), 1);
  const occupancyRate =
    total > 0
      ? Math.min(Math.round((confirmees / theoreticalSlotsInPeriod) * 100), 100)
      : 0;

  // Chart coordinates
  const maxDaily = Math.max(...dailyStats.map((d) => d.count), 4);
  const chartHeight = 140;
  const chartWidth = 520;
  const pointSpacing =
    dailyStats.length > 1 ? chartWidth / (dailyStats.length - 1) : chartWidth;

  const points = dailyStats.map((d, index) => {
    const x = index * pointSpacing;
    const y = chartHeight - (d.count / maxDaily) * (chartHeight - 20) - 10;
    return { x, y, count: d.count, date: d.date };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1]?.x ?? 0} ${chartHeight} L 0 ${chartHeight} Z`
    : '';

  const handleExportCsv = () => {
    const headers = ['Date', 'Nombre de demandes'];
    const rows = dailyStats.map((d) => [`"${d.date}"`, d.count]);
    const summary = [
      [],
      ['Total Rendez-vous', total],
      ['Rendez-vous Confirmés', confirmees],
      ['Rendez-vous En attente', enAttente],
      ['Rendez-vous Refusés', refusees],
      ['Nombre de Patients', uniquePatientsCount],
      ['Taux d\'Occupation', `${occupancyRate}%`],
      ['Taux de Confirmation', `${confirmationRate}%`],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((r) => r.join(',')),
        ...summary.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rapport_activite_${days}j.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full print:p-0">
      {/* ══════════════════════════════════════════════════
          1. HEADER
          ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 sm:h-8 bg-[#800020] rounded-full shrink-0" />
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              Rapports & Statistiques Médicales
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium mt-0.5">
              Analyse détaillée de l'activité, taux d'occupation et flux des consultations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 print:hidden flex-wrap">
          <button
            type="button"
            onClick={loadReports}
            className="p-2 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[#FFF8FA] text-gray-600 transition-colors cursor-pointer"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[#FFF8FA] text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#A61935]" />
            <span>Exporter CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#A61935] hover:bg-[#851329] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          2. SUMMARY KPIS (6 ESSENTIAL CARDS)
          ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Rendez-vous */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Total RDV</span>
            <div className="w-8 h-8 rounded-xl bg-[#FDE8EF] text-[#A61935] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              {total}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
            Volume global enregistré
          </p>
        </div>

        {/* 2. Rendez-vous Confirmés */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Confirmés</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {confirmees}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
            {confirmationRate}% de validation
          </p>
        </div>

        {/* 3. Rendez-vous En attente */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">En attente</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {enAttente}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
            {pendingRate}% à traiter
          </p>
        </div>

        {/* 4. Rendez-vous Refusés */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Refusés</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {refusees}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
            {refusalRate}% déclinés
          </p>
        </div>

        {/* 5. Nombre de Patients */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Patients</span>
            <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#7C3AED]">
              {uniquePatientsCount}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
            Patientes distinctes
          </p>
        </div>

        {/* 6. Taux d'occupation */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Occupation</span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              {occupancyRate}%
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
            Sur créneaux ouverts
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          3. EVOLUTION DE L'ACTIVITÉ + FILTRES PÉRIODE
          ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FDE8EF] text-[#A61935] flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[var(--color-text-primary)]">
                  Évolution de l'Activité Médicale
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Flux des demandes selon la période sélectionnée
                </p>
              </div>
            </div>

            {/* Period buttons: Jour, Semaine, Mois, Année */}
            <div className="flex items-center gap-1 bg-[#FFF8FA] p-1 rounded-xl border border-[var(--color-border)]">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setDays(opt.days)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    days === opt.days
                      ? 'bg-[#A61935] text-white shadow-xs'
                      : 'text-[var(--color-text-secondary)] hover:text-[#A61935]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full overflow-x-auto py-2">
            <div className="min-w-[480px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                <defs>
                  <linearGradient id="report-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A61935" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#A61935" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = chartHeight - ratio * (chartHeight - 20) - 10;
                  return (
                    <line
                      key={ratio}
                      x1="0"
                      y1={yVal}
                      x2={chartWidth}
                      y2={yVal}
                      stroke="#F2E6EB"
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {/* Area and Line */}
                {areaD && <path d={areaD} fill="url(#report-gradient)" />}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#A61935"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#A61935" stroke="#FFFFFF" strokeWidth="2" />
                  </g>
                ))}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-medium pt-3 border-t border-[var(--color-border-soft)]">
                {dailyStats.slice(-7).map((d) => (
                  <span key={d.date} className="text-center">
                    {formatShortDay(d.date, i18n.language)} {formatShortDate(d.date, i18n.language)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Card (1 col) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[var(--color-border)] shadow-[0_2px_15px_rgba(166,25,53,0.03)] flex flex-col justify-between gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-xl bg-[#FDE8EF] text-[#A61935] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[var(--color-text-primary)]">
                Répartition des Statuts
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">État des dossiers en base</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Confirmée */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Confirmées (Planifiées)
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {confirmees} ({confirmationRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${confirmationRate}%` }}
                />
              </div>
            </div>

            {/* En attente */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  En attente de validation
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {enAttente} ({pendingRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pendingRate}%` }}
                />
              </div>
            </div>

            {/* Refusées */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Déclinées / Conflits
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {refusees} ({refusalRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${refusalRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF8FA] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
            <span className="font-bold text-[#A61935] block mb-0.5">Indicateur de Performance</span>
            Taux de confirmation : <strong>{confirmationRate}%</strong>. Taux d'occupation estimé : <strong>{occupancyRate}%</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
