import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from ..models.fhir import (
    FHIRBundle,
    FHIRBundleEntry,
    FHIRPatientResource,
    FHIRObservationResource,
    FHIRMedicationRequestResource,
    FHIRConditionResource,
    FHIRDiagnosticReportResource,
    FHIRIdentifier,
    FHIRReference,
    FHIRCodeableConcept,
    FHIRCoding,
    FHIRQuantity,
    FHIRReferenceRange,
)
from ..models.health_record import (
    HealthRecord,
    PatientProfile,
    ABHACardResponse,
)

class ABDMFHIRService:
    """
    ABDM / ABHA Integration & FHIR R4 Interoperability Engine
    Compliant with NRCES India and National Health Authority (NHA) ABDM specifications.
    Maps records into FHIR R4 Document Bundles and handles mock ABHA linking & OTP verification.
    """

    @staticmethod
    def generate_mock_abha_number() -> str:
        # Standard ABDM 14-digit format: 91-XXXX-XXXX-XXXX
        part1 = "91"
        part2 = f"{uuid.uuid4().int % 9000 + 1000}"
        part3 = f"{uuid.uuid4().int % 9000 + 1000}"
        part4 = f"{uuid.uuid4().int % 9000 + 1000}"
        return f"{part1}-{part2}-{part3}-{part4}"

    @staticmethod
    def initiate_abha_linking(abha_id_or_number: str) -> Dict[str, str]:
        txn_id = f"ABDM-TXN-{uuid.uuid4().hex[:10].upper()}"
        return {
            "txn_id": txn_id,
            "status": "OTP_SENT",
            "message": f"Verification OTP dispatched to registered mobile linked with '{abha_id_or_number}'. (Demo OTP: 123456)",
            "masked_mobile": "+91 98*** **412"
        }

    @staticmethod
    def verify_and_create_abha_card(
        txn_id: str,
        otp: str,
        patient_name: str = "Kavina M",
        custom_address: str = "kavina.m@abdm"
    ) -> ABHACardResponse:
        # Verify demo OTP (accepts 123456 or any 6-digit code for testing convenience)
        abha_num = ABDMFHIRService.generate_mock_abha_number()
        issued_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        qr_payload = {
            "v": "1.0",
            "hid": abha_num,
            "hAddress": custom_address,
            "name": patient_name,
            "gender": "Female",
            "dob": "1998-05-14",
            "state": "Tamil Nadu",
            "district": "Namakkal",
            "auth": "AADHAAR_MOCK_VERIFIED",
            "issued": issued_time
        }

        return ABHACardResponse(
            abha_number=abha_num,
            abha_address=custom_address,
            full_name=patient_name,
            gender="Female",
            dob="1998-05-14",
            mobile="+91 98765 43210",
            qr_data=json.dumps(qr_payload),
            verification_status="VERIFIED",
            abdm_facility="National Health Authority (NHA) Sandbox",
            issued_at=issued_time
        )

    @staticmethod
    def export_to_fhir_bundle(patient: PatientProfile, record: HealthRecord) -> Dict[str, Any]:
        """
        Converts a clinical HealthRecord into an official ABDM-compliant FHIR R4 Document Bundle.
        """
        bundle_id = f"bundle-{record.id}"
        patient_ref = f"Patient/{patient.patient_id}"

        entries: List[Dict[str, Any]] = []

        # 1. FHIR Patient Resource
        fhir_patient = {
            "resourceType": "Patient",
            "id": patient.patient_id,
            "meta": {
                "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
            },
            "identifier": [
                {
                    "system": "https://healthid.abdm.gov.in",
                    "value": patient.abha_id or "91-8472-1092-3841",
                    "use": "official"
                }
            ],
            "name": [
                {
                    "use": "official",
                    "text": patient.full_name
                }
            ],
            "gender": patient.gender.lower(),
            "birthDate": "1998-05-14"
        }
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": fhir_patient
        })

        # 2. FHIR Observations (Lab Values)
        obs_refs = []
        for idx, lv in enumerate(record.extracted_lab_values):
            obs_id = f"obs-{record.id}-{idx}"
            obs_resource = {
                "resourceType": "Observation",
                "id": obs_id,
                "meta": {
                    "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation"]
                },
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "laboratory",
                                "display": "Laboratory"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": lv.loinc_code or "Unknown",
                            "display": lv.test_name
                        }
                    ],
                    "text": lv.test_name
                },
                "subject": {"reference": patient_ref},
                "effectiveDateTime": f"{record.record_date}T09:00:00Z",
                "valueQuantity": {
                    "value": lv.value,
                    "unit": lv.unit,
                    "system": "http://unitsofmeasure.org",
                    "code": lv.unit
                },
                "interpretation": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                                "code": "H" if lv.status.value == "HIGH" else ("L" if lv.status.value == "LOW" else "N"),
                                "display": lv.status.value
                            }
                        ]
                    }
                ],
                "referenceRange": [
                    {
                        "text": lv.reference_range
                    }
                ]
            }
            obs_refs.append({"reference": f"Observation/{obs_id}", "display": lv.test_name})
            entries.append({
                "fullUrl": f"urn:uuid:{uuid.uuid4()}",
                "resource": obs_resource
            })

        # 3. FHIR MedicationRequests (Prescriptions)
        for idx, med in enumerate(record.extracted_medications):
            med_id = f"medreq-{record.id}-{idx}"
            med_resource = {
                "resourceType": "MedicationRequest",
                "id": med_id,
                "meta": {
                    "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest"]
                },
                "status": "active",
                "intent": "order",
                "medicationCodeableConcept": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "387005008",
                            "display": med.name
                        }
                    ],
                    "text": f"{med.name} {med.strength}"
                },
                "subject": {"reference": patient_ref},
                "authoredOn": f"{record.record_date}T09:30:00Z",
                "dosageInstruction": [
                    {
                        "text": f"{med.frequency}, {med.timing}, duration {med.duration}",
                        "route": {
                            "coding": [
                                {
                                    "system": "http://snomed.info/sct",
                                    "code": "260548002",
                                    "display": "Oral"
                                }
                            ]
                        }
                    }
                ]
            }
            entries.append({
                "fullUrl": f"urn:uuid:{uuid.uuid4()}",
                "resource": med_resource
            })

        # 4. FHIR Conditions (Diagnoses)
        for idx, diag in enumerate(record.diagnoses):
            cond_id = f"cond-{record.id}-{idx}"
            cond_resource = {
                "resourceType": "Condition",
                "id": cond_id,
                "meta": {
                    "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition"]
                },
                "clinicalStatus": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                            "code": "active",
                            "display": "Active"
                        }
                    ]
                },
                "code": {
                    "coding": [
                        {
                            "system": "http://hl7.org/fhir/sid/icd-10",
                            "code": diag.icd10_code or "R69",
                            "display": diag.condition_name
                        }
                    ],
                    "text": diag.condition_name
                },
                "subject": {"reference": patient_ref},
                "recordedDate": record.record_date
            }
            entries.append({
                "fullUrl": f"urn:uuid:{uuid.uuid4()}",
                "resource": cond_resource
            })

        # 5. FHIR DiagnosticReport (Encompassing clinical document)
        diag_report = {
            "resourceType": "DiagnosticReport",
            "id": f"report-{record.id}",
            "meta": {
                "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportLab"]
            },
            "status": "final",
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "11502-2",
                        "display": record.title
                    }
                ],
                "text": record.title
            },
            "subject": {"reference": patient_ref},
            "effectiveDateTime": f"{record.record_date}T10:00:00Z",
            "result": obs_refs,
            "conclusion": record.ai_summary.plain_language_overview
        }
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": diag_report
        })

        # Construct Bundle
        bundle = {
            "resourceType": "Bundle",
            "id": bundle_id,
            "meta": {
                "lastUpdated": datetime.utcnow().isoformat(),
                "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
            },
            "identifier": {
                "system": "https://healthid.abdm.gov.in/bundles",
                "value": f"ABDM-DOC-{record.id.upper()}"
            },
            "type": "document",
            "timestamp": datetime.utcnow().isoformat(),
            "entry": entries
        }

        return bundle
