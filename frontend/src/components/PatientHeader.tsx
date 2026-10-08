import React from 'react';
import { 
  User, 
  AlertCircle, 
  HeartPulse, 
  Pill, 
  FileCheck2, 
  ShieldCheck, 
  PhoneCall
} from 'lucide-react';
import { PatientProfile } from '../types';

interface PatientHeaderProps {
  patient: PatientProfile | null;
  onOpenAbhaModal: () => void;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  onOpenAbhaModal
}) => {
  if (!patient) return null;

  return (
    <div className="glass-panel p-5 sm:p-6 mb-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Patient Avatar & Key Vitals */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
              <User className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold font-display">
                {patient.full_name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                {patient.age} yrs • {patient.gender}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                Blood Group: {patient.blood_group}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <button 
                onClick={onOpenAbhaModal}
                className="inline-flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-2 font-mono font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                ABHA: {patient.abha_id}
              </button>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 font-mono">Address: {patient.abha_address}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ABDM Linked
              </span>
            </div>

            {/* Chronic Conditions & Allergies Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mr-1">
                Active Conditions:
              </span>
              {patient.chronic_conditions.map((cond, i) => (
                <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 font-medium">
                  {cond}
                </span>
              ))}

              {patient.allergies.length > 0 && (
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Allergies:
                  </span>
                  {patient.allergies.map((allg, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-medium">
                      {allg}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <FileCheck2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-1" />
            <span className="text-lg font-bold font-display">
              {patient.total_records_count}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Records</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <Pill className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-lg font-bold font-display">
              {patient.active_medications_count}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Active Meds</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <HeartPulse className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
            <span className="text-lg font-bold font-display">
              {Object.keys(patient.vital_trends || {}).length}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Biomarkers</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-slate-900/80 border border-rose-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <PhoneCall className="w-5 h-5 text-rose-500 dark:text-rose-400 mb-1" />
            <span className="text-lg font-bold text-rose-600 dark:text-rose-300 font-mono">
              108 / 112
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Emergency Care</span>
          </div>
        </div>

      </div>
    </div>
  );
};
