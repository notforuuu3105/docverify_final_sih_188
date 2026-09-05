import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../lib/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'user-demo-1',
  email: 'analyst@docverify.ai',
  full_name: 'Dr. Sarah Vance',
  organization: 'Global Forensic Integrity Labs',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const LOCAL_USER_KEY = 'docverify_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (isConfigured) {
      // Listen to Supabase Auth state changes
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Local sandbox mode: Check localStorage
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(DEMO_USER);
        }
      } else {
        // Auto-login demo user for immediate testability
        setUser(DEMO_USER);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEMO_USER));
      }
      setLoading(false);
    }
  }, [isConfigured]);

  const signIn = async (email: string, password = '') => {
    if (isConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } else {
      const newUser: UserProfile = {
        ...DEMO_USER,
        email,
        full_name: email.split('@')[0].toUpperCase(),
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      return {};
    }
  };

  const signUp = async (email: string, password = '', fullName = '') => {
    if (isConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) return { error: error.message };
      return {};
    } else {
      const newUser: UserProfile = {
        id: 'user-' + Date.now(),
        email,
        full_name: fullName || email.split('@')[0],
        organization: 'Independent Verifier',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      return {};
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    if (isConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    }
    return {};
  };

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
