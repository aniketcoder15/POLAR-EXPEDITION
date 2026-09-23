import { useState } from 'react';
import { Compass, Lock, User, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import { AuthUser } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = authService.getDemoAccounts();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authService.login(username, password);
      setIsLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    }, 150);
  };

  const handleSelectDemoAccount = (accUsername: string) => {
    const creds = authService.getQuickFillCredentials(accUsername);
    if (creds) {
      setUsername(creds.username);
      setPassword(creds.password);
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col justify-between relative selection:bg-[#FFE5C7] selection:text-[#C96A20]">
      {/* Background Accent */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 15%, #FFE5C7 0%, transparent 65%)'
        }}
      />

      {/* Top Bar with Language Selector */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFE5C7] to-[#F29A3D]/20 border border-[#F29A3D]/40 flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5 text-[#C96A20]" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#24313A] font-display">
              POLAR EXPEDITION
            </span>
            <span className="block text-[10px] text-[#C96A20] font-bold uppercase tracking-wider">
              Logistics & Asset Management
            </span>
          </div>
        </div>

        <LanguageSelector compact />
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#FFFCF8] border border-[#EAE3D5] rounded-3xl p-6 sm:p-8 warm-card-shadow text-[#24313A]">
          {/* Card Header */}
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFF8EF] border border-[#F29A3D]/30 text-[11px] font-bold text-[#C96A20] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Svalbard Operations Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#24313A] font-display tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-[#71808A] mt-1.5 leading-relaxed">
              Sign in to continue to the expedition management system.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div 
              id="login-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-[#FDE8E8] border border-[#E84D4D]/30 text-xs text-[#24313A] flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-[#E84D4D] shrink-0 mt-0.5" />
              <div className="leading-snug font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label 
                htmlFor="login-username" 
                className="block text-xs font-bold text-[#24313A] uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#71808A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin or logistics.officer"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-medium text-[#24313A] placeholder-[#71808A] focus:outline-none focus:border-[#F29A3D] focus:bg-[#FFFCF8] transition-colors"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="login-password" 
                className="block text-xs font-bold text-[#24313A] uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71808A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter system password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-medium text-[#24313A] placeholder-[#71808A] focus:outline-none focus:border-[#F29A3D] focus:bg-[#FFFCF8] transition-colors"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#F29A3D] hover:bg-[#E28828] text-[#24313A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70 mt-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-6 pt-5 border-t border-[#EAE3D5]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#71808A] uppercase tracking-wider mb-2.5">
              <KeyRound className="w-3.5 h-3.5 text-[#C96A20]" />
              <span>Quick Demo Access (Select Role)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {demoAccounts.map(acc => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleSelectDemoAccount(acc.username)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                    username === acc.username
                      ? 'bg-[#FFE5C7] border-[#F29A3D] text-[#24313A]'
                      : 'bg-[#F7F4EF] border-[#EAE3D5] hover:border-[#F29A3D]/40 text-[#71808A] hover:text-[#24313A]'
                  }`}
                >
                  <div className="text-xs font-bold truncate leading-tight text-[#24313A]">{acc.name}</div>
                  <div className="text-[10px] text-[#C96A20] font-semibold truncate leading-tight mt-0.5">
                    {acc.roleTitle}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#71808A]">
        <span>Polar Expedition Logistics & Asset Management System • Longyearbyen Operations</span>
      </footer>
    </div>
  );
};
