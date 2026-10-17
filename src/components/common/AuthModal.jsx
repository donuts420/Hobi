import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Button from "./Button";
import CodeSlots from "../bits/CodeSlots";
import { supabase } from "../../lib/supabase";
/**
 * AuthModal component providing a JWT / Supabase Auth ready login and sign-up form.
 * Strictly requires Email and Password with client-side syntax and length validation.
 */
export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  recoveryMode = false,
  onRecoveryComplete,
  defaultTab = "login", // 'login' | 'signup'
}) {
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setStatusMessage("");
      setOtpStep(false);
      setOtp("");
      setChallengeId("");
    }
  }, [isOpen, tab]);

  useEffect(() => {
    if (isOpen) setTab(defaultTab);
  }, [isOpen, defaultTab]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");

    if (!email.trim() || !validateEmail(email)) {
      setError("Please provide a valid email address (e.g., name@domain.com).");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters in length.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (data.session) {
          onSuccess?.({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email.split("@")[0],
          });
          onClose();
          return;
        }

        setStatusMessage("Account created. Check your email and follow the confirmation link before signing in.");
        return;
      }

      if (otpStep) {
        if (!/^\d{6}$/.test(otp)) {
          setError("Enter the six-digit code from your email.");
          return;
        }

        const { data, error } = await supabase.functions.invoke("login-email-otp", {
          body: {
            action: "verify",
            email: email.trim().toLowerCase(),
            password,
            challengeId,
            code: otp,
          },
        });
        if (error || !data?.access_token || !data?.refresh_token) {
          setError("That code is incorrect or expired. Check the code and try again.");
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        if (sessionError) throw sessionError;
        const user = sessionData.user;
        onSuccess?.({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split("@")[0],
        });
        onClose();
        return;
      }

      const { data, error } = await supabase.functions.invoke("login-email-otp", {
        body: {
          action: "request",
          email: email.trim().toLowerCase(),
          password,
        },
      });
      if (error || !data?.challengeId) {
        setError("Unable to start sign-in. Please try again.");
        return;
      }
      setChallengeId(data.challengeId);
      setOtpStep(true);
      setStatusMessage(`If the sign-in details are valid, a six-digit code was sent to ${email.trim()}.`);
    } catch (error) {
      setError(error.message || "Unable to complete this request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setStatusMessage("");
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || "Unable to sign in with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setStatusMessage("");
    if (!email.trim() || !validateEmail(email)) {
      setError(
        "Please enter your email address above to receive a reset link.",
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/` },
      );
      if (error) throw error;
      setStatusMessage("If an account exists for that email, a password reset link has been sent.");
    } catch (error) {
      setError(error.message || "Unable to send a reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");
    if (password.length < 6) return setError("Password must be at least 6 characters in length.");
    if (password !== confirmPassword) return setError("The passwords do not match.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      setStatusMessage("Your password has been updated.");
      onRecoveryComplete?.();
      onClose();
    } catch (error) {
      setError(error.message || "Unable to update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkRoast/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-elevated border border-clayBrown/80 w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl shadow-dune-lg p-4 sm:p-6 md:p-8 relative font-serif text-warmCream">
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
            <span className="font-serif font-black text-xl text-softButter">
              T
            </span>
          </div>
          <h3 className="font-serif font-black text-2xl text-softButter">
            {recoveryMode ? "Set a New Password" : tab === "login" ? "Sign in to TerraTix" : "Create an Account"}
          </h3>
          <p className="text-xs text-mutedClay max-w-xs mx-auto">
            {recoveryMode
              ? "Choose a new password for your account."
              : tab === "login"
              ? "Access your tickets, manage bookings, and enjoy express checkout."
              : "Join thousands of eventgoers discovering premier live experiences."}
          </p>
        </div>

        {/* Tab Toggle */}
        {!recoveryMode && <div className="flex bg-darkRoast p-1 rounded-lg border border-elevatedBorder mb-5">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 py-1.5 text-xs font-serif rounded-md transition-all ${
              tab === "login"
                ? "bg-clayBrown text-softButter font-semibold shadow-sm"
                : "text-mutedClay hover:text-warmCream"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 py-1.5 text-xs font-serif rounded-md transition-all ${
              tab === "signup"
                ? "bg-clayBrown text-softButter font-semibold shadow-sm"
                : "text-mutedClay hover:text-warmCream"
            }`}
          >
            New Account
          </button>
        </div>}

        {/* Validation / Status Messages */}
        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-terracotta/15 border border-terracotta/40 text-xs text-warmCream">
            <AlertCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-softButter/15 border border-softButter/30 text-xs text-softButter">
            <CheckCircle2 className="w-4 h-4 text-softButter shrink-0 mt-0.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {!recoveryMode && !otpStep && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-elevatedBorder bg-darkRoast px-3 py-2.5 text-xs text-warmCream hover:border-terracotta disabled:opacity-60 transition-colors"
            >
              <svg aria-hidden="true" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.93c-.58 2.96-2.25 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.15-10.16 7.15-17.56Z" />
                <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 4)" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.27-8.28 2.27-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
              </svg>
              {googleLoading ? "Connecting to Google…" : "Continue with Google"}
            </button>
            <div className="flex items-center gap-3 my-4 text-[10px] uppercase tracking-wider text-mutedClay">
              <span className="h-px flex-1 bg-elevatedBorder" />
              <span>or with email</span>
              <span className="h-px flex-1 bg-elevatedBorder" />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={recoveryMode ? handlePasswordUpdate : handleSubmit} className="space-y-4">
          {recoveryMode ? (
            <>
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-mutedClay mb-1.5">New Password</label>
                <input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-darkRoast border border-elevatedBorder focus:border-terracotta rounded-lg px-3 py-2.5 text-xs text-warmCream focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-mutedClay mb-1.5">Confirm New Password</label>
                <input type="password" required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-darkRoast border border-elevatedBorder focus:border-terracotta rounded-lg px-3 py-2.5 text-xs text-warmCream focus:outline-none" />
              </div>
            </>
          ) : otpStep ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-mutedClay">Enter the verification code for <strong className="text-warmCream">{email}</strong></p>
              <CodeSlots value={otp} onChange={setOtp} label="EMAIL VERIFICATION CODE" copyable={false} />
              <button type="button" onClick={() => { setOtpStep(false); setOtp(""); setChallengeId(""); setStatusMessage(""); }} className="text-xs text-softButter hover:underline">
                Back to sign in
              </button>
            </div>
          ) : <>
          {tab === "signup" && (
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
              {tab === "login" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
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
          </>}

          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={loading}
            className="w-full mt-2"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {loading ? "Please wait…" : recoveryMode ? "Update Password" : otpStep
              ? "Verify Code"
              : tab === "login"
                ? "Sign In"
                : "Create Free Account"}
          </Button>

          <div className="pt-2 text-center">
            {tab === "login" ? (
              <p className="text-xs text-mutedClay">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="text-softButter font-semibold hover:text-terracotta hover:underline ml-1"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-mutedClay">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="text-softButter font-semibold hover:text-terracotta hover:underline ml-1"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
