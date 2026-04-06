import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // App Hash commonly required by mobile, but we can pass a dummy or undefined string.
  const appHash = 'admin-ui';

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) {
      setError('Mobile number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': 'com.paymentalert.app',
        },
        body: JSON.stringify({ phoneNumber: mobileNumber, appHash }),
      });

      if (!res.ok) {
        throw new Error('Failed to send OTP. Please check the number.');
      }

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'OTP dispatch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setError('OTP is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/login/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': 'com.paymentalert.app',
        },
        body: JSON.stringify({ phoneNumber: mobileNumber, code: otpCode }),
      });

      if (!res.ok) {
        throw new Error('Invalid OTP');
      }

      const data = await res.json();

      if (data.token) {
        // Now set the cookie securely utilizing our admin utility route
        const cookieRes = await fetch('/api/admin/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token: data.token }),
        });

        if (!cookieRes.ok) throw new Error('Failed to set secure session');

        login();
        navigate('/');
      } else {
        throw new Error('No token returned');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black/40">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-phonepe-light/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white/90 mb-2">
            Admin Portal
          </h1>
          <p className="text-sm text-white/50 text-center mb-8">
            {step === 'phone'
              ? 'Enter your authorized mobile number to receive an OTP.'
              : 'Enter the OTP sent to your phone.'}
          </p>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="w-full space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-medium">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    setError('');
                  }}
                  placeholder="+919876543210"
                  disabled={loading}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono disabled:opacity-50"
                />
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                {!loading && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="w-full space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-medium">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setError('');
                  }}
                  placeholder="123456"
                  disabled={loading}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono disabled:opacity-50 tracking-widest text-center text-lg"
                />
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
                {!loading && (
                  <ShieldCheck className="w-4 h-4 transition-transform" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setError('');
                }}
                className="w-full text-white/40 hover:text-white/80 py-2 text-sm flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
