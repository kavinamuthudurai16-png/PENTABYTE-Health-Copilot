export interface LanguageConfig {
  code: string;
  name: string;
  native: string;
  translations: {
    appTitle: string;
    tagline: string;
    tabUpload: string;
    tabTimeline: string;
    tabVitals: string;
    tabMeds: string;
    tabAbha: string;
    patientProfile: string;
    abhaLinked: string;
    abhaNotLinked: string;
    uploadTitle: string;
    uploadDesc: string;
    dragDropText: string;
    tryDemoBtn: string;
    eli5Toggle: string;
    abnormalValues: string;
    doctorQuestions: string;
    actionItems: string;
    lifestyleAdvice: string;
    exportFhir: string;
    emergencyCall: string;
    askCopilot: string;
    slidePresentation: string;
    architectureDiagram: string;
  };
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    native: 'English',
    translations: {
      appTitle: 'PENTABYTE Health Copilot',
      tagline: 'AI-Powered Personal Health Intelligence & ABDM Interoperability',
      tabUpload: 'Scan & Ingest',
      tabTimeline: 'Health Timeline',
      tabVitals: 'Biomarker Trends',
      tabMeds: 'Medication Regimen',
      tabAbha: 'ABDM / ABHA Card',
      patientProfile: 'Unified Health Profile',
      abhaLinked: 'ABHA Linked',
      abhaNotLinked: 'Link ABHA ID',
      uploadTitle: 'Ingest Medical Record or Prescription',
      uploadDesc: 'Upload scanned lab PDFs, prescriptions, discharge papers or paste clinical notes.',
      dragDropText: 'Drop your clinical documents here, or browse files',
      tryDemoBtn: 'Load Pre-built Sample Records',
      eli5Toggle: "Explain Like I'm 5 (ELI5)",
      abnormalValues: 'Abnormal Findings & Meaning',
      doctorQuestions: 'Questions for Your Next Consultation',
      actionItems: 'Recommended Action Steps',
      lifestyleAdvice: 'Diet & Lifestyle Guidance',
      exportFhir: 'Export ABDM FHIR R4',
      emergencyCall: 'Emergency Medical Hotline: 108 / 112',
      askCopilot: 'Ask Health Copilot',
      slidePresentation: 'Round 1 Pitch Deck',
      architectureDiagram: 'Architecture & Pipeline'
    }
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    translations: {
      appTitle: 'पेन्टाबाइट हेल्थ कोपायलट',
      tagline: 'एआई-संचालित व्यक्तिगत स्वास्थ्य एवं आभा (ABDM) प्लेटफ़ॉर्म',
      tabUpload: 'जांच पर्ची अपलोड',
      tabTimeline: 'स्वास्थ्य टाइमलाइन',
      tabVitals: 'बायोमार्कर्स एवं रुझान',
      tabMeds: 'दवाओं की सूची',
      tabAbha: 'आभा (ABHA) कार्ड',
      patientProfile: 'एकीकृत स्वास्थ्य प्रोफ़ाइल',
      abhaLinked: 'आभा लिंक्ड',
      abhaNotLinked: 'आभा आईडी लिंक करें',
      uploadTitle: 'चिकित्सा पर्ची या रिपोर्ट अपलोड करें',
      uploadDesc: 'लैब रिपोर्ट, डॉक्टर की पर्ची, डिस्चार्ज सारांश या टेक्स्ट अपलोड करें।',
      dragDropText: 'दस्तावेज़ यहाँ खींचें या ब्राउज़ करें',
      tryDemoBtn: 'नमूना रिपोर्ट लोड करें',
      eli5Toggle: 'आसान शब्दों में समझें (ELI5)',
      abnormalValues: 'असामान्य परिणाम एवं उनका अर्थ',
      doctorQuestions: 'डॉक्टर से पूछने योग्य प्रश्न',
      actionItems: 'मरीज़ के लिए आवश्यक कदम',
      lifestyleAdvice: 'आहार एवं जीवनशैली सुझाव',
      exportFhir: 'ABDM FHIR R4 एक्सपोर्ट करें',
      emergencyCall: 'आपातकालीन चिकित्सा हेल्पलाइन: 108',
      askCopilot: 'कोपायलट से पूछें',
      slidePresentation: 'प्रस्तुति स्लाइड्स',
      architectureDiagram: 'आर्किटेक्चर पाइपलाइन'
    }
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    translations: {
      appTitle: 'பெண்டாபைட் ஹெல்த் கோபைலட்',
      tagline: 'செயற்கை நுண்ணறிவு மருத்துவ உதவியாளர் & ABDM தளம்',
      tabUpload: 'மருத்துவ ஆவணம் பதிவேற்றம்',
      tabTimeline: 'சுகாதார காலவரிசை',
      tabVitals: 'உடல்நல அளவீடுகள்',
      tabMeds: 'மருந்துகள் அட்டவணை',
      tabAbha: 'ஆபா (ABHA) அட்டை',
      patientProfile: 'முழுமையான சுயவிவரம்',
      abhaLinked: 'ஆபா இணைக்கப்பட்டது',
      abhaNotLinked: 'ஆபா இணைக்கவும்',
      uploadTitle: 'மருந்து சீட்டு அல்லது ஆய்வக அறிக்கையை பதிவேற்றவும்',
      uploadDesc: 'ஸ்கேன் செய்யப்பட்ட அறிக்கைகள் அல்லது ஆவணங்களை பதிவேற்றவும்.',
      dragDropText: 'கோப்புகளை இங்கே இழுத்துப் போடவும்',
      tryDemoBtn: 'மாதிரி அறிக்கையை ஏற்றுக',
      eli5Toggle: 'எளிய தமிழில் விளக்கம் (ELI5)',
      abnormalValues: 'மாறுபட்ட மருத்துவ முடிவுகள்',
      doctorQuestions: 'மருத்துவரிடம் கேட்க வேண்டியவை',
      actionItems: 'செய்ய வேண்டிய முக்கிய பணிகள்',
      lifestyleAdvice: 'உணவு & வாழ்க்கை முறை ஆலோசனைகள்',
      exportFhir: 'ABDM FHIR ஏற்றுமதி',
      emergencyCall: 'அவசர உதவி எண்: 108',
      askCopilot: 'கேள்வி கேளுங்கள்',
      slidePresentation: 'விளக்கக் காட்சி (Pitch Deck)',
      architectureDiagram: 'கட்டமைப்பு வரைபடம்'
    }
  },
  te: {
    code: 'te',
    name: 'Telugu',
    native: 'తెలుగు',
    translations: {
      appTitle: 'పెంటాబైట్ హెల్త్ కోపైలట్',
      tagline: 'AI ఆధారిత ఆరోగ్య సహాయకుడు & ABDM అనుసంధానం',
      tabUpload: 'రికార్డుల అప్‌లోడ్',
      tabTimeline: 'ఆరోగ్య కాలక్రమం',
      tabVitals: 'ఆరోగ్య కొలమానాలు',
      tabMeds: 'మందుల వివరాలు',
      tabAbha: 'ఆభా (ABHA) కార్డ్',
      patientProfile: 'రోగి ప్రొఫైల్',
      abhaLinked: 'ఆభా లింక్ చేయబడింది',
      abhaNotLinked: 'ఆభా లింక్ చేయండి',
      uploadTitle: 'ప్రిస్క్రిప్షన్ లేదా ల్యాబ్ నివేదికను అప్‌లోడ్ చేయండి',
      uploadDesc: 'ల్యాబ్ రిపోర్టులు, మందుల చీటీలు లేదా డిశ్చార్జ్ సారాంశాన్ని అప్‌లోడ్ చేయండి.',
      dragDropText: 'ఫైళ్లను ఇక్కడ డ్రాప్ చేయండి',
      tryDemoBtn: 'నమూనా రిపోర్టులు లోడ్ చేయండి',
      eli5Toggle: 'సులభమైన వివరణ (ELI5)',
      abnormalValues: 'అసాధారణ ఫలితాల వివరణ',
      doctorQuestions: 'వైద్యుడిని అడగవలసిన ప్రశ్నలు',
      actionItems: 'తీసుకోవాల్సిన జాగ్రత్తలు',
      lifestyleAdvice: 'ఆహార మరియు జీవనశైలి సలహాలు',
      exportFhir: 'ABDM FHIR ఎగుమతి',
      emergencyCall: 'అత్యవసర హెల్ప్‌లైన్: 108',
      askCopilot: 'AI ని అడగండి',
      slidePresentation: 'పిచ్ డెక్ స్లైడ్‌లు',
      architectureDiagram: 'ఆర్కిటెక్చర్ పైప్‌లైన్'
    }
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    native: 'বাংলা',
    translations: {
      appTitle: 'পেন্টাবাইট হেলথ কোপাইলট',
      tagline: 'AI চালিত স্বাস্থ্য সহায়ক ও ABDM সমন্বয়',
      tabUpload: 'নথি আপলোড',
      tabTimeline: 'স্বাস্থ্য টাইমলাইন',
      tabVitals: 'স্বাস্থ্য সূচক',
      tabMeds: 'ওষুধের তালিকা',
      tabAbha: 'আভা (ABHA) কার্ড',
      patientProfile: 'রোগীর প্রোফাইল',
      abhaLinked: 'আভা সংযুক্ত',
      abhaNotLinked: 'আভা লিঙ্ক করুন',
      uploadTitle: 'প্রেসক্রিপশন বা রিপোর্ট আপলোড করুন',
      uploadDesc: 'ল্যাব রিপোর্ট বা চিকিৎসকের প্রেসক্রিপশন আপলোড করুন।',
      dragDropText: 'এখানে ফাইল ড্রপ করুন',
      tryDemoBtn: 'নমুনা রিপোর্ট দেখুন',
      eli5Toggle: 'সহজ ভাষায় ব্যাখ্যা (ELI5)',
      abnormalValues: 'অস্বাভাবিক পরীক্ষার ফলাফল',
      doctorQuestions: 'ডাক্তারকে জিজ্ঞাসা করার প্রশ্ন',
      actionItems: 'প্রয়োজনীয় পদক্ষেপ',
      lifestyleAdvice: 'খাদ্যাভ্যাস পরামর্শ',
      exportFhir: 'ABDM FHIR এক্সপোর্ট',
      emergencyCall: 'জরুরী নম্বর: ১০৮',
      askCopilot: 'সহায়কের সাহায্য নিন',
      slidePresentation: 'প্রেজেন্টেশন স্লাইড',
      architectureDiagram: 'আর্কিটেকচার চিত্র'
    }
  }
};
