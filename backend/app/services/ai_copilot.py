from typing import List, Dict, Any, Optional
from ..models.health_record import (
    AISummary,
    LabValue,
    Medication,
    Diagnosis,
    ValueStatus,
)

class AICopilotService:
    """
    AI Health Copilot Clinical Reasoning & Summary Engine
    Translates intricate diagnostic reports, laboratory indices, and pharmacology
    into plain-language, patient-centric explanations with safety guardrails.
    """

    @staticmethod
    def generate_health_summary(
        title: str,
        record_type: str,
        lab_values: List[LabValue],
        medications: List[Medication],
        diagnoses: List[Diagnosis],
        raw_text: str = ""
    ) -> AISummary:
        abnormal_labs = [lv for lv in lab_values if lv.status in [ValueStatus.HIGH, ValueStatus.LOW, ValueStatus.CRITICAL]]
        critical_labs = [lv for lv in lab_values if lv.status == ValueStatus.CRITICAL]

        # 1. Plain-Language Overview
        overview_parts = []
        if diagnoses:
            diag_str = ", ".join([d.condition_name for d in diagnoses])
            overview_parts.append(f"This record documents findings related to **{diag_str}**.")
        else:
            overview_parts.append(f"This is a {record_type.replace('_', ' ').title()} review.")

        if abnormal_labs:
            abnormal_names = [f"{lv.test_name} ({lv.value} {lv.unit})" for lv in abnormal_labs]
            overview_parts.append(
                f"We noticed that **{len(abnormal_labs)} test parameter(s)** fall outside the standard reference range: {', '.join(abnormal_names)}. "
                "These indicators suggest your body is experiencing metabolic or organ stress that warrants follow-up."
            )
        else:
            overview_parts.append("Good news: All tested indicators appear within expected reference intervals.")

        if medications:
            med_names = [f"{m.name} ({m.strength})" for m in medications]
            overview_parts.append(
                f"Your treatment plan currently contains **{len(medications)} prescribed medication(s)**: {', '.join(med_names)}."
            )

        plain_language_overview = " ".join(overview_parts)

        # 2. ELI5 ("Explain Like I'm 5") Summary
        eli5_parts = []
        if abnormal_labs:
            first_abnormal = abnormal_labs[0]
            eli5_parts.append(
                f"Think of your body like a high-performance car with an electronic dashboard. Your {first_abnormal.test_name} "
                f"warning light is blinking because the reading ({first_abnormal.value} {first_abnormal.unit}) is higher or lower "
                f"than normal speed limit ({first_abnormal.reference_range}). It means you need a gentle tune-up and good fuel!"
            )
        else:
            eli5_parts.append(
                "Everything on your body's dashboard is showing green lights! Keep drinking plenty of water and getting good sleep."
            )

        if medications:
            eli5_parts.append(
                f"Your medicine is like a trusted helper team. Make sure to take them at the exact times shown on the schedule."
            )
        eli5_summary = " ".join(eli5_parts)

        # 3. Abnormal findings explained
        abnormal_findings_explained = []
        for lv in abnormal_labs:
            urgency = "⚠️ URGENT:" if lv.status == ValueStatus.CRITICAL else "•"
            explanation_line = (
                f"{urgency} **{lv.test_name}** is {lv.status.value.lower()} at **{lv.value} {lv.unit}** "
                f"(Standard range: {lv.reference_range}). {lv.explanation} "
                f"When this number stays out of range, it increases the risk of fatigue, cardiovascular strain, or tissue stress."
            )
            abnormal_findings_explained.append(explanation_line)

        # 4. Action items
        action_items = []
        if critical_labs:
            action_items.append("Immediate: Contact your treating doctor or visit your healthcare clinic to review your critical results.")
        if abnormal_labs and not critical_labs:
            action_items.append("Schedule a follow-up appointment within 7 to 14 days to re-evaluate your out-of-range markers.")

        if medications:
            action_items.append("Set daily mobile reminders for your medication schedule to ensure 100% adherence without missed doses.")
            action_items.append("Never abruptly halt or double your dosage without direct consultation with your prescribing physician.")

        action_items.append("Maintain an active log of your daily vitals (blood pressure and fasting blood glucose).")

        # 5. Dietary & Lifestyle advice
        lifestyle_advice = []
        has_glycemic = any("sugar" in lv.test_name.lower() or "hba1c" in lv.test_name.lower() for lv in lab_values)
        has_lipid = any("cholesterol" in lv.test_name.lower() or "triglyceride" in lv.test_name.lower() for lv in lab_values)
        has_renal = any("creatinine" in lv.test_name.lower() for lv in lab_values)

        if has_glycemic:
            lifestyle_advice.append("Prioritize low-glycemic index complex carbohydrates (millets, oats, leafy vegetables); limit sweetened beverages and refined flour.")
            lifestyle_advice.append("Engage in a 20-30 minute brisk walk after major meals to enhance postprandial insulin sensitivity.")

        if has_lipid:
            lifestyle_advice.append("Reduce saturated fats and deep-fried foods; introduce omega-3 rich sources (flaxseeds, walnuts, olive oil).")

        if has_renal:
            lifestyle_advice.append("Stay well hydrated with adequate clean water unless a doctor has advised fluid restrictions; moderate sodium intake under 2g/day.")

        if not lifestyle_advice:
            lifestyle_advice.append("Maintain 7-8 hours of quality sleep nightly, drink 2-3 liters of water, and get 150 minutes of moderate physical activity weekly.")

        # 6. Questions to ask doctor
        questions = [
            "Are my current medication dosages still appropriate given these recent test results?",
            "What specific target ranges should we aim for at my next follow-up evaluation?",
            "Do any of my medications or supplements have known interactions with each other?"
        ]
        if abnormal_labs:
            questions.append(f"When should I repeat the test for {abnormal_labs[0].test_name} to assess improvement?")

        # 7. Red flag warnings
        red_flags = []
        if critical_labs:
            red_flags.append("🚨 CRITICAL LAB VALUES DETECTED: Prompt medical review is strongly indicated.")
        red_flags.append("Seek emergency care immediately if experiencing sudden chest pain, shortness of breath, sudden severe dizziness, or loss of consciousness.")

        return AISummary(
            plain_language_overview=plain_language_overview,
            eli5_summary=eli5_summary,
            abnormal_findings_explained=abnormal_findings_explained,
            patient_action_items=action_items,
            dietary_lifestyle_advice=lifestyle_advice,
            questions_for_doctor=questions,
            red_flag_warnings=red_flags,
            medical_disclaimer=(
                "LEGAL & MEDICAL DISCLAIMER: PENTABYTE Health Copilot provides assistive data "
                "synthesis and health literacy summaries. This output is NOT a medical diagnosis, "
                "formal prescription, or emergency triage service. Please consult a licensed medical "
                "practitioner before making clinical, dietary, or medication changes."
            )
        )

    @staticmethod
    def answer_patient_query(query: str, records: List[Any], language: str = "en") -> str:
        q_lower = query.lower()
        
        # Medical conversational QA reasoning
        if "hba1c" in q_lower or "sugar" in q_lower or "diabetes" in q_lower:
            return (
                "**Regarding your Blood Sugar & HbA1c:**\n\n"
                "• **What HbA1c measures:** Unlike a daily finger-prick glucose test which only reflects one single moment, "
                "HbA1c measures the percentage of your hemoglobin coated with sugar over the last 90-120 days.\n"
                "• **Normal Range:** Below 5.7% is considered normal. 5.7% to 6.4% indicates Prediabetes. 6.5% and above points to Diabetes.\n"
                "• **Actionable Step:** If your reading is elevated, consistent medication adherence (e.g. Metformin if prescribed), "
                "fiber-rich meals, and post-meal walks can steadily bring this value down. Discuss with your endocrinologist."
            )
        elif "medicine" in q_lower or "medication" in q_lower or "pills" in q_lower or "metformin" in q_lower:
            return (
                "**Regarding your Prescriptions & Medication Adherence:**\n\n"
                "• Always follow the timing prescribed (e.g., Metformin is best taken with meals to minimize stomach discomfort; "
                "Pantoprazole or Thyroxine must be taken on an empty stomach in the morning).\n"
                "• Do not skip doses even if you are feeling completely healthy, as chronic conditions like hypertension and diabetes "
                "require steady maintenance levels in the bloodstream.\n"
                "• Check with your doctor or pharmacist before combining any over-the-counter pain relievers or supplements."
            )
        elif "cholesterol" in q_lower or "lipid" in q_lower:
            return (
                "**Regarding your Lipid Profile & Cholesterol:**\n\n"
                "• Total cholesterol under 200 mg/dL is generally desirable, and Triglycerides under 150 mg/dL.\n"
                "• High levels lead to gradual plaque deposition inside artery walls. "
                "• Regular aerobic exercise (brisk walking, cycling) and replacing trans-fats with heart-healthy fats (olive oil, nuts) "
                "significantly support cardiovascular protection."
            )
        elif "creatinine" in q_lower or "kidney" in q_lower:
            return (
                "**Regarding your Kidney Health & Creatinine:**\n\n"
                "• Serum creatinine is a natural metabolic waste product created by muscle activity and filtered out by healthy kidneys.\n"
                "• Standard range is approximately 0.6 to 1.2 mg/dL. An increase can indicate reduced glomerular filtration or dehydration.\n"
                "• Adequate water intake and strict blood pressure control are vital for preserving kidney health."
            )
        else:
            return (
                f"**Clinical Copilot Analysis for '{query}':**\n\n"
                "Based on your unified health timeline, our AI copilot continuously tracks your diagnostic trends, medications, and clinical notes. "
                "Maintaining an up-to-date health record allows your healthcare providers to make timely and well-informed decisions.\n\n"
                "Would you like me to explain a specific lab parameter, medication timing, or generate an ABDM FHIR report summary for your doctor?"
            )
