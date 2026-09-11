import React, { useRef, useState } from 'react';
import { Upload, FileText, X, RefreshCw, Hash, Lock } from 'lucide-react';
import { calculateSHA256 } from '../../lib/utils/hashing';
import { formatBytes } from '../../lib/utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

export type DocumentCategory = 
  | 'identity' 
  | 'academic' 
  | 'legal' 
  | 'financial'
  | 'passport' 
  | 'visa' 
  | 'national_id' 
  | 'border_permit';

export type UploadFileFormat = 'pdf' | 'scanner_flatbed' | 'mobile_camera';

export interface SubtypeSpec {
  id: string;
  name: string;
  nameHi: string;
  authority: string;
}

export const CATEGORY_DEFINITIONS: Record<
  string,
  {
    labelEn: string;
    labelHi: string;
    subtypes: SubtypeSpec[];
  }
> = {
  identity: {
    labelEn: 'Citizen Identity Cards',
    labelHi: 'नागरिक पहचान पत्र',
    subtypes: [
      {
        id: 'aadhaar',
        name: 'Aadhaar Card',
        nameHi: 'आधार कार्ड',
        authority: 'UIDAI',
      },
      {
        id: 'pan',
        name: 'PAN Card',
        nameHi: 'पैन कार्ड',
        authority: 'Income Tax Dept',
      },
      {
        id: 'voter',
        name: 'Voter ID Card (EPIC)',
        nameHi: 'मतदाता पहचान पत्र (EPIC)',
        authority: 'Election Commission of India',
      },
      {
        id: 'passport_regular',
        name: 'Indian Passport',
        nameHi: 'भारतीय पासपोर्ट',
        authority: 'Ministry of External Affairs',
      },
      {
        id: 'driving_license',
        name: 'Driving License',
        nameHi: 'ड्राइविंग लाइसेंस',
        authority: 'MoRTH Transport Dept',
      },
    ],
  },
  academic: {
    labelEn: 'Academic & Educational Certificates',
    labelHi: 'शैक्षणिक प्रमाण पत्र',
    subtypes: [
      {
        id: 'marksheet',
        name: '10th / 12th Board Marksheet',
        nameHi: '10वीं / 12वीं बोर्ड अंकतालिका',
        authority: 'State Board / CBSE / CISCE',
      },
      {
        id: 'degree_certificate',
        name: 'University Degree Certificate',
        nameHi: 'विश्वविद्यालय डिग्री प्रमाण पत्र',
        authority: 'UGC / Recognized University',
      },
      {
        id: 'diploma_cert',
        name: 'Technical Diploma Certificate',
        nameHi: 'तकनीकी डिप्लोमा प्रमाण पत्र',
        authority: 'Technical Education Board',
      },
    ],
  },
  legal: {
    labelEn: 'Legal & Property Documents',
    labelHi: 'कानूनी एवं संपत्ति दस्तावेज़',
    subtypes: [
      {
        id: 'stamp_paper',
        name: 'Non-Judicial Stamp Paper',
        nameHi: 'गैर-न्यायिक स्टाम्प पेपर',
        authority: 'State Revenue Department',
      },
      {
        id: 'sale_deed',
        name: 'Property Sale Deed / Registry',
        nameHi: 'संपत्ति बिक्री विलेख / रजिस्ट्री',
        authority: 'Sub-Registrar Office',
      },
      {
        id: 'court_affidavit',
        name: 'Notarized Legal Affidavit',
        nameHi: 'शपथ पत्र / कानूनी हलफनामा',
        authority: 'Notary Public / High Court',
      },
    ],
  },
  financial: {
    labelEn: 'Financial & Business Documents',
    labelHi: 'वित्तीय एवं व्यावसायिक दस्तावेज़',
    subtypes: [
      {
        id: 'gst_invoice',
        name: 'Commercial GST Tax Invoice',
        nameHi: 'व्यावसायिक जीएसटी टैक्स इनवॉइस',
        authority: 'GSTN / Ministry of Finance',
      },
      {
        id: 'bank_statement',
        name: 'Certified Bank Account Statement',
        nameHi: 'प्रमाणित बैंक खाता विवरण',
        authority: 'Reserve Bank of India Guidelines',
      },
    ],
  },
};

