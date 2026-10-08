import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  Download, 
  CheckCircle2, 
  Smartphone, 
  RefreshCw, 
  FileCode, 
  Share2,
  Lock,
  Sparkles
} from 'lucide-react';
import { ABHACard } from '../types';

interface AbhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  abhaCard: ABHACard | null;
  onCardUpdated: (newCard: ABHACard) => void;
}

export const AbhaModal: React.FC<AbhaModalProps> = ({
  isOpen,
  onClose,
  abhaCard,
  onCardUpdated
}) => {
  const [step, setStep] = useState<'card' | 'link' | 'verify'>('card');
  const [inputAbha, setInputAbha] = useState('91-8472-1092-3841');
  const [txnId, setTxnId] = useState('');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [fhirExportData, setFhirExportData] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleInitiate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/abdm/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abha_id_or_number: inputAbha })
      });
      const data = await res.json();
      setTxnId(data.txn_id);
      setStep('verify');
    } catch (err) {
      alert('Error initiating ABDM link');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/abdm/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txn_id: txnId, otp: otp })
      });
      if (!res.ok) throw new Error('Verification failed');
      const data: ABHACard = await res.json();
      onCardUpdated(data);
      setStep('card');
    } catch (err) {
      alert('Invalid OTP. Use demo OTP: 123456');
    } finally {
      setLoading(false);
    }
  };

  const downloadFhirBundle = async () => {
    try {
      const res = await fetch('/api/abdm/fhir-export');
      const data = await res.json();
      setFhirExportData(data);

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ABDM_FHIR_R4_${abhaCard?.abha_number || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download FHIR Bundle');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 sm:p-8 max-w-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              Ayushman Bharat Digital Mission (ABDM)
            </h3>
            <p className="text-xs text-slate-400">
              ABHA ID Linking, NRCES India FHIR R4 Interoperability & Health Locker
            </p>
          </div>
        </div>

        {step === 'card' && abhaCard && (
          <div className="space-y-6">
            
            {/* Digital ABHA Card Representation */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
              
              {/* Decorative Holographic Badge */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs">
                    🇮🇳
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-extrabold text-white">
                      National Health Authority (NHA)
                    </div>
                    <div className="text-[9px] text-slate-300">
                      Ministry of Health & Family Welfare, Govt. of India
                    </div>
                  </div>
                </div>

                <span className="badge-status badge-normal text-[10px]">
                  ABHA Active
                </span>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                
                {/* User Info */}
                <div className="sm:col-span-2 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Patient Full Name</span>
                    <span className="text-lg font-bold text-white font-display">{abhaCard.full_name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Gender / DOB</span>
                      <span>{abhaCard.gender} • {abhaCard.dob}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Mobile No.</span>
                      <span>{abhaCard.mobile}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] uppercase text-cyan-400 block font-semibold">14-Digit ABHA Number</span>
                    <span className="text-base font-mono font-bold text-cyan-300 tracking-wider">
                      {abhaCard.abha_number}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">ABHA Address</span>
                    <span className="font-mono text-slate-200">{abhaCard.abha_address}</span>
                  </div>
                </div>

                {/* Simulated QR Code for Scan & Share */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white text-slate-900 text-center">
                  <QrCode className="w-24 h-24 text-slate-900" />
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-700">
                    Scan & Share
                  </span>
                </div>

              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Aadhaar e-KYC Verified
                </span>
                <span className="font-mono">ABDM Tier-1 Sandbox</span>
              </div>

            </div>

            {/* Action Buttons: Export FHIR & Link Other */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadFhirBundle}
                  className="btn-primary text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export NRCES FHIR R4 Bundle (JSON)
                </button>
              </div>

              <button
                onClick={() => setStep('link')}
                className="btn-secondary text-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Link Different ABHA ID
              </button>
            </div>

            {/* FHIR Export Preview Snippet */}
            {fhirExportData && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto">
                <div className="text-cyan-400 font-bold mb-1">// FHIR R4 Bundle Preview:</div>
                <pre>{JSON.stringify(fhirExportData, null, 2)}</pre>
              </div>
            )}

          </div>
        )}

        {/* Step 2: Link Form */}
        {step === 'link' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Enter your 14-digit ABHA Number or ABHA Address to link your Ayushman Bharat records.
            </p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">ABHA ID or Mobile Number:</label>
              <input
                type="text"
                value={inputAbha}
                onChange={(e) => setInputAbha(e.target.value)}
                placeholder="e.g. 91-8472-1092-3841 or username@abdm"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button onClick={() => setStep('card')} className="btn-secondary text-xs">
                Cancel
              </button>
              <button 
                onClick={handleInitiate} 
                disabled={loading || !inputAbha} 
                className="btn-primary text-xs"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verify OTP */}
        {step === 'verify' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200">
              Verification OTP dispatched to registered Aadhaar/Mobile. (Demo OTP: <span className="font-mono font-bold text-white">123456</span>)
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Enter 6-Digit OTP:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base text-white font-mono text-center tracking-widest focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button onClick={() => setStep('link')} className="btn-secondary text-xs">
                Back
              </button>
              <button 
                onClick={handleVerify} 
                disabled={loading || otp.length !== 6} 
                className="btn-primary text-xs"
              >
                {loading ? 'Verifying...' : 'Verify & Mint ABHA Card'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
