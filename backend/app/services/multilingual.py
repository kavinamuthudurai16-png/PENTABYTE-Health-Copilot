from typing import Dict, Any, List
from ..models.health_record import AISummary

# Regional Medical Terms & Phrasing
REGIONAL_TRANSLATIONS = {
    "hi": {
        "language_name": "हिन्दी (Hindi)",
        "summary_title": "स्वास्थ्य सारांश (सरल भाषा में)",
        "eli5_label": "आसान शब्दों में समझें (जैसे बच्चे को समझाया जाए)",
        "abnormal_title": "असामान्य परीक्षण मान एवं उनका अर्थ",
        "action_title": "मरीज़ के लिए आवश्यक कदम",
        "lifestyle_title": "आहार एवं जीवनशैली सुझाव",
        "doctor_questions_title": "डॉक्टर से पूछने योग्य महत्वपूर्ण प्रश्न",
        "red_flag_title": "आपातकालीन चेतावनी संकेत",
        "disclaimer": "चेतावनी: यह विश्लेषण केवल जानकारी और जागरूकता के लिए है। यह कोई डॉक्टरी नुस्खा या निदान नहीं है। किसी भी चिकित्सीय निर्णय के लिए कृपया योग्य डॉक्टर से संपर्क करें।",
        "overview_template": "यह रिकॉर्ड आपकी हालिया स्वास्थ्य जांच और परीक्षणों का सारांश प्रदान करता है।",
        "warning_critical": "⚠️ तत्काल सूचना: आपके कुछ परीक्षण मान सुरक्षित सीमा से बाहर हैं। कृपया शीघ्र ही अपने चिकित्सक से परामर्श लें।",
        "medication_advice": "दवाएं डॉक्टर के बताए अनुसार ही नियमित समय पर लें। भोजन के बाद या पहले के निर्देशों का ध्यान रखें।",
        "diet_advice": "चीनी और तले हुए भोजन का सेवन सीमित करें। दिन में 2-3 लीटर पानी पिएं और रोजाना 20-30 मिनट टहलें।"
    },
    "ta": {
        "language_name": "தமிழ் (Tamil)",
        "summary_title": "சுகாதார சுருக்கம் (எளிய தமிழில்)",
        "eli5_label": "எளிய விளக்கம்",
        "abnormal_title": "இயல்பு நிலைக்கு மாறான பரிசோதனை முடிவுகள்",
        "action_title": "நோயாளி மேற்கொள்ள வேண்டிய நடவடிக்கைகள்",
        "lifestyle_title": "உணவு மற்றும் வாழ்க்கை முறை ஆலோசனைகள்",
        "doctor_questions_title": "மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்",
        "red_flag_title": "அவசர எச்சரிக்கை அறிகுறிகள்",
        "disclaimer": "முக்கிய அறிவிப்பு: இந்த AI பகுப்பாய்வு உங்கள் புரிதலுக்காக மட்டுமே. இது மருத்துவ சிகிச்சை அல்லது அதிகாரப்பூர்வ நோயறிதல் அல்ல. மருத்துவரின் ஆலோசனையைப் பெறவும்.",
        "overview_template": "இந்த மருத்துவ அறிக்கை உங்களின் சமீபத்திய பரிசோதனை முடிவுகளின் சுருக்கத்தை வழங்குகிறது.",
        "warning_critical": "⚠️ உடனடி கவனம்: உங்களின் சில இரத்தப் பரிசோதனை அளவுகள் மாறுபட்டுள்ளன. மருத்துவரை அணுகவும்.",
        "medication_advice": "மருந்துகளை மருத்துவர் குறிப்பிட்ட நேரத்தில் தவறாமல் உட்கொள்ளுங்கள்.",
        "diet_advice": "சர்க்கரை மற்றும் எண்ணெய் பலகாரங்களை குறைத்து, காய்கறிகள் மற்றும் கீரைகளை உணவில் சேர்த்துக் கொள்ளவும்."
    },
    "te": {
        "language_name": "తెలుగు (Telugu)",
        "summary_title": "ఆరోగ్య సారాంశం (సులభమైన భాషలో)",
        "eli5_label": "సులభమైన వివరణ",
        "abnormal_title": "అసాధారణ పరీక్ష ఫలితాలు & వివరణ",
        "action_title": "తీసుకోవాల్సిన జాగ్రత్తలు",
        "lifestyle_title": "ఆహార మరియు జీవనశైలి సలహాలు",
        "doctor_questions_title": "వైద్యుడిని అడగవలసిన ముఖ్యమైన ప్రశ్నలు",
        "red_flag_title": "అత్యవసర హెచ్చరికలు",
        "disclaimer": "ముఖ్య గమనిక: ఈ AI విశ్లేషణ కేవలం అవగాహన కొరకు మాత్రమే. ఇది వైద్య నిర్ధారణ లేదా చికిత్స కాదు. ఎల్లప్పుడూ వైద్యుడిని సంప్రదించండి.",
        "overview_template": "ఈ వైద్య రికార్డు మీ ప్రస్తుత ఆరోగ్య పరీక్షల వివరాలను సులభంగా వివరిస్తుంది.",
        "warning_critical": "⚠️ తక్షణ శ్రద్ధ: మీ పరీక్షల విలువల్లో కొన్ని సాధారణ స్థాయి కంటే వేరుగా ఉన్నాయి. వెంటనే వైద్యుడిని సంప్రదించండి.",
        "medication_advice": "మందులను డాక్టర్ చెప్పిన సమయానికే తప్పకుండా వేసుకోండి.",
        "diet_advice": "ఉప్పు, చక్కెర తగ్గించి, పీచు పదార్థాలు మరియు తాజా కూరగాయలు ఎక్కువగా తీసుకోండి."
    },
    "bn": {
        "language_name": "বাংলা (Bengali)",
        "summary_title": "স্বাস্থ্য সারাংশ (সহজ ভাষায়)",
        "eli5_label": "সহজ ব্যাখ্যা",
        "abnormal_title": "অস্বাভাবিক পরীক্ষার ফলাফল ও ব্যাখ্যা",
        "action_title": "রোগীর জন্য প্রয়োজনীয় পদক্ষেপ",
        "lifestyle_title": "খাদ্যাভ্যাস ও জীবনযাত্রার পরামর্শ",
        "doctor_questions_title": "ডাক্তারকে জিজ্ঞাসা করার প্রশ্ন",
        "red_flag_title": "জরুরী সতর্কতা",
        "disclaimer": "সতর্কবার্তা: এই AI বিশ্লেষণ শুধুমাত্র তথ্যের জন্য। এটি কোনো চিকিৎসকের পরামর্শ বা ব্যবস্থাপত্র নয়। যেকোনো সিদ্ধান্তের জন্য চিকিৎসকের সাথে যোগাযোগ করুন।",
        "overview_template": "এই স্বাস্থ্য প্রতিবেদনটি আপনার সাম্প্রতিক পরীক্ষার একটি সার্বিক সারাংশ প্রদান করে।",
        "warning_critical": "⚠️ জরুরী সতর্কতা: কিছু পরীক্ষার মান সাধারণ সীমার বাইরে। দ্রুত ডাক্তারের সাথে পরামর্শ করুন।",
        "medication_advice": "ডাক্তারের নির্দেশ অনুযায়ী সঠিক সময়ে নিয়মিত ওষুধ সেবন করুন।",
        "diet_advice": "চিনি এবং অতিরিক্ত তৈলাক্ত খাবার এড়িয়ে চলুন। পর্যাপ্ত জল পান করুন।"
    }
}

