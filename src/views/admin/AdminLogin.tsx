import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';

export const AdminLogin: React.FC = () => {
  const { login } = useAdmin();
  const { setCurrentView, branding } = useShop();

  const [email, setEmail] = useState('owner@gdigitalz.ug');
  const [password, setPassword] = useState('PeterzAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const fillCredentials = (type: 'owner' | 'staff') => {
    if (type === 'owner') {
      setEmail('owner@gdigitalz.ug');
      setPassword('PeterzAdmin2026!');
    } else {
      setEmail('staff@gdigitalz.ug');
      setPassword('PeterzStaff2026!');
    }
  };

  return (
    <div className="min-h-screen bg-[#141210] text-[#D8C7B0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#8E6C3B]/40 selection:text-white">
      {/* Back to Storefront Link */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-1.5 text-xs text-[#A89885] hover:text-white transition-colors py-2 px-3 rounded-xs border border-[#2C2824] bg-[#1A1816]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="font-editorial text-3xl sm:text-4xl font-semibold tracking-wider text-white uppercase block">
          {branding?.storeName || 'G-Digitalz Fashions'}
        </span>
        <span className="text-[10px] tracking-[0.25em] text-[#C5A880] uppercase font-body font-semibold block mt-1">
          Atelier Control Console
        </span>
        <h2 className="mt-4 text-sm font-medium text-[#A89885]">
          Authorized Administrator Sign-in
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#1A1816] border border-[#2C2824] py-8 px-6 sm:px-10 rounded-sm shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3 bg-[#B91C1C]/15 border border-[#B91C1C]/30 text-[#FCA5A5] text-xs rounded-xs flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-[#C5A880] mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141210] border border-[#3A342D] px-3.5 py-2.5 pl-9 text-xs text-white rounded-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                  placeholder="admin@gdigitalz.ug"
                />
                <Mail className="w-4 h-4 text-[#7A7165] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-[#C5A880] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141210] border border-[#3A342D] px-3.5 py-2.5 pl-9 pr-10 text-xs text-white rounded-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                  placeholder="••••••••••••"
                />
                <Lock className="w-4 h-4 text-[#7A7165] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#7A7165] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#8E6C3B] hover:bg-[#A37D46] text-white uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Enter Atelier Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill credentials helper for evaluation & testing */}
          <div className="pt-4 border-t border-[#2C2824] space-y-2 text-[11px] text-[#8C7E70]">
            <p className="font-semibold text-[#C5A880] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pre-Configured Role Credentials:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => fillCredentials('owner')}
                className="p-2 bg-[#231F1A] border border-[#3A342D] hover:border-[#8E6C3B] rounded-xs text-left transition-colors"
              >
                <span className="block font-semibold text-white">Owner Account</span>
                <span className="text-[10px] text-[#C5A880]">Full Control</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="p-2 bg-[#231F1A] border border-[#3A342D] hover:border-[#8E6C3B] rounded-xs text-left transition-colors"
              >
                <span className="block font-semibold text-white">Staff Account</span>
                <span className="text-[10px] text-[#A89885]">Catalog & Orders</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
