import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Temporary bypass for testing
  const bypassAuth = false; // Auth is now enabled
  
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
          // Fetch user role immediately - no delay needed
          try {
            const { data: roleData, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
            
            console.log('User role fetched:', roleData?.role, 'Error:', error);
            setUserRole(roleData?.role || 'user');
          } catch (error) {
            console.error('Error fetching role:', error);
            setUserRole('user');
          }
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

  const signUp = async (email: string, firstName: string, lastName: string) => {
    // Generate a temporary password for initial signup
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
    const redirectUrl = `${window.location.origin}/auth?reset=true`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    
    // Immediately send password reset email so user can set their own password
    if (!error) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
    }
    
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