interface FileUploadZoneProps {
  onFileSelected: (file: File, fileHash: string, previewUrl?: string) => void;
  selectedFile: File | null;
  fileHash: string;
  onClearFile: () => void;
  category: DocumentCategory | '';
  onSelectCategory: (cat: DocumentCategory | '') => void;
  subtype: string;
  onSelectSubtype: (sub: string) => void;
  uploadFormat?: UploadFileFormat | '';
  onSelectFormat?: (fmt: UploadFileFormat | '') => void;
  officerName?: string;
  officerBadge?: string;
  caseRef?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelected,
  selectedFile,
  fileHash,
  onClearFile,
  category,
  onSelectCategory,
  subtype,
  onSelectSubtype,
  uploadFormat,
  onSelectFormat,
  officerName = 'Officer R. Sharma',
  officerBadge = 'GOV-CYBER-884',
  caseRef = 'CASE-GOI-2026-7841',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const currentCategoryDef = category && category in CATEGORY_DEFINITIONS ? CATEGORY_DEFINITIONS[category] : null;
  const currentSubtypes = currentCategoryDef ? currentCategoryDef.subtypes : [];
  const activeSubtype = subtype ? currentSubtypes.find((s) => s.id === subtype) : null;
  const isUploadUnlocked = Boolean(category && subtype);

  const handleProcessFile = async (file: File) => {
    setIsHashing(true);
    try {
      const hash = await calculateSHA256(file);
      let previewUrl: string | undefined = undefined;

      if (file.type.startsWith('image/')) {
        previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        });
      } else if (file.type === 'application/pdf') {
        previewUrl = undefined;
      }

