import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'superadmin' | 'subscriber' | 'writer';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  credits: number;
  cv_credits: number | null;
  skripsi_credits: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isSubscriber: boolean;
  isSuperAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      setProfileLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        if (retryCount < 2) {
          // Retry after delay
          setTimeout(() => fetchProfile(userId, retryCount + 1), 1000);
          return;
        }
        setAuthError('Failed to load profile data');
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (retryCount < 2) {
        setTimeout(() => fetchProfile(userId, retryCount + 1), 1000);
        return;
      }
      setAuthError('Network error while loading profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let profileSubscription: any = null;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Clean up previous subscription
        if (profileSubscription) {
          profileSubscription.unsubscribe();
          profileSubscription = null;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
          
          // Set up realtime subscription for profile changes
          setTimeout(() => {
            profileSubscription = supabase
              .channel(`profile-${session.user.id}`)
              .on(
                'postgres_changes',
                {
                  event: 'UPDATE',
                  schema: 'public',
                  table: 'profiles',
                  filter: `id=eq.${session.user.id}`
                },
                (payload) => {
                  console.log('Profile updated via realtime:', payload.new);
                  if (payload.new) {
                    setProfile(payload.new as Profile);
                  }
                }
              )
              .subscribe();
          }, 100);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setAuthError('Authentication error');
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Initialize auth error:', error);
        setAuthError('Failed to initialize authentication');
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      if (profileSubscription) {
        profileSubscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    setAuthError(null);
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const isSubscriber = profile?.role === 'subscriber';
  const isSuperAdmin = profile?.role === 'superadmin';

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    authError,
    signIn,
    signUp,
    signOut,
    isSubscriber,
    isSuperAdmin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};