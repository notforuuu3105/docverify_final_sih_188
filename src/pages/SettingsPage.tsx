import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Settings,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Save,
  Info,
} from 'lucide-react';

type RigorProfile = 'standard' | 'enhanced' | 'identity';

const SETTINGS_STORAGE_KEY = 'docverify_calibration_settings';

export const SettingsPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  // Policy & AI Analysis Sensitivity Calibration
  const [sensitivityProfile, setSensitivityProfile] = useState<RigorProfile>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.profile || 'enhanced';
      }
    } catch {
      // fallback
    }
    return 'enhanced';
  });

  const [elaSensitivity, setElaSensitivity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.elaSensitivity === 'number') return parsed.elaSensitivity;
      }
    } catch {
      // fallback
    }
    return 90;
  });

  const [typographySensitivity, setTypographySensitivity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.typographySensitivity === 'number') return parsed.typographySensitivity;
      }
    } catch {
      // fallback
    }
    return 88;
  });

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const applyProfile = (profile: 'standard' | 'enhanced' | 'identity') => {
    setSensitivityProfile(profile);
    if (profile === 'standard') {
      setElaSensitivity(80);
      setTypographySensitivity(75);
    } else if (profile === 'enhanced') {
      setElaSensitivity(90);
      setTypographySensitivity(88);
    } else if (profile === 'identity') {
      setElaSensitivity(95);
      setTypographySensitivity(94);
    }
  };

  const handleSavePolicy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          profile: sensitivityProfile,
          elaSensitivity,
          typographySensitivity,
        })
      );
    } catch (err) {
      console.warn('Failed to save calibration to localStorage', err);
    }

    setSaveMessage(
      isHi
        ? 'एआई कैलिब्रेशन सेटिंग्स सफलतापूर्वक सहेजी गईं।'
        : 'Calibration settings saved successfully.'
    );
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleResetCalibration = () => {
    setSensitivityProfile('enhanced');
    setElaSensitivity(90);
    setTypographySensitivity(88);
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // ignore
    }
    setSaveMessage(
      isHi
        ? 'मानक कैलिब्रेशन सेटिंग्स सफलतापूर्वक पुनर्स्थापित की गईं।'
        : 'Baseline calibration settings restored successfully.'
    );
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl text-gov-ink">
      {/* Page Header */}
      <div className="pb-2 border-b border-gov-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gov-saffron"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gov-navy-800 font-mono">
              {isHi ? 'एआई निरीक्षण नीतियां एवं कैलिब्रेशन' : 'AI INSPECTION POLICIES & CALIBRATION'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gov-navy-950 flex items-center gap-2 mt-0.5">
            <Settings className="w-6 h-6 text-gov-navy-900" />
            <span>
              {isHi
                ? 'फोरेंसिक निरीक्षण नीतियां'
                : 'Forensic Inspection Policies'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gov-inksoft">
            {isHi
              ? 'एआई विश्लेषण संवेदनशीलता, त्रुटि स्तर विश्लेषण (ELA) एवं टाइपोग्राफी विसंगति पहचान का समायोजन।'
              : 'Calibrate algorithmic anomaly detection sensitivity, Error Level Analysis (ELA) tolerance, and typography kerning metrics.'}
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Algorithmic Sensitivity Calibration Card */}
      <div className="glass-card p-5 rounded-sm border border-gov-line space-y-5 shadow-xs">
        <div className="flex items-center gap-3 pb-3 border-b border-gov-line">
          <div className="p-2 rounded bg-gov-navy-900 text-white shadow-xs">
            <Sliders className="w-4 h-4 text-gov-saffron" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider">
              {isHi ? 'एआई विसंगति पहचान संवेदनशीलता कैलिब्रेशन' : 'AI Anomaly Detection Sensitivity Calibration'}
            </h3>
            <p className="text-[11px] text-gov-inksoft">
              {isHi
                ? 'दस्तावेज़ सत्यापन मॉडल हेतु संवेदनशीलता प्रोफ़ाइल और कलन विधि मान का समायोजन'
                : 'Configure AI sensitivity profiles and algorithmic thresholds for document triage'}
            </p>
          </div>
        </div>

        <div className="space-y-5 text-xs">
          {/* Inspection Rigor Profile with 3 Functional Options */}
          <div>
            <div className="mb-2">
              <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
                {isHi ? 'निरीक्षण संवेदनशीलता प्रोफ़ाइल:' : 'Inspection Rigor Profile:'}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Standard Screening */}
              <button
                type="button"
                onClick={() => applyProfile('standard')}
                className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                  sensitivityProfile === 'standard'
                    ? 'bg-gov-navy-900 text-white border-gov-navy-950 shadow-xs ring-1 ring-gov-navy-900'
                    : 'bg-gov-paper border-gov-line text-gov-ink hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-extrabold">
                    {isHi ? 'मानक स्क्रीनिंग' : 'Standard Screening'}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    sensitivityProfile === 'standard' ? 'bg-gov-navy-800 text-amber-300' : 'bg-slate-100 text-gov-inksoft'
                  }`}>
                    80% / 75%
                  </span>
                </div>
                <span className={`block text-[10px] mt-1.5 leading-snug ${sensitivityProfile === 'standard' ? 'text-slate-300' : 'text-gov-inksoft'}`}>
                  {isHi ? 'नियमित इनवॉइस, अनुबंध एवं सामान्य दस्तावेज़' : 'General screening for invoices, contracts & routine documents'}
                </span>
              </button>

              {/* Option 2: Enhanced Forensic Review */}
              <button
                type="button"
                onClick={() => applyProfile('enhanced')}
                className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                  sensitivityProfile === 'enhanced'
                    ? 'bg-gov-navy-900 text-white border-gov-navy-950 shadow-xs ring-1 ring-gov-navy-900'
                    : 'bg-gov-paper border-gov-line text-gov-ink hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-extrabold">
                    {isHi ? 'संवर्धित फोरेंसिक समीक्षा' : 'Enhanced Forensic Review'}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    sensitivityProfile === 'enhanced' ? 'bg-gov-navy-800 text-amber-300' : 'bg-slate-100 text-gov-inksoft'
                  }`}>
                    90% / 88%
                  </span>
                </div>
                <span className={`block text-[10px] mt-1.5 leading-snug ${sensitivityProfile === 'enhanced' ? 'text-slate-300' : 'text-gov-inksoft'}`}>
                  {isHi ? 'महत्वपूर्ण ऑडिट एवं डिजिटल छेड़छाड़ की गहन जांच' : 'Deep anomaly scan for high-stakes audits & tamper detection'}
                </span>
              </button>

              {/* Option 3: Identity & Travel Documents */}
              <button
                type="button"
                onClick={() => applyProfile('identity')}
                className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                  sensitivityProfile === 'identity'
                    ? 'bg-gov-navy-900 text-white border-gov-navy-950 shadow-xs ring-1 ring-gov-navy-900'
                    : 'bg-gov-paper border-gov-line text-gov-ink hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-extrabold">
                    {isHi ? 'पहचान एवं यात्रा दस्तावेज़' : 'Identity & Travel Documents'}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    sensitivityProfile === 'identity' ? 'bg-gov-navy-800 text-amber-300' : 'bg-slate-100 text-gov-inksoft'
                  }`}>
                    95% / 94%
                  </span>
                </div>
                <span className={`block text-[10px] mt-1.5 leading-snug ${sensitivityProfile === 'identity' ? 'text-slate-300' : 'text-gov-inksoft'}`}>
                  {isHi ? 'आधार, पैन, पासपोर्ट एवं नागरिक पहचान पत्रों हेतु' : 'High-sensitivity checks for Aadhaar, PAN, Passport & IDs'}
                </span>
              </button>
            </div>
          </div>

          {/* Informational Callout Note: Higher Sensitivity vs False Positives */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-sm text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-950 block">
                {isHi ? 'एआई संवेदनशीलता कैलिब्रेशन सूचना' : 'AI Analysis Calibration Note'}
              </span>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                {isHi
                  ? 'सूचना: उच्च संवेदनशीलता संभावित सूक्ष्म विसंगतियों और स्थानीय हेरफेर की पहचान बढ़ाती है, लेकिन कम रेज़ोल्यूशन, अत्यधिक संपीड़ित या बार-बार स्कैन किए गए दस्तावेज़ों में झूठी चेतावनी (फाल्स पॉजिटिव) की संभावना भी बढ़ा सकती है।'
                  : 'Note: Higher sensitivity increases detection of potential subtle anomalies and localized manipulations, but may also increase false positives on degraded, re-scanned, compressed, or low-resolution documents.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Restore Baseline Calibration & Save Calibration Settings */}
        <div className="pt-4 border-t border-gov-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetCalibration}
            className="text-xs text-gov-navy-900 hover:text-gov-navy-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHi ? 'मानक कैलिब्रेशन पुनर्स्थापित करें' : 'Restore Baseline Calibration'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSavePolicy()}
            className="btn-gov-primary flex items-center gap-2 justify-center cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isHi ? 'कैलिब्रेशन सेटिंग्स सहेजें' : 'Save Calibration Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

