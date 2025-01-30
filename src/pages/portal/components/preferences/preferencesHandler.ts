// PreferenceHandler.ts
import { PreferencesData } from './types';
import { Order } from '../order/types'

export const getEffectivePreferences = (
    order: Order,
    globalPreferences?: PreferencesData | null
): {
    preferences: PreferencesData;
    peripheralsBudget: number;
} => {
    // For pending offers, use offer-specific preferences if they exist
    if (order.status === 'pending') {
        return {
            preferences: {
                parts_source: order.preferences?.parts_source || [],
                existing_hardware: order.preferences?.existing_hardware || [],
                custom_sources: order.preferences?.custom_sources || [],
                custom_peripherals: order.preferences?.custom_peripherals || [],
            },
            peripheralsBudget: order.peripherals_budget || 0
        };
    }

    // For authenticated orders, check offer preferences first
    const offerPreferences = order.offers?.preferences;
    const offerPeripheralsBudget = order.offers?.peripherals_budget;

    if (offerPreferences) {
        return {
            preferences: {
                parts_source: offerPreferences.parts_source || [],
                existing_hardware: offerPreferences.existing_hardware || [],
                custom_sources: offerPreferences.custom_sources || [],
                custom_peripherals: offerPreferences.custom_peripherals || [],
            },
            peripheralsBudget: offerPeripheralsBudget || 0
        };
    }

    // Fallback to global preferences
    if (globalPreferences) {
        return {
            preferences: globalPreferences,
            peripheralsBudget: order.peripherals_budget || 0
        };
    }

    // Default empty preferences if nothing exists
    return {
        preferences: {
            parts_source: [],
            existing_hardware: [],
            custom_sources: [],
            custom_peripherals: []
        },
        peripheralsBudget: 0
    };
};

// Utility function to validate budget usage
export const validateBudgetUsage = (
    hardwareCost: number,
    peripheralsCost: number,
    totalBudget: number,
    peripheralsBudget: number
): {
    isValid: boolean;
    message?: string;
} => {
    const hardwareBudgetLimit = totalBudget * 1.03; // 3% tolerance
    const peripheralsBudgetLimit = peripheralsBudget * 1.03;

    if (hardwareCost > hardwareBudgetLimit) {
        return {
            isValid: false,
            message: `Hardware cost (${hardwareCost}) exceeds budget limit (${hardwareBudgetLimit})`
        };
    }

    if (peripheralsCost > peripheralsBudgetLimit) {
        return {
            isValid: false,
            message: `Peripherals cost (${peripheralsCost}) exceeds budget limit (${peripheralsBudgetLimit})`
        };
    }

    return { isValid: true };
};

// Utility to track parts list progress
export const calculatePartsListProgress = (
    partsList: any[],
    preferences: PreferencesData
): {
    hardwareProgress: number;
    peripheralsProgress: number;
} => {
    const requiredPeripherals = preferences.existing_hardware.filter(item => !item.isCustom);
    const addedPeripherals = partsList.filter(part => part.type === 'peripheral');
    
    const peripheralsProgress = requiredPeripherals.length > 0 
        ? (addedPeripherals.length / requiredPeripherals.length) * 100
        : 100;

    // Calculate hardware progress based on essential components
    const essentialComponents = [
        'CPU', 'MOTHERBOARD', 'MEMORY', 'STORAGE', 'GPU', 'PSU', 'CASE'
    ];
    
    const addedComponents = new Set(
        partsList
            .filter(part => part.type !== 'peripheral')
            .map(part => part.type)
    );

    const hardwareProgress = (
        essentialComponents.filter(comp => addedComponents.has(comp)).length / 
        essentialComponents.length
    ) * 100;

    return {
        hardwareProgress,
        peripheralsProgress
    };
};