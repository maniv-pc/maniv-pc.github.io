export interface PeripheralItem {
    id: string;
    name?: string;
    isCustom: boolean;
}

export interface PartsSource {
    id: string;
    name: string;
    url: string;
}

export interface PreferencesData {
    parts_source?: PartsSource[];
    existing_hardware?: PeripheralItem[];
    custom_sources?: Array<{ name: string; url: string; }>;
    custom_peripherals?: string[];
}