import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GovTopBar } from '../components/common/GovTopBar';
import { GovEmblem } from '../components/common/GovEmblem';
import { Lock, Mail, ArrowRight, AlertCircle, Shield, Building2, Microscope, UserCheck } from 'lucide-react';

interface StationPreset {
  id: string;
  name: string;
  station: string;
  stationHi: string;
  role: string;
  roleHi: string;
  email: string;
  badge: string;
  icon: typeof Shield;
}

const STATIONS: StationPreset[] = [
  {
    id: 'desk-1',
    name: 'Analyst Rajesh Sharma',
    station: 'Team Inferno — Citizen Identity Desk',
    stationHi: 'टीम इन्फर्नो — नागरिक पहचान पटल',
    role: 'Aadhaar, PAN & Passport Verification',
    roleHi: 'आधार कार्ड, पैन कार्ड एवं पासपोर्ट सत्यापन',
    email: 'rajesh@inferno.dev',
    badge: 'INFERNO-742',
    icon: Shield,
  },
  {
    id: 'desk-2',
    name: 'Analyst Priya Verma',
    station: 'Team Inferno — Certificate & Legal Unit',
    stationHi: 'टीम इन्फर्नो — प्रमाणपत्र एवं साक्ष्य इकाई',
    role: 'Degrees, Marksheets & Land Deeds',
    roleHi: 'डिग्री, अंकतालिका एवं संपत्ति विलेख सत्यापन',
    email: 'priya@inferno.dev',
    badge: 'INFERNO-109',
    icon: Building2,
  },
  {
    id: 'desk-3',
    name: 'Dr. Sunita Rao',
    station: 'Team Inferno — Core Forensic Lab',
    stationHi: 'टीम इन्फर्नो — कोर फोरेंसिक प्रयोगशाला',
    role: 'Lead Examiner (Forensic Analysis & BSA)',
    roleHi: 'प्रमुख फोरेंसिक परीक्षक (साक्ष्य विश्लेषण)',
    email: 'sunita@inferno.dev',
    badge: 'INFERNO-401',
    icon: Microscope,
  },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleStationLogin = async (station: StationPreset) => {
    setLoading(true);
    await signIn(station.email, 'authorized-officer-key');
    setLoading(false);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gov-paper text-gov-ink flex flex-col selection:bg-gov-navy-800/20 selection:text-gov-navy-900">
      {/* Official Top Bar */}
      <GovTopBar showFullHeader={false} />

      {/* Main Authentication Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl space-y-6">
          {/* Institutional Crest Header */}
          <div className="text-center space-y-2">
            <GovEmblem size="lg" />
            <div className="pt-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-700 font-mono block">
                {t('govt_of_india')}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gov-navy-950">
                {t('portal_title')}
              </h1>
              <p className="text-xs text-gov-inksoft">
                {t('portal_subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Station Access Selector */}
          <div className="bg-white border border-gov-line rounded-sm shadow-md overflow-hidden">
            <div className="bg-gov-navy-900 text-white px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isHi ? 'टीम इन्फर्नो विश्लेषक चयन (1-क्लिक एक्सेस)' : 'Team Inferno Analyst Station (1-Click Demo)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-300">
                FAST ACCESS
              </span>
            </div>

            <div className="p-4 space-y-2.5 bg-slate-50 border-b border-gov-line">
              <p className="text-xs text-gov-inksoft">
                {isHi
                  ? 'सत्यापन प्रक्रिया की जांच हेतु किसी भी अधिकृत पटल का चयन करें:'
                  : 'Select an authorized station to simulate verification duty:'}
              </p>

              <div className="space-y-2">
                {STATIONS.map((st) => {
                  const StationIcon = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleStationLogin(st)}
                      className="w-full text-left p-3 rounded-sm bg-white border border-gov-line hover:border-gov-navy-900 hover:shadow-xs transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="p-2 rounded bg-gov-navy-50 text-gov-navy-900 shrink-0 group-hover:bg-gov-navy-900 group-hover:text-white transition-colors">
                        <StationIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-gov-navy-950 truncate">
                            {st.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-gov-ink">
                            {st.badge}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-gov-navy-900 mt-0.5">
                          {isHi ? st.stationHi : st.station}
                        </p>
                        <p className="text-[10px] text-gov-inksoft">
                          {isHi ? st.roleHi : st.role}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Credentials Form */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-gov-line">
                <span className="text-xs font-bold uppercase tracking-wider text-gov-navy-950 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gov-navy-900" />
                  {isHi ? 'खाता क्रेडेंशियल्स' : 'Account Credentials'}
                </span>
                <span className="text-[10px] font-mono text-gov-inksoft">
                  INFERNO AUTH
                </span>
              </div>

              {error && (
                <div className="p-3 rounded bg-rose-50 border border-rose-300 flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide mb-1.5">
                    {isHi ? 'सरकारी ईमेल / अधिकारी आईडी' : 'Government Email / Officer ID'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gov-inksoft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@gov.in"
                      className="w-full bg-white border border-gov-line rounded-sm pl-10 pr-4 py-2 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900 focus:ring-1 focus:ring-gov-navy-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide mb-1.5">
                    {isHi ? 'पासवर्ड / सुरक्षा पिन' : 'Security Passphrase / Token PIN'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gov-inksoft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-gov-line rounded-sm pl-10 pr-4 py-2 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900 focus:ring-1 focus:ring-gov-navy-900 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gov-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span>{loading ? (isHi ? 'सत्यापन जारी...' : 'Authenticating...') : (isHi ? 'पोर्टल में प्रवेश करें' : 'Authenticate & Enter Portal')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Security Notice */}
              <div className="p-3 rounded bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>{isHi ? 'सुरक्षा सूचना:' : 'Security Notice:'}</strong>{' '}
                {isHi
                  ? 'यह प्रणाली टीम इन्फर्नो के अधिकृत सत्यापन विश्लेषकों के लिए सुरक्षित है।'
                  : 'System access is authenticated and monitored under Team Inferno Forensic Protocol.'}
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="bg-slate-50 border-t border-gov-line px-6 py-2.5 text-center text-[11px] text-gov-inksoft">
              <span>{isHi ? 'टीम इन्फर्नो सुरक्षित गेटवे' : 'Team Inferno Secure Gateway'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-gov-line bg-white py-4 px-4 text-center text-xs text-gov-inksoft">
        <p>© 2026 {t('govt_of_india')} • {t('portal_title')}</p>
      </footer>
    </div>
  );
};
