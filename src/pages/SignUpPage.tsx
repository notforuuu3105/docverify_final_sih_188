import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GovTopBar } from '../components/common/GovTopBar';
import { GovEmblem } from '../components/common/GovEmblem';
import { ShieldCheck, Lock, Mail, User, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passphrases do not match');
      return;
    }

    if (password.length < 6) {
      setError('Passphrase must be at least 6 characters in length');
      return;
    }

    setLoading(true);
    const res = await signUp(email, password, fullName);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gov-paper text-gov-ink flex flex-col selection:bg-gov-navy-800/20 selection:text-gov-navy-900">
      <GovTopBar showFullHeader={false} />

      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <GovEmblem size="lg" />
            <div className="pt-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-700 font-mono block">
                TEAM INFERNO
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gov-navy-950">
                Analyst Account Registration
              </h1>
              <p className="text-xs text-gov-inksoft">
                Register authorized credentials for document screening & forensics
              </p>
            </div>
          </div>

          <div className="bg-white border border-gov-line rounded-sm shadow-md overflow-hidden">
            <div className="bg-gov-navy-900 text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gov-saffron" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  New Officer Registration
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-300">
                FORM: REG-GOV-01
              </span>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 rounded bg-rose-50 border border-rose-300 flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide mb-1.5">
                    Full Legal Name & Designation
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gov-inksoft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Inspector R. Sharma"
                      className="w-full bg-white border border-gov-line rounded-sm pl-10 pr-4 py-2 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900 focus:ring-1 focus:ring-gov-navy-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide mb-1.5">
                    Department / Ministry / Agency
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gov-inksoft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="National Document Verification Authority - Forensics Wing"
                      className="w-full bg-white border border-gov-line rounded-sm pl-10 pr-4 py-2 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900 focus:ring-1 focus:ring-gov-navy-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide mb-1.5">
                    Official Government Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gov-inksoft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@mha.gov.in"
                      className="w-full bg-white border border-gov-line rounded-sm pl-10 pr-4 py-2 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900 focus:ring-1 focus:ring-gov-navy-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide mb-1.5">
                    Security Passphrase (min 6 characters)
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

                <div>
                  <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide mb-1.5">
                    Confirm Passphrase
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gov-inksoft absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-gov-line rounded-sm pl-10 pr-4 py-2 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900 focus:ring-1 focus:ring-gov-navy-900 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gov-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 mt-2"
                >
                  <span>{loading ? 'Submitting Registration...' : 'Register Official Credentials'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="bg-slate-50 border-t border-gov-line px-6 py-3 text-center text-xs text-gov-inksoft">
              <span>Already registered? </span>
              <Link to="/login" className="text-gov-navy-900 font-bold hover:underline">
                Officer Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto border-t border-gov-line bg-white py-4 px-4 text-center text-xs text-gov-inksoft">
        <p>© 2026 Government of India • National Document Authenticity Portal</p>
      </footer>
    </div>
  );
};
