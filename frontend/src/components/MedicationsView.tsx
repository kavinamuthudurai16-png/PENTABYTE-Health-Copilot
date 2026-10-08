import React from 'react';
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  Sun, 
  Sunset, 
  Moon 
} from 'lucide-react';

interface MedicationsViewProps {
  medications: any[];
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({ medications }) => {
  return (
    <div className="space-y-6">
      
      {/* Daily Schedule Cadence Cards */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 font-display">
              <Clock className="w-5 h-5 text-cyan-500" />
              Daily Medication Timing Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Optimized dosing slots based on active prescription records
            </p>
          </div>

          <span className="badge-status badge-normal text-xs">
            {medications.length} Active Prescriptions
          </span>
        </div>

        {/* Timing Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Morning Slot */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sun className="w-4 h-4 text-amber-500" />
              Morning (08:00 AM)
            </div>
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Telmisartan 40mg</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">After Breakfast</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Blood pressure control</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Metformin 500mg</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">With Meal</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Glycemic regulation</div>
              </div>
            </div>
          </div>

          {/* Evening Slot */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sunset className="w-4 h-4 text-orange-500" />
              Evening (08:00 PM)
            </div>
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Metformin 500mg</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">With Dinner</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">2nd daily dose</div>
              </div>
            </div>
          </div>

          {/* Bedtime Slot */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Moon className="w-4 h-4 text-purple-500" />
              Bedtime (10:30 PM)
            </div>
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Atorvastatin 20mg</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">At Bedtime</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Lipid & cholesterol control</div>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Medication Inventory */}
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-500" />
          Active Pharmacology & Interaction Profiles
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm card-hoverable">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</h5>
                  <p className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">{med.generic_name || med.name}</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {med.strength}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                {med.purpose || "Prescribed therapeutic agent"}
              </p>

              <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-3 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                <div>Cadence: <span className="text-slate-800 dark:text-slate-200 font-medium">{med.frequency}</span></div>
                <div>Instructions: <span className="text-emerald-600 dark:text-emerald-300 font-medium">{med.timing}</span></div>
                <div>Duration: <span className="text-slate-800 dark:text-slate-200">{med.duration}</span></div>
              </div>

              {med.warnings && med.warnings.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-200/90 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{med.warnings[0]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
