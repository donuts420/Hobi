import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from './Button';

/**
 * AuthModal component providing a JWT / Supabase Auth ready login and sign-up form.
 * Strictly requires Email and Password with client-side syntax and length validation.
 */
export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login', // 'login' | 'signup'
}) {
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setResetSent(false);
    }
  }, [isOpen, tab]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Format Validations
    if (!email.trim() || !validateEmail(email)) {
      setError('Please provide a valid email address (e.g., name@domain.com).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);

    // Mock JWT / Supabase Auth handshake simulation
    setTimeout(() => {
      setLoading(false);
      const user = {
        id: `usr_${Date.now()}`,
        email: email.trim(),
        name: fullName.trim() || email.split('@')[0],
        token: `jwt_terratix_${btoa(email)}_${Date.now()}`,
      };
      if (onSuccess) onSuccess(user);
      onClose();
    }, 600);
  };

  const handleForgotPassword = () => {
    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter your email address above to receive a reset link.');
      return;
    }
    setError('');
    setResetSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkRoast/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-elevated border border-clayBrown/80 max-w-md w-full rounded-2xl shadow-dune-lg p-6 sm:p-8 relative font-serif text-warmCream">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-mutedClay hover:text-warmCream bg-darkRoast border border-elevatedBorder transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Monogram */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-terracotta to-clayBrown flex items-center justify-center border border-terracotta/40 mx-auto shadow-dune-sm">
            <span className="font-serif font-black text-xl text-softButter">T</span>
          </div>
          <h3 className="font-serif font-black text-2xl text-softButter">
            {tab === 'login' ? 'Sign in to TerraTix' : 'Create an Account'}
          </h3>
          <p className="text-xs text-mutedClay max-w-xs mx-auto">
            {tab === 'login'
              ? 'Access your tickets, manage bookings, and enjoy express checkout.'
              : 'Join thousands of eventgoers discovering premier live experiences.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-darkRoast p-1 rounded-lg border border-elevatedBorder mb-5">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 text-xs font-serif rounded-md transition-all ${
              tab === 'login'
                ? 'bg-clayBrown text-softButter font-semibold shadow-sm'
                : 'text-mutedClay hover:text-warmCream'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-1.5 text-xs font-serif rounded-md transition-all ${
              tab === 'signup'
                ? 'bg-clayBrown text-softButter font-semibold shadow-sm'
                : 'text-mutedClay hover:text-warmCream'
            }`}
          >
            New Account
          </button>
        </div>

        {/* Validation / Status Messages */}
        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-terracotta/15 border border-terracotta/40 text-xs text-warmCream">
            <AlertCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-softButter/15 border border-softButter/30 text-xs text-softButter">
            <CheckCircle2 className="w-4 h-4 text-softButter shrink-0 mt-0.5" />
            <span>Password reset instructions sent to <strong>{email}</strong>. Check your inbox.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-mutedClay mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full bg-darkRoast border border-elevatedBorder focus:border-terracotta rounded-lg pl-9 pr-3 py-2.5 text-xs text-warmCream placeholder-mutedClay/60 focus:outline-none transition-colors"
                />
                <User className="w-4 h-4 text-mutedClay absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-mutedClay mb-1.5">
              Email Address <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-darkRoast border border-elevatedBorder focus:border-terracotta rounded-lg pl-9 pr-3 py-2.5 text-xs text-warmCream placeholder-mutedClay/60 focus:outline-none transition-colors"
              />
              <Mail className="w-4 h-4 text-mutedClay absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase font-mono tracking-wider text-mutedClay">
                Password <span className="text-terracotta">*</span>
              </label>
              {tab === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-softButter hover:text-terracotta hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-darkRoast border border-elevatedBorder focus:border-terracotta rounded-lg pl-9 pr-3 py-2.5 text-xs text-warmCream placeholder-mutedClay/60 focus:outline-none transition-colors font-mono"
              />
              <Lock className="w-4 h-4 text-mutedClay absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={loading}
            className="w-full mt-2"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In' : 'Create Free Account'}
          </Button>

          <div className="pt-2 text-center">
            {tab === 'login' ? (
              <p className="text-xs text-mutedClay">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-softButter font-semibold hover:text-terracotta hover:underline ml-1"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-mutedClay">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-softButter font-semibold hover:text-terracotta hover:underline ml-1"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Security Trust Badge */}
        <div className="mt-6 pt-4 border-t border-elevatedBorder flex items-center justify-center gap-2 text-[11px] text-mutedClay/80">
          <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
          <span>JWT-encrypted authentication • No spam guarantee</span>
        </div>
      </div>
    </div>
  );
}