class MultilingualService:
    """
    Multilingual Healthcare Localization Service
    Translates clinical AI summaries and patient guidance into regional Indian languages.
    """

    @staticmethod
    def get_supported_languages() -> List[Dict[str, str]]:
        return [
            {"code": "en", "name": "English", "native": "English"},
            {"code": "hi", "name": "Hindi", "native": "हिन्दी"},
            {"code": "ta", "name": "Tamil", "native": "தமிழ்"},
            {"code": "te", "name": "Telugu", "native": "తెలుగు"},
            {"code": "bn", "name": "Bengali", "native": "বাংলা"},
        ]

    @staticmethod
    def localize_summary(summary: AISummary, lang_code: str) -> AISummary:
        if lang_code == "en" or lang_code not in REGIONAL_TRANSLATIONS:
            return summary

        trans = REGIONAL_TRANSLATIONS[lang_code]

        # Localized overview
        has_abnormal = len(summary.abnormal_findings_explained) > 0
        localized_overview = f"{trans['overview_template']} " + (
            trans['warning_critical'] if has_abnormal else "सभी परीक्षण सामान्य सीमा में प्रतीत होते हैं।"
        )

        localized_eli5 = (
            f"💡 {trans['eli5_label']}: "
            f"यह रिपोर्ट आपके स्वास्थ्य की स्थिति दर्शाती है। यदि कोई मान सामान्य से भिन्न है, "
            f"तो डॉक्टर की देखरेख में उचित आहार और जीवनशैली से इसे नियंत्रित किया जा सकता है।"
        )

        # Localized abnormal findings
        localized_abnormals = []
        for ab in summary.abnormal_findings_explained:
            localized_abnormals.append(f"{ab}")

        # Localized actions
        localized_actions = [
            trans['medication_advice'],
            "7 से 14 दिनों के भीतर अपने प्राथमिक चिकित्सक से परामर्श करें।" if lang_code == "hi" else trans['action_title'],
            "दैनिक रक्तचाप और रक्त शर्करा की रीडिंग डायरी में दर्ज करें।" if lang_code == "hi" else "Monitor daily vitals regularly."
        ]

        # Localized diet & lifestyle
        localized_diet = [
            trans['diet_advice'],
            "प्रतिदिन 7-8 घंटे की गहरी नींद लें और तनाव मुक्त रहने का अभ्यास करें।" if lang_code == "hi" else "Ensure adequate rest and hydration."
        ]

        # Localized doctor questions
        localized_questions = [
            "क्या मेरी वर्तमान दवाओं की खुराक इन जांच परिणामों के अनुसार सही है?" if lang_code == "hi" else summary.questions_for_doctor[0],
            "अगली जांच के लिए मुझे किन सामान्य स्तरों को प्राप्त करना चाहिए?" if lang_code == "hi" else summary.questions_for_doctor[1]
        ]

        return AISummary(
            plain_language_overview=localized_overview,
            eli5_summary=localized_eli5,
            abnormal_findings_explained=localized_abnormals if localized_abnormals else summary.abnormal_findings_explained,
            patient_action_items=localized_actions,
            dietary_lifestyle_advice=localized_diet,
            questions_for_doctor=localized_questions,
            red_flag_warnings=[trans['warning_critical']] if has_abnormal else summary.red_flag_warnings,
            medical_disclaimer=trans['disclaimer']
        )
