import React from 'react';
import { 
  X, 
  Network, 
  FileText, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Lock,
  Globe2,
  FileCode2
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 sm:p-8 max-w-4xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              Technical Architecture & Data Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              End-to-End Ingestion, Clinical Entity Extraction, AI Reasoning & ABDM FHIR R4 Schema
            </p>
          </div>
        </div>

        {/* Pipeline Diagram Flow */}
        <div className="space-y-4">
          
          {/* Layer 1: Ingestion */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
              Multimodal Ingestion & Document Preprocessing
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Prescriptions</span>
                Handwritten & digital Rx
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Lab Reports</span>
                Biochemistry & CBC PDFs
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Discharge Summaries</span>
                Inpatient hospital records
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Bilingual Notes</span>
                Hindi, Tamil, Telugu clinical text
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 text-cyan-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>

          {/* Layer 2: OCR & Clinical Extraction */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px]">2</span>
              Intelligent OCR, Entity Normalization & Standard Ontologies
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Lab Extraction (LOINC)</span>
                Normalizes values, units & clinical reference ranges
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Medication Cadence</span>
                Extracts dosages (1-0-1), routes, meal timings
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Diagnoses (ICD-10)</span>
                Standardized condition coding & clinical status
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 text-blue-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>

          {/* Layer 3: AI Clinical Reasoning & Copilot */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">3</span>
              AI Clinical Reasoning & Plain-Language Engine
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Plain English & ELI5</span>
                Explains abnormal test indices in simple metaphors
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Actionable Guidance</span>
                Lifestyle advice, questions for doctor, safety disclaimers
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block">Multilingual Localization</span>
                Full support for Hindi, Tamil, Telugu, and Bengali
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 text-purple-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>

          {/* Layer 4: ABDM Interoperability & FHIR Schema */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">4</span>
              ABDM Standards & NRCES FHIR R4 Bundle Output
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-center">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                FHIR Patient
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                FHIR Observation
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                MedicationRequest
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                FHIR Condition
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono col-span-2 sm:col-span-1">
                DiagnosticReport
              </div>
            </div>
          </div>

        </div>

        {/* Footer Specifications Badge */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <Lock className="w-3.5 h-3.5" /> DISHA / ABDM Privacy Compliant
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <FileCode2 className="w-3.5 h-3.5" /> FHIR R4 JSON Export
            </span>
            <span className="flex items-center gap-1.5 text-purple-300 font-medium">
              <Globe2 className="w-3.5 h-3.5" /> Regional Indic Languages
            </span>
          </div>

          <span className="text-[11px] text-slate-500">
            Team PENTABYTE • HackXLerate 2026
          </span>
        </div>

      </div>
    </div>
  );
};
