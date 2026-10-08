from typing import List, Dict
from .models.health_record import (
    HealthRecord,
    RecordType,
    ValueStatus,
    LabValue,
    Medication,
    Diagnosis,
    AISummary,
    PatientProfile,
)

SAMPLE_PATIENT = PatientProfile(
    patient_id="PENTABYTE-PATIENT-001",
    full_name="Kavina M",
    age=27,
    gender="Female",
    blood_group="O+",
    abha_id="91-8472-1092-3841",
    abha_address="kavina.m@abdm",
    is_abha_linked=True,
    allergies=["Penicillin (Mild urticaria)", "Sulfonamides"],
    chronic_conditions=["Type 2 Diabetes Mellitus", "Essential Hypertension"],
    active_medications_count=3,
    total_records_count=4,
    vital_trends={}
)

SAMPLE_RECORDS: List[HealthRecord] = [
    HealthRecord(
        id="rec-001",
        patient_id="PENTABYTE-PATIENT-001",
        title="Comprehensive Metabolic & Lipid Diagnostic Panel",
        record_type=RecordType.LAB_REPORT,
        record_date="2026-09-15",
        doctor_name="Dr. S. Radhakrishnan, MD",
        facility_name="Apollo Diagnostics & Reference Lab",
        department="Biochemistry & Pathology",
        raw_ocr_text="""
        APOLLO DIAGNOSTICS & PATHOLOGY LABORATORY
        Patient: Kavina M | Age: 27 | Sex: Female
        Sample Collection Date: 15-Sep-2026 | Ref By: Dr. S. Radhakrishnan, MD
        
        INVESTIGATION                      OBSERVED VALUE   REFERENCE RANGE     UNITS
        -----------------------------------------------------------------------------
        HbA1c (Glycated Hemoglobin)        8.2              4.0 - 5.6           %
        Fasting Blood Sugar (FBS)          148.0            70.0 - 99.0         mg/dL
        Total Cholesterol                  215.0            125.0 - 200.0       mg/dL
        Triglycerides                      220.0            50.0 - 150.0        mg/dL
        Serum Creatinine                   1.05             0.6 - 1.2           mg/dL
        Hemoglobin (Hb)                    13.2             12.0 - 15.5         g/dL
        Blood Pressure                     138/88           90-120 / 60-80      mmHg
        
        Clinical Interpretation:
        Glycemic parameters demonstrate poorly controlled diabetes mellitus with hypertriglyceridemia.
        Renal indices remain preserved within reference limits.
        """,
        extracted_lab_values=[
            LabValue(
                test_name="HbA1c (Glycated Hemoglobin)",
                category="Glycemic Control",
                loinc_code="4548-4",
                value=8.2,
                unit="%",
                reference_range="4.0 - 5.6 %",
                min_ref=4.0,
                max_ref=5.6,
                status=ValueStatus.HIGH,
                explanation="Reflects 3-month average blood glucose. Reading of 8.2% indicates elevated blood sugar needing therapy adjustment.",
                risk_level="Elevated"
            ),
            LabValue(
                test_name="Fasting Blood Sugar (FBS)",
                category="Glycemic Control",
                loinc_code="1558-6",
                value=148.0,
                unit="mg/dL",
                reference_range="70.0 - 99.0 mg/dL",
                min_ref=70.0,
                max_ref=99.0,
                status=ValueStatus.HIGH,
                explanation="Blood sugar after fasting. 148 mg/dL confirms persistent morning hyperglycemia.",
                risk_level="Elevated"
            ),
            LabValue(
                test_name="Total Cholesterol",
                category="Lipid Profile",
                loinc_code="2093-3",
                value=215.0,
                unit="mg/dL",
                reference_range="125.0 - 200.0 mg/dL",
                min_ref=125.0,
                max_ref=200.0,
                status=ValueStatus.HIGH,
                explanation="Total circulating cholesterol. Slightly above desirable limit of 200 mg/dL.",
                risk_level="Moderate"
            ),
            LabValue(
                test_name="Triglycerides",
                category="Lipid Profile",
                loinc_code="2571-8",
                value=220.0,
                unit="mg/dL",
                reference_range="50.0 - 150.0 mg/dL",
                min_ref=50.0,
                max_ref=150.0,
                status=ValueStatus.HIGH,
                explanation="Blood fat particles. Above the safe limit of 150 mg/dL; often linked with high carbohydrate intake.",
                risk_level="Elevated"
            ),
            LabValue(
                test_name="Serum Creatinine",
                category="Renal Function",
                loinc_code="2160-0",
                value=1.05,
                unit="mg/dL",
                reference_range="0.6 - 1.2 mg/dL",
                min_ref=0.6,
                max_ref=1.2,
                status=ValueStatus.NORMAL,
                explanation="Renal filtration marker. Normal value confirms healthy kidney function.",
                risk_level="Optimal"
            ),
            LabValue(
                test_name="Hemoglobin (Hb)",
                category="Complete Blood Count",
                loinc_code="718-7",
                value=13.2,
                unit="g/dL",
                reference_range="12.0 - 16.5 g/dL",
                min_ref=12.0,
                max_ref=16.5,
                status=ValueStatus.NORMAL,
                explanation="Oxygen carrying capacity. Healthy level with no sign of anemia.",
                risk_level="Optimal"
            ),
            LabValue(
                test_name="Systolic Blood Pressure",
                category="Vitals",
                loinc_code="8480-6",
                value=138.0,
                unit="mmHg",
                reference_range="90.0 - 120.0 mmHg",
                min_ref=90.0,
                max_ref=120.0,
                status=ValueStatus.HIGH,
                explanation="Systolic blood pressure slightly elevated (Stage 1 Hypertension threshold).",
                risk_level="Moderate"
            )
        ],
        diagnoses=[
            Diagnosis(
                condition_name="Type 2 Diabetes Mellitus",
                icd10_code="E11.9",
                severity="Chronic",
                clinical_status="Active",
                explanation="Impaired glycemic regulation evidenced by elevated HbA1c (8.2%) and Fasting Sugar."
            ),
            Diagnosis(
                condition_name="Hyperlipidemia",
                icd10_code="E78.5",
                severity="Moderate",
                clinical_status="Active",
                explanation="Combined elevation of serum total cholesterol and triglycerides."
            )
        ],
        ai_summary=AISummary(
            plain_language_overview=(
                "Your diagnostic test shows that while your kidney function and hemoglobin counts are in great shape, "
                "your **HbA1c (8.2%)** and **Fasting Blood Sugar (148 mg/dL)** are higher than target ranges, indicating that "
                "diabetes management needs closer attention. Your triglycerides (220 mg/dL) are also moderately high."
            ),
            eli5_summary=(
                "Imagine your bloodstream is like a highway. Right now, there are too many sugar and fat cars on the road, "
                "which causes traffic jams. Your kidneys are doing a great job keeping things clean, but your engine needs "
                "less sugary fuel and regular walking to clear the road."
            ),
            abnormal_findings_explained=[
                "• **HbA1c is 8.2% (Target < 5.7%):** This means excess glucose molecules have attached to your red blood cells over the past 3 months.",
                "• **Fasting Blood Sugar is 148 mg/dL (Normal < 100):** Your body is producing or releasing extra glucose overnight.",
                "• **Triglycerides are 220 mg/dL (Normal < 150):** Excess dietary carbohydrates and sugars are converted into these lipid stores.",
                "• **Systolic BP is 138 mmHg (Normal < 120):** Blood is pushing slightly too firmly against arterial vessels."
            ],
            patient_action_items=[
                "Show this report to Dr. Radhakrishnan to discuss optimizing your Metformin or antihypertensive dosage.",
                "Maintain a daily morning fasting blood glucose log on your smartphone or diary.",
                "Engage in a 25-minute brisk walk after lunch or dinner every day to utilize excess glucose."
            ],
            dietary_lifestyle_advice=[
                "Replace white rice and refined flour with fiber-rich whole grains (millet, brown rice, steel-cut oats).",
                "Cut out sugary beverages, soda, and deep-fried snacks.",
                "Drink 2.5 liters of clean water daily to assist natural metabolic excretion."
            ],
            questions_for_doctor=[
                "Should we adjust the Metformin dose or add another agent to bring my HbA1c below 7.0%?",
                "Do I need a statin (such as Atorvastatin) to bring my triglycerides and cholesterol under control?",
                "When should I repeat the HbA1c test?"
            ],
            red_flag_warnings=[
                "Watch out for signs of severe high sugar like extreme unquenchable thirst, frequent night urination, or unexplained weight loss.",
                "Seek immediate medical help if you experience chest pain, sudden dizziness, or shortness of breath."
            ],
            medical_disclaimer=(
                "PENTABYTE AI Health Copilot provides assistive educational summaries. "
                "This is not a substitute for clinical diagnosis or prescription by a medical doctor."
            )
        )
    ),
    HealthRecord(
        id="rec-002",
        patient_id="PENTABYTE-PATIENT-001",
        title="Internal Medicine Prescription & Care Plan",
        record_type=RecordType.PRESCRIPTION,
        record_date="2026-09-18",
        doctor_name="Dr. S. Radhakrishnan, MD",
        facility_name="Apollo Multispeciality Hospitals",
        department="Department of Endocrinology & Medicine",
        raw_ocr_text="""
        APOLLO MULTISPECIALITY HOSPITALS
        DEPARTMENT OF GENERAL MEDICINE & ENDOCRINOLOGY
        Date: 18/09/2026 | Patient: Kavina M (27Y / F)
        
        Rx:
        1. Tab Metformin 500mg - 1-0-1 (Twice daily after meals) x 30 days
        2. Tab Telmisartan 40mg - 1-0-0 (Once daily morning after food) x 30 days
        3. Tab Atorvastatin 20mg - 0-0-1 (Once daily at bedtime) x 30 days
        
        Advice:
        - Low salt, diabetic diet.
        - 30 mins brisk walking.
        - Review with FBS/PPBS in 4 weeks.
        """,
        extracted_medications=[
            Medication(
                name="Metformin",
                generic_name="Metformin Hydrochloride 500mg",
                strength="500 mg",
                frequency="1-0-1 (Twice daily - Morning & Night)",
                timing="After meals",
                route="Oral",
                duration="30 days",
                purpose="Lowers glucose production in liver and improves insulin sensitivity.",
                instructions="Always take with or immediately after food to avoid stomach cramps.",
                interaction_warnings=["Avoid alcohol consumption while on Metformin."]
            ),
            Medication(
                name="Telmisartan",
                generic_name="Telmisartan 40mg",
                strength="40 mg",
                frequency="1-0-0 (Once daily - Morning)",
                timing="After morning breakfast",
                route="Oral",
                duration="30 days",
                purpose="Relaxes blood vessels to lower blood pressure and protect kidney microvasculature.",
                instructions="Take with water at the same time every morning.",
                interaction_warnings=["Do not combine with potassium supplements without checking."]
            ),
            Medication(
                name="Atorvastatin",
                generic_name="Atorvastatin Calcium 20mg",
                strength="20 mg",
                frequency="0-0-1 (Once daily - Night)",
                timing="At bedtime",
                route="Oral",
                duration="30 days",
                purpose="Inhibits cholesterol synthesis in the liver to lower LDL and triglycerides.",
                instructions="Best taken at bedtime because cholesterol synthesis peaks during sleep.",
                interaction_warnings=["Report any unusual muscle aches or dark urine to doctor."]
            )
        ],
        diagnoses=[
            Diagnosis(
                condition_name="Type 2 Diabetes Mellitus",
                icd10_code="E11.9",
                severity="Chronic",
                clinical_status="Active",
                explanation="Pharmacological glycemic control regimen initiated."
            ),
            Diagnosis(
                condition_name="Essential Hypertension",
                icd10_code="I10",
                severity="Chronic",
                clinical_status="Active",
                explanation="Antihypertensive ARB therapy for arterial pressure regulation."
            )
        ],
        ai_summary=AISummary(
            plain_language_overview=(
                "Dr. Radhakrishnan has prescribed a comprehensive triple therapy designed to address your diabetes, "
                "blood pressure, and elevated lipids simultaneously. Following this medication schedule will significantly "
                "protect your heart and kidneys."
            ),
            eli5_summary=(
                "You have three health guardians: Metformin manages your sugar, Telmisartan keeps your blood pipes relaxed, "
                "and Atorvastatin sweeps away extra grease from your arteries while you sleep!"
            ),
            abnormal_findings_explained=[
                "• Metformin 500mg targets your elevated HbA1c (8.2%) and Fasting Glucose.",
                "• Telmisartan 40mg keeps systolic pressure within safe limits (<120 mmHg).",
                "• Atorvastatin 20mg addresses the 220 mg/dL triglycerides and 215 mg/dL cholesterol."
            ],
            patient_action_items=[
                "Set 3 daily medication alarm reminders: Breakfast (Telmisartan + Metformin), Dinner (Metformin), Bedtime (Atorvastatin).",
                "Refill your prescriptions before running out so there is no gap in therapy.",
                "Book a 4-week follow-up appointment."
            ],
            dietary_lifestyle_advice=[
                "Maintain low sodium intake (under 1 teaspoon of salt total per day).",
                "Drink water regularly throughout the day."
            ],
            questions_for_doctor=[
                "How often should I monitor my blood pressure at home?",
                "If I experience mild nausea from Metformin, can I take it midway through my meal?"
            ],
            red_flag_warnings=[
                "Never stop blood pressure medications suddenly, as it can cause rebound high pressure."
            ],
            medical_disclaimer="Assistive copilot summary. Take medications strictly as directed by your physician."
        )
    ),
    HealthRecord(
        id="rec-003",
        patient_id="PENTABYTE-PATIENT-001",
        title="Quarterly Diabetes Routine Follow-up Panel",
        record_type=RecordType.LAB_REPORT,
        record_date="2026-06-10",
        doctor_name="Dr. S. Radhakrishnan, MD",
        facility_name="Apollo Diagnostics & Reference Lab",
        department="Biochemistry",
        raw_ocr_text="""
        APOLLO DIAGNOSTICS & PATHOLOGY LABORATORY
        Patient: Kavina M | Date: 10-Jun-2026
        HbA1c: 8.8 % (High)
        Fasting Blood Sugar: 165.0 mg/dL (High)
        Total Cholesterol: 230.0 mg/dL (High)
        Serum Creatinine: 1.10 mg/dL (Normal)
        Systolic BP: 144 mmHg
        """,
        extracted_lab_values=[
            LabValue(
                test_name="HbA1c (Glycated Hemoglobin)",
                category="Glycemic Control",
                loinc_code="4548-4",
                value=8.8,
                unit="%",
                reference_range="4.0 - 5.6 %",
                min_ref=4.0,
                max_ref=5.6,
                status=ValueStatus.HIGH,
                explanation="Historical reading showing earlier baseline glycemic index was higher at 8.8%.",
                risk_level="Elevated"
            ),
            LabValue(
                test_name="Fasting Blood Sugar (FBS)",
                category="Glycemic Control",
                loinc_code="1558-6",
                value=165.0,
                unit="mg/dL",
                reference_range="70.0 - 99.0 mg/dL",
                min_ref=70.0,
                max_ref=99.0,
                status=ValueStatus.HIGH,
                explanation="Fasting blood glucose was significantly elevated at 165 mg/dL.",
                risk_level="Elevated"
            ),
            LabValue(
                test_name="Total Cholesterol",
                category="Lipid Profile",
                loinc_code="2093-3",
                value=230.0,
                unit="mg/dL",
                reference_range="125.0 - 200.0 mg/dL",
                min_ref=125.0,
                max_ref=200.0,
                status=ValueStatus.HIGH,
                explanation="Baseline cholesterol was 230 mg/dL.",
                risk_level="Elevated"
            ),
            LabValue(
                test_name="Systolic Blood Pressure",
                category="Vitals",
                loinc_code="8480-6",
                value=144.0,
                unit="mmHg",
                reference_range="90.0 - 120.0 mmHg",
                min_ref=90.0,
                max_ref=120.0,
                status=ValueStatus.HIGH,
                explanation="Elevated systolic blood pressure at initial consultation.",
                risk_level="Elevated"
            )
        ],
        diagnoses=[
            Diagnosis(
                condition_name="Uncontrolled Type 2 Diabetes",
                icd10_code="E11.65",
                severity="Severe",
                clinical_status="Active",
                explanation="High glycemic markers preceding medication titration."
            )
        ],
        ai_summary=AISummary(
            plain_language_overview="Earlier baseline evaluation from June 2026 showing higher glucose and lipid levels.",
            eli5_summary="This record shows where you started. You have made noticeable progress between June and September!",
            abnormal_findings_explained=["HbA1c was 8.8% in June, which decreased to 8.2% by September."],
            patient_action_items=["Celebrate positive trajectory while keeping up lifestyle changes."],
            dietary_lifestyle_advice=["Continue regular workouts and balanced nutrition."],
            questions_for_doctor=["Can we reach < 7.0% within the next 3 months?"],
            red_flag_warnings=[],
            medical_disclaimer="Historical record comparison."
        )
    ),
    HealthRecord(
        id="rec-004",
        patient_id="PENTABYTE-PATIENT-001",
        title="Inpatient Discharge Summary - Gastroenterology",
        record_type=RecordType.DISCHARGE_SUMMARY,
        record_date="2026-03-22",
        doctor_name="Dr. V. Meenakshi, MD, DM (Gastro)",
        facility_name="Apollo Multispeciality Hospitals",
        department="Department of Gastroenterology",
        raw_ocr_text="""
        APOLLO MULTISPECIALITY HOSPITALS
        DEPARTMENT OF MEDICAL GASTROENTEROLOGY
        DISCHARGE SUMMARY
        Patient: Kavina M | Age: 27 | Sex: Female
        Admission Date: 20-Mar-2026 | Discharge Date: 22-Mar-2026
        
        Final Diagnosis: Acute Gastritis secondary to NSAID use & Viral Pyrexia.
        Course in Hospital: Admitted with epigastric burning pain and low grade fever.
        Treated with IV PPI infusions, antiemetics, and hydration.
        Patient tolerated oral diet and was hemodynamically stable at discharge.
        
        Discharge Medications:
        1. Cap Pantoprazole 40mg - 1-0-0 (Before breakfast on empty stomach) x 14 days
        2. Tab Paracetamol 650mg - SOS (For fever/pain, max 3 times daily)
        """,
        extracted_medications=[
            Medication(
                name="Pantoprazole",
                generic_name="Pantoprazole Sodium 40mg",
                strength="40 mg",
                frequency="1-0-0 (Once daily - Morning)",
                timing="Before breakfast (Empty stomach)",
                route="Oral",
                duration="14 days",
                purpose="Reduces gastric acid to allow stomach lining healing.",
                instructions="Take 30 minutes before morning meal with water.",
                interaction_warnings=["Complete the recommended 14-day course."]
            ),
            Medication(
                name="Paracetamol",
                generic_name="Paracetamol 650mg",
                strength="650 mg",
                frequency="SOS (As needed)",
                timing="After food",
                route="Oral",
                duration="5 days as needed",
                purpose="Fever and mild pain relief.",
                instructions="Take only when fever is above 99°F.",
                interaction_warnings=["Do not take alongside other paracetamol-containing cough syrups."]
            )
        ],
        diagnoses=[
            Diagnosis(
                condition_name="Acute Gastritis",
                icd10_code="K29.0",
                severity="Mild",
                clinical_status="Resolved",
                explanation="Gastric mucosal irritation successfully treated with proton pump inhibitors."
            )
        ],
        ai_summary=AISummary(
            plain_language_overview="Hospital discharge summary documenting recovery from stomach inflammation (gastritis).",
            eli5_summary="Your stomach got upset from medicine and a fever bug, but the doctor helped it heal up completely!",
            abnormal_findings_explained=["Stomach lining inflammation is resolved with no lingering ulcers."],
            patient_action_items=["Avoid spicy, deep-fried food and avoid taking pain relievers on an empty stomach."],
            dietary_lifestyle_advice=["Bland meals, coconut water, curd/buttermilk to soothe digestive system."],
            questions_for_doctor=["Should I stop Pantoprazole after 14 days if symptoms are gone?"],
            red_flag_warnings=["Consult emergency if experiencing black tarry stools or vomiting blood."],
            medical_disclaimer="Discharge instructions are for post-hospitalization recovery."
        )
    )
]
