import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import { AuthContextType, AuthMetadata } from './types';
import { getConfig, getBaseUrl } from '../../config';

const config = getConfig();

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
        flowType: 'pkce'
      }
    }
);

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [authError, setAuthError] = useState<Error | null>(null);

   // בקובץ index.tsx
    useEffect(() => {
        let mounted = true;

        const handleAuthStateChange = async (event: string, session: Session | null) => {
            if (!mounted) return;
            
            console.log('Auth State Change:', {
                event,
                sessionExists: !!session,
                userExists: !!session?.user,
                currentUrl: window.location.href
            });

            // אם כבר ניסינו לנקות URL קודם, לא צריך שוב
            if (!window.location.search.includes('code=')) {
                setUser(session?.user || null);
            }
        };

        const initializeAuth = async () => {
            // הימנע מאתחול כפול אם כבר יש session
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Failed to get session:', error);
                return;
            }

            if (session?.user) {
                setUser(session.user);
                return;
            }

            // רק אם אין session, המשך עם האתחול הרגיל
            supabase.auth.onAuthStateChange(handleAuthStateChange);
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, []); // Remove dependencies to run only once

    const maintainUserRole = async (userId: string) => {
        try {
          // Get user's current role
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('role, email')
            .eq('id', userId)
            .single();
            
          if (fetchError) return { error: fetchError };
      
          // If admin, maintain admin role
          if (profile.role === 'Admin') {
            const { error } = await supabase
              .from('profiles')
              .update({ role: 'Admin' })
              .eq('id', userId);
            return { error };
          }
      
          // For customers, check if they have any offers
          const { data: offers, error: offersError } = await supabase
            .from('offers')
            .select('id')
            .eq('email', profile.email);
      
          if (offersError) return { error: offersError };
      
          // Update role based on offers existence
          const newRole = offers && offers.length > 0 ? 'Customer' : 'NotRelated';
          const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);
      
          return { error };
        } catch (error) {
          return { error };
        }
    };
    
    const signIn = async (email: string, password: string, role?: 'Admin' | 'Customer') => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ 
                email, 
                password
            });
    
            if (error) throw error;
            if (!data.user) throw new Error('No user data returned');
    
            if (role) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();
    
                if (profileError) {
                    await supabase.auth.signOut();
                    throw profileError;
                }

                // Admin portal - send notification and allow only admin access
                if (role === 'Admin') {
                    if (profile.role !== 'Admin') {
                        await supabase.auth.signOut();
                        throw new Error('Unauthorized access');
                    }
                    
                    const baseUrl = getBaseUrl();
                    await fetch(`${baseUrl}/api/send-admin-alert`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userEmail: email,
                            timestamp: new Date().toISOString()
                        })
                    });
                }
                
                // Customer portal - allow only customer access
                if (role === 'Customer' && profile.role !== 'Customer') {
                    await supabase.auth.signOut();
                    throw new Error('Unauthorized access');
                }
            }
        } catch (error) {
            console.error('Error in signIn:', error);
            throw error;
        }
    };

    const signInWithGoogle = async (role?: 'Admin' | 'Customer'): Promise<void> => {
        try {
          const baseUrl = getBaseUrl();
          const redirectPath = role === 'Admin' ? '/admin' : '/portal';
          
          // Make sure we only have one hash in the redirect URL
          const redirectUrl = `${baseUrl}/#${redirectPath}`;
          
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              },
              scopes: 'email profile'
            }
          });
          
          if (error) throw error;
          
          if (!data?.url) throw new Error('No OAuth URL returned');
          
          // Add loading state before redirect
          setLoading(true);
          
          // Add small delay before redirect to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 100));
          
          window.location.href = data.url;
          
        } catch (error) {
          console.error('Error in signInWithGoogle:', error);
          setAuthError(error as Error);
          setLoading(false);
          throw error;
        }
      };

    const resetPassword = async (email: string) => {
        try {
            const baseUrl = getBaseUrl();
            const { error } = await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: `${baseUrl}/#/reset-password`
                }
            );
            if (error) throw error;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    };
    
    const signUp = async (email: string, password: string, metadata?: AuthMetadata) => {
        try {
            // Check offer exists with matching name and email
            const { data: offerData, error: offerError } = await supabase
                .from('offers')
                .select('*')
                .eq('email', email)
                .eq('full_name', metadata?.fullName)
                .single();
    
            if (offerError && offerError.code !== 'PGRST116') throw offerError;
            if (!offerData) throw new Error('No matching offer found');
    
            // Create auth user with correct role
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'Customer', // Force Customer role if offer exists
                        full_name: metadata?.fullName,
                        phone: metadata?.phone
                    }
                }
            });
    
            if (signUpError) throw signUpError;
            if (!data.user) throw new Error('No user data returned');
    
            // Update profile role explicitly
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'Customer' })
                .eq('id', data.user.id);
    
            if (updateError) throw updateError;
    
            return data;
        } catch (error) {
            console.error('Error in signUp:', error);
            throw error;
        }
    };

    const signOut = async () => {
        setIsSigningOut(true);
        
        try {
            await supabase.auth.signOut();
        
            // Reset states
            setUser(null);
            setAuthError(null);
        
            // Get the current hash route
            const currentHash = window.location.hash;
            
            // בדוק אם המשתמש היה באדמין או בפורטל
            const redirectPath = currentHash.includes('/admin') ? '/admin' : '/portal';
            
            // שימוש ב-HashRouter לניווט
            window.location.href = `${getBaseUrl()}/#${redirectPath}`;
        } catch (error) {
            console.error('Sign out error:', error);
            setAuthError(error as Error);
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading: loading || isSigningOut,
            isSigningOut,
            error: authError,
            maintainUserRole,
            signIn,
            signInWithGoogle,
            signUp,
            signOut,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};