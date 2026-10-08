import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Target, 
  Award,
  Zap,
  Globe2
} from 'lucide-react';

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIDES = [
  {
    title: "AI-Powered Personal Health Copilot",
    subtitle: "HackXLerate 2026 · Round 1 · Altrix Labs Challenge",
    team: "Team: PENTABYTE",
    category: "Problem Context & Vision",
    points: [
      "Fragmented Healthcare: Patient medical data is scattered across physical slips, paper prescriptions, lab PDFs, and hospital discharge notes.",
      "The Health Literacy Chasm: Patients receive complex test markers (e.g. HbA1c 8.4%, Creatinine 1.2, LDL 160) without understanding what abnormal readings mean or what immediate steps to take.",
      "Our Mission: Build an AI-native Copilot that transforms fragmented health data into an actionable, unified longitudinal health timeline with ABDM interoperability."
    ],
    highlight: "Empowering every Indian citizen to take charge of their healthcare journey."
  },
  {
    title: "The PENTABYTE Solution Architecture",
    subtitle: "AI Ingestion · Clinical Reasoner · ABDM Compliance",
    team: "Core Innovation",
    category: "Technical Architecture",
    points: [
      "Intelligent Multimodal Extraction: OCR engine extracts medications, dosages (1-0-1), lab values, reference intervals, and diagnoses from prescriptions, blood reports, and discharge summaries.",
      "Plain-Language AI Summarizer: Translates medical jargon into crystal-clear patient explanations, including an innovative 'Explain Like I'm 5' (ELI5) toggle.",
      "Unified Chronological Timeline: All historical encounters, prescription regimens, and biomarker trends (HbA1c, BP, Cholesterol) in one unified interactive timeline."
    ],
    highlight: "Turns confusing medical paperwork into patient clarity in under 3 seconds."
  },
  {
    title: "Bonus Features: Multilingual & ABDM/ABHA",
    subtitle: "Maximum Evaluation Points (3.5 Bonus Credit)",
    team: "Key Differentiators",
    category: "Bonus Credit (+10 Points)",
    points: [
      "Regional Indic Languages: Full interface and clinical summary translation in Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), and Bengali (বাংলা).",
      "Bilingual OCR Handling: Ingests prescriptions and clinic notes written in English mixed with regional languages.",
      "ABDM / ABHA Digital Identity: Standardized 14-digit ABHA ID integration, simulated OTP authentication, digital health card with QR code.",
      "NRCES India FHIR R4 Bundles: Native export into standard FHIR R4 resources (Patient, Observation, MedicationRequest, Condition, DiagnosticReport)."
    ],
    highlight: "100% compliant with National Health Authority (NHA) ABDM standards."
  },
  {
    title: "Medical Safety & Clinical Ethics",
    subtitle: "Safe Wording · No Misleading Claims · Actionable Guardrails",
    team: "Healthcare Impact (10%)",
    category: "Clinical Safety",
    points: [
      "Clear Medical Disclaimers: Prominent context-aware notices distinguishing assistive health literacy from clinical diagnosis.",
      "Red-Flag Warning Engine: Automated detection of critical laboratory anomalies (e.g., severe glycemic spikes or acute renal indicators) with immediate triage advisories.",
      "Doctor Collaboration: Equips patients with specific, articulate questions for their next consultation and daily medication reminder alarms.",
      "Direct Emergency Hotline Access: Integrated quick-dial for national ambulance services (108 / 112)."
    ],
    highlight: "Clinically responsible AI designed to support—not replace—licensed doctors."
  },
  {
    title: "Roadmap to Round 2 (Hyderabad)",
    subtitle: "Next Stage Vision for Top 50 Finalists",
    team: "Roadmap & Scalability",
    category: "Future Horizons",
    points: [
      "On-Device Offline Edge AI: Lightweight OCR inference on mobile devices for rural and connectivity-constrained healthcare centers.",
      "Voice Copilot in Regional Dialects: Speech-to-speech health interaction for low-literacy rural demographics.",
      "Doctor-Facing ABDM Health Summary: 1-click generation of a 30-second clinical briefing before patient appointments.",
      "Unified Ayushman Bharat Health Locker Sync: Live sandbox synchronization with NHA Health Information Provider (HIP) and User (HIU) gateways."
    ],
    highlight: "Team PENTABYTE is ready to build the future of Indian Digital Health!"
  }
];

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 sm:p-10 max-w-3xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              {slide.category}
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Slide {currentSlide + 1} of {SLIDES.length}
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="min-h-[320px] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
              {slide.team}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-1">
              {slide.title}
            </h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              {slide.subtitle}
            </p>

            {/* Slide Bullet Points */}
            <div className="space-y-3.5 mb-6">
              {slide.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-200 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>{pt}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight Callout */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{slide.highlight}</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-800">
          <button
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="btn-secondary text-xs disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide 
                    ? 'w-6 bg-cyan-400' 
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            className="btn-primary text-xs disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
