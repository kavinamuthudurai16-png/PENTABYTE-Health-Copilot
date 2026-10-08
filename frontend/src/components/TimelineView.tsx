import React, { useState } from 'react';
import { 
  Calendar, 
  FileText, 
  Pill, 
  FlaskConical, 
  Building2, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Code2, 
  HelpCircle, 
  Search,
  Trash2
} from 'lucide-react';
import { HealthRecord, RecordType } from '../types';
import { LANGUAGES } from '../translations';

interface TimelineViewProps {
  records: HealthRecord[];
  currentLang: string;
  onDeleteRecord: (id: string) => void;
  onViewFhir: (record: HealthRecord) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  records,
  currentLang,
  onDeleteRecord,
  onViewFhir
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(records[0]?.id || null);
  const [eli5Mode, setEli5Mode] = useState<Record<string, boolean>>({});

  const t = LANGUAGES[currentLang]?.translations || LANGUAGES.en.translations;

  const toggleExpand = (id: string) => {
    setExpandedRecordId(prev => prev === id ? null : id);
  };

  const toggleEli5 = (id: string) => {
    setEli5Mode(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRecords = records.filter(r => {
    const matchesFilter = filterType === 'ALL' || r.record_type === filterType;
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facility_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.extracted_medications.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.extracted_lab_values.some(l => l.test_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getRecordIcon = (type: RecordType) => {
    switch (type) {
      case 'PRESCRIPTION':
        return <Pill className="w-5 h-5 text-emerald-500" />;
      case 'LAB_REPORT':
        return <FlaskConical className="w-5 h-5 text-cyan-500" />;
      case 'DISCHARGE_SUMMARY':
        return <Building2 className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Timeline Controls & Filter Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by test, medication, or doctor..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === type
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {type === 'ALL' ? 'All Events' : type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-slate-300 dark:before:to-slate-800">
        
        {filteredRecords.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400">
            No medical records match your criteria.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isExpanded = expandedRecordId === record.id;
            const isEli5 = eli5Mode[record.id] || false;
            const abnormalCount = record.extracted_lab_values.filter(l => l.status !== 'NORMAL').length;

            return (
              <div key={record.id} className="relative group">
                
                {/* Timeline node bullet */}
                <div className="absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-cyan-500 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                </div>

                {/* Event Card */}
                <div className="glass-panel overflow-hidden card-hoverable">
                  
                  {/* Card Header */}
                  <div 
                    onClick={() => toggleExpand(record.id)}
                    className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
                        {getRecordIcon(record.record_type)}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-base font-bold font-display">
                            {record.title}
                          </h4>
                          <span className="badge-status badge-cyan text-[10px]">
                            {record.record_type.replace('_', ' ')}
                          </span>
                          {abnormalCount > 0 && (
                            <span className="badge-status badge-high text-[10px]">
                              {abnormalCount} Abnormal
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-300 font-mono font-medium">
                            <Calendar className="w-3.5 h-3.5 text-cyan-500" /> {record.record_date}
                          </span>
                          {record.doctor_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" /> {record.doctor_name}
                            </span>
                          )}
                          {record.facility_name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" /> {record.facility_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewFhir(record);
                        }}
                        className="btn-secondary !py-1 !px-2.5 text-xs"
                        title="View ABDM FHIR JSON"
                      >
                        <Code2 className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="hidden sm:inline">FHIR R4</span>
                      </button>

                      <div className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Card Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-5 animate-fadeIn">
                      
                      {/* AI Clinical Summary & ELI5 Toggle */}
                      <div className="p-4 rounded-xl bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-900/40 border border-slate-200 dark:border-cyan-500/20 shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-300 uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            AI Health Intelligence Summary
                          </div>

                          {/* ELI5 Toggle Switch */}
                          <button
                            onClick={() => toggleEli5(record.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                              isEli5 
                                ? 'bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/50' 
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>{t.eli5Toggle}</span>
                          </button>
                        </div>

                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                          {isEli5 
                            ? record.ai_summary.eli5_summary 
                            : record.ai_summary.plain_language_overview}
                        </p>
                      </div>

                      {/* Abnormal Findings Gauge List */}
                      {record.ai_summary.abnormal_findings_explained.length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-600/30">
                          <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            {t.abnormalValues}
                          </h5>
                          <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200/90">
                            {record.ai_summary.abnormal_findings_explained.map((finding, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Extracted Lab Values Table */}
                      {record.extracted_lab_values.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <FlaskConical className="w-3.5 h-3.5 text-cyan-500" />
                            Extracted Laboratory Parameters
                          </h5>
                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="py-2.5 px-3">Test Name & LOINC</th>
                                  <th className="py-2.5 px-3">Observed Value</th>
                                  <th className="py-2.5 px-3">Standard Reference</th>
                                  <th className="py-2.5 px-3">Status</th>
                                  <th className="py-2.5 px-3">Clinical Explanation</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {record.extracted_lab_values.map((lv, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                      {lv.test_name}
                                      {lv.loinc_code && (
                                        <span className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 font-normal">
                                          LOINC: {lv.loinc_code}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                      {lv.value} {lv.unit}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                      {lv.reference_range}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span className={`badge-status text-[10px] ${
                                        lv.status === 'CRITICAL' ? 'badge-critical' :
                                        lv.status === 'HIGH' ? 'badge-high' :
                                        lv.status === 'LOW' ? 'badge-high' : 'badge-normal'
                                      }`}>
                                        {lv.status}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs leading-relaxed">
                                      {lv.explanation}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Extracted Medications Cards */}
                      {record.extracted_medications.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-emerald-500" />
                            Prescribed Medications & Dosages
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {record.extracted_medications.map((med, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs">{med.name}</span>
                                  <span className="text-[11px] font-mono font-semibold text-cyan-600 dark:text-cyan-400">{med.strength}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                                  Cadence: <span className="text-slate-800 dark:text-slate-200 font-medium">{med.frequency}</span>
                                </div>
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-300/90 mb-1">
                                  Timing: {med.timing}
                                </div>
                                {med.interaction_warnings.length > 0 && (
                                  <div className="mt-1 text-[10px] text-amber-800 dark:text-amber-300/80 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200 dark:border-amber-900/40">
                                    ⚠️ {med.interaction_warnings[0]}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Patient Action Items & Doctor Consultation Questions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Action items */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <h6 className="text-xs font-bold text-cyan-600 dark:text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
                            {t.actionItems}
                          </h6>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                            {record.ai_summary.patient_action_items.map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                                <span className="text-cyan-500 shrink-0">✓</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Questions for doctor */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <h6 className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                            {t.doctorQuestions}
                          </h6>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                            {record.ai_summary.questions_for_doctor.map((q, i) => (
                              <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                                <span className="text-purple-500 shrink-0">?</span> {q}
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                      {/* Footer Actions: ABDM Export & Delete */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                        <button
                          onClick={() => onViewFhir(record)}
                          className="btn-secondary !py-1 !px-3 text-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-500" />
                          Download NRCES FHIR R4 Bundle
                        </button>

                        <button
                          onClick={() => onDeleteRecord(record.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 px-2 py-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
