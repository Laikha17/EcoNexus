import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { Recycle, ArrowLeft, Lock, Mail, KeyRound } from 'lucide-react';

interface LoginPageProps {
  onGoToSignup: () => void;
  onGoToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoToSignup, onGoToLanding }) => {
  const { login, sendPasswordReset } = useEcoNexus();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetSending, setIsResetSending] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login submit error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsResetSending(true);
    await sendPasswordReset(resetEmail);
    setIsResetSending(false);
    setShowForgotPasswordModal(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to EcoNexus Home
        </button>

        <div className="flex items-center justify-center gap-2">
          <img src="/econexus-logo.jpg" alt="EcoNexus Logo" className="w-11 h-11 rounded-xl object-cover ring-1 ring-emerald-500/20 shadow-xs" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">Eco<span className="text-emerald-600">Nexus</span></span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900">Welcome back</h2>
        <p className="text-xs text-slate-500">
          Sign in to your EcoNexus business workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card padded className="space-y-6 shadow-modal border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Business Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefixSymbol={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefixSymbol={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                Keep me signed in
              </label>

              <button 
                type="button" 
                onClick={() => {
                  setResetEmail(email);
                  setShowForgotPasswordModal(true);
                }}
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full" size="lg" loading={isLoggingIn} disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-600">
              Don’t have an account?{' '}
              <button
                type="button"
                onClick={onGoToSignup}
                className="font-bold text-emerald-600 hover:text-emerald-700"
              >
                Create Business Account
              </button>
            </p>
          </div>
        </Card>
      </div>

      {/* Password Reset Modal */}
      {showForgotPasswordModal && (
        <Modal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
          title="Reset Password"
          subtitle="Enter your corporate email address to receive a secure Firebase password reset link."
          maxWidth="sm"
        >
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="e.g. name@company.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              prefixSymbol={<Mail className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForgotPasswordModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isResetSending} icon={<KeyRound className="w-4 h-4" />}>
                Send Reset Link
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
