import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  HelpCircle, 
  ShieldCheck, 
  Pill,
  Sparkles,
  ClipboardList,
  ExternalLink
} from 'lucide-react';
import { ChatStructuredCard } from '../types';

interface StructuredChatCardsProps {
  card: ChatStructuredCard;
}

export const StructuredChatCards: React.FC<StructuredChatCardsProps> = ({ card }) => {
  if (!card) return null;

  // 1. COMPARISON CARD
  if (card.type === 'comparison' && card.items) {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 dark:bg-slate-900/95 border border-cyan-500/30 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
              <ClipboardList className="w-4 h-4" />
            </span>
            <span className="font-semibold text-xs sm:text-sm text-cyan-300">
              {card.title || 'Biomarker Progression Comparison'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>{card.previous_date} ➔ {card.latest_date}</span>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="py-1.5 px-2 font-medium">Test Name</th>
                <th className="py-1.5 px-2 font-medium text-right">Previous</th>
                <th className="py-1.5 px-2 font-medium text-right">Latest</th>
                <th className="py-1.5 px-2 font-medium text-center">Change</th>
                <th className="py-1.5 px-2 font-medium">Clinical Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {card.items.map((item, idx) => {
                const isDecreasing = item.change.startsWith('-');
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2 font-sans font-medium text-slate-200">
                      <div>{item.test_name}</div>
                      <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1 mt-0.5">
                        <FileText className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{item.source}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">
                      {item.previous_value} {item.unit}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-white">
                      {item.latest_value} {item.unit}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isDecreasing 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isDecreasing ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {item.change}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-sans text-[11px]">
                      <span className="text-cyan-300">{item.status}</span>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">{item.explanation}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
          <span>Source: Apollo Diagnostic Panels (June & Sept 2026)</span>
          <span className="text-cyan-400">Grounded Clinical Trajectory</span>
        </div>
      </div>
    );
  }

  // 2. DOCTOR PREPARATION SUMMARY CARD
  if (card.type === 'doctor_summary') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/80 border border-purple-500/30 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-900/50">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
              <ClipboardList className="w-4 h-4" />
            </span>
            <span className="font-semibold text-xs sm:text-sm text-purple-200">
              {card.title || 'Doctor Appointment Brief'}
            </span>
          </div>
          {card.doctor && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {card.doctor}
            </span>
          )}
        </div>

        {card.recent_improvements && card.recent_improvements.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-emerald-300 mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Recent Clinical Progress
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {card.recent_improvements.map((imp, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200">
                  {imp}
                </div>
              ))}
            </div>
          </div>
        )}

        {card.questions_to_ask && card.questions_to_ask.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-amber-300 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Suggested Questions to Ask Your Doctor
            </div>
            <ul className="space-y-1.5 text-xs">
              {card.questions_to_ask.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 3. TAMIL SUMMARY CARD
  if (card.type === 'tamil_summary') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-white shadow-lg space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-semibold text-xs sm:text-sm text-amber-300">
              {card.title}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            தமிழ் மொழிபெயர்ப்பு
          </span>
        </div>

        {card.key_findings && (
          <div className="space-y-1">
            {card.key_findings.map((item, idx) => (
              <div key={idx} className="p-1.5 rounded-lg bg-slate-800/60 text-xs text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {card.doctor_review && (
          <p className="text-[11px] text-slate-300 bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
            📌 {card.doctor_review}
          </p>
        )}
      </div>
    );
  }

  // 4. VERIFICATION STATUS CARD
  if (card.type === 'verification_status') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <span className="font-semibold text-xs sm:text-sm text-slate-200">
            {card.title}
          </span>
        </div>

        {card.verified_items && card.verified_items.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Clinically Verified Items
            </div>
            <ul className="space-y-1">
              {card.verified_items.map((item, idx) => (
                <li key={idx} className="text-xs p-1.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {card.unverified_items && card.unverified_items.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Items Requiring Clinical Confirmation
            </div>
            <ul className="space-y-1">
              {card.unverified_items.map((item, idx) => (
                <li key={idx} className="text-xs p-1.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 5. UPLOADED REPORT INGESTION CARD
  if (card.type === 'uploaded_report') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-white shadow-lg space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileText className="w-4 h-4" />
            </span>
            <span className="font-semibold text-xs sm:text-sm text-emerald-300">
              {card.title}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {card.record_id}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700">
            <div className="text-lg font-bold text-white">{card.extracted_labs_count || 0}</div>
            <div className="text-[10px] text-slate-400">Biomarkers</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700">
            <div className={`text-lg font-bold ${(card.abnormal_count || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {card.abnormal_count || 0}
            </div>
            <div className="text-[10px] text-slate-400">Abnormal</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700">
            <div className="text-lg font-bold text-cyan-400">{card.extracted_meds_count || 0}</div>
            <div className="text-[10px] text-slate-400">Medications</div>
          </div>
        </div>

        {card.key_takeaway && (
          <p className="text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60 leading-relaxed">
            {card.key_takeaway}
          </p>
        )}
      </div>
    );
  }

  // 6. MEDICATIONS LIST CARD
  if (card.type === 'medications_list') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-white shadow-lg space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Pill className="w-4 h-4" />
            </span>
            <span className="font-semibold text-xs sm:text-sm text-emerald-300">
              {card.title}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {card.active_count} Active Prescriptions
          </span>
        </div>

        {card.safety_alert && (
          <div className="text-xs p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{card.safety_alert}</span>
          </div>
        )}
      </div>
    );
  }

  // Default fallback for any other structured card
  return (
    <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-cyan-500/20 text-xs text-slate-300">
      <div className="font-bold text-cyan-400 mb-1">{card.title}</div>
      {card.key_takeaway && <p>{card.key_takeaway}</p>}
    </div>
  );
};
