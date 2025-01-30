import { Order } from '../order/types';

export interface SourceItem {
    id: string;
    name: string;
    url: string;
    isCustom?: boolean;
    sourceType?: SourceType;
}

export interface PeripheralItem {
    id: string;
    name: string;
    isCustom?: boolean;
    isDefault?: boolean;
}

export interface PreferencesData {
    parts_source: SourceItem[];
    existing_hardware: PeripheralItem[];
    custom_sources?: SourceItem[];
    custom_peripherals?: PeripheralItem[];
}

export interface UserPreferences {
    preferences: PreferencesData;
    peripherals_budget?: {
        amount: number;
        added_service_cost: number;
        order_id?: string;
    };
}

// For the component props, create a new interface that includes the simple budget number
export interface PreferencesDisplayData extends PreferencesData {
    peripherals_budget?: number;
}

export interface PreferencesFormProps {
    darkMode: boolean;
    orders: Order[];
    userId: string;
    onOrdersUpdate: () => Promise<void>;
}

export interface PartsSourceCategory {
    name: string;
    sources: SourceItem[];
}

export interface CustomItem {
    id: string;
    name: string;
    url?: string;
    isCustom: boolean;
}

export type PreferenceTarget = 'global' | 'specific';

export type SourceType = 'local' | 'international' | 'secondhand' | 'unknown';
