import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Layers, Ruler, ShieldCheck, Sparkles, Scale, AlertTriangle, CheckSquare } from 'lucide-react';

interface PhysicalSpec {
  titleEn: string;
  titleHi: string;
  substrateEn: string;
  substrateHi: string;
  thickness: string;
  dimensions: string;
  density?: string;
  featuresEn: string[];
  featuresHi: string[];
  standardOrg: string;
  protocolEn: string[];
  protocolHi: string[];
}

const SPEC_DATABASE: Record<string, PhysicalSpec> = {
  aadhaar: {
    titleEn: 'Aadhaar Card Physical Measures & Substrate Specs',
    titleHi: 'आधार कार्ड भौतिक माप एवं विनिर्देश',
    substrateEn: 'Multi-layer Polyvinyl Chloride (PVC Smart Card Substrate)',
    substrateHi: 'बहु-स्तरीय पीवीसी (स्मार्ट कार्ड सब्सट्रेट)',
    thickness: '300 µm (±10 µm)',
    dimensions: 'ISO/IEC 7810 ID-1 (85.60 × 53.98 mm)',
    density: 'Rigid PVC Core (~5.0 g / card)',
    featuresEn: [
      'Ashoka Pillar relief watermark with tamper-evident micro-text',
      'UIDAI Guilloche anti-copy fine-line geometric pattern',
      'UV 365nm optical dullness (zero optical brighteners / non-fluorescent)',
      'High-density 2048-bit digitally signed offline verification QR code',
    ],
    featuresHi: [
      'अशोक स्तम्भ राहत वॉटरमार्क एवं सूक्ष्म सुरक्षा अक्षरांकन',
      'यूआईडीएआई गिलॉश सूक्ष्म रेखा ज्यामितीय सुरक्षा पैटर्न',
      'यूवी 365nm प्रकाशीय शुद्धता (शून्य फ्लोरोसेंट ब्राइटनर)',
      'उच्च-घनत्व डिजिटल हस्ताक्षरित 2048-बिट सुरक्षित क्यूआर कोड',
    ],
    standardOrg: 'UIDAI / ISO-IEC 7810 ID-1',
    protocolEn: [
      'Use a calibrated digital micrometer to verify edge and center thickness equals 300 µm (±10 µm).',
      'Examine under 365 nm UV illumination; authentic PVC must not fluoresce bright blue/violet.',
      'Inspect Ashoka pillar watermark under oblique back-lighting for multi-tone depth.',
    ],
    protocolHi: [
      'कैलिब्रेटेड डिजिटल माइक्रोमीटर से जांचें कि कार्ड की मोटाई 300 µm (±10 µm) है।',
      '365 nm यूवी लैंप के नीचे देखें; प्रामाणिक पीवीसी सब्सट्रेट फ्लोरोसेंट नीला नहीं चमकना चाहिए।',
      'तिरछी रोशनी में अशोक स्तम्भ वॉटरमार्क की प्रामाणिक गहराई और उभार की जांच करें।',
    ],
  },
  pan: {
    titleEn: 'PAN Card Physical Measures & Substrate Specs',
    titleHi: 'पैन कार्ड भौतिक माप एवं विनिर्देश',
    substrateEn: 'Rigid Laminated Polyvinyl Chloride (PVC with Hologram)',
    substrateHi: 'कठोर लैमिनेटेड पीवीसी (सुरक्षा होलोग्राम युक्त)',
    thickness: '300 µm (±15 µm)',
    dimensions: 'ISO/IEC 7810 ID-1 (85.60 × 53.98 mm)',
    density: 'Rigid PVC Core (~5.0 g / card)',
    featuresEn: [
      'Income Tax Department genuine multi-angle diffraction hologram',
      'Micro-line border text and high-resolution background security tint',
      'Cryptographic QR code encoding taxpayer identity details',
      'UV 365nm reflective insignia and anti-scratch matte/gloss overlay',
    ],
    featuresHi: [
      'आयकर विभाग का बहु-कोणीय विवर्तन प्रामाणिक होलोग्राम',
      'सूक्ष्म रेखा बॉर्डर टेक्स्ट एवं उच्च-रेज़ोल्यूशन बैकग्राउंड सुरक्षा टिंट',
      'करदाता विवरण एन्कोड करता क्रिप्टोग्राफिक क्यूआर कोड',
      'यूवी 365nm परावर्तक प्रतीक चिह्न एवं खरोंच-रोधी सुरक्षा परत',
    ],
    standardOrg: 'Income Tax Dept / ISO-7810',
    protocolEn: [
      'Verify card thickness at 300 µm (±15 µm) using micrometer.',
      'Tilt card under directional white light to verify kinetic movement in the ITD hologram.',
      'Scan micro-lettering on border margins with 10x optical loupe for razor-sharp legibility.',
    ],
    protocolHi: [
      'माइक्रोमीटर से कार्ड की मोटाई 300 µm (±15 µm) सत्यापित करें।',
      'सफेद रोशनी में कार्ड को झुकाकर आयकर विभाग के होलोग्राम का रंग बदलाव जांचें।',
      '10x मैग्निफाइंग लेंस से किनारों पर सूक्ष्म अक्षरों की स्पष्टता जांचें।',
    ],
  },
  voter: {
    titleEn: 'Voter ID (EPIC) Physical Measures & Substrate Specs',
    titleHi: 'मतदाता पहचान पत्र (EPIC) भौतिक माप एवं विनिर्देश',
    substrateEn: 'Laminated Security Polymer / High-Density PVC Cardstock',
    substrateHi: 'लैमिनेटेड सुरक्षा पॉलीमर / उच्च-घनत्व कार्ड',
    thickness: '280 µm (±10 µm)',
    dimensions: 'ISO/IEC 7810 ID-1 (85.60 × 53.98 mm)',
    density: 'Polymer Composite (~4.8 g)',
    featuresEn: [
      'Election Commission of India metallic emblem hologram',
      'Continuous micro-lettering along boundary margins',
      'Secondary ghost photograph with inverted tonal contrast',
      'Machine-readable Barcode / QR with encrypted EPIC number',
    ],
    featuresHi: [
      'भारत निर्वाचन आयोग का धात्विक होलोग्राम प्रतीक',
      'सीमांत किनारों पर निरंतर सूक्ष्म अक्षरांकन',
      'विपरीत कंट्रास्ट युक्त द्वितीयक घोस्ट फोटो छवि',
      'एन्क्रिप्टेड एपिक नंबर युक्त मशीन पठनीय बारकोड / क्यूआर',
    ],
    standardOrg: 'Election Commission of India (ECI)',
    protocolEn: [
      'Confirm physical card thickness matches 280 µm (±10 µm).',
      'Verify secondary ghost portrait matches primary photograph features.',
      'Check metallic hologram integrity for absence of peeling or thermal transfer edges.',
    ],
    protocolHi: [
      'सत्यापित करें कि कार्ड की मोटाई 280 µm (±10 µm) है।',
      'घोस्ट फोटो की मुख्य फोटो से मिलान करें।',
      'होलोग्राम के किनारों की जांच करें कि कोई छीलने या चिपकाने का निशान न हो।',
    ],
  },
  passport_regular: {
    titleEn: 'Indian Passport Physical Measures & Substrate Specs',
    titleHi: 'भारतीय पासपोर्ट भौतिक माप एवं विनिर्देश',
    substrateEn: 'Security Rag Paper (Inner) / Polycarbonate (Bio-data Page)',
    substrateHi: 'सुरक्षात्मक कॉटन कागज़ / पॉलीकार्बोनेट बायो-डेटा कार्ड',
    thickness: '85 µm (Inner page) / 600 µm (Data card)',
    dimensions: 'ICAO Doc 9303 (125.0 × 88.0 mm Booklet)',
    density: '90 GSM High-Tensile Security Paper (±5 GSM)',
    featuresEn: [
      'Optically Variable Ink (OVI) color-shifting coat on emblem',
      'Tactile intaglio relief printing on cover and visa page boundaries',
      'Secondary ghost portrait with laser-engraved micro-perforations',
      'Type-3 Machine Readable Zone (MRZ) compliant with ICAO Doc 9303',
    ],
    featuresHi: [
      'प्रतीक चिह्न पर रंग बदलने वाली परिवर्तनीय प्रकाशीय स्याही (OVI)',
      'कवर एवं पृष्ठों पर उभारदार इंटैग्लियो स्पर्शनीय मुद्रण',
      'लेजर-छिद्रित सूक्ष्म छिद्रों से निर्मित घोस्ट फोटो छवि',
      'आईसीएओ डॉक्टर 9303 मानक के अनुरूप टाइप-3 मशीन पठनीय क्षेत्र (MRZ)',
    ],
    standardOrg: 'ICAO Doc 9303 / SPMCIL / MEA',
    protocolEn: [
      'Verify 90 GSM paper weight and 85 µm thickness for inner leaves; 600 µm for polycarbonate card.',
      'Tactile finger-rub test across intaglio lettering to feel raised ink relief.',
      'Back-light page to inspect laser micro-perforations matching passport number.',
    ],
    protocolHi: [
      'भीतरी पृष्ठों की मोटाई 85 µm (90 GSM) तथा पॉलीकार्बोनेट पृष्ठ की मोटाई 600 µm जांचें।',
      'उंगली से छूकर इंटैग्लियो अक्षरों के वास्तविक उभार का अनुभव करें।',
      'रोशनी के सामने रखकर लेजर छिद्रों से बने पासपोर्ट नंबर की जांच करें।',
    ],
  },
  driving_license: {
    titleEn: 'Driving License Physical Measures & Substrate Specs',
    titleHi: 'ड्राइविंग लाइसेंस भौतिक माप एवं विनिर्देश',
    substrateEn: 'Smart Card Polycarbonate / Multi-layer PVC with Contact/Contactless Chip',
    substrateHi: 'स्मार्ट कार्ड पॉलीकार्बोनेट / मल्टी-लेयर पीवीसी चिप युक्त',
    thickness: '300 µm (±10 µm)',
    dimensions: 'ISO/IEC 7810 ID-1 (85.60 × 53.98 mm)',
    density: 'Rigid Composite Substrate (~5.1 g)',
    featuresEn: [
      'State Transport Department optical security hologram',
      'ISO 7816 compliant embedded cryptographic micro-controller chip',
      'Micro-printed state emblem perimeter line',
      'UV 365nm fluorescent state transport insignia',
    ],
    featuresHi: [
      'राज्य परिवहन विभाग का ऑप्टिकल सुरक्षा होलोग्राम',
      'आईएसओ 7816 अनुरूप समाहित माइक्रोकंट्रोलर चिप',
      'सूक्ष्म मुद्रित राज्य प्रतीक परिधि रेखा',
      'यूवी 365nm फ्लोरोसेंट राज्य परिवहन प्रतीक चिह्न',
    ],
    standardOrg: 'MoRTH / ISO-7810 / ISO-7816',
    protocolEn: [
      'Check caliper thickness measures 300 µm (±10 µm).',
      'Inspect chip contact pads for authentic gold-plated micro-connectors.',
      'Verify sharpness of guilloche patterns and hologram adherence.',
    ],
    protocolHi: [
      'कैलीपर से मोटाई 300 µm (±10 µm) जांचें।',
      'चिप के कॉन्टैक्ट पैड्स पर प्रामाणिक गोल्ड प्लेटिंग का निरीक्षण करें।',
      'गिलॉश सुरक्षा रेखाओं एवं होलोग्राम की प्रामाणिकता जांचें।',
    ],
  },
  marksheet: {
    titleEn: 'Board Marksheet Physical Measures & Substrate Specs',
    titleHi: 'बोर्ड अंकतालिका भौतिक माप एवं विनिर्देश',
    substrateEn: '100% Woodfree High-Tensile Security Bond Paper',
    substrateHi: '100% उच्च गुणवत्ता सुरक्षात्मक बॉन्ड कागज़',
    thickness: '110 µm (±5 µm)',
    dimensions: 'Standard A4 (210 × 297 mm)',
    density: '95 GSM (Grams per Square Meter) (±4 GSM)',
    featuresEn: [
      'Embedded dandy roll institutional watermark visible under transmitted light',
      'Anti-photocopy void pantograph background (reveals "COPY" on duplicate)',
      'Solvent-sensitive anti-alteration chemical reaction security ink',
      'High-precision micro-printed perimeter border line',
    ],
    featuresHi: [
      'कागज़ निर्माण के दौरान समाहित संस्थागत डैंडी रोल वॉटरमार्क',
      'फोटोकॉपी रोधी वॉइड पेंटोग्राफ पृष्ठभूमि (कॉपी करने पर "COPY" दिखता है)',
      'रासायनिक विलायक-संवेदनशील सुरक्षात्मक सुरक्षा स्याही',
      'उच्च-परिशुद्धता सूक्ष्म मुद्रित बॉर्डर परिधि',
    ],
    standardOrg: 'CBSE / CISCE / State Examination Board',
    protocolEn: [
      'Measure sheet thickness using micrometer: must calibrate to 110 µm (±5 µm) at 95 GSM.',
      'Hold sheet up to bright backlight to verify genuine molded dandy watermark inside paper fibers.',
      'Use 10x magnification to confirm border text is readable micro-text, not a broken dot-matrix print.',
    ],
    protocolHi: [
      'माइक्रोमीटर से शीट की मोटाई 110 µm (±5 µm) एवं 95 GSM घनत्व मापें।',
      'तेज रोशनी में देखें कि वॉटरमार्क कागज़ के रेशों में बना है, ऊपर से छापा नहीं गया है।',
      '10x लेंस से बॉर्डर के सूक्ष्म अक्षरों की स्पष्टता सत्यापित करें।',
    ],
  },
  degree_certificate: {
    titleEn: 'University Degree Physical Measures & Substrate Specs',
    titleHi: 'विश्वविद्यालय डिग्री भौतिक माप एवं विनिर्देश',
    substrateEn: 'Heavyweight Security Parchment / 100% Cotton Rag Paper',
    substrateHi: 'भारी सुरक्षात्मक पार्चमेंट / 100% कॉटन सुरक्षा कागज़',
    thickness: '130 µm (±5 µm)',
    dimensions: 'Standard A4 / Letter (210 × 297 mm)',
    density: '120 GSM Heavyweight Bond (±5 GSM)',
    featuresEn: [
      'Embossed university seal with high-relief metallic hot-stamp foil',
      'Dual-tone multi-shade three-dimensional watermark',
      'Invisible UV fluorescent fibers embedded randomly in paper slurry',
      'Non-reproducible Guilloche border and rainbow split-duct printing',
    ],
    featuresHi: [
      'उभारदार विश्वविद्यालय मोहर एवं धात्विक हॉट-स्टैम्प पन्नी',
      'द्वि-रंगी त्रि-आयामी सुरक्षात्मक वॉटरमार्क',
      'कागज़ में बिखरे अदृश्य यूवी फ्लोरोसेंट सुरक्षा रेशे',
      'अद्वितीय गिलॉश बॉर्डर एवं रेनबो स्प्लिट-डक्ट मुद्रण',
    ],
    standardOrg: 'UGC / University Security Standards',
    protocolEn: [
      'Confirm paper weight reaches 120 GSM and thickness 130 µm (±5 µm).',
      'Illuminate with 365 nm UV light to reveal embedded red/green security fibers.',
      'Touch the embossed university seal to verify genuine physical deformation of paper stock.',
    ],
    protocolHi: [
      'कागज़ का घनत्व 120 GSM और मोटाई 130 µm (±5 µm) मापें।',
      '365 nm यूवी प्रकाश में कागज़ में मौजूद हरे/लाल सुरक्षा रेशों की चमक देखें।',
      'उभारदार विश्वविद्यालय मोहर के वास्तविक कागज़ उभार को स्पर्श करें।',
    ],
  },
  diploma_cert: {
    titleEn: 'Technical Diploma Physical Measures & Substrate Specs',
    titleHi: 'तकनीकी डिप्लोमा भौतिक माप एवं विनिर्देश',
    substrateEn: 'High-Tensile Security Bond Paper with Anti-Copy Matrix',
    substrateHi: 'उच्च-तन्यता सुरक्षा बॉन्ड कागज़ (एंटी-कॉपी मैट्रिक्स युक्त)',
    thickness: '120 µm (±5 µm)',
    dimensions: 'Standard A4 (210 × 297 mm)',
    density: '100 GSM Bond Paper (±4 GSM)',
    featuresEn: [
      'Anti-copy void pantograph pattern behind student marks',
      'Serial numbering in penetrating magnetic numbering ink',
      'UV fluorescent state technical education insignia',
      'Micro-printed perimeter rules and border framing',
    ],
    featuresHi: [
      'अंकों के पीछे फोटोकॉपी रोधी वॉइड पेंटोग्राफ सुरक्षा पैटर्न',
      'कागज़ के भीतर समाने वाली मैग्नेटिक नंबरिंग स्याही में क्रमांक',
      'यूवी फ्लोरोसेंट तकनीकी शिक्षा बोर्ड का सुरक्षा प्रतीक',
      'सूक्ष्म मुद्रित परिधि रेखाएं एवं बॉर्डर फ्रेम',
    ],
    standardOrg: 'Technical Education Board / AICTE Standards',
    protocolEn: [
      'Measure 120 µm thickness and 100 GSM substrate weight.',
      'Check reverse side for penetration of magnetic red/black numbering ink.',
      'Examine background tint under magnifying loupe for continuous vector curves.',
    ],
    protocolHi: [
      '120 µm मोटाई और 100 GSM कागज़ भार मापें।',
      'कागज़ के पीछे क्रमांक स्याही के हल्के रिसाव की प्रामाणिकता जांचें।',
      'लेंस से बैकग्राउंड सुरक्षा रेखाओं की निरंतरता देखें।',
    ],
  },
  stamp_paper: {
    titleEn: 'Non-Judicial Stamp Paper Physical Measures & Specs',
    titleHi: 'गैर-न्यायिक स्टाम्प पेपर भौतिक माप एवं विनिर्देश',
    substrateEn: 'Security Rag Paper Embedded with Windowed Security Thread',
    substrateHi: 'सुरक्षा धागे से युक्त उच्च-तन्यता सुरक्षा कागज़',
    thickness: '120 µm (±5 µm)',
    dimensions: 'Standard Legal Format (215.9 × 355.6 mm)',
    density: '100 GSM Security Rag Substrate (±5 GSM)',
    featuresEn: [
      'Windowed metallic security thread with micro-lettered state markings',
      'National Ashoka emblem watermark visible across header',
      'Bleed-resistant intaglio jurisdictional tax seal with tactile texture',
      'Unique serial numbering printed in optical magnetic ink',
    ],
    featuresHi: [
      'सूक्ष्म अक्षरों युक्त धात्विक विंडो सुरक्षा धागा',
      'शीर्षक पर दृश्य राष्ट्रीय अशोक स्तम्भ वॉटरमार्क',
      'सुरक्षित उभरी हुई इंटैग्लियो आधिकारिक राजस्व मोहर',
      'ऑप्टिकल मैग्नेटिक स्याही में विशिष्ट क्रमांकन',
    ],
    standardOrg: 'SPMCIL / State Revenue Dept / RBI Specs',
    protocolEn: [
      'Verify 100 GSM security rag substrate and 120 µm thickness.',
      'Backlight paper to inspect continuous embedded security thread spanning top to bottom.',
      'Perform tactile check on intaglio header engraving for raised ink texture.',
    ],
    protocolHi: [
      '100 GSM सुरक्षा कागज़ और 120 µm मोटाई सत्यापित करें।',
      'रोशनी के सामने रखकर ऊपर से नीचे तक फैले प्रामाणिक सुरक्षा धागे को देखें।',
      'राजस्व मोहर पर उंगली फिराकर उभरी हुई स्याही की बनावट महसूस करें।',
    ],
  },
  sale_deed: {
    titleEn: 'Property Sale Deed / Registry Physical Measures',
    titleHi: 'संपत्ति बिक्री विलेख / रजिस्ट्री भौतिक माप',
    substrateEn: 'Heavy Duty Green Ledger Paper / Document Parchment',
    substrateHi: 'हैवी ड्यूटी ग्रीन लेजर पेपर / रजिस्ट्री दस्तावेज़ कागज़',
    thickness: '110 µm (±5 µm)',
    dimensions: 'Standard Legal (215.9 × 355.6 mm)',
    density: '90 GSM High-Tensile Ledger (±4 GSM)',
    featuresEn: [
      'Sub-Registrar digital barcode and official registry serial stamping',
      'Notary embossed seal and revenue stamp affixations',
      'Thumbprint impressions in permanent anti-smudge indelible ink',
      'Numbered pages with certified registry office ledger stamps',
    ],
    featuresHi: [
      'उप-पंजीयक कार्यालय का डिजिटल बारकोड एवं आधिकारिक रजिस्ट्री स्टैम्प',
      'नोटरी पब्लिक का उभरा हुआ सील एवं राजस्व टिकट',
      'अमिट सुरक्षात्मक स्याही में अंगूठे का निशान',
      'प्रमाणित रजिस्ट्री कार्यालय मोहर युक्त क्रमांकित पृष्ठ',
    ],
    standardOrg: 'Inspector General of Registration / State Revenue',
    protocolEn: [
      'Measure 90 GSM paper density and 110 µm legal sheet thickness.',
      'Check for wet notary seals and embossed blind stamps on every leaf.',
      'Verify indelible ink fingerprint ridges under 10x magnifying glass.',
    ],
    protocolHi: [
      '90 GSM कागज़ घनत्व और 110 µm शीट मोटाई जांचें।',
      'प्रत्येक पृष्ठ पर नोटरी की गीली स्याही मोहर और उभरे हुए ठप्पे की जांच करें।',
      '10x लेंस से अंगूठे के निशान की रेखाओं की प्रामाणिकता देखें।',
    ],
  },
  court_affidavit: {
    titleEn: 'Notarized Legal Affidavit Physical Measures & Specs',
    titleHi: 'शपथ पत्र / कानूनी हलफनामा भौतिक माप',
    substrateEn: 'Heavy Legal Bond Paper with Notarial Seals',
    substrateHi: 'भारी कानूनी बॉन्ड कागज़ (नोटरी सील युक्त)',
    thickness: '105 µm (±5 µm)',
    dimensions: 'Standard Legal (215.9 × 355.6 mm)',
    density: '85 GSM Legal Bond (±4 GSM)',
    featuresEn: [
      'Affixed non-judicial notary adhesive stamp with canceling signature',
      'Embossed circular metallic notary public crimp seal',
      'Government registered Notary Advocate serial register number',
      'Oaths Commissioner wet ink attestation stamp',
    ],
    featuresHi: [
      'हस्ताक्षर द्वारा रद्द किया गया प्रामाणिक नोटरी राजस्व टिकट',
      'उभरा हुआ गोल धात्विक नोटरी पब्लिक क्रिम्प सील',
      'सरकार द्वारा पंजीकृत नोटरी अधिवक्ता का वैध रजिस्टर क्रमांक',
      'शपथ आयुक्त का गीली स्याही वाला साक्ष्यांकन ठप्पा',
    ],
    standardOrg: 'Notaries Act, 1952 / High Court Rules',
    protocolEn: [
      'Verify 85 GSM sheet density and 105 µm thickness.',
      'Check that notary embossed crimp seal causes tangible physical indentations on paper.',
      'Verify that notary adhesive stamp is cancelled across stamp border with ink signature.',
    ],
    protocolHi: [
      '85 GSM शीट घनत्व एवं 105 µm मोटाई की जांच करें।',
      'कागज़ पर नोटरी के उभरे हुए ठप्पे (कम्प्रेस सील) के स्पष्ट उभार को जांचें।',
      'सत्यापित करें कि नोटरी टिकट पर आर-पार स्याही से हस्ताक्षर किए गए हैं।',
    ],
  },
  gst_invoice: {
    titleEn: 'Commercial GST Tax Invoice Physical Measures',
    titleHi: 'व्यावसायिक जीएसटी टैक्स इनवॉइस भौतिक माप',
    substrateEn: 'Commercial Bond or Dual-Ply Carbonless Thermal/Bond Substrate',
    substrateHi: 'व्यावसायिक बॉन्ड या कार्बनलेस सुरक्षा कागज़',
    thickness: '90 µm (±5 µm)',
    dimensions: 'Standard A4 (210 × 297 mm)',
    density: '75 GSM Commercial Bond (±3 GSM)',
    featuresEn: [
      'GSTN-compliant 64-character Invoice Reference Number (IRN) hash',
      'Cryptographically signed B2B e-Invoice QR code',
      'Authorized signatory wet or certified cryptographic digital token stamp',
      'Tax breakdown columns matching HSN/SAC statutory codes',
    ],
    featuresHi: [
      'जीएसटीएन अनुरूप 64-अक्षरीय इनवॉइस संदर्भ संख्या (IRN) हैश',
      'क्रिप्टोग्राफिक रूप से हस्ताक्षरित बी2बी ई-इनवॉइस क्यूआर कोड',
      'अधिकृत हस्ताक्षरकर्ता का डिजिटल प्रमाण पत्र या मोहर',
      'एचएसएन/एसएसी कोड सहित वैधानिक कर विभाजन तालिका',
    ],
    standardOrg: 'GSTN / Central Board of Indirect Taxes & Customs',
    protocolEn: [
      'Verify 75 GSM paper thickness (approx 90 µm).',
      'Decode digital e-Invoice QR code to confirm matching IRN and GSTIN.',
      'Verify printed totals match mathematically with state and central tax rates.',
    ],
    protocolHi: [
      'कागज़ की मोटाई 90 µm (75 GSM) मापें।',
      'ई-इनवॉइस क्यूआर कोड को स्कैन कर IRN और GSTIN का मिलान करें।',
      'जांचें कि मुद्रित कर राशि वैधानिक जीएसटी दरों के अनुसार सही है।',
    ],
  },
  bank_statement: {
    titleEn: 'Bank Account Statement Physical Measures & Specs',
    titleHi: 'प्रमाणित बैंक खाता विवरण भौतिक माप',
    substrateEn: 'Certified Watermarked Banking Stationery / Laser Bond',
    substrateHi: 'प्रमाणित बैंक स्टेशनरी / लेजर बॉन्ड कागज़',
    thickness: '95 µm (±5 µm)',
    dimensions: 'Standard A4 (210 × 297 mm)',
    density: '80 GSM Bank Ledger Paper (±4 GSM)',
    featuresEn: [
      'Official branch verification round seal and officer employee code stamp',
      'Bank security logo watermark or security color gradient background',
      'Unique statement generation timestamp and transaction reference hash',
      'Consistent tabular character kerning without font substitutions',
    ],
    featuresHi: [
      'आधिकारिक बैंक शाखा का गोल सत्यापन ठप्पा एवं कर्मचारी कोड',
      'बैंक सुरक्षा लोगो वॉटरमार्क अथवा सुरक्षात्मक रंग बैकग्राउंड',
      'विशिष्ट विवरण निर्माण समय एवं लेनदेन संदर्भ हैश कोड',
      'बिना फॉन्ट हेरफेर के सुसंगत तालिकीय अक्षरांकन',
    ],
    standardOrg: 'RBI Banking Standards / Scheduled Commercial Banks',
    protocolEn: [
      'Measure 80 GSM paper density and 95 µm thickness.',
      'Inspect official branch verification stamp for genuine wet ink bleeding.',
      'Verify running ledger balances mathematically across all transaction rows.',
    ],
    protocolHi: [
      '80 GSM कागज़ घनत्व और 95 µm मोटाई मापें।',
      'बैंक शाखा की मोहर पर गीली स्याही के प्रामाणिक अवशोषण को जांचें।',
      'सभी लेनदेन पंक्तियों में शेष राशि की गणितीय गणना का सत्यापन करें।',
    ],
  },
};

