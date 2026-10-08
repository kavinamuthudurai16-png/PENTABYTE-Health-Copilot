# PENTABYTE Health Copilot 🩺
### AI-Powered Personal Health Copilot & ABDM FHIR Interoperability Engine
**HackXLerate 2026 — Round 1 | Altrix Labs Challenge**  
**Team: PENTABYTE**

---

## 🌟 Overview
Healthcare information is heavily fragmented across paper prescriptions, diagnostic lab reports, and discharge summaries. **PENTABYTE Health Copilot** transforms raw, disorganized clinical records into an actionable, unified longitudinal health profile with intelligent OCR extraction, plain-language patient summaries, and native Ayushman Bharat Digital Mission (ABDM) FHIR R4 interoperability.

---

## 🚀 Quick Start Instructions

Both backend and frontend can be started with a single PowerShell script:

### 1. Launch FastAPI Backend
```powershell
.\run_backend.ps1
# or
.\run.backend.ps1
```
- **API Server:** `http://127.0.0.1:8000`
- **Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check Endpoint:** `http://127.0.0.1:8000/api/health`

### 2. Launch React / TypeScript Frontend
```powershell
.\run_frontend.ps1
# or
.\run.frontend.ps1
```
- **Frontend Web Application:** [http://localhost:5173](http://localhost:5173)

---

## 🎯 Problem Statement Alignment (Altrix Labs Brief)

| Evaluation Criterion | Weight | How PENTABYTE Solves It |
|---|---|---|
| **AI Utilization** | **35%** | Multimodal OCR entity extraction (medicines, dosages `1-0-1`, lab values, reference intervals, LOINC codes, ICD-10 diagnoses). Plain-language AI summarizer with "Explain Like I'm 5" (ELI5) mode and abnormal value risk interpretation. |
| **Technical Architecture** | **25%** | Modular FastAPI pipeline (`ocr_engine`, `ai_copilot`, `multilingual`, `abdm_fhir_service`, `timeline_service`). NRCES India FHIR R4 standard document bundle output. |
| **User Experience** | **20%** | Drag-and-drop document upload, 1-click preloaded hackathon test cases, interactive chronological health timeline, and SVG biomarker trajectory graphs. |
| **Healthcare Impact** | **10%** | Safe clinical wording, no misleading claims, prominent medical disclaimers, red-flag emergency alert triggers, and emergency hotline (108 / 112) integration. |
| **Presentation & Demo** | **10%** | Built-in interactive 5-slide Hackathon Pitch Deck mode directly inside the web UI, plus an end-to-end Architecture Diagram modal. |
| **Bonus Credit** | **+10 pts** | **1. Regional Multilingual Support:** English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা). <br>**2. ABDM/ABHA Readiness:** Mock 14-digit ABHA ID link, OTP verification, digital ABHA Health Card with QR code, and 1-click NRCES FHIR R4 JSON export. |

---

## 🧪 Automated Test Suite

Run backend test suite with 100% pass coverage:
```powershell
$env:PYTHONPATH = "D:\pentabyte"
.\.tools\python\python.exe -m pytest backend/tests/test_api.py -v
```

---

## 🏗️ Technical Stack
- **Backend:** FastAPI, Python 3.11, Uvicorn, Pydantic v2, Pytest
- **Frontend:** React 18, TypeScript, Vite, Lucide React
- **Standards:** HL7 FHIR R4, LOINC, ICD-10, NRCES India / ABDM Profiles
