export const AUTH_VIEW = {
    SIGN_IN: 'sign_in',
    SIGN_UP: 'sign_up',
    RESET_PASSWORD: 'reset_password'
} as const;

export type AuthView = typeof AUTH_VIEW[keyof typeof AUTH_VIEW];

export interface UserMetadata {
    fullName?: string;
    phone?: string;
}

export interface AuthFormState {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    error: string | null;
    fullNameError: string | null;
    phoneError: string | null;
}

export interface AuthFormProps {
    darkMode: boolean;
    initialView?: AuthView;
}