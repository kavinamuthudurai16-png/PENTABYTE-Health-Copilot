import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  HeartPulse, 
  Pill, 
  ShieldCheck, 
  UploadCloud,
  Code2,
  Presentation,
  Network,
  Bot,
  Sparkles
} from 'lucide-react';

import { 
  HealthRecord, 
  PatientProfile, 
  ABHACard 
} from './types';
import { LANGUAGES } from './translations';

import { Navbar } from './components/Navbar';
import { PatientHeader } from './components/PatientHeader';
import { RecordUpload } from './components/RecordUpload';
import { TimelineView } from './components/TimelineView';
import { VitalsView } from './components/VitalsView';
import { MedicationsView } from './components/MedicationsView';
import { FullPageChatView } from './components/FullPageChatView';
import { AbhaModal } from './components/AbhaModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { PitchDeckModal } from './components/PitchDeckModal';
import { CopilotChatDrawer } from './components/CopilotChatDrawer';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('copilot_theme') as 'light' | 'dark') || 'light';
  });

  const [currentLang, setCurrentLang] = useState<string>('en');
  const [activeTab, setActiveTab] = useState<'timeline' | 'chat' | 'upload' | 'vitals' | 'meds' | 'abha'>('timeline');

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [abhaCard, setAbhaCard] = useState<ABHACard | null>(null);

  // Modals state
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fhirModalData, setFhirModalData] = useState<{ recordTitle: string; bundle: any } | null>(null);

  const t = LANGUAGES[currentLang]?.translations || LANGUAGES.en.translations;

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('copilot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load baseline data
  const fetchData = async (lang = currentLang) => {
    try {
      const pRes = await fetch('/api/timeline/profile');
      if (pRes.ok) {
        const pData = await pRes.json();
        setPatient(pData);
      }

      const rRes = await fetch(`/api/records?language=${lang}`);
      if (rRes.ok) {
        const rData = await rRes.json();
        setRecords(rData);
      }

      const mRes = await fetch('/api/timeline/medications');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMedications(mData);
      }

      const aRes = await fetch('/api/abdm/card');
      if (aRes.ok) {
        const aData = await aRes.json();
        setAbhaCard(aData);
      }
    } catch (err) {
      console.error('Error fetching clinical data', err);
    }
  };

  useEffect(() => {
    fetchData(currentLang);
  }, [currentLang]);

  const handleLanguageChange = (newLang: string) => {
    setCurrentLang(newLang);
  };

  const handleRecordCreated = (newRecord: HealthRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    fetchData(currentLang);
    setActiveTab('timeline');
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to remove this record from your timeline?')) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords(prev => prev.filter(r => r.id !== id));
        fetchData(currentLang);
      }
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const handleViewFhir = async (record: HealthRecord) => {
    try {
      const res = await fetch(`/api/records/${record.id}/fhir`);
      if (res.ok) {
        const bundle = await res.json();
        setFhirModalData({ recordTitle: record.title, bundle });
      }
    } catch (err) {
      alert('Failed to export FHIR Bundle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-cyan-500/30 selection:text-cyan-700 dark:selection:text-cyan-200">
      
      {/* Top Patient Navigation */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        patient={patient}
        onOpenAbhaModal={() => setIsAbhaModalOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Patient Profile Header */}
        <PatientHeader
          patient={patient}
          onOpenAbhaModal={() => setIsAbhaModalOpen(true)}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold no-scrollbar">
          
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>{t.tabTimeline}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300">
              {records.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-500" />
            <span>{t.tabChat}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[10px] text-cyan-600 dark:text-cyan-300 font-bold border border-cyan-500/30">
              AI Copilot
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-cyan-500" />
            <span>{t.tabUpload}</span>
          </button>

          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'vitals'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-amber-500" />
            <span>{t.tabVitals}</span>
          </button>

          <button
            onClick={() => setActiveTab('meds')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'meds'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <Pill className="w-4 h-4 text-emerald-500" />
            <span>{t.tabMeds}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300">
              {medications.length}
            </span>
          </button>

          <button
            onClick={() => setIsAbhaModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all whitespace-nowrap cursor-pointer ml-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.tabAbha}</span>
          </button>

        </div>

        {/* Tab Views */}
        {activeTab === 'timeline' && (
          <TimelineView
            records={records}
            currentLang={currentLang}
            onDeleteRecord={handleDeleteRecord}
            onViewFhir={handleViewFhir}
          />
        )}

        {activeTab === 'chat' && (
          <FullPageChatView
            currentLang={currentLang}
            patient={patient}
            onRecordCreated={() => fetchData(currentLang)}
          />
        )}

        {activeTab === 'upload' && (
          <RecordUpload
            currentLang={currentLang}
            onRecordCreated={handleRecordCreated}
          />
        )}

        {activeTab === 'vitals' && (
          <VitalsView
            vitalTrends={patient?.vital_trends || {}}
          />
        )}

        {activeTab === 'meds' && (
          <MedicationsView
            medications={medications}
          />
        )}

        {/* Medical Safety & Ethics Banner */}
        <MedicalDisclaimer currentLang={currentLang} />

      </main>

      {/* Footer (Evaluator & Compliance Documentation) */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 py-5 px-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">PENTABYTE Health Copilot</span> • HackXLerate 2026
          </div>
          
          {/* Subtle Evaluator Deliverables Links in Footer */}
          <div className="flex items-center gap-4 text-xs">
            <button 
              onClick={() => setIsArchModalOpen(true)} 
              className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1"
            >
              <Network className="w-3.5 h-3.5" /> Architecture Pipeline
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsPitchModalOpen(true)} 
              className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
            >
              <Presentation className="w-3.5 h-3.5" /> Project Pitch Deck
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsAbhaModalOpen(true)} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> ABHA Identity Card
            </button>
          </div>
        </div>
      </footer>

      {/* ABDM / ABHA Modal */}
      <AbhaModal
        isOpen={isAbhaModalOpen}
        onClose={() => setIsAbhaModalOpen(false)}
        abhaCard={abhaCard}
        onCardUpdated={(newCard) => {
          setAbhaCard(newCard);
          fetchData(currentLang);
        }}
      />

      {/* Architecture Diagram Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Pitch Deck Modal */}
      <PitchDeckModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
      />

      {/* Floating AI Assistant Trigger Button (Bottom-Right Corner) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="group flex items-center gap-2.5 pl-3.5 pr-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-300/30"
          title="Open HealthLens AI Assistant Panel"
          aria-label="Open HealthLens AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-950" />
          </div>
          <span className="font-display tracking-tight hidden sm:inline">Ask Health Copilot</span>
        </button>
      </div>

      {/* Floating AI Health Copilot Assistant Drawer */}
      <CopilotChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentLang={currentLang}
        patient={patient}
        onOpenFullPageChat={() => setActiveTab('chat')}
        onRecordCreated={() => fetchData(currentLang)}
      />

      {/* Single Record FHIR Viewer Modal */}
      {fhirModalData && (
        <div className="modal-overlay">
          <div className="modal-content p-6 max-w-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-500" />
                <h4 className="font-bold text-sm">
                  ABDM NRCES FHIR R4 Bundle: {fhirModalData.recordTitle}
                </h4>
              </div>
              <button onClick={() => setFhirModalData(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Standardized HL7 FHIR R4 Document Bundle compliant with National Health Authority (NHA) ABDM data models.
            </p>

            <pre className="p-3 rounded-xl bg-slate-900 text-cyan-300 border border-slate-800 text-[11px] font-mono max-h-80 overflow-y-auto">
              {JSON.stringify(fhirModalData.bundle, null, 2)}
            </pre>

            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(fhirModalData.bundle, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `FHIR_${fhirModalData.recordTitle.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn-primary text-xs"
              >
                Download JSON File
              </button>
              <button onClick={() => setFhirModalData(null)} className="btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
