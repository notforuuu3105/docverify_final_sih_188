import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Top Bar & Branding
  govt_of_india: {
    en: 'Team Inferno',
    hi: 'टीम इन्फर्नो',
  },
  portal_title: {
    en: 'Inferno Document Verification Portal',
    hi: 'इन्फर्नो दस्तावेज़ सत्यापन पोर्टल',
  },
  portal_subtitle: {
    en: 'AI Document Forgery Detection & Forensic Substrate Verification',
    hi: 'एआई दस्तावेज़ जालसाजी पहचान एवं फोरेंसिक सब्सट्रेट सत्यापन प्रणाली',
  },
  official_use_only: {
    en: 'INFERNO VERIFIED',
    hi: 'इन्फर्नो प्रमाणित',
  },
  screen_reader: {
    en: 'Screen Reader Access',
    hi: 'स्क्रीन रीडर सहायता',
  },
  security_notice: {
    en: 'Team Inferno Security Core: AI-powered forensic verification of citizen identity documents, academic certificates, and tamper detection.',
    hi: 'टीम इन्फर्नो सुरक्षा कोर: नागरिक पहचान पत्रों, प्रमाणपत्रों एवं डिजिटल जालसाजी की उन्नत एआई फोरेंसिक जांच।',
  },

  // Navigation Items
  nav_verify: {
    en: 'Verify Document',
    hi: 'दस्तावेज़ सत्यापन',
  },
  nav_physical_measures: {
    en: 'Physical Measures',
    hi: 'भौतिक माप एवं मोटाई',
  },
  nav_reports: {
    en: 'Court Reports & BSA',
    hi: 'अदालती रिपोर्ट एवं साक्ष्य',
  },
  nav_history: {
    en: 'Case Audit Trail',
    hi: 'केस ऑडिट इतिहास',
  },
  nav_settings: {
    en: 'Settings & Rules',
    hi: 'नियम एवं सेटिंग्स',
  },
  nav_logout: {
    en: 'Sign Out',
    hi: 'लॉग आउट',
  },
  officer_session: {
    en: 'Verification Officer',
    hi: 'सत्यापन अधिकारी',
  },

  // Document Categories
  cat_identity: {
    en: 'Citizen Identity Cards',
    hi: 'नागरिक पहचान पत्र',
  },
  cat_academic: {
    en: 'Academic Certificates',
    hi: 'शैक्षणिक प्रमाण पत्र',
  },
  cat_legal: {
    en: 'Legal & Property Records',
    hi: 'कानूनी एवं संपत्ति दस्तावेज़',
  },
  cat_financial: {
    en: 'Financial & Business Documents',
    hi: 'वित्तीय एवं व्यावसायिक दस्तावेज़',
  },

  // Document Subtypes (Clean, without thickness in labels)
  doc_aadhaar: {
    en: 'Aadhaar Card (UIDAI)',
    hi: 'आधार कार्ड (UIDAI)',
  },
  doc_pan: {
    en: 'PAN Card (Income Tax Dept)',
    hi: 'पैन कार्ड (आयकर विभाग)',
  },
  doc_voter: {
    en: 'Voter ID Card (EPIC)',
    hi: 'मतदाता पहचान पत्र (EPIC)',
  },
  doc_passport: {
    en: 'Indian Passport (Travel Document)',
    hi: 'भारतीय पासपोर्ट (यात्रा दस्तावेज़)',
  },
  doc_driving_license: {
    en: 'Driving License (Transport Dept)',
    hi: 'ड्राइविंग लाइसेंस (परिवहन विभाग)',
  },
  doc_degree: {
    en: 'University Degree Certificate',
    hi: 'विश्वविद्यालय डिग्री प्रमाण पत्र',
  },
  doc_marksheet: {
    en: 'School / Board Marksheet',
    hi: 'बोर्ड / स्कूल अंकतालिका',
  },
  doc_stamp_paper: {
    en: 'Non-Judicial Stamp Paper',
    hi: 'गैर-न्यायिक स्टाम्प पेपर',
  },
  doc_sale_deed: {
    en: 'Property Sale Deed / Registry',
    hi: 'संपत्ति बिक्री विलेख / रजिस्ट्री',
  },
  doc_invoice: {
    en: 'Commercial GST Tax Invoice',
    hi: 'व्यावसायिक जीएसटी टैक्स इनवॉइस',
  },

  // Upload Formats
  fmt_pdf: {
    en: 'PDF Document (.pdf)',
    hi: 'पीडीएफ दस्तावेज़ (.pdf)',
  },
  fmt_scanner: {
    en: 'Flatbed Scanner Image (.png, .tiff)',
    hi: 'स्कैनर छवि (.png, .tiff)',
  },
  fmt_camera: {
    en: 'Mobile Camera Photo (.jpg)',
    hi: 'मोबाइल कैमरा फोटो (.jpg)',
  },

  // Common UI Buttons & Labels
  select_category: {
    en: 'Select Document Category',
    hi: 'दस्तावेज़ श्रेणी चुनें',
  },
  select_type: {
    en: 'Select Specific Document',
    hi: 'विशिष्ट दस्तावेज़ चुनें',
  },
  select_format: {
    en: 'Select File Upload Format',
    hi: 'अपलोड प्रारूप चुनें',
  },
  choose_file: {
    en: 'Choose Document File',
    hi: 'दस्तावेज़ फ़ाइल चुनें',
  },
  drag_drop_text: {
    en: 'Drag & drop file here or click to browse from device',
    hi: 'फ़ाइल यहाँ खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें',
  },
  supported_files: {
    en: 'Supported formats: PDF, JPEG, PNG (Max 15 MB)',
    hi: 'समर्थित प्रारूप: PDF, JPEG, PNG (अधिकतम 15 MB)',
  },
  start_verification_btn: {
    en: 'Start Document Verification',
    hi: 'दस्तावेज़ की जांच शुरू करें',
  },
  check_another_btn: {
    en: 'Check Another Document',
    hi: 'दूसरे दस्तावेज़ की जांच करें',
  },
  quick_samples: {
    en: 'Quick Demo Samples',
    hi: 'त्वरित डेमो नमूने',
  },
  sample_aadhaar_auth: {
    en: 'Authentic Aadhaar Card',
    hi: 'असली आधार कार्ड',
  },
  sample_aadhaar_tamp: {
    en: 'Tampered Aadhaar (Altered DOB)',
    hi: 'नकली आधार (बदली हुई जन्मतिथि)',
  },
  sample_passport_auth: {
    en: 'Authentic Passport',
    hi: 'असली पासपोर्ट',
  },
  sample_passport_tamp: {
    en: 'Tampered Passport (Cloned Photo)',
    hi: 'छेड़छाड़ किया गया पासपोर्ट',
  },

  // Mode Switcher
  mode_single: {
    en: '1. Single Document Verification',
    hi: '1. एकल दस्तावेज़ सत्यापन',
  },
  mode_batch: {
    en: '2. Batch Screening Pipeline',
    hi: '2. बैच स्क्रीनिंग पाइपलाइन',
  },

  // Verdicts
  verdict_authentic: {
    en: 'Document Verified as Authentic',
    hi: 'दस्तावेज़ प्रामाणिक एवं असली पाया गया',
  },
  verdict_tampered: {
    en: 'Tampering & Edits Detected',
    hi: 'छेड़छाड़ और फर्जी बदलाव पाए गए',
  },
  verdict_suspicious: {
    en: 'Suspicious Document — Officer Review Needed',
    hi: 'संदिग्ध दस्तावेज़ — अधिकारी समीक्षा आवश्यक',
  },
  verdict_genuine_short: {
    en: 'GENUINE',
    hi: 'प्रामाणिक',
  },
  verdict_tampered_short: {
    en: 'TAMPERED',
    hi: 'छेड़छाड़',
  },
  verdict_suspicious_short: {
    en: 'SUSPICIOUS',
    hi: 'संदिग्ध',
  },

  // Statuses & Metrics
  authenticity_score: {
    en: 'Authenticity Score',
    hi: 'विश्वसनीयता स्कोर',
  },
  tamper_risk: {
    en: 'Tamper Risk',
    hi: 'छेड़छाड़ का जोखिम',
  },
  qr_code_status: {
    en: 'Digital QR Verification',
    hi: 'डिजिटल क्यूआर कोड जांच',
  },
  masked_status: {
    en: 'Aadhaar Masking Check',
    hi: 'आधार मास्किंग जांच',
  },
  photo_check: {
    en: 'Photo Integrity Check',
    hi: 'फोटो प्रामाणिकता जांच',
  },
  officer_decision: {
    en: 'Officer Decision & Statutory Confirmation',
    hi: 'अधिकारी का निर्णय एवं अंतिम सत्यापन',
  },
  accept_doc: {
    en: 'Accept as Authentic',
    hi: 'दस्तावेज़ स्वीकार करें (असली)',
  },
  reject_doc: {
    en: 'Reject as Fake / Tampered',
    hi: 'दस्तावेज़ अस्वीकार करें (फर्जी)',
  },
  refer_lab: {
    en: 'Send to Physical Lab for Inspection',
    hi: 'भौतिक लैब जांच के लिए भेजें',
  },
  court_certificate_btn: {
    en: 'Section 63 BSA Legal Certificate',
    hi: 'धारा 63 कानूनी साक्ष्य प्रमाण पत्र',
  },

  // Viewer Controls
  view_normal: {
    en: 'Normal Document View',
    hi: 'मूल दस्तावेज़ दृश्य',
  },
  view_heatmap: {
    en: 'AI Tamper Heatmap (ELA)',
    hi: 'एआई छेड़छाड़ हीटमैप (ELA)',
  },
  ela_active_desc: {
    en: 'Error Level Analysis Active: Luminous variance indicates secondary JPEG recompression boundaries (spliced text / altered details).',
    hi: 'त्रुटि स्तर विश्लेषण सक्रिय: चमक में अंतर डिजिटल संपीड़न विसंगति (संपादित टेक्स्ट / बदले गए विवरण) को दर्शाता है।',
  },
  zoom_in: {
    en: 'Zoom In',
    hi: 'बड़ा करें',
  },
  zoom_out: {
    en: 'Zoom Out',
    hi: 'छोटा करें',
  },
  rotate: {
    en: 'Rotate 90°',
    hi: '90° घुमाएं',
  },
  reset_view: {
    en: 'Reset View',
    hi: 'रीसेट करें',
  },

  // Physical Measures
  physical_measures_heading: {
    en: 'Physical Document Measures & Substrate Specifications',
    hi: 'दस्तावेज़ भौतिक माप एवं सब्सट्रेट विनिर्देश',
  },
  physical_measures_subheading: {
    en: 'Laboratory substrate thickness, paper weight (GSM), and security features verification.',
    hi: 'कागज़ की मोटाई, जीएसएम घनत्व एवं भौतिक सुरक्षा लक्षणों का प्रयोगशाला सत्यापन।',
  },
  substrate_material: {
    en: 'Substrate Material',
    hi: 'सब्सट्रेट सामग्री',
  },
  standard_thickness: {
    en: 'Standard Thickness',
    hi: 'मानक मोटाई',
  },
  standard_dimensions: {
    en: 'Standard Dimensions',
    hi: 'मानक आकार',
  },
  security_features: {
    en: 'Physical Security Features',
    hi: 'भौतिक सुरक्षा लक्षण',
  },
  caliper_thickness_gauge: {
    en: 'Digital Caliper Thickness Gauge',
    hi: 'डिजिटल कैलिपर मोटाई गेज',
  },
  paper_density_gsm: {
    en: 'Paper Density / Weight (GSM)',
    hi: 'कागज़ घनत्व / वज़न (जीएसएम)',
  },
  uv_dullness_test: {
    en: 'UV 365nm Optical Dullness',
    hi: 'यूवी 365nm प्रकाशीय शुद्धता जांच',
  },
  test_substrate_btn: {
    en: 'Run Substrate Integrity Test',
    hi: 'सब्सट्रेट अखंडता जांच चलाएं',
  },
  physical_verdict_conformant: {
    en: 'Physical Substrate Conformant',
    hi: 'भौतिक आधार प्रामाणिक एवं मान्य',
  },
  physical_verdict_fake: {
    en: 'Substandard / Fake Paper Substrate',
    hi: 'अमान्य / जाली कागज़ आधार',
  },

  // Section 63 BSA Court Certificate
  bsa_certificate_heading: {
    en: 'Certificate of Electronic Evidence Admissibility',
    hi: 'इलेक्ट्रॉनिक साक्ष्य स्वीकार्यता प्रमाण पत्र',
  },
  bsa_statutory_reference: {
    en: 'Under Section 63 of the Bharatiya Sakshya Adhiniyam (BSA), 2023',
    hi: 'भारतीय साक्ष्य अधिनियम (BSA), 2023 की धारा 63 के अंतर्गत',
  },
  why_bsa_title: {
    en: 'Why is this Section 63 Certificate Required in Court & Police Proceedings?',
    hi: 'अदालत और पुलिस कार्यवाही में यह धारा 63 प्रमाण पत्र क्यों अनिवार्य है?',
  },
  why_bsa_p1: {
    en: 'Under Indian Law, digital evidence (scanned documents, OCR text, AI tamper reports) cannot be accepted in court without a signed Section 63 Certificate.',
    hi: 'भारतीय कानून के तहत, डिजिटल साक्ष्य (स्कैन किए गए दस्तावेज़, ओसीआर टेक्स्ट, एआई रिपोर्ट) बिना हस्ताक्षरित धारा 63 प्रमाण पत्र के अदालत में स्वीकार नहीं किए जा सकते।',
  },
  why_bsa_p2: {
    en: 'Mandatory for Police FIRs: Police stations require this certified cryptographic dossier to lodge cases of fraud under BNS Section 336 (Forgery) and Section 318 (Cheating).',
    hi: 'पुलिस प्राथमिकी (FIR) हेतु आवश्यक: जालसाजी और धोखाधड़ी के मामलों में एफआईआर दर्ज करने के लिए पुलिस को यह क्रिप्टोग्राफिक प्रमाणित साक्ष्य आवश्यक होता है।',
  },
  why_bsa_p3: {
    en: 'Judicial Admissibility: Certifies lawful custody, machine operational integrity, and SHA-256 hash preservation, preventing evidence tampering claims in court trials.',
    hi: 'न्यायिक स्वीकार्यता: यह कंप्यूटर प्रणाली की अखंडता और SHA-256 हैश की पुष्टि करता है, जिससे अदालत में साक्ष्य से छेड़छाड़ का कोई संशय नहीं रहता।',
  },
  export_bsa_pdf: {
    en: 'Export Sec 63 BSA Certificate (PDF)',
    hi: 'धारा 63 प्रमाण पत्र डाउनलोड करें (PDF)',
  },
  export_full_dossier: {
    en: 'Export Full Forensic Dossier (PDF)',
    hi: 'पूर्ण फोरेंसिक रिपोर्ट डाउनलोड करें (PDF)',
  },
  print_sheet: {
    en: 'Print Sheet',
    hi: 'प्रिंट करें',
  },

  // Checks Breakdown
  checks_heading: {
    en: 'Multi-Stage Forensic Inspection Breakdown',
    hi: 'बहु-स्तरीय फोरेंसिक निरीक्षण विवरण',
  },
  checks_passed: {
    en: 'Passed',
    hi: 'सफल',
  },
  checks_failed: {
    en: 'Failed',
    hi: 'विफल',
  },
  checks_warning: {
    en: 'Warning',
    hi: 'चेतावनी',
  },

  // Live Camera Verification & Biometric Match
  live_camera_step_title: {
    en: 'Live Camera Verification',
    hi: 'लाइव कैमरा सत्यापन',
  },
  live_camera_step_subtitle: {
    en: 'Capture a live photo using your device camera for 1:1 facial biometric matching against the document.',
    hi: 'दस्तावेज़ में मौजूद फोटो से 1:1 चेहरे के बायोमेट्रिक मिलान हेतु अपने डिवाइस कैमरे से लाइव फोटो लें।',
  },
  capture_live_photo_btn: {
    en: 'Capture Live Photo',
    hi: 'लाइव फोटो खींचें',
  },
  take_snapshot_btn: {
    en: 'Take Snapshot',
    hi: 'फोटो लें',
  },
  retake_photo_btn: {
    en: 'Retake Photo',
    hi: 'दोबारा फोटो लें',
  },
  continue_btn: {
    en: 'Continue',
    hi: 'आगे बढ़ें',
  },
  camera_active_hint: {
    en: 'Align your face clearly inside the frame and look directly at the lens.',
    hi: 'कृपया अपने चेहरे को फ्रेम के मध्य में सीधा रखें और कैमरे की ओर देखें।',
  },
  camera_permission_denied: {
    en: 'Camera access was blocked or denied. Please grant camera permissions in your browser settings to proceed.',
    hi: 'कैमरे की अनुमति अस्वीकृत की गई। आगे बढ़ने के लिए कृपया अपने ब्राउज़र में कैमरा अनुमति सक्षम करें।',
  },
  camera_unavailable: {
    en: 'No camera hardware detected on this device. A functional live camera is mandatory.',
    hi: 'इस डिवाइस पर कोई कैमरा नहीं मिला। लाइव सत्यापन हेतु कार्यात्मक कैमरा अनिवार्य है।',
  },
  retry_camera_btn: {
    en: 'Retry Camera Access',
    hi: 'कैमरा पुनः प्रारंभ करें',
  },
  cancel_camera_btn: {
    en: 'Cancel',
    hi: 'रद्द करें',
  },
  photo_match_success: {
    en: 'Photo match successful',
    hi: 'फोटो मिलान सफल',
  },
  photo_match_review: {
    en: 'Photo match requires review',
    hi: 'फोटो मिलान समीक्षा आवश्यक',
  },
  photo_match_unsuccessful: {
    en: 'Photo match unsuccessful',
    hi: 'फोटो मिलान असफल',
  },
  manual_review_notice: {
    en: 'Automated biometric comparison: Uncertain or non-matching cases are automatically routed to an authorized examiner for secondary manual review.',
    hi: 'स्वचालित बायोमेट्रिक तुलना: संदेहास्पद या असफल मामलों को द्वितीयक मैन्युअल समीक्षा हेतु अधिकृत अधिकारी को भेजा जाता है।',
  },
  live_photo_mandatory_badge: {
    en: 'MANDATORY LIVE BIOMETRIC STEP',
    hi: 'अनिवार्य लाइव बायोमेट्रिक चरण',
  },
  live_photo_verified: {
    en: 'Live Photo Captured & Confirmed',
    hi: 'लाइव फोटो सुरक्षित रूप से दर्ज की गई',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'docverify_preferred_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'hi' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][language] || TRANSLATIONS[key].en;
    }
    return key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
