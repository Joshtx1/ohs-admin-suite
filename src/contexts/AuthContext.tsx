import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Temporary bypass for testing
  const bypassAuth = false; // Disable bypass to use auth signup
  
  if (bypassAuth) {
    // Create a mock user for bypass mode
    const mockUser = { id: 'bypass-user', email: 'bypass@test.com' } as User;
    const mockSession = { user: mockUser } as Session;
    
    return (
      <AuthContext.Provider value={{
        user: mockUser,
        session: mockSession,
        userRole: 'admin',
        loading: false,
        signIn: async () => ({ error: null }),
        signUp: async () => ({ error: null }),
        signOut: async () => {},
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role with a small delay to ensure data is ready
          setTimeout(async () => {
            try {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              console.log('User role fetched:', roleData?.role);
              setUserRole(roleData?.role || 'user');
            } catch (error) {
              console.error('Error fetching role:', error);
              setUserRole('user');
            }
          }, 100);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      if (!session) {
        setSession(null);
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      // First, find the user by username to get their email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, username, user_id')
        .eq('username', username)
        .maybeSingle();

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        return { error: { message: 'Database error occurred. Please try again.' } };
      }
      
      if (!profileData) {
        return { error: { message: 'Invalid username or password' } };
      }

      // Now sign in with the email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      });
      
      if (authError) {
        return { error: { message: 'Invalid username or password' } };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected error in signIn:', error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}