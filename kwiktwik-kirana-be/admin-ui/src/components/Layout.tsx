import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  TerminalSquare,
  CreditCard,
  ShieldCheck,
  Activity,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    // Clear the HttpOnly cookie via backend
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // Ignore errors - still logout client-side
    }
    // Clear token from React state
    logout();
    // Redirect to login
    navigate('/login');
  };

  const getSystemStatus = () => {
    if (location.pathname.includes('phonepe')) {
      return (
        <div className="text-xs font-mono px-3 py-1.5 rounded-full bg-phonepe/10 border border-phonepe/20 text-phonepe-light flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-phonepe-light animate-pulse"></span>
          PhonePe Ready
        </div>
      );
    }
    if (location.pathname.includes('razorpay')) {
      return (
        <div className="text-xs font-mono px-3 py-1.5 rounded-full bg-razorpay/10 border border-razorpay/20 text-razorpay-accent flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-razorpay-accent animate-pulse"></span>
          Razorpay Ready
        </div>
      );
    }
    return (
      <div className="text-xs font-mono px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        System Online
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="glass-panel border-b border-white/10 px-6 py-4 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white/90">
              KwikTwik Commander
            </h1>
            <p className="text-xs text-white/50 leading-none">
              Global Admin Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {getSystemStatus()}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 glass-panel border-r border-white/10 flex flex-col shrink-0 relative shadow-2xl z-10">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
              Navigation
            </h2>
            <div className="space-y-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border group ${
                    isActive
                      ? 'bg-primary/20 border-primary/30 text-white'
                      : 'hover:bg-white/5 border-transparent text-white/70'
                  }`
                }
              >
                <TerminalSquare className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm">Scripts Runner</span>
              </NavLink>

              <NavLink
                to="/phonepe"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border group ${
                    isActive
                      ? 'bg-phonepe/20 border-phonepe/30 text-white'
                      : 'hover:bg-white/5 border-transparent text-white/70 hover:text-phonepe-light'
                  }`
                }
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-phonepe to-purple-500 flex items-center justify-center shadow-lg shadow-phonepe/20 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block truncate">
                    PhonePe Utilities
                  </span>
                </div>
              </NavLink>

              <NavLink
                to="/razorpay"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border group ${
                    isActive
                      ? 'bg-razorpay/80 border-razorpay-light/50 text-white'
                      : 'hover:bg-white/5 border-transparent text-white/70 hover:text-razorpay-accent'
                  }`
                }
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-razorpay to-blue-500 flex items-center justify-center shadow-lg shadow-razorpay/20 shrink-0">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block truncate">
                    Razorpay Utilities
                  </span>
                </div>
              </NavLink>
            </div>
          </div>

          {/* Logout at bottom of sidebar */}
          <div className="mt-auto p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 relative bg-transparent overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