      onFileSelected(file, hash, previewUrl);
    } catch (err) {
      console.error('Failed to hash file:', err);
      onFileSelected(file, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    } finally {
      setIsHashing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploadUnlocked) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isUploadUnlocked) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Document Classification & Type Selector */}
      <div className="bg-white border border-gov-line rounded-sm p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-line/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gov-navy-900" />
            <span className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider">
              {isHi ? 'दस्तावेज़ प्रकार का चयन' : 'Document Type Selection'}
            </span>
          </div>
          {activeSubtype ? (
            <span className="text-[11px] font-mono font-semibold text-gov-inksoft bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              {isHi ? 'जारीकर्ता प्राधिकरण:' : 'Issuing Authority:'}{' '}
              <strong className="text-gov-navy-900">{activeSubtype.authority}</strong>
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-400">
              {isHi ? 'चरण 1 और 2 का चयन करें' : 'Select Step 1 & 2'}
            </span>
          )}
        </div>

        {/* Category & Specific Subtype Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-gov-navy-950 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{isHi ? '१. दस्तावेज़ श्रेणी (Category)' : '1. Document Category'}</span>
              <span className="text-[10px] font-mono font-bold">
                {!category ? (
                  <span className="text-amber-600 font-semibold">{isHi ? 'चयन आवश्यक' : 'Required'}</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">{isHi ? '✓ चयनित' : '✓ Selected'}</span>
                )}
              </span>
            </label>
            <select
              value={category || ''}
              onChange={(e) => {
                const newCat = e.target.value as DocumentCategory;
                onSelectCategory(newCat);
                onSelectSubtype('');
              }}
              className="w-full text-xs font-semibold px-2.5 py-2 border border-gov-line rounded bg-white text-gov-navy-950 focus:outline-none focus:ring-1 focus:ring-gov-navy-900 cursor-pointer"
            >
              <option value="" disabled>
                {isHi ? '-- दस्तावेज़ श्रेणी का चयन करें --' : '-- Choose Document Category --'}
              </option>
              {Object.entries(CATEGORY_DEFINITIONS).map(([catKey, catDef]) => (
                <option key={catKey} value={catKey}>
                  {isHi ? catDef.labelHi : catDef.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gov-navy-950 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{isHi ? '२. विशिष्ट दस्तावेज़ प्रकार (Specific Type)' : '2. Specific Document Type'}</span>
              <span className="text-[10px] font-mono font-bold">
                {!category ? (
                  <span className="text-slate-400 font-normal">{isHi ? 'अवरुद्ध (Locked)' : 'Locked'}</span>
                ) : !subtype ? (
                  <span className="text-amber-600 font-semibold">{isHi ? 'चयन आवश्यक' : 'Required'}</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">{isHi ? '✓ चयनित' : '✓ Selected'}</span>
                )}
              </span>
            </label>
            <select
              value={subtype || ''}
              disabled={!category}
              onChange={(e) => onSelectSubtype(e.target.value)}
              className={`w-full text-xs font-semibold px-2.5 py-2 border rounded transition-all cursor-pointer ${
                !category
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'border-gov-line bg-white text-gov-navy-950 focus:outline-none focus:ring-1 focus:ring-gov-navy-900'
              }`}
            >
              {!category ? (
                <option value="" disabled>
                  {isHi ? '-- पहले दस्तावेज़ श्रेणी चुनें --' : '-- Select Category First --'}
                </option>
              ) : (
                <option value="" disabled>
                  {isHi ? '-- विशिष्ट दस्तावेज़ प्रकार चुनें --' : '-- Choose Specific Document Type --'}
                </option>
              )}
              {currentSubtypes.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {isHi ? sub.nameHi : sub.name} ({sub.authority})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File Drag & Drop Ingestion Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (isUploadUnlocked) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-sm p-6 text-center transition-all ${
          !isUploadUnlocked
            ? 'border-slate-300 bg-slate-50/90 cursor-not-allowed opacity-85'
            : isDragging
            ? 'border-gov-navy-900 bg-slate-100 cursor-pointer'
            : selectedFile
            ? 'border-emerald-500 bg-emerald-50/40 cursor-pointer'
            : 'border-gov-line hover:border-gov-navy-800 bg-white hover:bg-slate-50 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          disabled={!isUploadUnlocked}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleProcessFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {!isUploadUnlocked ? (
          <div className="space-y-3 py-5">
            <div className="w-12 h-12 rounded-full bg-slate-200/80 border border-slate-300 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-1.5 uppercase">
                {isHi ? 'चरण 1 और 2 अनिवार्य' : 'Step 1 & 2 Required'}
              </span>
              <p className="text-sm font-bold text-gov-navy-950">
                {isHi
                  ? 'दस्तावेज़ अपलोड करने के लिए कृपया ऊपर श्रेणी एवं प्रकार का चयन करें'
                  : 'Select Document Category and Specific Document Type Above'}
              </p>
              <p className="text-xs text-gov-inksoft mt-1 max-w-md mx-auto">
                {isHi
                  ? 'जब आप ऊपर श्रेणी और दस्तावेज़ प्रकार चुन लेंगे, तब यह फ़ाइल अपलोडिंग क्षेत्र स्वचालित रूप से अनलॉक हो जाएगा।'
                  : 'The file upload area will unlock automatically once you select the document category and specific type.'}
              </p>
            </div>
          </div>
        ) : isHashing ? (
          <div className="space-y-2 py-4">
            <RefreshCw className="w-8 h-8 text-gov-navy-900 animate-spin mx-auto" />
            <p className="text-xs font-bold text-gov-navy-950">
              {isHi ? 'दस्तावेज़ की हैश गणना जारी है...' : 'Calculating Cryptographic SHA-256 Hash...'}
            </p>
          </div>
        ) : selectedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded bg-emerald-100 text-emerald-800">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gov-navy-950">{selectedFile.name}</p>
                <p className="text-[11px] text-gov-inksoft font-mono">
                  {formatBytes(selectedFile.size)} • {selectedFile.type || 'application/pdf'}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-gov-navy-950 border border-gov-line rounded shadow-xs ml-2 cursor-pointer"
              >
                {isHi ? 'दस्तावेज़ बदलें' : 'Change'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  onClearFile();
                }}
                className="p-1 rounded hover:bg-rose-50 text-gov-inksoft hover:text-rose-700 transition-colors ml-1 cursor-pointer"
                title={t('check_another_btn')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SHA-256 Fingerprint */}
            <div className="p-2 rounded bg-white border border-gov-line max-w-lg mx-auto flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-gov-inksoft truncate">
                <Hash className="w-3.5 h-3.5 text-gov-navy-900 shrink-0" />
                <span className="font-bold shrink-0">SHA-256:</span>
                <span className="truncate text-gov-navy-950">{fileHash}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold shrink-0 ml-2">
                {isHi ? 'हैश सुरक्षित' : 'LOCKED'}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <div className="w-12 h-12 rounded-full bg-gov-paper border border-gov-line flex items-center justify-center mx-auto text-gov-navy-900">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gov-navy-950">
                {t('drag_drop_text')}
              </p>
              <p className="text-xs text-gov-inksoft mt-1">
                {t('supported_files')}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gov-inksoft font-mono">
              <span>{caseRef}</span>
              <span>•</span>
              <span>{isHi ? 'स्वचालित पहचान एवं सत्यापन' : 'Automatic Identification & Verification'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
