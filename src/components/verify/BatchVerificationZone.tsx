import React, { useState } from 'react';
import { BatchItemResult } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import {
  FolderArchive,
  Upload,
  Play,
  CheckCircle2,
  AlertOctagon,
  Download,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface BatchVerificationZoneProps {
  onInspectDocument: (batchItem: BatchItemResult) => void;
}

const DEFAULT_BATCH_ITEMS: BatchItemResult[] = [
  {
    id: 'batch-01',
    fileName: 'Aadhaar_Citizen_Authentic_01.pdf',
    fileSize: '420 KB',
    documentType: 'aadhaar',
    verdict: 'authentic',
    tamperingRiskScore: 4,
    confidenceScore: 98,
    tamperedFields: [],
    processedAt: 'Just now',
  },
  {
    id: 'batch-02',
    fileName: 'Aadhaar_Spliced_DOB_Fraud_02.jpg',
    fileSize: '1.2 MB',
    documentType: 'aadhaar',
    verdict: 'tampered',
    tamperingRiskScore: 94,
    confidenceScore: 96,
    tamperedFields: ['Date of Birth (1996 -> 2002)', 'Headshot Splicing Seam'],
    processedAt: 'Just now',
  },
  {
    id: 'batch-03',
    fileName: 'Passport_Control_Official_03.pdf',
    fileSize: '2.1 MB',
    documentType: 'passport',
    verdict: 'authentic',
    tamperingRiskScore: 6,
    confidenceScore: 99,
    tamperedFields: [],
    processedAt: 'Just now',
  },
  {
    id: 'batch-04',
    fileName: 'PAN_Card_Digitally_Forged_04.jpg',
    fileSize: '840 KB',
    documentType: 'pan',
    verdict: 'tampered',
    tamperingRiskScore: 89,
    confidenceScore: 95,
    tamperedFields: ['Father Name Font Kerning Mismatch', 'QR Code Missing Signature'],
    processedAt: 'Just now',
  },
  {
    id: 'batch-05',
    fileName: 'CBSE_Class12_Marksheet_Authentic_05.pdf',
    fileSize: '1.5 MB',
    documentType: 'academic',
    verdict: 'authentic',
    tamperingRiskScore: 5,
    confidenceScore: 97,
    tamperedFields: [],
    processedAt: 'Just now',
  },
];

export const BatchVerificationZone: React.FC<BatchVerificationZoneProps> = ({
  onInspectDocument,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [batchResults, setBatchResults] = useState<BatchItemResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRunBatch = () => {
    setIsRunning(true);
    setProgress(0);
    setBatchResults([]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const current = DEFAULT_BATCH_ITEMS[step - 1];
      if (current) {
        setCurrentFile(current.fileName);
        setProgress((step / DEFAULT_BATCH_ITEMS.length) * 100);
        setBatchResults((prev) => [...prev, current]);
      }

      if (step >= DEFAULT_BATCH_ITEMS.length) {
        clearInterval(interval);
        setIsRunning(false);
        setCurrentFile('');
      }
    }, 600);
  };

  const handleExportCSV = () => {
    if (batchResults.length === 0) return;
    const headers = ['File Name', 'Document Type', 'Verdict', 'Tamper Risk (%)', 'Confidence (%)', 'Altered Fields'];
    const rows = batchResults.map((r) => [
      r.fileName,
      r.documentType,
      r.verdict.toUpperCase(),
      r.tamperingRiskScore,
      r.confidenceScore,
      r.tamperedFields.join('; ') || 'None',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'National_Batch_Verification_Audit.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCount = batchResults.length;
  const authenticCount = batchResults.filter((r) => r.verdict === 'authentic').length;
  const tamperedCount = batchResults.filter((r) => r.verdict === 'tampered' || r.verdict === 'forged').length;

  const filteredResults = batchResults.filter((r) =>
    r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn text-gov-ink">
      {/* Batch Header & CTA */}
      <div className="glass-card p-6 rounded-sm border border-gov-line shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gov-saffron"></span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gov-navy-800 font-mono">
              {isHi ? 'फ़ीचर 3: थोक दस्तावेज़ सत्यापन' : 'FEATURE 3: BATCH PROCESSING PIPELINE'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gov-navy-950 mt-0.5">
            {isHi ? 'थोक दस्तावेज़ सत्यापन एवं स्क्रीनिंग (Batch Screening)' : 'Batch Document Screening Engine'}
          </h2>
          <p className="text-xs text-gov-inksoft mt-1">
            {isHi
              ? 'एक साथ कई आधार, मार्कशीट और पहचान पत्रों की जांच करें और सामूहिक ऑडिट रिपोर्ट प्राप्त करें।'
              : 'Scan multiple civil IDs, academic certificates, and credentials simultaneously with aggregated anomaly telemetry.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={handleRunBatch}
            disabled={isRunning}
            className="flex-1 md:flex-none btn-gov-primary text-xs py-2.5 flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <Sparkles className="w-4 h-4 text-gov-saffron animate-spin" />
                <span>{isHi ? 'जांच जारी है...' : 'Screening Batch...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-gov-saffron fill-gov-saffron" />
                <span>{isHi ? '5 दस्तावेज़ों का थोक परीक्षण चलाएं' : 'Run Demo Batch (5 Documents)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar while running */}
      {isRunning && (
        <div className="glass-card p-4 rounded-sm border border-gov-line space-y-2 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gov-navy-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gov-saffron-dark animate-spin" />
              <span>{isHi ? `जांच प्रक्रियाधीन: ${currentFile}` : `Processing: ${currentFile}`}</span>
            </span>
            <span className="font-mono font-bold text-gov-navy-900">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gov-navy-900 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results Summary Dashboard Cards */}
      {batchResults.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded bg-white border border-gov-line shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gov-inksoft block">
                {isHi ? 'कुल जांचे गए दस्तावेज़' : 'Total Screened'}
              </span>
              <span className="text-2xl font-extrabold text-gov-navy-950 font-mono block mt-1">
                {totalCount}
              </span>
              <span className="text-[10px] text-gov-inksoft">
                {isHi ? 'दस्तावेज़ कतार में' : 'documents in batch'}
              </span>
            </div>

            <div className="p-3.5 rounded bg-emerald-50/70 border border-emerald-300 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                {isHi ? 'प्रामाणिक पाए गए' : 'Verified Genuine'}
              </span>
              <span className="text-2xl font-extrabold text-emerald-800 font-mono block mt-1">
                {authenticCount}
              </span>
              <span className="text-[10px] text-emerald-700">
                {totalCount > 0 ? ((authenticCount / totalCount) * 100).toFixed(0) : 0}% {isHi ? 'पास दर' : 'pass rate'}
              </span>
            </div>

            <div className="p-3.5 rounded bg-rose-50/70 border border-rose-300 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-rose-900 block">
                {isHi ? 'छेड़छाड़ पकड़ी गई' : 'Flagged Tampered'}
              </span>
              <span className="text-2xl font-extrabold text-rose-800 font-mono block mt-1">
                {tamperedCount}
              </span>
              <span className="text-[10px] text-rose-700">
                {totalCount > 0 ? ((tamperedCount / totalCount) * 100).toFixed(0) : 0}% {isHi ? 'धोखाधड़ी दर' : 'fraud rate'}
              </span>
            </div>

            <div className="p-3.5 rounded bg-white border border-gov-line shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gov-inksoft block">
                  {isHi ? 'ऑडिट रिपोर्ट डाउनलोड' : 'Audit Export'}
                </span>
                <span className="text-xs font-bold text-gov-navy-950 block mt-1">
                  {isHi ? 'सीएसवी रिपोर्ट तैयार' : 'Full Batch CSV'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="mt-2 text-xs font-bold text-gov-navy-900 hover:text-gov-saffron-dark flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isHi ? 'डाउनलोड CSV' : 'Export CSV Ledger'}</span>
              </button>
            </div>
          </div>

          {/* Batch Results Table */}
          <div className="glass-card rounded-sm border border-gov-line overflow-hidden shadow-xs">
            <div className="p-3 bg-gov-paper border-b border-gov-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gov-inksoft absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHi ? 'फ़ाइल नाम से खोजें...' : 'Search batch results by filename or type...'}
                  className="w-full bg-white border border-gov-line rounded-sm pl-9 pr-3 py-1.5 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900"
                />
              </div>

              <span className="text-xs font-mono font-bold text-gov-navy-950 shrink-0">
                {filteredResults.length} / {totalCount} {isHi ? 'दस्तावेज़' : 'Records'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="gov-table text-xs">
                <thead>
                  <tr>
                    <th>{isHi ? 'दस्तावेज़ फ़ाइल' : 'Document File'}</th>
                    <th>{isHi ? 'प्रकार' : 'Category'}</th>
                    <th>{isHi ? 'जोखिम स्कोर' : 'Tamper Risk'}</th>
                    <th>{isHi ? 'निर्णय' : 'Verdict'}</th>
                    <th>{isHi ? 'पहचानी गई विसंगति' : 'Identified Discrepancies'}</th>
                    <th className="text-right">{isHi ? 'कार्रवाई' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((item) => (
                    <tr key={item.id} className={item.verdict === 'tampered' ? 'bg-rose-50/40' : ''}>
                      <td>
                        <div className="font-bold text-gov-navy-950 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-gov-navy-900 shrink-0" />
                          <span>{item.fileName}</span>
                        </div>
                        <span className="text-[10px] text-gov-inksoft font-mono block">
                          Size: {item.fileSize}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono uppercase text-[11px] font-bold text-gov-ink">
                          {item.documentType}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`font-mono font-bold text-xs ${
                            item.tamperingRiskScore > 50 ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {item.tamperingRiskScore}%
                        </span>
                      </td>
                      <td>
                        {item.verdict === 'authentic' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {isHi ? 'प्रामाणिक' : 'GENUINE'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3 text-rose-600" />
                            {isHi ? 'छेड़छाड़' : 'TAMPERED'}
                          </span>
                        )}
                      </td>
                      <td>
                        {item.tamperedFields.length > 0 ? (
                          <div className="space-y-0.5">
                            {item.tamperedFields.map((f, i) => (
                              <span
                                key={i}
                                className="block text-[10px] text-rose-800 font-semibold bg-rose-100/70 px-1.5 py-0.2 rounded"
                              >
                                ⚠ {f}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            {isHi ? 'कोई विसंगति नहीं' : 'None (Zero Anomaly)'}
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => onInspectDocument(item)}
                          className="btn-gov-secondary text-xs px-2.5 py-1 inline-flex items-center gap-1"
                        >
                          <span>{isHi ? 'जांचें' : 'Inspect'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
