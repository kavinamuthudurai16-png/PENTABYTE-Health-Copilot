import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Pill, 
  FlaskConical, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { HealthRecord, RecordType } from '../types';
import { LANGUAGES } from '../translations';

interface RecordUploadProps {
  currentLang: string;
  onRecordCreated: (newRecord: HealthRecord) => void;
}

const SAMPLE_TEMPLATES = [
  {
    name: "Diabetic & Lipid Panel (Lab Report)",
    type: "LAB_REPORT" as RecordType,
    text: `APOLLO CLINICAL LABS - BIOCHEMISTRY DIVISION
Patient: Kavina M | Date: 2026-10-08
Doctor: Dr. S. Radhakrishnan, MD

HbA1c: 8.4 %
Fasting Blood Sugar: 154 mg/dL
Total Cholesterol: 228 mg/dL
Triglycerides: 245 mg/dL
Serum Creatinine: 1.12 mg/dL
Hemoglobin: 13.5 g/dL
Blood Pressure: 136/86 mmHg

Diagnosis: Type 2 Diabetes Mellitus with Dyslipidemia.`
  },
  {
    name: "Endocrine & Cardiology Prescription",
    type: "PRESCRIPTION" as RecordType,
    text: `APOLLO MULTISPECIALITY HOSPITALS
Rx for: Kavina M (27Y Female) | Date: 2026-10-08
Doctor: Dr. S. Radhakrishnan, MD

1. Tab Metformin 500mg 1-0-1 after meals x 30 days
2. Tab Telmisartan 40mg 1-0-0 morning after food x 30 days
3. Tab Atorvastatin 20mg 0-0-1 night bedtime x 30 days
Advice: Strict diabetic diet, daily 30 min walking.`
  },
  {
    name: "Bilingual Hindi/English Clinic Note",
    type: "PRESCRIPTION" as RecordType,
    text: `DR. SHARMA HEALTH CLINIC (डॉ. शर्मा हेल्थ क्लीनिक)
Patient: Kavina M | दिनांक: 08-10-2026

Rx:
1. Tab Paracetamol 650mg - 1-0-1 भोजन के बाद (After meals) x 5 days
2. Tab Pantoprazole 40mg - 1-0-0 सुबह खाली पेट (Before breakfast) x 7 days
3. Tab Amoxicillin 500mg - 1-0-1 x 5 days (एंटीबायोटिक)

रोगी को पर्याप्त पानी पीने और आराम करने की सलाह दी गई।`
  },
  {
    name: "Inpatient Discharge Summary",
    type: "DISCHARGE_SUMMARY" as RecordType,
    text: `CITY MULTISPECIALITY HOSPITAL - DISCHARGE SUMMARY
Patient: Kavina M | Admitted: 02-Oct-2026 | Discharged: 05-Oct-2026
Consultant: Dr. V. Meenakshi, MD (Gastroenterology)

Diagnosis: Acute Gastritis & Viral Pyrexia
Condition at discharge: Hemodynamically stable, afebrile, oral intake normal.

Medications to continue:
Cap Pantoprazole 40mg once daily before breakfast x 14 days
Tab Paracetamol 650mg SOS for fever.`
  }
];

