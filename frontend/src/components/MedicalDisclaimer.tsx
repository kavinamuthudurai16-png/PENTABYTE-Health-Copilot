import React from 'react';
import { ShieldAlert, PhoneCall } from 'lucide-react';
import { LANGUAGES } from '../translations';

interface MedicalDisclaimerProps {
  currentLang: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ currentLang }) => {
  const t = LANGUAGES[currentLang]?.translations || LANGUAGES.en.translations;

  return (
    <div className="glass-panel p-4 my-8 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Clinical Safety Notice:</strong> PENTABYTE AI Health Copilot provides assistive data synthesis and medical literacy guidance. It is not an automated medical diagnostic tool, treatment decision platform, or prescription service. Always review these insights directly with your primary care physician or specialist before making clinical modifications.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 font-semibold">
          <PhoneCall className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
          <span>{t.emergencyCall}</span>
        </div>

      </div>
    </div>
  );
};
