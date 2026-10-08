from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class FHIRCoding(BaseModel):
    system: str
    code: str
    display: str

class FHIRCodeableConcept(BaseModel):
    coding: List[FHIRCoding]
    text: Optional[str] = None

class FHIRIdentifier(BaseModel):
    system: str
    value: str
    use: Optional[str] = "official"

class FHIRReference(BaseModel):
    reference: str
    display: Optional[str] = None

class FHIRQuantity(BaseModel):
    value: float
    unit: str
    system: str = "http://unitsofmeasure.org"
    code: str

class FHIRReferenceRange(BaseModel):
    low: Optional[FHIRQuantity] = None
    high: Optional[FHIRQuantity] = None
    text: Optional[str] = None

# FHIR R4 Patient (ABDM Aligned)
class FHIRPatientResource(BaseModel):
    resourceType: str = "Patient"
    id: str
    meta: Dict[str, Any] = Field(
        default_factory=lambda: {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
        }
    )
    identifier: List[FHIRIdentifier]
    name: List[Dict[str, Any]]
    gender: str
    birthDate: str
    telecom: Optional[List[Dict[str, str]]] = None

# FHIR R4 Observation (Lab values, vitals)
class FHIRObservationResource(BaseModel):
    resourceType: str = "Observation"
    id: str
    meta: Dict[str, Any] = Field(
        default_factory=lambda: {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation"]
        }
    )
    status: str = "final"
    category: Optional[List[FHIRCodeableConcept]] = None
    code: FHIRCodeableConcept
    subject: FHIRReference
    effectiveDateTime: str
    valueQuantity: Optional[FHIRQuantity] = None
    interpretation: Optional[List[FHIRCodeableConcept]] = None
    referenceRange: Optional[List[FHIRReferenceRange]] = None

# FHIR R4 MedicationRequest (Prescriptions)
class FHIRMedicationRequestResource(BaseModel):
    resourceType: str = "MedicationRequest"
    id: str
    meta: Dict[str, Any] = Field(
        default_factory=lambda: {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest"]
        }
    )
    status: str = "active"
    intent: str = "order"
    medicationCodeableConcept: FHIRCodeableConcept
    subject: FHIRReference
    authoredOn: str
    dosageInstruction: List[Dict[str, Any]] = Field(default_factory=list)

# FHIR R4 Condition (Diagnoses)
class FHIRConditionResource(BaseModel):
    resourceType: str = "Condition"
    id: str
    meta: Dict[str, Any] = Field(
        default_factory=lambda: {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition"]
        }
    )
    clinicalStatus: FHIRCodeableConcept
    code: FHIRCodeableConcept
    subject: FHIRReference
    recordedDate: str

# FHIR R4 DiagnosticReport (Discharge summary / Lab package)
class FHIRDiagnosticReportResource(BaseModel):
    resourceType: str = "DiagnosticReport"
    id: str
    meta: Dict[str, Any] = Field(
        default_factory=lambda: {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportLab"]
        }
    )
    status: str = "final"
    code: FHIRCodeableConcept
    subject: FHIRReference
    effectiveDateTime: str
    result: List[FHIRReference] = Field(default_factory=list)
    conclusion: Optional[str] = None

# FHIR R4 Bundle (Standard container for ABDM health information exchange)
class FHIRBundleEntry(BaseModel):
    fullUrl: str
    resource: Dict[str, Any]

class FHIRBundle(BaseModel):
    resourceType: str = "Bundle"
    id: str
    meta: Dict[str, Any] = Field(
        default_factory=lambda: {
            "lastUpdated": datetime.utcnow().isoformat(),
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
        }
    )
    identifier: FHIRIdentifier
    type: str = "document"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    entry: List[FHIRBundleEntry] = Field(default_factory=list)
