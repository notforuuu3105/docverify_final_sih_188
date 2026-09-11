import React from 'react';
import { PassportOcrData, VisaOcrData, WatchlistQueryResult } from '../../lib/types';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  User,
  Calendar,
  Globe,
  Hash,
  Clock,
  Fingerprint,
} from 'lucide-react';

interface OcrMrzProfileCardProps {
  passportData?: PassportOcrData;
  visaData?: VisaOcrData;
  watchlistQuery?: WatchlistQueryResult;
}

export const OcrMrzProfileCard: React.FC<OcrMrzProfileCardProps> = ({
  passportData,
  visaData,
  watchlistQuery,
}) => {
  if (!passportData && !visaData) {
    return (
      <div className="p-6 text-center text-gov-inksoft border border-dashed border-gov-line rounded-sm">
        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-semibold">No OCR / MRZ extracted data available for this document.</p>
      </div>
    );
  }

  const isMrzValid = passportData?.mrz_checksum_valid ?? true;
  const isInterpolCleared = watchlistQuery?.interpol_sltd_status === 'CLEARED';
  const isLocCleared = watchlistQuery?.mha_loc_status === 'NO_ADVERSE_RECORD';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Watchlist & Database Interdiction Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* INTERPOL SLTD Query */}
        <div
          className={`p-3 rounded-sm border flex items-center justify-between ${
            isInterpolCleared
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-400 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isInterpolCleared ? (
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block font-mono">
                INTERPOL SLTD DATABASE
              </span>
              <span className="text-xs font-extrabold">
                {isInterpolCleared
                  ? 'CLEARED (Zero Matches in Stolen Database)'
                  : 'FLAGGED: 1 MATCH (REPORTED STOLEN)'}
              </span>
            </div>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
              isInterpolCleared
                ? 'bg-white border-emerald-300 text-emerald-800'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {isInterpolCleared ? 'SECURE' : 'ALERT'}
          </span>
        </div>

        {/* National Lookout Circular (LOC) Query */}
        <div
          className={`p-3 rounded-sm border flex items-center justify-between ${
            isLocCleared
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-400 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isLocCleared ? (
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block font-mono">
                NATIONAL LOOKOUT CIRCULAR (LOC)
              </span>
              <span className="text-xs font-extrabold">
                {isLocCleared ? 'NO ADVERSE RECORD' : 'INTERDICTION REQUIRED (LOC ACTIVE)'}
              </span>
            </div>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
              isLocCleared
                ? 'bg-white border-emerald-300 text-emerald-800'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {isLocCleared ? 'CLEAR' : 'DETAIN'}
          </span>
        </div>
      </div>

      {/* 2. Module 1: Extracted Identity Fields Card */}
      {passportData && (
        <div className="glass-card p-4 rounded-sm border border-gov-line space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-gov-line">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gov-navy-900" />
              <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider">
                Module 1: OCR Extracted Travel Identity Profile
              </h3>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                passportData.standards_compliance === 'ICAO Doc 9303 Compliant'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {passportData.standards_compliance === 'ICAO Doc 9303 Compliant' ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-700" />
              )}
              {passportData.standards_compliance}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Field 1: Document Number */}
            <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
              <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block flex items-center gap-1">
                <Hash className="w-3 h-3 text-gov-navy-900" /> Passport Number
              </span>
              <span className="font-mono font-extrabold text-gov-navy-950 text-sm mt-0.5 block">
                {passportData.document_number}
              </span>
            </div>

            {/* Field 2: Full Name */}
            <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm col-span-2">
              <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block flex items-center gap-1">
                <User className="w-3 h-3 text-gov-navy-900" /> Passenger Full Name
              </span>
              <span className="font-extrabold text-gov-navy-950 text-xs mt-0.5 block truncate">
                {passportData.full_name}
              </span>
            </div>

            {/* Field 3: Nationality */}
            <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
              <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block flex items-center gap-1">
                <Globe className="w-3 h-3 text-gov-navy-900" /> Nationality / Code
              </span>
              <span className="font-mono font-bold text-gov-navy-950 text-xs mt-0.5 block">
                {passportData.nationality} ({passportData.issuing_country})
              </span>
            </div>

            {/* Field 4: Date of Birth & Gender */}
            <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
              <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gov-navy-900" /> Date of Birth / Sex
              </span>
              <span className="font-mono font-bold text-gov-navy-950 text-xs mt-0.5 block">
                {passportData.date_of_birth} • {passportData.gender === 'M' ? 'MALE' : passportData.gender === 'F' ? 'FEMALE' : 'X'}
              </span>
            </div>

            {/* Field 5: Date of Expiry */}
            <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
              <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3 text-gov-navy-900" /> Expiration Date
              </span>
              <span className="font-mono font-bold text-gov-navy-950 text-xs mt-0.5 block">
                {passportData.date_of_expiry}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Module 2: ICAO Doc 9303 MRZ Checksum Reader & Validator */}
      {passportData && (
        <div className="glass-card p-4 rounded-sm border border-gov-line space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-gov-line">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-gov-saffron-dark" />
              <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider">
                Module 2: Machine Readable Zone (MRZ) & Check-Digit Validation
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isMrzValid
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
              }`}
            >
              {isMrzValid ? '✓ CHECKSUM VERIFIED (MODULUS 7-3-1)' : '⚠️ CHECKSUM COMPUTATION FAILURE'}
            </span>
          </div>

          <p className="text-[11px] text-gov-inksoft">
            Decodes 2x44 character OCR-B string in accordance with ICAO Document 9303 standards. Checks composite hashes of passport number, birth date, and expiry.
          </p>

          {/* 2-Line MRZ Box */}
          <div className="p-3 bg-slate-900 text-white rounded-sm border border-slate-700 font-mono text-xs overflow-x-auto shadow-inner space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
              <span>LINE 1 (DOCUMENT CODE, COUNTRY, SURNAME, GIVEN NAMES)</span>
              <span className="text-emerald-400">44 CHARS</span>
            </div>
            <p className="text-emerald-400 tracking-[0.25em] font-bold text-xs sm:text-sm whitespace-nowrap">
              {passportData.mrz_line1}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1 pt-1.5">
              <span>LINE 2 (NUMBER, CHECK DIGIT, DOB, SEX, EXPIRY, COMPOSITE CHECK)</span>
              <span className={isMrzValid ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                {isMrzValid ? 'CHECKSUM PASS' : 'CHECKSUM FAIL'}
              </span>
            </div>
            <p
              className={`tracking-[0.25em] font-bold text-xs sm:text-sm whitespace-nowrap ${
                isMrzValid ? 'text-emerald-400' : 'text-rose-400 underline decoration-rose-500'
              }`}
            >
              {passportData.mrz_line2}
            </p>
          </div>

          {!isMrzValid && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-sm text-rose-950 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold">Cryptographic Check-Digit Mismatch Detected:</strong>
                <span className="text-[11px] text-rose-800">
                  The printed check digit does not match the calculated Modulus 7-3-1 weight on birth year or expiry date. This indicates high probability of manual font replacement on the visual zone without updating the algorithmic check string.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
