import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useRoadmap } from '../context/RoadmapContext';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { userProfile, updateProfile } = useRoadmap();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [mockName, setMockName] = useState(userProfile.name || '');
  const [mockEmail, setMockEmail] = useState('developer@pathwise.ai');
  const [hasMockSession, setHasMockSession] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Check local mock session
      const storedMock = localStorage.getItem('pw_v2_mock_session');
      if (storedMock) {
        setHasMockSession(true);
      }
      return;
    }

    // Get current session
    supabase!.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase!.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Google Auth Failed', error);
    }
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName.trim()) return;

    // Save profile name
    updateProfile({ name: mockName });
    localStorage.setItem('pw_v2_mock_session', 'true');
    setHasMockSession(true);
  };

  // Logout helper exposed globally/via context
  const handleLogout = () => {
    if (isSupabaseConfigured) {
      supabase!.auth.signOut();
    } else {
      localStorage.removeItem('pw_v2_mock_session');
      setHasMockSession(false);
    }
  };

  // Attach logout handler to window so Sidebar/Profile can call it easily
  useEffect(() => {
    (window as any).pathwiseLogout = handleLogout;
    return () => {
      delete (window as any).pathwiseLogout;
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center animate-pulse-glow mb-4">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider animate-pulse">
          Restoring OAuth Session...
        </p>
      </div>
    );
  }

  const isAuthorized = isSupabaseConfigured ? !!session : hasMockSession;

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6 select-none z-50">
        
        {/* Glow auroras */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-neonPurple/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neonBlue/5 blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-md glass-panel-heavy p-8 rounded-3xl border border-white/5 shadow-2xl relative"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neonPurple via-indigo-500 to-neonBlue flex items-center justify-center mx-auto shadow-lg shadow-neonPurple/20 mb-4 animate-pulse-glow">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Welcome to PathWise V2
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              The Premium AI Career Copilot & Operating System
            </p>
          </div>

          {isSupabaseConfigured ? (
            /* Cloud login form */
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-slate-900 font-heading font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-lg cursor-pointer"
              >
                <span className="font-heading font-black text-slate-900 text-sm">G</span> Continue with Google
              </button>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 text-[10px] text-slate-500 leading-normal text-center">
                Uses secure Google OAuth via Supabase Authentication. Your roadmap data, Streaks, and AI sessions sync automatically.
              </div>
            </div>
          ) : (
            /* Mock dev login form */
            <form onSubmit={handleMockLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className="w-full glass-input px-3.5 py-3 rounded-2xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">
                  Email Address
                </label>
                <input
                  type="email"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  className="w-full glass-input px-3.5 py-3 rounded-2xl text-xs font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-neonPurple to-neonBlue text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-neonPurple/10 transition-shadow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Launch Career Copilot
              </button>

              <div className="p-3 border border-dashed border-slate-900 rounded-xl text-[9px] text-slate-600 leading-relaxed text-center">
                Running in <strong>Virtual Developer mode</strong>. Input your details to create an offline profile with full state sync compatibility.
              </div>
            </form>
          )}

        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
export default AuthGate;
