import React from 'react';
import { Link } from 'react-router-dom';
import { GovTopBar } from '../components/common/GovTopBar';
import { InfernoLogo } from '../components/common/InfernoLogo';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  FileSearch,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  FileBadge2,
  QrCode,
  CreditCard,
  GraduationCap,
  FileText,
  Flame,
  Mail,
  Headphones,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="min-h-screen bg-gov-paper text-gov-ink flex flex-col selection:bg-gov-navy-800/20 selection:text-gov-navy-900">
      {/* 1. Official Header with Accessibility & Team Inferno Logo */}
      <GovTopBar showFullHeader={true} />

      {/* 2. Secondary Navigation Bar */}
      <nav className="bg-gov-navy-900 text-white border-b border-gov-navy-950 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs font-semibold tracking-wide">
            <Link to="/" className="text-gov-saffron hover:underline flex items-center gap-1.5 font-bold">
              {isHi ? 'मुख्य पृष्ठ' : 'Home'}
            </Link>
            <a href="#documents" className="text-slate-200 hover:text-white transition-colors">
              {isHi ? 'समर्थित दस्तावेज़' : 'Supported Documents'}
            </a>
            <a href="#how-it-works" className="text-slate-200 hover:text-white transition-colors">
              {isHi ? 'सत्यापन प्रक्रिया' : 'How It Works'}
            </a>
            <a href="#compliance" className="text-slate-200 hover:text-white transition-colors">
              {isHi ? 'कानूनी साक्ष्य' : 'Legal Compliance'}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/verify"
              className="px-3.5 py-1.5 rounded-sm bg-gov-saffron hover:bg-gov-saffron-dark text-gov-navy-950 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{isHi ? 'दस्तावेज़ जांचें' : 'Verify Document'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs font-bold uppercase tracking-wider font-mono">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'टीम इन्फर्नो' : 'TEAM INFERNO'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gov-navy-950 leading-tight">
              {isHi ? 'नागरिक पहचान एवं दस्तावेज़ सत्यापन प्रणाली' : 'Citizen Identity & Document Verification Portal'}
            </h1>

            <p className="text-base text-gov-inksoft leading-relaxed max-w-2xl">
              {isHi
                ? 'टीम इन्फर्नो द्वारा विकसित उन्नत दस्तावेज़ सत्यापन प्रणाली। आधार कार्ड (QR कोड एवं मास्किंग), पैन कार्ड, पासपोर्ट (MRZ चेकसम) और शैक्षणिक प्रमाणपत्रों में किसी भी प्रकार की डिजिटल छेड़छाड़ व फर्जीवाड़े की त्वरित पहचान करता है।'
                : 'Advanced verification portal powered by Team Inferno. Detects digital tampering, altered dates, forged photos, and simulated stamps across Aadhaar Cards, PAN Cards, Passports, and Academic Marksheets.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/verify"
                className="btn-gov-primary px-6 py-3 text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <FileSearch className="w-4 h-4" />
                <span>{isHi ? 'दस्तावेज़ की जांच शुरू करें' : 'Verify a Document Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Advisory Notice */}
            <div className="p-3.5 rounded bg-white border border-gov-line text-xs text-gov-inksoft flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gov-navy-950">
                  {isHi ? 'कानूनी साक्ष्य अनुपालन:' : 'Evidentiary Compliance:'}
                </strong>{' '}
                {isHi
                  ? 'यह प्रणाली भारतीय साक्ष्य अधिनियम (BSA), 2023 की धारा 63 के तहत अदालत में मान्य डिजिटल साक्ष्य रिपोर्ट व प्रमाण पत्र जारी करती है।'
                  : 'This system generates court-admissible forensic certificates compliant with Section 63 of Bharatiya Sakshya Adhiniyam (BSA), 2023.'}
              </div>
            </div>
          </div>

          {/* Hero Right: Summary Card */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 rounded border-2 border-gov-navy-900/20 shadow-lg space-y-6 relative overflow-hidden bg-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gov-saffron/10 rounded-bl-full pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-gov-line pb-4">
                <div className="flex items-center gap-3">
                  <InfernoLogo size="sm" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-700 block font-mono">
                      {isHi ? 'टीम इन्फर्नो' : 'TEAM INFERNO'}
                    </span>
                    <span className="text-xs font-bold text-gov-navy-950">
                      {isHi ? 'फोरेंसिक सत्यापन इंजन' : 'Verification Engine'}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold font-mono uppercase">
                  {isHi ? 'सक्रिय' : 'ACTIVE'}
                </span>
              </div>

              {/* Core Verification Features */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-gov-paper border border-gov-line flex items-center justify-between">
                  <span className="text-gov-inksoft font-medium">
                    {isHi ? 'आधार कार्ड सत्यापन' : 'Aadhaar Card Verification'}
                  </span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {isHi ? 'QR कोड एवं मास्किंग' : 'UIDAI QR & Masking'}
                  </span>
                </div>
                <div className="p-3 rounded bg-gov-paper border border-gov-line flex items-center justify-between">
                  <span className="text-gov-inksoft font-medium">
                    {isHi ? 'पैन कार्ड सत्यापन' : 'PAN Card Verification'}
                  </span>
                  <span className="font-bold text-gov-navy-950 font-mono">
                    {isHi ? 'संरचना एवं फोटो जांच' : 'Format & Photo Check'}
                  </span>
                </div>
                <div className="p-3 rounded bg-gov-paper border border-gov-line flex items-center justify-between">
                  <span className="text-gov-inksoft font-medium">
                    {isHi ? 'पासपोर्ट सत्यापन' : 'Passport Verification'}
                  </span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {isHi ? 'ICAO MRZ चेकसम' : 'ICAO 9303 Checksum'}
                  </span>
                </div>
                <div className="p-3 rounded bg-gov-paper border border-gov-line flex items-center justify-between">
                  <span className="text-gov-inksoft font-medium">
                    {isHi ? 'छेड़छाड़ की पहचान' : 'Tamper Detection'}
                  </span>
                  <span className="font-bold text-gov-navy-950 font-mono">
                    {isHi ? 'पिक्सेल स्तर पर खोज' : 'Pixel-Level Scan'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gov-line flex items-center justify-between text-[11px] text-gov-inksoft">
                <span>{t('govt_of_india')}</span>
                <span className="font-mono text-gov-navy-900 font-bold">GOI-DOC-NODE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Supported Documents Section */}
      <section id="documents" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-gov-line">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-gov-navy-800 block">
            {isHi ? 'समर्थित श्रेणियाँ' : 'Supported Document Types'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gov-navy-950 mt-1">
            {isHi ? 'नागरिक पहचान एवं आधिकारिक दस्तावेज़' : 'Citizen Identity & Official Credentials'}
          </h2>
          <p className="text-xs sm:text-sm text-gov-inksoft mt-2">
            {isHi
              ? 'प्रमुख भारतीय नागरिक पहचान पत्रों और शैक्षणिक प्रमाणपत्रों के लिए मानकीकृत सत्यापन प्रक्रिया।'
              : 'Standardized automated verification for key Indian citizen identity documents and official records.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Aadhaar */}
          <div className="glass-card p-5 rounded border border-gov-line hover:border-gov-navy-800 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded bg-gov-navy-900 text-white flex items-center justify-center">
              <QrCode className="w-5 h-5 text-gov-saffron" />
            </div>
            <h3 className="text-sm font-bold text-gov-navy-950">
              {isHi ? 'आधार कार्ड (Aadhaar)' : 'Aadhaar Card Verification'}
            </h3>
            <p className="text-xs text-gov-inksoft leading-relaxed">
              {isHi
                ? 'यूआईडीएआई द्वारा हस्ताक्षरित डिजिटल क्यूआर कोड, 12-अंकीय मास्किंग अनुपालन, फोटो एवं जन्म तिथि की सत्यता की जांच।'
                : 'Verifies UIDAI digital signed QR code, legal 12-digit masking, citizen demographic details, and photo splicing seams.'}
            </p>
            <div className="pt-2">
              <Link to="/verify" className="text-xs font-bold text-gov-navy-800 hover:underline flex items-center gap-1">
                {isHi ? 'आधार जांचें' : 'Test Aadhaar'} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 2: PAN Card */}
          <div className="glass-card p-5 rounded border border-gov-line hover:border-gov-navy-800 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded bg-gov-navy-900 text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gov-saffron" />
            </div>
            <h3 className="text-sm font-bold text-gov-navy-950">
              {isHi ? 'पैन कार्ड (PAN Card)' : 'PAN Card Verification'}
            </h3>
            <p className="text-xs text-gov-inksoft leading-relaxed">
              {isHi
                ? 'आयकर विभाग के 10-अंकीय अल्फ़ान्यूमेरिक प्रारूप, नाम, पिता का नाम, हस्ताक्षर एवं होलोग्राम की प्रामाणिकता जांच।'
                : 'Validates 10-digit alphanumeric PAN syntax, Income Tax Dept format, citizen signature, and optical hologram.'}
            </p>
            <div className="pt-2">
              <Link to="/verify" className="text-xs font-bold text-gov-navy-800 hover:underline flex items-center gap-1">
                {isHi ? 'पैन जांचें' : 'Test PAN'} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Passport */}
          <div className="glass-card p-5 rounded border border-gov-line hover:border-gov-navy-800 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded bg-gov-navy-900 text-white flex items-center justify-center">
              <FileText className="w-5 h-5 text-gov-saffron" />
            </div>
            <h3 className="text-sm font-bold text-gov-navy-950">
              {isHi ? 'भारतीय पासपोर्ट (Passport)' : 'Indian Passport Verification'}
            </h3>
            <p className="text-xs text-gov-inksoft leading-relaxed">
              {isHi
                ? 'अंतर्राष्ट्रीय ICAO Doc 9303 एमआरजेड चेकसम गणना, डेटापेज ओसीआर निष्कर्षण एवं लाइव बायोमेट्रिक फोटो मिलान।'
                : 'Decodes 2-line ICAO Doc 9303 MRZ, validates Modulus 7-3-1 check-digits, and performs biometric facial verification.'}
            </p>
            <div className="pt-2">
              <Link to="/verify" className="text-xs font-bold text-gov-navy-800 hover:underline flex items-center gap-1">
                {isHi ? 'पासपोर्ट जांचें' : 'Test Passport'} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 4: Academic */}
          <div className="glass-card p-5 rounded border border-gov-line hover:border-gov-navy-800 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded bg-gov-navy-900 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-gov-saffron" />
            </div>
            <h3 className="text-sm font-bold text-gov-navy-950">
              {isHi ? 'शैक्षणिक अंकतालिका एवं डिग्री' : 'Marksheets & Certificates'}
            </h3>
            <p className="text-xs text-gov-inksoft leading-relaxed">
              {isHi
                ? 'विश्वविद्यालय डिग्री एवं बोर्ड अंकतालिकाओं में अंकों, ग्रेड, सील, हस्ताक्षर अथवा टेक्स्ट में किसी भी छेड़छाड़ की पहचान।'
                : 'Scans university degrees and 10th/12th marksheets for altered marks, edited grades, spliced seals, and fake typography.'}
            </p>
            <div className="pt-2">
              <Link to="/verify" className="text-xs font-bold text-gov-navy-800 hover:underline flex items-center gap-1">
                {isHi ? 'प्रमाणपत्र जांचें' : 'Test Certificate'} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section id="how-it-works" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-gov-line bg-white rounded-lg my-6 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-gov-navy-800 block">
            {isHi ? 'सरल एवं पारदर्शी प्रक्रिया' : 'Step-by-Step Workflow'}
          </span>
          <h2 className="text-2xl font-extrabold text-gov-navy-950 mt-1">
            {isHi ? '4 आसान चरणों में दस्तावेज़ सत्यापन' : '4-Step Verification Workflow'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="space-y-2 p-4 rounded bg-gov-paper border border-gov-line">
            <div className="w-8 h-8 rounded bg-gov-navy-900 text-white font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h4 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
              {isHi ? 'दस्तावेज़ अपलोड करें' : 'Upload Document'}
            </h4>
            <p className="text-xs text-gov-inksoft">
              {isHi
                ? 'ड्रॉपडाउन से दस्तावेज़ श्रेणी चुनें और फ़ाइल अपलोड करें (PDF, स्कैनर या मोबाइल फोटो)।'
                : 'Select document type from the dropdown and upload the file (PDF, scan, or photo).'}
            </p>
          </div>

          <div className="space-y-2 p-4 rounded bg-gov-paper border border-gov-line">
            <div className="w-8 h-8 rounded bg-gov-navy-900 text-white font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h4 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
              {isHi ? 'एआई विश्लेषण' : 'AI Inspection'}
            </h4>
            <p className="text-xs text-gov-inksoft">
              {isHi
                ? 'प्रणाली तुरंत फ़ॉन्ट, पिक्सेल विसंगति, क्यूआर कोड और डिजिटल छेड़छाड़ की जांच करती है।'
                : 'System inspects text font metrics, compression artifacts, QR signatures, and photo edits.'}
            </p>
          </div>

          <div className="space-y-2 p-4 rounded bg-gov-paper border border-gov-line">
            <div className="w-8 h-8 rounded bg-gov-navy-900 text-white font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h4 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
              {isHi ? 'अधिकारी समीक्षा' : 'Officer Review'}
            </h4>
            <p className="text-xs text-gov-inksoft">
              {isHi
                ? 'पहचाने गए संदिग्ध क्षेत्रों को स्क्रीन पर हाइलाइट करके देखें और निष्कर्षों की समीक्षा करें।'
                : 'Review detected anomalous regions highlighted clearly on the document canvas.'}
            </p>
          </div>

          <div className="space-y-2 p-4 rounded bg-gov-paper border border-gov-line">
            <div className="w-8 h-8 rounded bg-gov-navy-900 text-white font-bold text-xs flex items-center justify-center">
              04
            </div>
            <h4 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
              {isHi ? 'निर्णय एवं प्रमाणपत्र' : 'Affidavit & Decision'}
            </h4>
            <p className="text-xs text-gov-inksoft">
              {isHi
                ? 'दस्तावेज़ को स्वीकार/अस्वीकार करें एवं धारा 63 कानूनी साक्ष्य प्रमाणपत्र डाउनलोड करें।'
                : 'Record officer decision and export court-ready Section 63 BSA forensic certificates.'}
            </p>
          </div>
        </div>
      </section>

      {/* 7. Legal Compliance Section */}
      <section id="compliance" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-gov-line">
        <div className="bg-gov-navy-900 text-white p-6 sm:p-8 rounded-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <FileBadge2 className="w-8 h-8 text-gov-saffron shrink-0" />
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isHi ? 'भारतीय साक्ष्य अधिनियम (BSA), 2023 अनुपालन' : 'Bharatiya Sakshya Adhiniyam (BSA), 2023 Compliance'}
              </h3>
              <p className="text-xs text-slate-300">
                {isHi
                  ? 'धारा 63: इलेक्ट्रॉनिक अभिलेखों की कानूनी ग्राह्यता एवं डिजिटल सत्यापन'
                  : 'Section 63: Legal Admissibility of Electronic Records & Cryptographic Verification'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
            <div className="space-y-1">
              <strong className="text-white block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isHi ? 'अपरिवर्तनीय SHA-256 हैश' : 'Cryptographic Hash Lock'}
              </strong>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? 'अपलोड होते ही दस्तावेज़ का गणितीय हैश उत्पन्न होता है जिससे कोई बदलाव संभव नहीं रहता।'
                  : 'SHA-256 hash locked at the moment of upload, preventing any modification in transit.'}
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isHi ? 'डिजिटल हस्ताक्षर टोकन' : 'Digital Officer Token'}
              </strong>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? 'सत्यापन अधिकारी का डिजिटल टोकन रिपोर्ट के साथ संलग्न किया जाता है।'
                  : 'Immutable digital signature hash tied directly to the authorized officer badge.'}
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isHi ? 'पूर्ण ऑडिट ट्रेल' : 'Full Audit Trail'}
              </strong>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? 'प्रत्येक जांच का समय, अधिकारी एवं विवरण सुरक्षित रूप से दर्ज रहता है।'
                  : 'Tamper-proof audit logs recording timestamp, officer identity, and check findings.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Official Government Footer */}
      <footer className="mt-auto bg-gov-navy-950 text-slate-300 border-t-4 border-gov-saffron pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <InfernoLogo size="sm" monochrome={false} />
              <div>
                <span className="font-bold text-white block">{t('govt_of_india')}</span>
                <span className="text-slate-300 text-[11px] block">
                  {isHi ? 'दस्तावेज़ सत्यापन पोर्टल' : 'Document Verification Portal'}
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isHi
                ? 'नागरिक पहचान पत्रों एवं आधिकारिक प्रमाणपत्रों की सत्यता जांच हेतु राष्ट्रीय मंच।'
                : 'National verification platform for citizen identity credentials and official documents.'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              {isHi ? 'त्वरित लिंक' : 'Quick Links'}
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/verify" className="hover:text-gov-saffron">{t('nav_verify')}</Link></li>
              <li><Link to="/physical-measures" className="hover:text-gov-saffron">{t('nav_physical_measures')}</Link></li>
              <li><Link to="/reports" className="hover:text-gov-saffron">{t('nav_reports')}</Link></li>
              <li><Link to="/history" className="hover:text-gov-saffron">{isHi ? 'जांच इतिहास' : 'Verification Log'}</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              {isHi ? 'नियम एवं कानून' : 'Acts & Rules'}
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><span className="text-slate-400">Aadhaar Act, 2016</span></li>
              <li><span className="text-slate-400">Information Technology Act, 2000</span></li>
              <li><span className="text-slate-400">Bharatiya Sakshya Adhiniyam, 2023 (Sec 63)</span></li>
              <li><span className="text-slate-400">Passports Act, 1967</span></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-gov-saffron" />
              {isHi ? 'सहायता (SUPPORT)' : 'SUPPORT'}
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isHi
                ? 'तकनीकी सहायता अथवा फोरेंसिक प्रश्नों के लिए सहायता डेस्क से संपर्क करें।'
                : 'For technical inquiries, assistance, or forensic queries, connect with our support team.'}
            </p>
            <div className="pt-1.5 space-y-2">
              <a
                href="mailto:team.inferno.ai@gmail.com"
                className="flex items-center gap-2.5 p-2.5 rounded bg-slate-900 border border-slate-700/80 text-white hover:border-gov-saffron hover:bg-slate-800/90 transition-all group"
                title="Send email to team.inferno.ai@gmail.com"
              >
                <div className="w-7 h-7 rounded bg-gov-saffron/10 border border-gov-saffron/30 flex items-center justify-center text-gov-saffron group-hover:scale-110 transition-transform shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Gmail
                  </span>
                  <span className="text-xs font-mono font-bold text-gov-saffron block truncate">
                    team.inferno.ai@gmail.com
                  </span>
                </div>
              </a>
              <div className="flex items-center gap-2 px-0.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>{isHi ? '24/7 फोरेंसिक सहायता उपलब्ध' : '24/7 Forensic Support Active'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 {t('govt_of_india')}. All Rights Reserved.</p>
          <p className="font-mono text-slate-500">POWERED BY TEAM INFERNO FORENSIC ENGINE</p>
        </div>
      </footer>
    </div>
  );
};
