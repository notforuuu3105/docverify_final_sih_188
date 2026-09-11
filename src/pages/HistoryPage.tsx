import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockStore } from '../lib/mockAI/mockEngine';
import type { VerificationRecord } from '../lib/types';
import { formatDate, getVerdictBadgeClass } from '../lib/utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Eye,
  FileSearch,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_risk' | 'lowest_risk'>('newest');
  const { language } = useLanguage();
  const isHi = language === 'hi';

  useEffect(() => {
    setRecords(mockStore.getVerifications());
  }, []);

  // Filter & Search logic
  const filtered = records
    .filter((record) => {
      const matchesFilter =
        filterVerdict === 'all' ? true : record.verdict === filterVerdict || record.status === filterVerdict;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        record.document?.file_name.toLowerCase().includes(q) ||
        record.id.toLowerCase().includes(q) ||
        record.summary.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'highest_risk') {
        return b.tampering_risk_score - a.tampering_risk_score;
      }
      if (sortBy === 'lowest_risk') {
        return a.tampering_risk_score - b.tampering_risk_score;
      }
      return 0;
    });

  const verdicts = [
    { key: 'all', labelEn: 'All Records', labelHi: 'सभी रिकॉर्ड' },
    { key: 'authentic', labelEn: 'Authentic', labelHi: 'प्रामाणिक' },
    { key: 'tampered', labelEn: 'Tampered', labelHi: 'छेड़छाड़' },
    { key: 'suspicious', labelEn: 'Suspicious', labelHi: 'संदिग्ध' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-gov-ink">
      {/* Header */}
      <div className="pb-2 border-b border-gov-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gov-saffron"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gov-navy-800 font-mono">
              {isHi ? 'केंद्रीय ऑडिट रजिस्टर' : 'CENTRAL AUDIT REGISTRY'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gov-navy-950 flex items-center gap-2 mt-0.5">
            <History className="w-6 h-6 text-gov-navy-900" />
            <span>{isHi ? 'दस्तावेज़ सत्यापन केस ऑडिट इतिहास' : 'Verification Case Audit Trail'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gov-inksoft">
            {isHi
              ? 'सत्यापित किए गए सभी दस्तावेज़ों, क्रिप्टोग्राफिक SHA-256 हैश एवं निष्कर्षों का आधिकारिक संग्रह।'
              : 'Historical repository of all screened documents, cryptographic SHA-256 integrity logs, and forensic findings.'}
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-mono font-bold text-gov-navy-950 block">
            {filtered.length} {isHi ? 'रिकॉर्ड अनुक्रमित' : 'RECORDS INDEXED'}
          </span>
          <span className="text-[10px] text-gov-inksoft uppercase">
            {isHi ? 'केंद्रीय अभिलेखागार' : 'Central Archive'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-sm border border-gov-line space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gov-inksoft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isHi
                  ? 'फ़ाइल नाम, केस आईडी या कीवर्ड से खोजें...'
                  : 'Search by filename, Case ID, or forensic summary keyword...'
              }
              className="w-full bg-white border border-gov-line rounded-sm pl-10 pr-4 py-2 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-gov-inksoft" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gov-line text-gov-navy-950 font-semibold text-xs rounded-sm px-3 py-2 focus:outline-none focus:border-gov-navy-900"
            >
              <option value="newest">{isHi ? 'नवीनतम केस पहले' : 'Newest Cases First'}</option>
              <option value="oldest">{isHi ? 'पुराने केस पहले' : 'Oldest Cases First'}</option>
              <option value="highest_risk">{isHi ? 'उच्चतम जोखिम पहले' : 'Highest Tamper Risk'}</option>
              <option value="lowest_risk">{isHi ? 'न्यूनतम जोखिम पहले' : 'Lowest Tamper Risk'}</option>
            </select>
          </div>
        </div>

        {/* Verdict Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-gov-line">
          <span className="text-[10px] text-gov-inksoft font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-gov-navy-900" />
            <span>{isHi ? 'निष्कर्ष अनुसार फ़िल्टर:' : 'Filter Verdict:'}</span>
          </span>
          {verdicts.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setFilterVerdict(v.key)}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ${
                filterVerdict === v.key
                  ? 'bg-gov-navy-900 text-white shadow-xs border border-gov-navy-950'
                  : 'bg-gov-paper hover:bg-slate-200 text-gov-ink border border-gov-line'
              }`}
            >
              {isHi ? v.labelHi : v.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* History Records Table */}
      <div className="glass-card rounded-sm overflow-hidden border border-gov-line shadow-xs">
        <div className="divide-y divide-gov-line">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gov-inksoft space-y-2">
              <FileSearch className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-gov-navy-950">
                {isHi ? 'कोई मेल खाने वाला सत्यापन रिकॉर्ड नहीं मिला।' : 'No matching verification records located.'}
              </p>
              <p className="text-[11px] text-gov-inksoft">
                {isHi ? 'कृपया कीवर्ड बदलकर खोजें या नया दस्तावेज़ जांचें।' : 'Refine your keyword search or verify a new document.'}
              </p>
            </div>
          ) : (
            filtered.map((record) => {
              const anomalyCount =
                record.checks?.flatMap((c) => c.suspicious_regions).length || 0;

              return (
                <div
                  key={record.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Document Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded bg-gov-navy-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5 text-gov-saffron" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/verify/${record.id}`}
                          className="text-xs font-bold text-gov-navy-950 hover:underline transition-colors truncate"
                        >
                          {record.document?.file_name || (isHi ? 'दस्तावेज़ केस #' : 'Document Case #') + record.id.slice(0, 8)}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${getVerdictBadgeClass(
                            record.verdict
                          )}`}
                        >
                          {record.verdict === 'authentic'
                            ? isHi ? 'प्रामाणिक' : 'AUTHENTIC'
                            : record.verdict === 'tampered'
                            ? isHi ? 'छेड़छाड़' : 'TAMPERED'
                            : isHi ? 'संदिग्ध' : 'SUSPICIOUS'}
                        </span>
                      </div>
                      <p className="text-xs text-gov-ink mt-0.5 line-clamp-1">
                        {record.summary}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-gov-inksoft mt-1 font-mono">
                        <span className="font-bold text-gov-navy-950">{record.id.slice(0, 16)}</span>
                        <span>•</span>
                        <span>{formatDate(record.created_at)}</span>
                        <span>•</span>
                        <span>
                          {record.checks?.length || 0} {isHi ? 'जांचें पूर्ण' : 'checks completed'}
                        </span>
                        <span>•</span>
                        <span className={anomalyCount > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700'}>
                          {anomalyCount} {isHi ? 'विसंगत क्षेत्र' : 'anomalies'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gov-line">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-gov-navy-950">
                        {record.confidence_score}%
                      </div>
                      <div className="text-[10px] text-gov-inksoft uppercase font-bold">
                        {isHi ? 'सटीकता' : 'Confidence'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-mono font-bold ${
                          record.tampering_risk_score > 60
                            ? 'text-rose-700'
                            : record.tampering_risk_score > 30
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {record.tampering_risk_score}%
                      </div>
                      <div className="text-[10px] text-gov-inksoft uppercase font-bold">
                        {isHi ? 'जोखिम स्कोर' : 'Risk Score'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/verify/${record.id}`}
                        className="btn-gov-secondary text-xs px-2.5 py-1.5 flex items-center gap-1"
                        title={isHi ? 'फोरेंसिक विवरण देखें' : 'Inspect Forensic Detail'}
                      >
                        <Eye className="w-3.5 h-3.5 text-gov-navy-900" />
                        <span>{isHi ? 'जांचें' : 'Inspect'}</span>
                      </Link>

                      <Link
                        to={`/reports?verificationId=${record.id}`}
                        className="btn-gov-primary text-xs px-2.5 py-1.5 flex items-center gap-1"
                        title={isHi ? 'अदालती रिपोर्ट देखें' : 'Open Court Dossier'}
                      >
                        <FileText className="w-3.5 h-3.5 text-gov-saffron" />
                        <span>{isHi ? 'अदालती रिपोर्ट' : 'Report'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
