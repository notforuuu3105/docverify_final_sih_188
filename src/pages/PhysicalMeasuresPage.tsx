import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Ruler,
  Layers,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Sliders,
  FileText,
  RotateCcw,
  ArrowLeft,
  Microscope,
} from 'lucide-react';

interface SubstrateProfile {
  id: string;
  nameEn: string;
  nameHi: string;
  categoryEn: string;
  categoryHi: string;
  standardThickness: number; // in microns
  tolerance: number; // in microns
  standardGsm: number;
  gsmTolerance: number;
  materialEn: string;
  materialHi: string;
  dimensionsEn: string;
  dimensionsHi: string;
  featuresEn: string[];
  featuresHi: string[];
}

const PROFILES: SubstrateProfile[] = [
  {
    id: 'aadhaar',
    nameEn: 'Aadhaar Smart Card (UIDAI)',
    nameHi: 'आधार कार्ड (UIDAI)',
    categoryEn: 'Citizen Identity PVC Card',
    categoryHi: 'नागरिक पहचान पीवीसी कार्ड',
    standardThickness: 300,
    tolerance: 10,
    standardGsm: 0, // PVC rigid
    gsmTolerance: 0,
    materialEn: 'Multi-layer Polyvinyl Chloride (PVC)',
    materialHi: 'बहु-स्तरीय पीवीसी (स्मार्ट कार्ड)',
    dimensionsEn: 'ISO/IEC 7810 ID-1 (85.60 × 53.98 mm)',
    dimensionsHi: 'ISO/IEC 7810 ID-1 (85.60 × 53.98 मिमी)',
    featuresEn: [
      'Ashoka Pillar relief watermark',
      'UIDAI Guilloche micro-pattern',
      'UV 365nm non-fluorescent substrate',
      'Digitally signed 2048-bit QR code',
    ],
    featuresHi: [
      'अशोक स्तम्भ राहत वॉटरमार्क चिह्न',
      'यूआईडीएआई गिलॉश सूक्ष्म पैटर्न',
      'यूवी 365nm गैर-फ्लोरोसेंट सब्सट्रेट',
      'डिजिटल हस्ताक्षरित 2048-बिट क्यूआर कोड',
    ],
  },
  {
    id: 'passport',
    nameEn: 'Indian Passport (Regular 36-page)',
    nameHi: 'भारतीय पासपोर्ट (नियमित 36-पृष्ठ)',
    categoryEn: 'Travel Document Booklet',
    categoryHi: 'यात्रा दस्तावेज़ पुस्तिका',
    standardThickness: 85,
    tolerance: 5,
    standardGsm: 90,
    gsmTolerance: 5,
    materialEn: 'Security Cotton Rag Paper (Polycarbonate Bio-page)',
    materialHi: 'सुरक्षात्मक कॉटन कागज़ (पॉलीकार्बोनेट बायो-पेज)',
    dimensionsEn: 'ICAO Doc 9303 (125.0 × 88.0 mm)',
    dimensionsHi: 'ICAO Doc 9303 (125.0 × 88.0 मिमी)',
    featuresEn: [
      'Optically Variable Ink (OVI)',
      'Tactile intaglio relief printing',
      'Laser perforated ghost portrait',
      'ICAO Machine Readable Zone (MRZ)',
    ],
    featuresHi: [
      'परिवर्तनीय प्रकाशीय स्याही (OVI)',
      'उभारदार इंटैग्लियो मुद्रण',
      'लेजर-छिद्रित घोस्ट फोटो छवि',
      'मशीन पठनीय क्षेत्र (MRZ)',
    ],
  },
  {
    id: 'pan',
    nameEn: 'Permanent Account Number (PAN Card)',
    nameHi: 'स्थायी खाता संख्या (पैन कार्ड)',
    categoryEn: 'Tax Identification Card',
    categoryHi: 'करदाता पहचान कार्ड',
    standardThickness: 300,
    tolerance: 15,
    standardGsm: 0,
    gsmTolerance: 0,
    materialEn: 'Rigid Laminated Polyvinyl Chloride (PVC)',
    materialHi: 'कठोर लैमिनेटेड पीवीसी',
    dimensionsEn: 'ISO/IEC 7810 ID-1 (85.60 × 53.98 mm)',
    dimensionsHi: 'ISO/IEC 7810 ID-1 (85.60 × 53.98 मिमी)',
    featuresEn: [
      'Income Tax Dept genuine hologram',
      'Micro-line security border',
      'UV 365nm fluorescent logo',
    ],
    featuresHi: [
      'आयकर विभाग प्रामाणिक होलोग्राम',
      'सूक्ष्म रेखा सुरक्षा बॉर्डर',
      'यूवी 365nm फ्लोरोसेंट लोगो',
    ],
  },
  {
    id: 'marksheet',
    nameEn: 'Class X/XII Educational Marksheet',
    nameHi: '10वीं / 12वीं बोर्ड अंकतालिका',
    categoryEn: 'Academic Security Certificate',
    categoryHi: 'शैक्षणिक सुरक्षा प्रमाण पत्र',
    standardThickness: 110,
    tolerance: 5,
    standardGsm: 95,
    gsmTolerance: 5,
    materialEn: '100% Woodfree Security Bond Paper',
    materialHi: '100% उच्च गुणवत्ता सुरक्षात्मक बॉन्ड कागज़',
    dimensionsEn: 'Standard A4 (210 × 297 mm)',
    dimensionsHi: 'मानक A4 (210 × 297 मिमी)',
    featuresEn: [
      'Embedded dandy roll watermark',
      'Anti-photocopy void pantograph',
      'Solvent-reactive anti-alteration ink',
    ],
    featuresHi: [
      'समाहित डैंडी रोल वॉटरमार्क',
      'फोटोकॉपी रोधी वॉइड पेंटोग्राफ',
      'विलायक-संवेदनशील सुरक्षात्मक स्याही',
    ],
  },
  {
    id: 'stamp_paper',
    nameEn: 'Non-Judicial Stamp Paper',
    nameHi: 'गैर-न्यायिक स्टाम्प पेपर',
    categoryEn: 'State Revenue & Legal Deed',
    categoryHi: 'राज्य राजस्व एवं कानूनी विलेख',
    standardThickness: 120,
    tolerance: 6,
    standardGsm: 100,
    gsmTolerance: 5,
    materialEn: 'High-Tensile Security Rag Paper with Security Thread',
    materialHi: 'सुरक्षा धागे युक्त उच्च-तन्यता सुरक्षा कागज़',
    dimensionsEn: 'Standard Legal (215.9 × 355.6 mm)',
    dimensionsHi: 'मानक लीगल (215.9 × 355.6 मिमी)',
    featuresEn: [
      'Windowed metallic security thread with microtext',
      'National Ashoka emblem watermark',
      'Bleed-resistant jurisdictional intaglio seal',
    ],
    featuresHi: [
      'सूक्ष्म टेक्स्ट युक्त धात्विक विंडो सुरक्षा धागा',
      'राष्ट्रीय अशोक स्तम्भ वॉटरमार्क',
      'सुरक्षित इंटैग्लियो आधिकारिक मोहर',
    ],
  },
];

