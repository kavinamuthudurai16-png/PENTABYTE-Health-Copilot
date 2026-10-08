from typing import List, Dict, Any
from ..models.health_record import (
    HealthRecord,
    PatientProfile,
    VitalMetricPoint,
    ValueStatus,
)

class TimelineService:
    """
    Unified Health Profile & Longitudinal Trajectory Service
    Compiles disparate clinical documents into an interactive chronological stream
    and tracks biometric trend charts across time.
    """

    @staticmethod
    def aggregate_timeline(records: List[HealthRecord]) -> List[HealthRecord]:
        # Sort chronologically, newest first
        return sorted(records, key=lambda r: r.record_date, reverse=True)

    @staticmethod
    def extract_vital_trends(records: List[HealthRecord]) -> Dict[str, List[VitalMetricPoint]]:
        trends: Dict[str, List[VitalMetricPoint]] = {
            "HbA1c (%)": [],
            "Fasting Blood Sugar (mg/dL)": [],
            "Systolic BP (mmHg)": [],
            "Diastolic BP (mmHg)": [],
            "Serum Creatinine (mg/dL)": [],
            "Total Cholesterol (mg/dL)": [],
            "Hemoglobin (g/dL)": []
        }

        # Sort ascending for time-series charts
        sorted_asc = sorted(records, key=lambda r: r.record_date)

        for rec in sorted_asc:
            for lv in rec.extracted_lab_values:
                t_lower = lv.test_name.lower()
                point = VitalMetricPoint(
                    date=rec.record_date,
                    value=lv.value,
                    unit=lv.unit,
                    status=lv.status,
                    record_id=rec.id
                )

                if "hba1c" in t_lower:
                    trends["HbA1c (%)"].append(point)
                elif "fasting blood sugar" in t_lower or "fbs" in t_lower:
                    trends["Fasting Blood Sugar (mg/dL)"].append(point)
                elif "systolic" in t_lower:
                    trends["Systolic BP (mmHg)"].append(point)
                elif "diastolic" in t_lower:
                    trends["Diastolic BP (mmHg)"].append(point)
                elif "creatinine" in t_lower:
                    trends["Serum Creatinine (mg/dL)"].append(point)
                elif "total cholesterol" in t_lower:
                    trends["Total Cholesterol (mg/dL)"].append(point)
                elif "hemoglobin" in t_lower:
                    trends["Hemoglobin (g/dL)"].append(point)

        # Remove empty series
        return {k: v for k, v in trends.items() if len(v) > 0}

    @staticmethod
    def extract_active_medications(records: List[HealthRecord]) -> List[Dict[str, Any]]:
        med_dict = {}
        for rec in sorted(records, key=lambda r: r.record_date, reverse=True):
            for med in rec.extracted_medications:
                key = med.name.lower()
                if key not in med_dict:
                    med_dict[key] = {
                        "name": med.name,
                        "generic_name": med.generic_name,
                        "strength": med.strength,
                        "frequency": med.frequency,
                        "timing": med.timing,
                        "route": med.route,
                        "duration": med.duration,
                        "purpose": med.purpose,
                        "prescribed_date": rec.record_date,
                        "prescribed_by": rec.doctor_name,
                        "facility": rec.facility_name,
                        "record_id": rec.id,
                        "warnings": med.interaction_warnings
                    }
        return list(med_dict.values())
