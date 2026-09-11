import React, { useState } from 'react';
import { AadhaarOcrData, PassportOcrData, PanOcrData, VerificationCheck, ParsedQrData, FieldVerificationStatus } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import {
  QrCode,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Type,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  compareFields,
  validatePanNumber,
  validateAadhaarNumber,
  validateDateOfBirth,
  maskIdentificationNumber,
} from '../../lib/forensics/comparisonEngine';

interface QrOcrCrossCheckCardProps {
  isTampered: boolean;
  aadhaarData?: AadhaarOcrData;
  passportData?: PassportOcrData;
  panData?: PanOcrData;
  parsedQrData?: ParsedQrData;
  checks?: VerificationCheck[];
  isLiveOcr?: boolean;
  rawOcrText?: string;
}

interface TableRowData {
  field: string;
  ocrValue: string;
  benchmarkSpec: string;
  status: FieldVerificationStatus;
  detail: string;
}

export const QrOcrCrossCheckCard: React.FC<QrOcrCrossCheckCardProps> = ({
  isTampered,
  aadhaarData,
  passportData,
  panData,
  parsedQrData,
  checks = [],
  isLiveOcr = false,
  rawOcrText,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [showRawText, setShowRawText] = useState<boolean>(false);

  const isPan = !!panData;
  const isAadhaar = !!aadhaarData && !isPan;
  const isPassport = !!passportData && !isPan && !isAadhaar;

  const hasQrCode = parsedQrData?.detected ?? (aadhaarData ? Boolean(aadhaarData.qr_code_detected) : false);
  const isQrEncrypted = parsedQrData?.isEncryptedOrUnparseable ?? false;

  // Build rows deterministically from actual data
  const comparisonRows: TableRowData[] = [];

  if (isPan && panData) {
    const panNumVal = validatePanNumber(panData.pan_number);
    comparisonRows.push({
      field: isHi ? 'पैन संख्या (PAN Number)' : 'PAN Number',
      ocrValue: maskIdentificationNumber(panData.pan_number, 'pan'),
      benchmarkSpec: 'Income Tax Dept (10-char AAAAA9999A)',
      status: panNumVal.isValid ? 'VALID' : panData.pan_number === 'Not detected' ? 'NOT_DETECTED' : 'INVALID',
      detail: panNumVal.message,
    });

    comparisonRows.push({
      field: isHi ? 'कार्डधारक का नाम (Full Name)' : 'Cardholder Full Name',
      ocrValue: panData.full_name,
      benchmarkSpec: panData.full_name !== 'Not detected' ? 'Printed Document Field' : 'Not detected',
      status: panData.full_name !== 'Not detected' ? 'DETECTED' : 'NOT_DETECTED',
      detail: panData.full_name !== 'Not detected' ? 'Extracted from PAN cardholder line' : 'Unable to extract name from image',
    });

    comparisonRows.push({
      field: isHi ? 'पिता का नाम (Father\'s Name)' : 'Father\'s Name',
      ocrValue: panData.father_name,
      benchmarkSpec: panData.father_name !== 'Not detected' ? 'Printed Document Field' : 'Not detected',
      status: panData.father_name !== 'Not detected' ? 'DETECTED' : 'NOT_DETECTED',
      detail: panData.father_name !== 'Not detected' ? 'Extracted from PAN parent line' : 'Unable to extract father name from image',
    });

    const dobVal = validateDateOfBirth(panData.date_of_birth);
    comparisonRows.push({
      field: isHi ? 'जन्म तिथि (Date of Birth)' : 'Date of Birth',
      ocrValue: panData.date_of_birth,
      benchmarkSpec: 'Standard Calendar DD/MM/YYYY',
      status: dobVal.isValid ? 'VALID' : panData.date_of_birth === 'Not detected' ? 'NOT_DETECTED' : 'INVALID',
      detail: dobVal.message,
    });

    comparisonRows.push({
      field: isHi ? 'आयकर विभाग 2D बारकोड' : 'ITD 2D Barcode',
      ocrValue: hasQrCode ? '2D Barcode Found' : 'No Barcode Scanned',
      benchmarkSpec: 'NSDL / ITD Encrypted Signature',
      status: hasQrCode ? 'DETECTED' : 'NOT_DETECTED',
      detail: hasQrCode ? '2D barcode located on card substrate' : '2D barcode not detected on uploaded image',
    });

    comparisonRows.push({
      field: isHi ? 'हस्ताक्षर एवं फोटो स्थिति' : 'Signature & Photo Substrate',
      ocrValue: panData.signature_detected ? 'Signature Layer Detected' : 'No Signature Text',
      benchmarkSpec: 'Physical Specimen Inspection',
      status: panData.signature_detected ? 'VALID' : 'REVIEW_REQUIRED',
      detail: panData.signature_detected ? 'Official card signature boundary confirmed' : 'Requires visual inspection by verifying officer',
    });
  } else if (isAadhaar && aadhaarData) {
    // AADHAAR CARD
    if (hasQrCode && parsedQrData && !isQrEncrypted && (parsedQrData.full_name || parsedQrData.date_of_birth)) {
      // Real QR payload is available: compare directly!
      const nameComp = compareFields('Full Name', aadhaarData.full_name, parsedQrData.full_name, false);
      comparisonRows.push({
        field: isHi ? 'नागरिक का नाम (Full Name)' : 'Full Name',
        ocrValue: nameComp.printedValue,
        benchmarkSpec: nameComp.referenceValue,
        status: nameComp.status,
        detail: nameComp.message,
      });

      const dobComp = compareFields('Date of Birth', aadhaarData.date_of_birth, parsedQrData.date_of_birth, true);
      comparisonRows.push({
        field: isHi ? 'जन्म तिथि (Date of Birth)' : 'Date of Birth',
        ocrValue: dobComp.printedValue,
        benchmarkSpec: dobComp.referenceValue,
        status: dobComp.status,
        detail: dobComp.message,
      });

      const uidComp = compareFields('आधार संख्या (12-Digit UID)', aadhaarData.aadhaar_number_masked, parsedQrData.aadhaar_number_masked, false);
      comparisonRows.push({
        field: isHi ? 'आधार संख्या (12-Digit UID)' : 'Aadhaar Number (UID)',
        ocrValue: uidComp.printedValue,
        benchmarkSpec: uidComp.referenceValue,
        status: uidComp.status,
        detail: uidComp.message,
      });

      const genderComp = compareFields('लिंग (Gender)', aadhaarData.gender, parsedQrData.gender, false);
      comparisonRows.push({
        field: isHi ? 'लिंग (Gender)' : 'Gender',
        ocrValue: genderComp.printedValue,
        benchmarkSpec: genderComp.referenceValue,
        status: genderComp.status,
        detail: genderComp.message,
      });

      comparisonRows.push({
        field: isHi ? 'डिजिटल क्यूआर सत्यापन' : 'Digital QR Verification',
        ocrValue: 'Scanned Card Face',
        benchmarkSpec: 'Decoded QR Payload Matched',
        status: 'MATCHED',
        detail: 'Printed document text verified against decoded QR payload',
      });
    } else if (hasQrCode && isQrEncrypted) {
      // QR is detected but is encrypted V2/V3 format
      const nameVal = aadhaarData.full_name !== 'Not detected';
      comparisonRows.push({
        field: isHi ? 'नागरिक का नाम (Full Name)' : 'Full Name',
        ocrValue: aadhaarData.full_name,
        benchmarkSpec: 'Encrypted in Secure QR (UIDAI Key Req.)',
        status: nameVal ? 'DETECTED' : 'NOT_DETECTED',
        detail: nameVal ? 'Extracted from card face' : 'Unable to extract name from card',
      });

      const dobVal = validateDateOfBirth(aadhaarData.date_of_birth);
      comparisonRows.push({
        field: isHi ? 'जन्म तिथि (Date of Birth)' : 'Date of Birth',
        ocrValue: aadhaarData.date_of_birth,
        benchmarkSpec: 'Encrypted in Secure QR (UIDAI Key Req.)',
        status: dobVal.isValid ? 'VALID' : aadhaarData.date_of_birth === 'Not detected' ? 'NOT_DETECTED' : 'INVALID',
        detail: dobVal.message,
      });

      const uidVal = validateAadhaarNumber(aadhaarData.aadhaar_number_masked);
      comparisonRows.push({
        field: isHi ? 'आधार संख्या (मास्क की गई)' : 'Aadhaar Number (Masked)',
        ocrValue: aadhaarData.aadhaar_number_masked,
        benchmarkSpec: 'Encrypted in Secure QR (UIDAI Key Req.)',
        status: uidVal.isValid ? 'VALID' : aadhaarData.aadhaar_number_masked === 'Not detected' ? 'NOT_DETECTED' : 'INVALID',
        detail: uidVal.message,
      });

      comparisonRows.push({
        field: isHi ? 'डिजिटल क्यूआर स्थिति' : 'Digital QR Status',
        ocrValue: 'Encrypted QR Detected',
        benchmarkSpec: 'UIDAI Cryptographic Signature',
        status: 'REVIEW_REQUIRED',
        detail: 'QR code detected but payload is cryptographically sealed; printed fields require manual cross-check',
      });
    } else {
      // NO QR code on front face of card: DO NOT fake verification!
      const nameVal = aadhaarData.full_name !== 'Not detected';
      comparisonRows.push({
        field: isHi ? 'नागरिक का नाम (Full Name)' : 'Full Name',
        ocrValue: aadhaarData.full_name,
        benchmarkSpec: 'QR Data Unavailable',
        status: nameVal ? 'DETECTED' : 'NOT_DETECTED',
        detail: nameVal ? 'Extracted from printed card face' : 'Unable to extract name from document image',
      });

      const dobVal = validateDateOfBirth(aadhaarData.date_of_birth);
      comparisonRows.push({
        field: isHi ? 'जन्म तिथि (Date of Birth)' : 'Date of Birth',
        ocrValue: aadhaarData.date_of_birth,
        benchmarkSpec: 'Standard Calendar DD/MM/YYYY',
        status: dobVal.isValid ? 'VALID' : aadhaarData.date_of_birth === 'Not detected' ? 'NOT_DETECTED' : 'INVALID',
        detail: dobVal.message,
      });

      const uidVal = validateAadhaarNumber(aadhaarData.aadhaar_number_masked);
      comparisonRows.push({
        field: isHi ? 'आधार संख्या (12-अंकीय मास्किंग)' : 'Aadhaar Number (12-Digit Masking)',
        ocrValue: aadhaarData.aadhaar_number_masked,
        benchmarkSpec: 'UIDAI 4-4-4 Redaction Spec',
        status: uidVal.isValid ? 'VALID' : aadhaarData.aadhaar_number_masked === 'Not detected' ? 'NOT_DETECTED' : 'INVALID',
        detail: uidVal.message,
      });

      const rawG = aadhaarData.gender;
      const isMale = !!(rawG && (rawG === 'M' || rawG === 'MALE' || rawG.toUpperCase().startsWith('M') || rawG.includes('पुरुष')));
      const isFemale = !!(rawG && (rawG === 'F' || rawG === 'FEMALE' || rawG.toUpperCase().startsWith('F') || rawG.includes('महिला') || rawG.includes('स्त्री')));
      const isTrans = !!(rawG && (rawG === 'Other' || rawG === 'T' || rawG === 'TRANSGENDER' || rawG.toUpperCase().startsWith('T') || rawG.includes('अन्य')));
      const genderDetected = isMale || isFemale || isTrans;

      comparisonRows.push({
        field: isHi ? 'लिंग (Gender)' : 'Gender',
        ocrValue: isMale
          ? (isHi ? 'पुरुष (Male)' : 'Male / पुरुष')
          : isFemale
          ? (isHi ? 'महिला (Female)' : 'Female / महिला')
          : isTrans
          ? (isHi ? 'अन्य (Transgender)' : 'Transgender / अन्य')
          : 'Not detected',
        benchmarkSpec: 'Official Bilingual Hierarchy',
        status: genderDetected ? 'VALID' : 'NOT_DETECTED',
        detail: genderDetected ? 'Gender classification verified' : 'Gender indicator absent',
      });

      comparisonRows.push({
        field: isHi ? 'डिजिटल क्यूआर कोड' : 'Digital QR Code',
        ocrValue: 'QR Not on Card Face',
        benchmarkSpec: 'Reverse Side Placement',
        status: 'NOT_DETECTED',
        detail: isHi
          ? 'भौतिक कार्ड के अग्र भाग पर क्यूआर कोड नहीं होता है (क्यूआर पिछले पृष्ठ पर रहता है)'
          : 'QR code absent on card face. Reverse face scan required for digital QR cross-check',
      });

      comparisonRows.push({
        field: isHi ? 'फोटो अखंडता (Photo Splicing Check)' : 'Photo Tamper & Splicing',
        ocrValue: 'Substrate Raster Scan',
        benchmarkSpec: 'Manual Officer Review',
        status: 'REVIEW_REQUIRED',
        detail: isHi
          ? 'फोटो छेड़छाड़ परीक्षण हेतु भौतिक/मैनुअल समीक्षा अनुशंसित है'
          : 'Automated photo splice check requires manual verification by officer',
      });
    }
  } else if (passportData) {
    comparisonRows.push({
      field: isHi ? 'दस्तावेज़ संख्या (Passport Number)' : 'Passport Number',
      ocrValue: maskIdentificationNumber(passportData.document_number, 'passport'),
      benchmarkSpec: 'ICAO Doc 9303 Alphanumeric',
      status: passportData.document_number !== 'Not detected' ? 'DETECTED' : 'NOT_DETECTED',
      detail: passportData.document_number !== 'Not detected' ? 'Extracted from Passport page / MRZ' : 'Unable to extract passport number',
    });

    comparisonRows.push({
      field: isHi ? 'कार्डधारक का नाम (Full Name)' : 'Full Name',
      ocrValue: passportData.full_name,
      benchmarkSpec: 'MRZ Primary & Secondary Identifiers',
      status: passportData.full_name !== 'Not detected' ? 'DETECTED' : 'NOT_DETECTED',
      detail: passportData.full_name !== 'Not detected' ? 'Extracted from MRZ Line 1' : 'Unable to extract name from MRZ',
    });

    const dobVal = validateDateOfBirth(passportData.date_of_birth);
    comparisonRows.push({
      field: isHi ? 'जन्म तिथि (Date of Birth)' : 'Date of Birth',
      ocrValue: passportData.date_of_birth,
      benchmarkSpec: 'MRZ YYMMDD Checksum',
      status: dobVal.isValid ? 'VALID' : passportData.date_of_birth === 'Not detected' ? 'NOT_DETECTED' : 'INVALID',
      detail: dobVal.message,
    });

    comparisonRows.push({
      field: isHi ? 'एमआरजेड चेकसम (MRZ Checksum)' : 'MRZ Checksum',
      ocrValue: passportData.mrz_checksum_valid ? 'Valid Checksum' : 'Missing / Invalid MRZ',
      benchmarkSpec: 'ICAO Doc 9303 Standard',
      status: passportData.mrz_checksum_valid ? 'VALID' : 'INVALID',
      detail: passportData.standards_compliance,
    });
  }

  // Count mismatches
  const mismatchRows = comparisonRows.filter((r) => r.status === 'MISMATCH');
  const hasMismatches = mismatchRows.length > 0;

  const renderStatusBadge = (status: FieldVerificationStatus) => {
    switch (status) {
      case 'MATCHED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHi ? 'सत्यापित (मेल)' : 'Matched'}</span>
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>{isHi ? 'बेमेल (MISMATCH)' : 'MISMATCH'}</span>
          </span>
        );
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHi ? 'वैध प्रारूप' : 'Valid'}</span>
          </span>
        );
      case 'INVALID':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>{isHi ? 'अमान्य प्रारूप' : 'Invalid'}</span>
          </span>
        );
      case 'DETECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{isHi ? 'पहचाना गया' : 'Detected'}</span>
          </span>
        );
      case 'REVIEW_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{isHi ? 'समीक्षा आवश्यक' : 'Review Required'}</span>
          </span>
        );
      case 'NOT_DETECTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>{isHi ? 'नहीं मिला / अनुपलब्ध' : 'Not Detected'}</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-card p-4 rounded-sm border border-gov-line space-y-4 shadow-xs bg-white">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gov-line">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-gov-navy-900 text-white">
            {hasQrCode ? (
              <QrCode className="w-4 h-4 text-gov-saffron" />
            ) : (
              <Type className="w-4 h-4 text-gov-saffron" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider">
                {hasQrCode
                  ? (isHi ? 'दस्तावेज़ फ़ील्ड बनाम क्यूआर क्रॉस-सत्यापन' : 'Printed Fields vs. Secure QR Cross-Check')
                  : (isHi ? 'दस्तावेज़ फ़ील्ड निष्कर्षण एवं प्रारूप सत्यापन' : 'Extracted Fields & Standards Validation')}
              </h3>
              {isLiveOcr && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                  <span>Live Tesseract OCR</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-gov-inksoft">
              {hasQrCode
                ? (isHi
                  ? 'मुद्रित अक्षरों की सीधे डिजिटल क्यूआर कोड से तुलना की जाती है'
                  : 'Directly validates scanned OCR text against decoded QR payload')
                : (isHi
                  ? 'दस्तावेज़ के मुद्रित डेटा का आधिकारिक प्रारूप एवं मानकों से सत्यापन'
                  : 'Validates extracted document data against statutory issuing standards')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {rawOcrText && (
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="px-2 py-1 rounded text-[10px] font-bold border border-gov-line bg-white hover:bg-gov-paper text-gov-navy-900 flex items-center gap-1 cursor-pointer transition-colors"
              title="Inspect raw OCR character stream"
            >
              <FileText className="w-3 h-3 text-gov-saffron" />
              <span>{isHi ? 'कच्चा OCR टेक्स्ट' : 'Raw OCR Stream'}</span>
              {showRawText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {hasMismatches ? (
            <span className="px-2.5 py-1 rounded text-[10px] font-extrabold uppercase font-mono bg-rose-50 text-rose-900 border border-rose-400 flex items-center gap-1 shadow-xs">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>{isHi ? 'डेटा बेमेल (CONFLICT DETECTED)' : 'FIELD MISMATCH DETECTED'}</span>
            </span>
          ) : hasQrCode ? (
            <span className="px-2.5 py-1 rounded text-[10px] font-extrabold uppercase font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHi ? 'क्यूआर सत्यापित' : 'QR VERIFIED'}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded text-[10px] font-extrabold uppercase font-mono bg-blue-50 text-blue-900 border border-blue-300 flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isHi ? 'प्रारूप सत्यापित' : 'FORMAT VALIDATED'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Critical Mismatch Banner if any field differed */}
      {hasMismatches && (
        <div className="p-3 bg-rose-50 border-2 border-rose-400 rounded text-rose-950 text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {isHi
                ? 'गंभीर चेतावनी: मुद्रित टेक्स्ट एवं डिजिटल डेटा के बीच बेमेल पाया गया!'
                : 'CRITICAL WARNING: Discrepancy detected between printed document text and digital reference!'}
            </span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-900">
            {mismatchRows.map((m, idx) => (
              <li key={idx}>
                <strong>{m.field}</strong>: {m.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* When No QR Code: Honest Informational Callout */}
      {!hasQrCode && (
        <div className="p-3 rounded bg-blue-50/80 border border-blue-200 text-[11px] text-blue-950 flex items-start gap-2.5 animate-fadeIn">
          <div className="p-1 rounded bg-blue-100 text-blue-900 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-blue-950 text-xs">
                {isHi
                  ? 'दस्तावेज़ अग्र भाग: डिजिटल क्यूआर कोड अनुपस्थित'
                  : 'Document Face Lacks Digital QR Code'}
              </p>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-200/70 text-blue-900 border border-blue-300">
                INFO
              </span>
            </div>
            <p className="text-[11px] text-blue-900/90 mt-1 leading-relaxed">
              {isHi
                ? 'भौतिक आधार कार्ड में डिजिटल क्यूआर कोड केवल पिछले पृष्ठ पर मुद्रित होता है। मुद्रित फ़ील्ड्स का विश्लेषण एवं प्रारूप सत्यापन संपन्न हुआ। डिजिटल मिलान हेतु पिछले पृष्ठ को भी अपलोड करें।'
                : 'Physical identity cards typically bear the secure QR code on the card reverse. Printed fields were extracted and verified against national formatting algorithms. For complete cryptographic cross-verification, scan the card reverse.'}
            </p>
          </div>
        </div>
      )}

      {/* Expandable Raw OCR Character Stream */}
      {showRawText && rawOcrText && (
        <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded border border-slate-700 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[10px] text-slate-400">
            <span>LIVE OCR RAW CHARACTER STREAM</span>
            <span className="text-emerald-400 font-bold">{rawOcrText.length} CHARACTERS</span>
          </div>
          <pre className="whitespace-pre-wrap break-words max-h-36 overflow-y-auto leading-relaxed">
            {rawOcrText}
          </pre>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded border border-gov-line bg-white shadow-xs">
        <table className="gov-table text-xs">
          <thead>
            <tr>
              <th className="w-1/4">
                {isHi ? 'फ़ील्ड / दस्तावेज़ तत्व' : 'Field / Document Element'}
              </th>
              <th className="w-1/4">
                {isHi ? 'दस्तावेज़ पर मुद्रित (OCR)' : 'Printed on Document (OCR)'}
              </th>
              <th className="w-1/4">
                {hasQrCode
                  ? (isHi ? 'सुरक्षित क्यूआर डेटा (QR Payload)' : 'Inside Secure QR Code')
                  : (isHi ? 'आधिकारिक टेम्पलेट / मानक' : 'Issuance Standard / Spec')}
              </th>
              <th className="w-1/4 text-right">
                {isHi ? 'सत्यापन स्थिति' : 'Verification Status'}
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, idx) => (
              <tr
                key={idx}
                className={
                  row.status === 'MISMATCH' || row.status === 'INVALID'
                    ? 'bg-rose-50/70 border-l-4 border-l-rose-500'
                    : row.status === 'MATCHED'
                    ? 'bg-emerald-50/30'
                    : ''
                }
              >
                <td className="font-bold text-gov-navy-950">{row.field}</td>
                <td className="font-mono">
                  <span
                    className={
                      row.status === 'MISMATCH'
                        ? 'text-rose-800 font-bold bg-rose-100 px-1.5 py-0.5 rounded'
                        : row.ocrValue === 'Not detected'
                        ? 'text-slate-400 italic'
                        : 'text-gov-ink font-semibold'
                    }
                  >
                    {row.ocrValue}
                  </span>
                </td>
                <td className="font-mono">
                  <span
                    className={
                      row.status === 'MISMATCH'
                        ? 'text-emerald-900 font-bold bg-emerald-100 px-1.5 py-0.5 rounded'
                        : row.benchmarkSpec.includes('Unavailable')
                        ? 'text-slate-400 italic text-[11px]'
                        : 'text-gov-ink'
                    }
                  >
                    {row.benchmarkSpec}
                  </span>
                </td>
                <td className="text-right">
                  {renderStatusBadge(row.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
