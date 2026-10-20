import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, LogOut, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function SecurityTab({ currentUser, onSignOut }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    // Validations
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    setUpdating(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;

        setNewPassword('');
        setConfirmPassword('');
        setStatusMessage('Your password has been successfully updated.');
      } else {
        setErrorMessage(
          'Password updates require an active Supabase backend connection. The application is currently running in offline/demo mode.'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to update password. Please check your authentication session.'
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-softButter">
          Account Security & Credentials
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Manage your password security, encryption session, and active login state.
        </p>
      </div>

      {/* Password Update Card */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-elevatedBorder">
          <KeyRound className="w-4 h-4 text-terracotta" />
          <h4 className="text-sm font-serif font-bold text-softButter uppercase tracking-wider">
            Change Password
          </h4>
        </div>

        {statusMessage && (
          <div className="bg-clayBrown/30 border border-terracotta/60 rounded-xl p-3.5 text-xs text-softButter flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-terracotta shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-darkRoast border border-red-500/60 rounded-xl p-3.5 text-xs text-red-300 flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="security-new-password"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="security-new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-mono px-3.5 py-2.5 pl-10 pr-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
              />
              <Lock className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-3 text-mutedClay hover:text-warmCream transition-colors"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="security-confirm-password"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="security-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-mono px-3.5 py-2.5 pl-10 pr-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
              />
              <Lock className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3 text-mutedClay hover:text-warmCream transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={updating || !newPassword || !confirmPassword}
            >
              {updating ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Active Session & Sign Out */}
      <div className="pt-6 border-t border-elevatedBorder space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-serif font-bold text-warmCream">
                Active Security Session
              </span>
              <Badge variant="butter" size="sm">
                Signed In
              </Badge>
            </div>
            <p className="text-xs text-mutedClay">
              Currently authenticated as <strong className="text-softButter font-mono">{currentUser?.email || 'Hopi User'}</strong>
            </p>
          </div>

          {onSignOut && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<LogOut className="w-3.5 h-3.5" />}
              className="text-terracotta border-terracotta/40 hover:bg-terracotta/10 shrink-0"
              onClick={onSignOut}
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
