import React, { useState, useEffect } from 'react';
import { GovEmblem } from './GovEmblem';
import { Globe, Volume2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GovTopBarProps {
  showFullHeader?: boolean;
}

export const GovTopBar: React.FC<GovTopBarProps> = ({ showFullHeader = true }) => {
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0); // -1, 0, 1
  const { language, toggleLanguage, t } = useLanguage();

  // Adjust root document font size
  const handleFontSizeChange = (delta: number) => {
    let newLevel = 0;
    if (delta === 0) newLevel = 0;
    else newLevel = Math.min(1, Math.max(-1, fontSizeLevel + delta));

    setFontSizeLevel(newLevel);
    if (newLevel === -1) {
      document.documentElement.style.fontSize = '14px';
    } else if (newLevel === 1) {
      document.documentElement.style.fontSize = '17px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  };

  useEffect(() => {
    return () => {
      document.documentElement.style.fontSize = '16px';
    };
  }, []);

  return (
    <header className="w-full bg-white border-b border-gov-line text-gov-ink select-none">
      {/* 1. Official National Utility & Accessibility Bar */}
      <div className="bg-gov-navy-950 text-slate-200 text-[11px] font-medium py-1.5 px-4 sm:px-6 lg:px-8 border-b border-gov-navy-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Team Inferno Attribution */}
          <div className="flex items-center gap-2 tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-extrabold text-white tracking-wider font-mono">
              {language === 'hi' ? 'टीम इन्फर्नो' : 'TEAM INFERNO'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 text-[10px] sm:text-[11px]">
              {language === 'hi'
                ? 'दस्तावेज़ सत्यापन एवं एआई फोरेंसिक विश्लेषण प्लेटफॉर्म'
                : 'Document Verification & AI Forensic Analysis Platform'}
            </span>
          </div>

          {/* Accessibility & Language Toolbar */}
          <div className="flex items-center gap-3 text-xs ml-auto">
            {/* Screen Reader Access */}
            <a
              href="#main-content"
              className="hidden lg:inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              title={t('screen_reader')}
            >
              <Volume2 className="w-3 h-3 text-gov-saffron" />
              <span>{t('screen_reader')}</span>
            </a>

            <span className="hidden lg:inline text-slate-600">|</span>

            {/* Font Size Adjusters */}
            <div className="flex items-center border border-slate-700 rounded bg-gov-navy-900/80 overflow-hidden text-[10px]">
              <button
                type="button"
                onClick={() => handleFontSizeChange(-1)}
                className={`px-1.5 py-0.5 hover:bg-gov-navy-800 transition-colors ${
                  fontSizeLevel === -1 ? 'bg-gov-saffron text-gov-navy-950 font-bold' : 'text-slate-300'
                }`}
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange(0)}
                className={`px-1.5 py-0.5 border-x border-slate-700 hover:bg-gov-navy-800 transition-colors ${
                  fontSizeLevel === 0 ? 'bg-slate-700 text-white font-bold' : 'text-slate-300'
                }`}
                title="Default Font Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange(1)}
                className={`px-1.5 py-0.5 hover:bg-gov-navy-800 transition-colors ${
                  fontSizeLevel === 1 ? 'bg-gov-saffron text-gov-navy-950 font-bold' : 'text-slate-300'
                }`}
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            <span className="text-slate-600">|</span>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-gov-navy-900 hover:bg-gov-navy-800 text-slate-200 hover:text-white border border-slate-700 transition-all shadow-xs"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-gov-saffron" />
              <span className="font-bold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tricolor Ribbon */}
      <div className="tricolor-strip">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* 3. Full Government Header with Official Crest */}
      {showFullHeader && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Emblem + Official Department Title */}
            <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
              <GovEmblem size="md" />
              <div className="border-l-2 border-gov-line pl-3 sm:pl-4">
                <p className="text-xs uppercase font-bold tracking-widest text-gov-navy-800 font-devanagari">
                  {t('govt_of_india')}
                </p>
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-gov-navy-950 leading-tight">
                  {t('portal_title')}
                </h1>
                <p className="text-[11px] sm:text-xs text-gov-inksoft font-medium">
                  {t('portal_subtitle')}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
