import { PreferencesData } from "../preferences/types";

export interface OrderCardProps {
    order: Order;
    darkMode: boolean;
    onOrderUpdate: () => Promise<void>;
    preferences?: PreferencesData;
    peripheralsBudget?: number;
    onApprove?: (orderId: string) => Promise<void>;
    onCancel?: (orderId: string, isInitialOrder: boolean) => Promise<void>;
    onSchedule?: (date: Date) => Promise<void>;
    onPaymentClick?: () => void;
}

export interface Offer {
    id: string;
    budget: number;
    service_cost: number;
    preferences?: PreferencesData;
    peripherals_budget?: number;
    service_type: 'consultationOnly' | 'buildOnly' | 'consultationAndBuild';
    use_types: string[];
    operating_system?: string;
    game_resolution?: string;
    video_software?: string;
    delivery_type?: 'pickup' | 'build_at_home' | 'shipping';
    address?: string;
    city?: string;
}

export interface Order {
    id: string;
    offer_id?: string;
    offers?: Offer; // Add the offers relationship
    status: 'pending' | 'approved' | 'pending_initial_list' | 'pending_consultation_payment' | 
            'pending_parts_upload' | 'pending_schedule'| 'schedule_pending_approval' | 
            'building' | 'ready' | 'delivered' | 'cancelled' | 'cancellation_pending';
    budget: number;
    service_cost: number;
    paid_amount: number;
    created_at: string;
    parts_list?: PartsList;
    service_type: 'consultationOnly' | 'buildOnly' | 'consultationAndBuild';
    use_types: string[];
    operating_system?: string;
    delivery_type?: 'pickup' | 'build_at_home' | 'shipping';
    address?: string;
    city?: string;
    game_resolution?: string;
    video_software?: string;
    build_date?: string;
    weekend_fee_applied?: boolean;
    payment_method?: 'later' | 'bit' | 'paybox' | 'bank';
    build_notes?: string;
    build_photos?: string[];
    support_tickets?: any[];
    agree_to_terms?: boolean;
    peripherals_added?: boolean;
    cancelled_at?: string;
    actual_delivery_date?: string;
    preferences?: PreferencesData;
    peripherals_budget?: number;
}

// PartsList
export interface PartsListItem {
    id: string;
    name: string;
    price: number;
    source: string;
    link?: string;
    quantity: number;
    type: string;
    peripheralType?: string;
}

export type PeripheralType = {
    type: 'peripheral';
    name: string;
    peripheralType: string;
}

export type ComponentType = string | PeripheralType;

export const SINGLE_CHOICE_COMPONENTS = {
    CPU: 'מעבד',
    MOTHERBOARD: 'לוח אם',
    CPU_COOLER: 'מאוורר למעבד',
    CASE: 'מארז',
    PSU: 'ספק כוח',
} as const;

export const MULTI_CHOICE_COMPONENTS = {
    MEMORY: 'זיכרון',
    STORAGE: 'אחסון',
    CASE_FAN: 'מאוורר למארז',
    GPU: 'כרטיס מסך'
} as const;

export const PERIPHERALS_MAP = {
    monitor: 'מסך',
    mouse: 'עכבר',
    keyboard: 'מקלדת',
    speakers: 'רמקולים',
    headphones: 'אוזניות'
} as const;

export interface PartsListViewerProps {
    isOpen: boolean;
    onClose: () => void;
    parts: PartsListItem[] | undefined;
    isInitialList: boolean;
    darkMode: boolean;
    onPayConsultation?: () => void;
    isUploadMode?: boolean;
    onUploadParts?: (parts: PartsListItem[]) => Promise<void>;
    peripheralsTypes?: string[];
    totalBudget: number;
    preferences?: PreferencesData;
    peripheralsBudget?: number;
}

export interface PartsList {
    initial_list?: PartsListItem[];
    full_list?: PartsListItem[];
    upload_date?: string;
}

export interface BuildSchedule {
    requested_date?: string;
    approved_date?: string;
    admin_notes?: string;
    status: 'pending' | 'approved' | 'rejected';
}


export interface BuildSchedulerProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
    onSchedule: (date: Date) => Promise<void>;
    onOrderUpdate?: () => Promise<void>;
}

export interface PaymentDialogProps {
    orders: Order[];
    darkMode: boolean;
    onPaymentMethodChange: (orderId: string, method: string) => Promise<void>;
    onTermsAgreement: (orderId: string, agreed: boolean) => Promise<void>;
    onPaymentConfirm: (orderId: string) => Promise<void>;
    onOrderUpdate: () => Promise<void>;
    onPaymentClick?: (orderId: string) => void;
}

export interface ApiError extends Error {
    message: string;
}
