import { User } from '@supabase/supabase-js';

export interface AuthMetadata {
    fullName?: string;
    phone?: string;
}

// types.ts
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isSigningOut: boolean;
    error: Error | null;
    signIn: (email: string, password: string, role?: 'Admin' | 'Customer') => Promise<any>;
    signInWithGoogle: (role?: 'Admin' | 'Customer') => Promise<void>;
    signUp: (email: string, password: string, metadata?: AuthMetadata) => Promise<any>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    maintainUserRole: (userId: string) => Promise<{error: any}>;
}