export const PhysicalMeasuresPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [searchParams] = useSearchParams();
  const paramDocId = searchParams.get('docId');
  const paramSubtype = searchParams.get('subtype');

  // Normalize incoming subtype
  const resolveProfileId = (rawSubtype: string | null) => {
    if (!rawSubtype) return 'aadhaar';
    if (rawSubtype.startsWith('passport')) return 'passport';
    if (rawSubtype.includes('pan')) return 'pan';
    if (rawSubtype.includes('marksheet')) return 'marksheet';
    if (rawSubtype.includes('stamp')) return 'stamp_paper';
    return PROFILES.some((p) => p.id === rawSubtype) ? rawSubtype : 'aadhaar';
  };

  const initialProfileId = resolveProfileId(paramSubtype);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(initialProfileId);

  useEffect(() => {
    if (paramSubtype) {
      const resolved = resolveProfileId(paramSubtype);
      handleSelectProfile(resolved);
    }
  }, [paramSubtype]);

  const profile = PROFILES.find((p) => p.id === selectedProfileId) || PROFILES[0];

  // Measured inputs
  const [measuredThickness, setMeasuredThickness] = useState<number>(profile.standardThickness);
  const [measuredGsm, setMeasuredGsm] = useState<number>(profile.standardGsm || 95);
  const [uvDullnessPassed, setUvDullnessPassed] = useState<boolean>(true);
  const [watermarkReliefPassed, setWatermarkReliefPassed] = useState<boolean>(true);

  // When profile changes, reset to standard specs
  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    const p = PROFILES.find((x) => x.id === id) || PROFILES[0];
    setMeasuredThickness(p.standardThickness);
    setMeasuredGsm(p.standardGsm || 95);
    setUvDullnessPassed(true);
    setWatermarkReliefPassed(true);
  };

  // Evaluation calculations
  const minThickness = profile.standardThickness - profile.tolerance;
  const maxThickness = profile.standardThickness + profile.tolerance;
  const isThicknessConformant = measuredThickness >= minThickness && measuredThickness <= maxThickness;

  const minGsm = profile.standardGsm > 0 ? profile.standardGsm - profile.gsmTolerance : 0;
  const maxGsm = profile.standardGsm > 0 ? profile.standardGsm + profile.gsmTolerance : 0;
  const isGsmConformant = profile.standardGsm === 0 || (measuredGsm >= minGsm && measuredGsm <= maxGsm);

  const isFullyConformant = isThicknessConformant && isGsmConformant && uvDullnessPassed && watermarkReliefPassed;

  return (
    <div className="space-y-6 animate-fadeIn text-gov-ink">
      {/* Referred Case Alert Banner (If navigated from /verify) */}
      {paramDocId && (
        <div className="p-4 rounded-sm bg-amber-50/90 border border-amber-400 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-amber-200/80 text-amber-900 shrink-0">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {isHi ? 'स्वचालित जांच से प्रेषित केस' : 'Escalated from Automated Screening'}
                </span>
                <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-white border border-amber-300">
                  ID: {paramDocId.slice(0, 18).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-0.5">
                {isHi
                  ? 'विसंगति पाए जाने पर दस्तावेज़ को भौतिक मोटाई एवं कागज़ सब्सट्रेट परीक्षण हेतु लैब में भेजा गया है।'
                  : 'Document was referred for hands-on micro-caliper thickness and physical substrate laboratory testing.'}
              </p>
            </div>
          </div>
          <Link
            to="/verify"
            className="text-xs font-bold text-amber-950 hover:text-amber-800 underline flex items-center gap-1 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isHi ? 'वापस सत्यापन पर जाएं' : 'Back to Verification'}</span>
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className="pb-3 border-b border-gov-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gov-saffron"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gov-navy-800 font-mono">
              {isHi ? 'दस्तावेज़ भौतिक माप एवं सब्सट्रेट प्रयोगशाला' : 'DOCUMENT PHYSICAL MEASURES & SUBSTRATE LAB'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gov-navy-950 flex items-center gap-2 mt-0.5">
            <Ruler className="w-6 h-6 text-gov-navy-900" />
            <span>
              {isHi
                ? 'दस्तावेज़ भौतिक माप एवं मोटाई परीक्षण'
                : 'Physical Document Measures & Thickness Analysis'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gov-inksoft">
            {isHi
              ? 'डिजिटल माइक्रोमीटर मोटाई (माइक्रोन), कागज़ का वज़न (जीएसएम) एवं भौतिक सुरक्षा लक्षणों का सत्यापन।'
              : 'Laboratory caliper thickness (µm), paper weight (GSM), and security substrate conformance testing.'}
          </p>
        </div>

        {/* Overall Substrate Verdict Pill */}
        <div className="shrink-0">
          <div
            className={`px-4 py-2 rounded-sm border flex items-center gap-2 shadow-xs ${
              isFullyConformant
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                : 'bg-rose-50 border-rose-500 text-rose-950'
            }`}
          >
            {isFullyConformant ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
            )}
            <div>
              <div className="text-xs font-extrabold uppercase font-mono">
                {isFullyConformant
                  ? isHi
                    ? 'भौतिक आधार प्रामाणिक'
                    : 'SUBSTRATE CONFORMANT'
                  : isHi
                  ? 'अमान्य / जाली आधार'
                  : 'SUBSTRATE NON-CONFORMANT'}
              </div>
              <div className="text-[10px] opacity-85">
                {isFullyConformant
                  ? isHi
                    ? 'सभी भौतिक मानक सफल'
                    : 'Meets Legal Specifications'
                  : isHi
                  ? 'मानक से विचलन दर्ज'
                  : 'Specification Discrepancy'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Select Document Profile Selector & Quick Test Presets */}
      <div className="bg-white p-4 rounded-sm border border-gov-line shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gov-navy-950 mb-1">
              {isHi ? 'परीक्षण हेतु दस्तावेज़ चुनें:' : 'Select Target Document to Inspect:'}
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => handleSelectProfile(e.target.value)}
              className="w-full bg-gov-paper border border-gov-line rounded-sm px-3 py-2 text-xs font-bold text-gov-navy-950 focus:outline-none focus:border-gov-navy-900 cursor-pointer"
            >
              {PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {isHi ? `${p.nameHi} — ${p.categoryHi}` : `${p.nameEn} — ${p.categoryEn}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectProfile(selectedProfileId)}
              className="btn-gov-secondary text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHi ? 'मानक पर रीसेट करें' : 'Reset to Standard'}</span>
            </button>
          </div>
        </div>

        {/* Quick Calibration Test Presets */}
        <div className="pt-2 border-t border-gov-line">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gov-inksoft block mb-1.5">
            {isHi ? 'त्वरित सिमुलेशन नमूने:' : 'Quick Testing Simulation Presets:'}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedProfileId('aadhaar');
                setMeasuredThickness(300);
                setUvDullnessPassed(true);
                setWatermarkReliefPassed(true);
              }}
              className="px-2.5 py-1 text-xs rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold transition-colors"
            >
              {isHi ? '✓ असली आधार कार्ड (300 µm PVC)' : '✓ Authentic Aadhaar (300 µm PVC)'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedProfileId('aadhaar');
                setMeasuredThickness(180); // Thin laminated paper photocopy
                setUvDullnessPassed(false); // Bleached paper glows under UV
              }}
              className="px-2.5 py-1 text-xs rounded bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-semibold transition-colors"
            >
              {isHi ? '⚠️ जाली आधार (180 µm लैमिनेटेड फोटोकॉपी)' : '⚠️ Fake Aadhaar (180 µm Laminated Paper)'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedProfileId('marksheet');
                setMeasuredThickness(110);
                setMeasuredGsm(95);
                setUvDullnessPassed(true);
              }}
              className="px-2.5 py-1 text-xs rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold transition-colors"
            >
              {isHi ? '✓ असली अंकतालिका (110 µm / 95 GSM)' : '✓ Authentic Marksheet (110 µm / 95 GSM)'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedProfileId('marksheet');
                setMeasuredThickness(75);
                setMeasuredGsm(70);
                setUvDullnessPassed(false);
              }}
              className="px-2.5 py-1 text-xs rounded bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-semibold transition-colors"
            >
              {isHi ? '⚠️ जाली अंकतालिका (75 µm / 70 GSM सस्ता कागज़)' : '⚠️ Fake Marksheet (75 µm / 70 GSM Copier Paper)'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Laboratory Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive Caliper & GSM Density Tool */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tool 1: Digital Caliper Thickness Gauge */}
          <div className="bg-white p-5 rounded-sm border border-gov-line shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gov-line">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-gov-navy-900 text-white">
                  <Ruler className="w-4 h-4 text-gov-saffron" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
                    {isHi ? '1. डिजिटल कैलिपर मोटाई परीक्षण' : '1. Digital Caliper Thickness Gauge'}
                  </h3>
                  <span className="text-[10px] text-gov-inksoft">
                    {isHi
                      ? 'दस्तावेज़ की भौतिक मोटाई को माइक्रोन (µm) में मापें।'
                      : 'Measure physical substrate thickness in micrometers (µm).'}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                  isThicknessConformant
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {isThicknessConformant
                  ? isHi
                    ? 'मानक अनुरूप'
                    : 'CONFORMANT'
                  : isHi
                  ? 'अमान्य मोटाई'
                  : 'DISCREPANCY'}
              </span>
            </div>

            {/* Gauge Display Card */}
            <div className="p-4 bg-slate-900 text-white rounded-sm border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  {isHi ? 'मापी गई मोटाई' : 'MEASURED CALIPER READING'}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-gov-saffron">
                  {measuredThickness} <span className="text-sm text-slate-300 font-sans">µm</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  {isHi ? 'सरकारी मानक विनिर्देश' : 'LEGAL SPECIFICATION'}
                </span>
                <div className="text-sm font-bold font-mono text-slate-200">
                  {profile.standardThickness} µm (±{profile.tolerance} µm)
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isHi
                    ? `स्वीकार्य सीमा: ${minThickness}–${maxThickness} µm`
                    : `Valid Range: ${minThickness}–${maxThickness} µm`}
                </div>
              </div>
            </div>

            {/* Interactive Caliper Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gov-inksoft">
                <span>{isHi ? 'कैलिपर स्लाइडर समायोजित करें:' : 'Adjust Micrometer Sensor Slider:'}</span>
                <span className="font-mono font-bold text-gov-navy-950">{measuredThickness} µm</span>
              </div>
              <input
                type="range"
                min="50"
                max="450"
                step="5"
                value={measuredThickness}
                onChange={(e) => setMeasuredThickness(Number(e.target.value))}
                className="w-full accent-gov-navy-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-gov-inksoft">
                <span>50 µm ({isHi ? 'पतला कागज़' : 'Thin Sheet'})</span>
                <span>{profile.standardThickness} µm ({isHi ? 'आधिकारिक मानक' : 'Standard Spec'})</span>
                <span>450 µm ({isHi ? 'अत्यधिक मोटा' : 'Heavy Card'})</span>
              </div>
            </div>

            {/* Diagnostic Message */}
            {!isThicknessConformant && (
              <div className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {measuredThickness < minThickness
                      ? isHi
                        ? 'दस्तावेज़ की मोटाई मानक से बहुत कम है!'
                        : 'Substrate is significantly thinner than legal standard!'
                      : isHi
                      ? 'दस्तावेज़ की मोटाई मानक से बहुत अधिक है!'
                      : 'Substrate is significantly thicker than legal standard!'}
                  </p>
                  <p className="text-[11px] text-rose-900 mt-0.5">
                    {measuredThickness < minThickness
                      ? isHi
                        ? 'यह दर्शाता है कि दस्तावेज़ असली पीवीसी या कॉटन पेपर के बजाय साधारण कागज़ पर फोटोकॉपी किया गया है।'
                        : 'Indicates the document was printed on ordinary paper or photocopy sheet rather than certified substrate.'
                      : isHi
                      ? 'अत्यधिक मोटाई आमतौर पर नकली प्लास्टिक पाउच लैमिनेशन या डुप्लिकेट चिपकाने का संकेत देती है।'
                      : 'Excess thickness indicates secondary pouch lamination or spliced paper duplication.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tool 2: Paper Density (GSM) Analyzer (if document is paper-based) */}
          {profile.standardGsm > 0 && (
            <div className="bg-white p-5 rounded-sm border border-gov-line shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gov-line">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-gov-navy-900 text-white">
                    <Scale className="w-4 h-4 text-gov-saffron" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
                      {isHi ? '2. कागज़ घनत्व एवं वज़न (जीएसएम)' : '2. Paper Weight & Density (GSM)'}
                    </h3>
                    <span className="text-[10px] text-gov-inksoft">
                      {isHi
                        ? 'ग्राम प्रति वर्ग मीटर (GSM) में कागज़ के घनत्व का परीक्षण।'
                        : 'Measure paper density in grams per square meter (GSM).'}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                    isGsmConformant
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {isGsmConformant
                    ? isHi
                      ? 'मानक अनुरूप'
                      : 'CONFORMANT'
                    : isHi
                    ? 'अमान्य वज़न'
                    : 'ANOMALY'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gov-paper rounded-sm border border-gov-line">
                  <span className="text-[10px] text-gov-inksoft block">
                    {isHi ? 'मापा गया जीएसएम' : 'Measured GSM'}
                  </span>
                  <div className="text-xl font-extrabold font-mono text-gov-navy-950 mt-0.5">
                    {measuredGsm} GSM
                  </div>
                </div>

                <div className="p-3 bg-gov-paper rounded-sm border border-gov-line">
                  <span className="text-[10px] text-gov-inksoft block">
                    {isHi ? 'सुरक्षात्मक मानक जीएसएम' : 'Standard Security GSM'}
                  </span>
                  <div className="text-xl font-extrabold font-mono text-gov-navy-900 mt-0.5">
                    {profile.standardGsm} GSM (±{profile.gsmTolerance})
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-gov-inksoft">
                  <span>{isHi ? 'जीएसएम समायोजित करें:' : 'Adjust GSM Sensor:'}</span>
                  <span className="font-mono font-bold text-gov-navy-950">{measuredGsm} GSM</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  step="5"
                  value={measuredGsm}
                  onChange={(e) => setMeasuredGsm(Number(e.target.value))}
                  className="w-full accent-gov-navy-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gov-inksoft font-mono">
                  <span>60 GSM ({isHi ? 'सस्ता प्रिंटर पेपर' : 'Cheap Copier Paper'})</span>
                  <span>{profile.standardGsm} GSM ({isHi ? 'सरकारी सुरक्षा कागज़' : 'Security Paper'})</span>
                  <span>140 GSM ({isHi ? 'कार्डबोर्ड शीट' : 'Heavy Cardstock'})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Substrate Profile & Micro-Security Checklist */}
        <div className="lg:col-span-5 space-y-4">
          {/* Substrate Profile Details Card */}
          <div className="bg-white p-4 rounded-sm border border-gov-line shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gov-line">
              <Layers className="w-4 h-4 text-gov-navy-900" />
              <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
                {isHi ? 'सब्सट्रेट विनिर्देश प्रोफ़ाइल' : 'Substrate Specification Profile'}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-gov-inksoft font-semibold block">
                  {isHi ? 'दस्तावेज़ का नाम:' : 'Document Name:'}
                </span>
                <span className="font-bold text-gov-navy-950">
                  {isHi ? profile.nameHi : profile.nameEn}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gov-inksoft font-semibold block">
                  {isHi ? 'सामग्री संरचना:' : 'Material Composition:'}
                </span>
                <span className="font-semibold text-gov-navy-900">
                  {isHi ? profile.materialHi : profile.materialEn}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gov-inksoft font-semibold block">
                  {isHi ? 'आधिकारिक आकार एवं आयाम:' : 'Standard Dimensions:'}
                </span>
                <span className="font-mono font-bold text-gov-navy-950">
                  {isHi ? profile.dimensionsHi : profile.dimensionsEn}
                </span>
              </div>
            </div>

            {/* Micro-Features Checklist */}
            <div className="pt-2 border-t border-gov-line space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gov-inksoft flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gov-saffron-dark" />
                <span>{isHi ? 'भौतिक सुरक्षा लक्षण' : 'Physical Security Features'}</span>
              </span>
              <ul className="space-y-1.5 text-xs">
                {(isHi ? profile.featuresHi : profile.featuresEn).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gov-saffron font-bold mt-0.5">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Optical & Watermark Physical Integrity Tests */}
          <div className="bg-white p-4 rounded-sm border border-gov-line shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gov-line">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
                {isHi ? 'ऑप्टिकल एवं वॉटरमार्क सत्यापन' : 'Optical & Watermark Physical Verification'}
              </h3>
            </div>

            <div className="space-y-2.5">
              {/* Test 1: UV 365nm Dullness */}
              <div
                onClick={() => setUvDullnessPassed(!uvDullnessPassed)}
                className={`p-2.5 rounded-sm border cursor-pointer transition-colors flex items-center justify-between ${
                  uvDullnessPassed
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-rose-50/50 border-rose-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-gov-navy-950 block">
                    {isHi ? 'यूवी 365nm प्रकाशीय शुद्धता' : 'UV 365nm Optical Dullness'}
                  </span>
                  <span className="text-[10px] text-gov-inksoft">
                    {uvDullnessPassed
                      ? isHi
                        ? 'कोई रासायनिक ब्लीच नहीं (प्रामाणिक)'
                        : 'Zero optical brightener bleed (Authentic)'
                      : isHi
                      ? 'अत्यधिक चमक — वाणिज्यिक कागज़ ब्लीच पाया गया'
                      : 'Heavy fluorescence — Bleached commercial paper'}
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                    uvDullnessPassed ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {uvDullnessPassed ? '✓' : '✗'}
                </div>
              </div>

              {/* Test 2: Watermark / Relief Depth */}
              <div
                onClick={() => setWatermarkReliefPassed(!watermarkReliefPassed)}
                className={`p-2.5 rounded-sm border cursor-pointer transition-colors flex items-center justify-between ${
                  watermarkReliefPassed
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-rose-50/50 border-rose-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-gov-navy-950 block">
                    {isHi ? 'वॉटरमार्क एवं सुरक्षा धागा गहराई' : 'Watermark & Security Thread Relief'}
                  </span>
                  <span className="text-[10px] text-gov-inksoft">
                    {watermarkReliefPassed
                      ? isHi
                        ? 'कागज़ के भीतर समाहित (सत्यापित)'
                        : 'Embedded within substrate pulp (Verified)'
                      : isHi
                      ? 'सतही प्रिंटिंग — नकली वॉटरमार्क'
                      : 'Surface printed — Fake watermark simulation'}
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                    watermarkReliefPassed ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {watermarkReliefPassed ? '✓' : '✗'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