export const RecordUpload: React.FC<RecordUploadProps> = ({
  currentLang,
  onRecordCreated
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState<RecordType>('LAB_REPORT');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUploaded, setLastUploaded] = useState<HealthRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [dragOver, setDragOver] = useState(false);

  const t = LANGUAGES[currentLang]?.translations || LANGUAGES.en.translations;

  const handleProcessText = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/records/upload/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          record_type: selectedType,
          language: currentLang
        })
      });

      if (!response.ok) throw new Error('Upload failed');
      const data: HealthRecord = await response.json();
      setLastUploaded(data);
      onRecordCreated(data);
    } catch (err) {
      console.error(err);
      alert('Failed to process medical document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('record_type', selectedType);
    formData.append('language', currentLang);

    try {
      const response = await fetch('/api/records/upload/file', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('File upload failed');
      const data: HealthRecord = await response.json();
      setLastUploaded(data);
      onRecordCreated(data);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze medical file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (template: typeof SAMPLE_TEMPLATES[0]) => {
    setInputText(template.text);
    setSelectedType(template.type);
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Box */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 font-display">
              <UploadCloud className="w-5 h-5 text-cyan-500" />
              {t.uploadTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.uploadDesc}
            </p>
          </div>

          {/* Input Method Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'text' 
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Direct OCR / Paste
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'file' 
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              File Upload (PDF / Image)
            </button>
          </div>
        </div>

        {/* 1-Click Sample Clinical Demos */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            1-Click Sample Clinical Cases (Click any to test instant extraction):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SAMPLE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(tmpl)}
                className="text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate">
                  {tmpl.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Type: {tmpl.type}
                </div>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'text' ? (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <label className="text-xs text-slate-600 dark:text-slate-300 font-medium">Record Classification:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as RecordType)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="LAB_REPORT">Lab Diagnostic Report</option>
                <option value="PRESCRIPTION">Doctor Prescription</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="DIAGNOSTIC_IMAGING">Imaging / Radiology</option>
              </select>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw prescription text, lab test values, or discharge summary here... e.g. 'HbA1c: 8.4 %, Fasting Blood Sugar: 154 mg/dL, Tab Metformin 500mg 1-0-1 after food'"
              className="w-full bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-slate-500">
                Supports English, Hindi, Tamil, Telugu medical terminology
              </span>
              <button
                onClick={handleProcessText}
                disabled={isLoading || !inputText.trim()}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Extracting & Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run AI Extraction & Ingest
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragOver 
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20' 
                  : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/50'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-cyan-500 mx-auto mb-3 opacity-80" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t.dragDropText}
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Supported formats: PDF, JPG, PNG, TIFF (Up to 25MB)
              </p>
              
              <label className="btn-secondary text-xs cursor-pointer inline-flex">
                <FileText className="w-4 h-4 text-cyan-500" />
                Select File from Computer
                <input
                  type="file"
                  accept="image/*,.pdf,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Live Ingestion & Extraction Result Banner */}
      {lastUploaded && (
        <div className="glass-panel p-6 border-cyan-500/30 bg-white/95 dark:bg-slate-900/90 relative overflow-hidden animate-fadeIn">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h4 className="text-base font-bold font-display">
              Successfully Ingested: {lastUploaded.title}
            </h4>
            <span className="badge-status badge-cyan ml-auto text-[10px]">
              FHIR R4 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Extracted Labs */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <FlaskConical className="w-4 h-4 text-cyan-500" />
                Extracted Lab Values ({lastUploaded.extracted_lab_values.length})
              </div>
              {lastUploaded.extracted_lab_values.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No numeric lab tests in this record</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {lastUploaded.extracted_lab_values.map((lv, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-slate-900/70 border border-slate-100 dark:border-transparent">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[130px]">{lv.test_name}</span>
                      <span className={`font-mono font-bold ${
                        lv.status === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' :
                        lv.status === 'HIGH' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {lv.value} {lv.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted Medications */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Pill className="w-4 h-4 text-emerald-500" />
                Prescribed Medicines ({lastUploaded.extracted_medications.length})
              </div>
              {lastUploaded.extracted_medications.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No prescriptions in this document</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {lastUploaded.extracted_medications.map((med, i) => (
                    <div key={i} className="text-xs p-1.5 rounded bg-white dark:bg-slate-900/70 border border-slate-100 dark:border-transparent">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{med.name}</span>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400">{med.strength}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {med.frequency} • {med.timing}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Summary Highlight */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Plain-Language Overview
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">
                {lastUploaded.ai_summary.plain_language_overview}
              </p>
              <div className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
                Added to chronological health timeline <ArrowRight className="w-3 h-3" />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
