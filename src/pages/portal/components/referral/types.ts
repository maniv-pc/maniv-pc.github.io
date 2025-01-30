// src/pages/portal/components/referral/types.ts
import { Order } from '../order/types';  // Import from order types

export interface Referral {
    id: string;
    referrer_id: string;
    code: string;
    new_customer_name: string;
    new_customer_email: string;
    used: boolean;
    created_at: string;
}

export interface ReferralManagerProps {
    darkMode: boolean;
    userId: string;
    userEmail?: string | null;
    orders: Order[];
    referrals: Referral[];
    onCreateReferral: (customerName: string, customerEmail: string) => Promise<void>;
}

export interface ReferralFormState {
    customerName: string;
    customerEmail: string;
    error: string | null;
}