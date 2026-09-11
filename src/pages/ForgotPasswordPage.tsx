import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GovTopBar } from '../components/common/GovTopBar';
import { GovEmblem } from '../components/common/GovEmblem';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await resetPassword(email);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSubmitted(true);
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
                Reset Security Key
              </h1>
              <p className="text-xs text-gov-inksoft">
                Self-service passphrase recovery for authorized analysts
              </p>
            </div>
          </div>

          <div className="bg-white border border-gov-line rounded-sm shadow-md overflow-hidden">
            <div className="bg-gov-navy-900 text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-gov-saffron" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Passphrase Recovery
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-300">
                INFERNO-SEC-RESET
              </span>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gov-navy-950">
                    Recovery Instructions Dispatched
                  </h3>
                  <p className="text-xs text-gov-inksoft leading-relaxed">
                    If an officer credential matches <span className="font-mono font-bold text-gov-navy-950">{email}</span>, a secure recovery email has been sent.
                  </p>
                  <div className="pt-3">
                    <Link
                      to="/login"
                      className="btn-gov-primary w-full text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded bg-rose-50 border border-rose-300 flex items-start gap-2 text-xs text-rose-800">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gov-navy-950 uppercase tracking-wide mb-1.5">
                      Registered Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gov-inksoft absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="analyst@inferno.dev"
                        className="w-full bg-white border border-gov-line rounded-sm pl-10 pr-4 py-2.5 text-xs text-gov-ink placeholder-gov-inksoft focus:outline-none focus:border-gov-navy-900 focus:ring-1 focus:ring-gov-navy-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-gov-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? 'Transmitting Request...' : 'Send Recovery Link'}
                  </button>

                  <div className="pt-2 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-xs text-gov-navy-900 font-semibold hover:underline"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                    </Link>
                  </div>
                </form>
              )}
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
