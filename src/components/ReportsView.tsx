import { useState } from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  BarChart2, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  Boxes, 
  Fuel, 
  AlertTriangle 
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n';

export const ReportsView: React.FC = () => {
  const { t } = useTranslation();
  const [downloaded, setDownloaded] = useState(false);
  const [logNote, setLogNote] = useState('');
  const [recentLogs, setRecentLogs] = useState<string[]>([
    '08:00 UTC - Morning radio check complete. Svalbard Sector 2 telemetry synchronized.',
    '10:30 UTC - Snowcat V-03 departed Base Camp en route to Ridge Point with 140kg medical supplies.',
    '13:15 UTC - Crevasse radar survey confirmed safe passage on Glacier Traverse.'
  ]);

  const handleExportText = () => {
    const reportText = dataService.generateMissionReport();
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `polar-expedition-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNote.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC';
    setRecentLogs([`${timeStr} - ${logNote.trim()}`, ...recentLogs]);
    setLogNote('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#24313A] font-display">
              {t('reports.title')}
            </h1>
            <p className="text-xs text-[#71808A]">
              {t('reports.subtitle')}
            </p>
          </div>
        </div>

        {/* Working Export Button */}
        <button
          id="export-mission-btn"
          onClick={handleExportText}
          className="px-4 py-2 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          {downloaded ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#24313A]" />
              <span>{t('reports.downloadComplete')}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{t('reports.exportBtn')}</span>
            </>
          )}
        </button>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71808A] uppercase">{t('expeditions.overallProgress')}</span>
            <TrendingUp className="w-4 h-4 text-[#F29A3D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#24313A] mt-2">72%</div>
          <div className="text-[11px] font-semibold text-[#39A96B] mt-1">● {t('status.active')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71808A] uppercase">{t('cargo.totalLots')}</span>
            <Boxes className="w-4 h-4 text-[#4AA9D8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#24313A] mt-2">18 / 28</div>
          <div className="text-[11px] text-[#71808A] mt-1">{t('cargo.destination')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71808A] uppercase">{t('tracking.fuelStatus')}</span>
            <Fuel className="w-4 h-4 text-[#F29A3D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#24313A] mt-2">82%</div>
          <div className="text-[11px] text-[#71808A] mt-1">{t('dashboard.camps')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71808A] uppercase">{t('dashboard.activeEmergencies')}</span>
            <AlertTriangle className="w-4 h-4 text-[#E84D4D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#E84D4D] mt-2">4</div>
          <div className="text-[11px] font-semibold text-[#39A96B] mt-1">3 {t('status.resolved')}</div>
        </div>
      </div>

      {/* Two Clean Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Mission Trajectory */}
        <div className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D5]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C96A20]" />
              <h3 className="text-sm font-extrabold text-[#24313A]">{t('expeditions.title')}</h3>
            </div>
            <span className="text-[10px] font-bold text-[#71808A] uppercase">Past 6 Weeks</span>
          </div>

          <div className="h-48 w-full pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="warmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F29A3D" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F29A3D" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="30" x2="500" y2="30" stroke="#EAE3D5" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#EAE3D5" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#EAE3D5" strokeDasharray="4 4" />
              <line x1="0" y1="165" x2="500" y2="165" stroke="#EAE3D5" />

              <polygon
                points="30,150 110,130 190,105 270,95 350,60 430,40 430,165 30,165"
                fill="url(#warmAreaGrad)"
              />

              <polyline
                points="30,150 110,130 190,105 270,95 350,60 430,40"
                fill="none"
                stroke="#F29A3D"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[
                { x: 30, y: 150, val: '18%' },
                { x: 110, y: 130, val: '32%' },
                { x: 190, y: 105, val: '48%' },
                { x: 270, y: 95, val: '55%' },
                { x: 350, y: 60, val: '64%' },
                { x: 430, y: 40, val: '72%' }
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#FFFCF8" stroke="#F29A3D" strokeWidth="3" />
                  <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#24313A" fontSize="11" fontWeight="bold">
                    {pt.val}
                  </text>
                </g>
              ))}

              <text x="30" y="180" textAnchor="middle" fill="#71808A" fontSize="10">W1</text>
              <text x="110" y="180" textAnchor="middle" fill="#71808A" fontSize="10">W2</text>
              <text x="190" y="180" textAnchor="middle" fill="#71808A" fontSize="10">W3</text>
              <text x="270" y="180" textAnchor="middle" fill="#71808A" fontSize="10">W4</text>
              <text x="350" y="180" textAnchor="middle" fill="#71808A" fontSize="10">W5</text>
              <text x="430" y="180" textAnchor="middle" fill="#C96A20" fontSize="10" fontWeight="bold">{t('dashboard.active')}</text>
            </svg>
          </div>
        </div>

        {/* Chart 2: Logistics & Field Allocations */}
        <div className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D5]">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#4AA9D8]" />
              <h3 className="text-sm font-extrabold text-[#24313A]">{t('inventory.title')}</h3>
            </div>
            <span className="text-[10px] font-bold text-[#71808A] uppercase">%</span>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { label: `${t('inventory.foodRations')} (42 Days)`, val: 84, color: 'bg-[#F29A3D]' },
              { label: `${t('inventory.fuel')} (82%)`, val: 82, color: 'bg-[#39A96B]' },
              { label: `${t('inventory.medicalKits')} (16 Units)`, val: 75, color: 'bg-[#4AA9D8]' },
              { label: `${t('inventory.tents')} (8 Tanks)`, val: 45, color: 'bg-[#E84D4D]' }
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#24313A] font-semibold">{item.label}</span>
                  <span className="font-extrabold text-[#24313A]">{item.val}%</span>
                </div>
                <div className="w-full h-2 bg-[#F7F4EF] rounded-full overflow-hidden border border-[#EAE3D5]">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Field Log Generator */}
      <div className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] warm-card-shadow space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D5]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C96A20]" />
            <h3 className="text-sm font-extrabold text-[#24313A]">{t('reports.recordLog')}</h3>
          </div>
          <span className="text-xs text-[#71808A]">{t('tracking.radioUplink')}</span>
        </div>

        {/* Add Entry Form */}
        <form onSubmit={handleAddLog} className="flex gap-2">
          <input
            type="text"
            placeholder={t('reports.logPlaceholder')}
            value={logNote}
            onChange={e => setLogNote(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-[#24313A] placeholder-[#71808A] focus:outline-none focus:border-[#F29A3D]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#F29A3D] hover:bg-[#FFB45A] text-[#24313A] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('reports.submitLog')}</span>
          </button>
        </form>

        {/* Recent Logs List */}
        <div className="space-y-2">
          {recentLogs.map((log, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs text-[#24313A]">
              {log}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