interface DocumentPhysicalSpecCardProps {
  subtype: string;
}

export const DocumentPhysicalSpecCard: React.FC<DocumentPhysicalSpecCardProps> = ({ subtype }) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const spec = SPEC_DATABASE[subtype] || SPEC_DATABASE['aadhaar'];

  return (
    <div className="bg-white border border-gov-line rounded-sm p-4 sm:p-5 shadow-xs space-y-4 animate-fadeIn">
      {/* Header & Advisory Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gov-line gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-gov-navy-900 text-white shrink-0 shadow-xs">
            <Ruler className="w-5 h-5 text-gov-saffron" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gov-navy-950">
              {isHi ? spec.titleHi : spec.titleEn}
            </h3>
            <span className="text-[11px] font-mono text-gov-inksoft">
              {isHi ? `मानक संदर्भ प्राधिकरण: ${spec.standardOrg}` : `Standard Reference: ${spec.standardOrg}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase">
            {isHi ? 'सूचनात्मक विनिर्देश संदर्भ' : 'INFORMATIONAL ADVISORY REFERENCE'}
          </span>
        </div>
      </div>

      {/* Prominent Advisory Notice Banner */}
      <div className="flex items-start gap-2.5 p-3 bg-amber-50/90 border border-amber-200 rounded-sm text-amber-950 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-[11px] uppercase tracking-wider text-amber-900">
            {isHi ? 'अधिकृत परीक्षक हेतु तकनीकी निर्देश (मैन्युअल भौतिक निरीक्षण)' : 'Official Examiner Advisory (Manual Physical Inspection Benchmark)'}
          </p>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            {isHi 
              ? 'सूचना: यह अनुभाग केवल अधिकृत अधिकारी/परीक्षक द्वारा भौतिक दस्तावेज़ की कैलीपर, माइक्रोमीटर, स्केल एवं यूवी लैंप से मैन्युअल जांच के लिए विनिर्देश संदर्भ प्रदान करता है। यह डिजिटल एआई स्कैनर द्वारा किया गया वास्तविक भौतिक माप नहीं है।'
              : 'Note: The physical specifications below (expected thickness, GSM/density, substrate, and security features) serve strictly as an authoritative benchmark for manual physical examination using micrometers, calipers, and UV lights. This is an informational reference and NOT an automated AI sensor measurement.'}
          </p>
        </div>
      </div>

      {/* Grid of 4 Key Physical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Thickness */}
        <div className="p-3 bg-gov-paper rounded-sm border border-gov-line">
          <div className="text-[11px] text-gov-inksoft flex items-center gap-1.5 font-semibold">
            <Ruler className="w-3.5 h-3.5 text-gov-navy-900" />
            <span>{isHi ? 'मानक मोटाई' : 'Standard Thickness'}</span>
          </div>
          <div className="text-sm font-extrabold text-gov-navy-950 font-mono mt-1">
            {spec.thickness}
          </div>
          <div className="text-[10px] text-gov-inksoft mt-0.5">
            {isHi ? 'कैलिब्रेटेड माइक्रोमीटर द्वारा' : 'Calibrated micrometer metric'}
          </div>
        </div>

        {/* Substrate Material */}
        <div className="p-3 bg-gov-paper rounded-sm border border-gov-line">
          <div className="text-[11px] text-gov-inksoft flex items-center gap-1.5 font-semibold">
            <Layers className="w-3.5 h-3.5 text-gov-navy-900" />
            <span>{isHi ? 'सब्सट्रेट सामग्री' : 'Substrate Material'}</span>
          </div>
          <div className="text-xs font-extrabold text-gov-navy-950 mt-1 line-clamp-2" title={isHi ? spec.substrateHi : spec.substrateEn}>
            {isHi ? spec.substrateHi : spec.substrateEn}
          </div>
          <div className="text-[10px] text-gov-inksoft mt-0.5">
            {isHi ? 'मूल सामग्री संरचना' : 'Base structural composition'}
          </div>
        </div>

        {/* Dimensions */}
        <div className="p-3 bg-gov-paper rounded-sm border border-gov-line">
          <div className="text-[11px] text-gov-inksoft flex items-center gap-1.5 font-semibold">
            <Scale className="w-3.5 h-3.5 text-gov-navy-900" />
            <span>{isHi ? 'मानक आकार / आयाम' : 'Dimensions'}</span>
          </div>
          <div className="text-xs font-extrabold text-gov-navy-950 font-mono mt-1 line-clamp-2" title={spec.dimensions}>
            {spec.dimensions}
          </div>
          <div className="text-[10px] text-gov-inksoft mt-0.5">
            {isHi ? 'वैधानिक कटिंग विनिर्देश' : 'Statutory cut standard'}
          </div>
        </div>

        {/* Weight / Density / GSM */}
        <div className="p-3 bg-gov-paper rounded-sm border border-gov-line">
          <div className="text-[11px] text-gov-inksoft flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gov-navy-900" />
            <span>{isHi ? 'घनत्व / जीएसएम / भार' : 'Density / GSM / Weight'}</span>
          </div>
          <div className="text-xs font-extrabold text-gov-navy-950 font-mono mt-1 line-clamp-2">
            {spec.density || (isHi ? 'मानक' : 'Standard')}
          </div>
          <div className="text-[10px] text-gov-inksoft mt-0.5">
            {isHi ? 'कागज़/कार्ड घनत्व विनिर्देश' : 'Substrate density spec'}
          </div>
        </div>
      </div>

      {/* Two Columns: Physical Security Features (Left) & Manual Examination Protocol (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Security Features Bullet List */}
        <div className="space-y-2 p-3 bg-slate-50/60 rounded-sm border border-gov-line">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gov-navy-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{isHi ? 'भौतिक सुरक्षा लक्षण (मैन्युअल सत्यापन सूची)' : 'Physical Security Features (Visual Check)'}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gov-ink">
            {(isHi ? spec.featuresHi : spec.featuresEn).map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gov-saffron font-bold mt-0.5">•</span>
                <span className="leading-snug">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Examiner Protocol Checklist */}
        <div className="space-y-2 p-3 bg-slate-50/60 rounded-sm border border-gov-line">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gov-navy-950 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-gov-navy-900" />
            <span>{isHi ? 'परीक्षक भौतिक निरीक्षण प्रोटोकॉल' : 'Manual Examiner Inspection Protocol'}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gov-ink">
            {(isHi ? spec.protocolHi : spec.protocolEn).map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gov-navy-800 font-mono font-bold text-[10px] mt-0.5">
                  [{i + 1}]
                </span>
                <span className="leading-snug">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
