import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) {
      setError('Mobile number is required');
      return;
    }

    // Save mobile number as raw token for simplicity,
    // assuming backend uses Bearer token with this value.
    localStorage.setItem('admin_token', mobileNumber);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black/40">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-phonepe-light/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white/90 mb-2">Admin Portal</h1>
          <p className="text-sm text-white/50 text-center mb-8">Enter your authorized mobile number to continue.</p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-medium">Mobile Number</label>
              <input 
                type="text" 
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  setError('');
                }}
                placeholder="+919876543210"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
              />
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
