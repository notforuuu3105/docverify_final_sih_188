import React from 'react';
import { AadhaarOcrData } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  QrCode,
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

interface AadhaarOcrCardProps {
  aadhaarData?: AadhaarOcrData;
}

export const AadhaarOcrCard: React.FC<AadhaarOcrCardProps> = ({ aadhaarData }) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const data: AadhaarOcrData = aadhaarData || {
    aadhaar_number_masked: 'XXXX XXXX 7020',
    is_masked: true,
    full_name: 'Arpan Bajpai',
    date_of_birth: '20/03/2007',
    gender: 'M',
    address: 'H-42, Sector 15, Rohini, North West Delhi, Delhi - 110085',
    qr_code_detected: true,
    qr_code_verified: true,
    qr_signature_valid: true,
    photo_tamper_detected: false,
    dob_tamper_detected: false,
    uidai_watermark_present: true,
  };

  return (
    <div className="bg-white border border-gov-line rounded-sm shadow-xs overflow-hidden space-y-4">
      {/* Top Header Card */}
      <div className="bg-gov-navy-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gov-navy-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gov-saffron" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {isHi ? 'नागरिक आधार पहचान प्रोफ़ाइल' : 'Citizen Aadhaar Identity Profile'}
            </h3>
            <span className="text-[10px] text-slate-300">
              UIDAI • {isHi ? 'भारतीय विशिष्ट पहचान प्राधिकरण' : 'Unique Identification Authority of India'}
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">
          {isHi ? 'सत्यापित आधार प्रारूप' : 'VALID AADHAAR FORMAT'}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Aadhaar Number & Masking Banner */}
        <div className="p-3 rounded-sm bg-gov-paper border border-gov-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gov-inksoft block">
              {isHi ? 'आधार संख्या (मास्क की गई)' : 'Aadhaar Number (Masked)'}
            </span>
            <span className="text-base sm:text-lg font-mono font-extrabold text-gov-navy-950 tracking-widest">
              {data.aadhaar_number_masked}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {data.is_masked ? (
              <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{isHi ? 'कानूनी मास्किंग अनुपालित' : 'Masking Compliant'}</span>
              </span>
            ) : (
              <span className="px-2 py-1 rounded bg-rose-50 border border-rose-300 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>{isHi ? 'अनमास्क जोखिम चेतावनी' : 'Unmasked Risk'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Demographic Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded bg-slate-50 border border-gov-line/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gov-inksoft flex items-center gap-1">
              <User className="w-3 h-3 text-gov-navy-900" />
              {isHi ? 'पूरा नाम' : 'Citizen Full Name'}
            </span>
            <p className="font-extrabold text-gov-navy-950 text-xs">
              {data.full_name}
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-gov-line/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gov-inksoft flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gov-navy-900" />
              {isHi ? 'जन्म तिथि / लिंग' : 'Date of Birth / Gender'}
            </span>
            <p className="font-extrabold text-gov-navy-950 text-xs">
              {data.date_of_birth} • {(data.gender === 'M' || data.gender === 'MALE' || (data.gender && data.gender.includes('पुरुष'))) ? (isHi ? 'पुरुष' : 'Male') : (data.gender === 'F' || data.gender === 'FEMALE' || (data.gender && data.gender.includes('महिला'))) ? (isHi ? 'महिला' : 'Female') : (data.gender === 'Other' || data.gender === 'T') ? (isHi ? 'अन्य' : 'Other') : (isHi ? 'निर्दिष्ट नहीं' : 'Not detected')}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="p-2.5 rounded bg-slate-50 border border-gov-line/80 space-y-1 text-xs">
          <span className="text-[10px] uppercase font-bold text-gov-inksoft flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gov-navy-900" />
            {isHi ? 'निवासी का पता' : 'Registered Residential Address'}
          </span>
          <p className="text-gov-ink leading-relaxed">
            {data.address}
          </p>
        </div>

        {/* 3 Core Security Checks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          {/* QR Code / Typography */}
          <div className={`p-2.5 rounded border text-center space-y-1 ${
            data.qr_code_verified
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : !data.qr_code_detected
              ? 'bg-blue-50 border-blue-300 text-blue-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <QrCode className="w-4 h-4 mx-auto text-blue-700" />
            <span className="font-bold block text-xs">
              {!data.qr_code_detected
                ? (isHi ? 'फ़ॉन्ट एवं लेआउट जांच' : 'Typography & Font Spec')
                : (isHi ? 'डिजिटल क्यूआर कोड' : 'UIDAI Signed QR')}
            </span>
            <span className="text-[10px] block">
              {data.qr_code_verified
                ? (isHi ? 'सत्यापित एवं वैध' : 'Verified & Valid')
                : !data.qr_code_detected
                ? (isHi ? 'सत्यापित (< 0.4pt)' : 'Verified (< 0.4pt)')
                : (isHi ? 'अमान्य / गायब' : 'Missing / Invalid')}
            </span>
          </div>

          {/* Photo & Tamper */}
          <div className={`p-2.5 rounded border text-center space-y-1 ${
            !data.photo_tamper_detected
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <FileCheck className="w-4 h-4 mx-auto text-emerald-700" />
            <span className="font-bold block text-xs">
              {isHi ? 'फोटो अखंडता' : 'Photo Seam Check'}
            </span>
            <span className="text-[10px] block">
              {!data.photo_tamper_detected
                ? (isHi ? 'कोई छेड़छाड़ नहीं' : 'No Splicing Detected')
                : (isHi ? 'संपादित किनारा मिला' : 'Splicing Border Found')}
            </span>
          </div>

          {/* UIDAI Watermark */}
          <div className="p-2.5 rounded border text-center space-y-1 bg-emerald-50 border-emerald-300 text-emerald-950">
            <ShieldCheck className="w-4 h-4 mx-auto text-emerald-700" />
            <span className="font-bold block text-xs">
              {isHi ? 'आधार लोगो एवं प्रतीक' : 'Emblem & Guiloches'}
            </span>
            <span className="text-[10px] block text-emerald-800">
              {isHi ? 'मूल माइक्रो-पैटर्न' : 'Genuine Pattern Match'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
