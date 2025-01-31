import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from 'components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from 'components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'components/ui/select';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Progress } from 'components/ui/progress';
import { ScrollArea } from 'components/ui/scroll-area';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { PreferencesData } from 'types/preferences';

// Types
interface PartsListItem {
    id: string;
    name: string;
    price: number;
    source: string;
    link?: string;
    quantity: number;
    type: string;
    peripheralType?: string;
}

interface PartsListViewerProps {
    isOpen: boolean;
    onClose: () => void;
    parts?: PartsListItem[];
    isInitialList: boolean;
    darkMode: boolean;
    isUploadMode?: boolean;
    onUploadParts?: (parts: PartsListItem[]) => Promise<void>;
    totalBudget: number;
    preferences?: PreferencesData;
    peripheralsBudget?: number;
}

// Constants
const REQUIRED_COMPONENTS = ['GPU', 'מעבד', 'לוח אם', 'זיכרון', 'ספק כוח', 'אחסון'];

const SINGLE_CHOICE_COMPONENTS = {
    CPU: 'מעבד',
    MOTHERBOARD: 'לוח אם',
    CPU_COOLER: 'מאוורר למעבד',
    CASE: 'מארז',
    PSU: 'ספק כוח',
} as const;

const MULTI_CHOICE_COMPONENTS = {
    MEMORY: 'זיכרון',
    STORAGE: 'אחסון',
    CASE_FAN: 'מאוורר למארז',
    GPU: 'כרטיס מסך'
} as const;

const PERIPHERALS_MAP = {
    monitor: 'מסך',
    mouse: 'עכבר',
    keyboard: 'מקלדת',
    speakers: 'רמקולים',
    headphones: 'אוזניות'
} as const;

type SingleChoiceComponentType = typeof SINGLE_CHOICE_COMPONENTS[keyof typeof SINGLE_CHOICE_COMPONENTS];
type PeripheralType = keyof typeof PERIPHERALS_MAP;
type PeripheralHebrewName = typeof PERIPHERALS_MAP[PeripheralType];
type ComponentType = string | { type: 'peripheral'; name: string; peripheralType: PeripheralType; };

export const PartsListViewer: React.FC<PartsListViewerProps> = ({
    isOpen,
    onClose,
    parts,
    isInitialList,
    darkMode,
    isUploadMode,
    onUploadParts,
    totalBudget,
    preferences,
    peripheralsBudget = 0
}) => {
    // State declarations
    const [localParts, setLocalParts] = useState<PartsListItem[]>([]);
    const [currentPart, setCurrentPart] = useState<Partial<PartsListItem>>({
        type: '',
        name: '',
        price: 0,
        link: '',
        quantity: 1
    });
    const [budgets, setBudgets] = useState<{
        hardware: number;
        peripherals: number;
    }>({
        hardware: 0,
        peripherals: 0
    });
    const [error, setError] = useState<string>('');
    const [customType, setCustomType] = useState<string>('');
    const [isCustomType, setIsCustomType] = useState(false);

    // Utility functions
    const reversePeripheralsMap = useMemo(() => {
        const reversed: Record<string, PeripheralType> = {};
        Object.entries(PERIPHERALS_MAP).forEach(([key, value]) => {
            reversed[value] = key as PeripheralType;
        });
        return reversed;
    }, []);

    const isPeripheralItem = useCallback((part: PartsListItem): boolean => {
        // If it's explicitly marked as peripheral type
        if (part.type === 'peripheral') return true;
        
        // If it has a peripheralType that matches our peripherals map
        if (part.peripheralType && isPeripheralType(part.peripheralType)) return true;
        
        // If the type itself matches any of our peripheral hebrew names
        if (isPeripheralHebrewName(part.type)) return true;
        
        return false;
    }, []);

    // Type guard functions
    const isPeripheralType = (type: string): type is PeripheralType => {
        return Object.keys(PERIPHERALS_MAP).includes(type);
    };

    const isPeripheralHebrewName = (type: string): type is PeripheralHebrewName => {
        return Object.values(PERIPHERALS_MAP).includes(type as PeripheralHebrewName);
    };

    const handleSubmit = () => {
        if (!onUploadParts) return;

        if (isInitialList && localParts.length !== 3) {
            setError('הרשימה הראשונית חייבת להכיל בדיוק 3 פריטים');
            return;
        }

        const hasAllRequired = REQUIRED_COMPONENTS.every(type => 
            localParts.some(part => part.type === type)
        );

        if (!isInitialList && !hasAllRequired) {
            setError('חסרים רכיבי חומרה הכרחיים');
            return;
        }

        onUploadParts(localParts);
    };

    // Required peripherals calculation (moved up)
    const requiredPeripherals = useMemo(() => {
        if (!preferences?.existing_hardware) return [];
        return preferences.existing_hardware
            .filter(item => !item.isCustom)
            .map(item => ({
                id: item.id as PeripheralType,
                name: PERIPHERALS_MAP[item.id as PeripheralType] || item.id,
                isRequired: true
            }));
    }, [preferences]);

    // Missing peripherals calculation (moved up)
    const missingPeripherals = useMemo(() => {
        if (!requiredPeripherals.length) return [];
        
        const currentPeripheralTypes = localParts
            .filter((part: PartsListItem) => part.type === 'peripheral')
            .map((part: PartsListItem) => part.peripheralType);

        return requiredPeripherals
            .filter(peripheral => !currentPeripheralTypes.includes(peripheral.id));
    }, [localParts, requiredPeripherals]);
    
    // Get available component types
    const availableTypes = useMemo(() => {
        const usedSingleChoiceTypes = localParts
            .map(part => part.type)
            .filter((type): type is SingleChoiceComponentType => 
                Object.values(SINGLE_CHOICE_COMPONENTS).includes(type as SingleChoiceComponentType)
            );
    
        const availableSingleChoiceTypes = Object.entries(SINGLE_CHOICE_COMPONENTS)
            .filter(([_, type]) => !usedSingleChoiceTypes.includes(type))
            .map(([_, type]) => type);
    
        const multiChoiceComponentTypes = Object.values(MULTI_CHOICE_COMPONENTS);
        
        const missingPeripheralTypes = missingPeripherals.map(p => ({
            type: 'peripheral' as const,
            name: p.name,
            peripheralType: p.id
        }));
    
        return [...availableSingleChoiceTypes, ...multiChoiceComponentTypes, ...missingPeripheralTypes] as ComponentType[];
    }, [localParts, missingPeripherals]);
    
    // Handle dialog close
    const handleClose = useCallback(() => {
        if (localParts.length > 0 && onUploadParts) {
            handleSubmit();
        }
        onClose();
    }, [localParts, onUploadParts, handleSubmit, onClose]);
    
    // Handle select change
    const handleTypeChange = useCallback((value: string) => {
        if (value === 'custom') {
            setIsCustomType(true);
        } else {
            const selectedType = availableTypes.find(t => 
                typeof t === 'string' ? t === value : t.type === value
            );
            
            if (selectedType && typeof selectedType !== 'string') {
                setCurrentPart({
                    ...currentPart,
                    type: 'peripheral',
                    peripheralType: selectedType.peripheralType
                });
            } else {
                setCurrentPart({...currentPart, type: value});
            }
        }
    }, [availableTypes, currentPart]);

    // Budget calculations
    const hardwareBudgetLimit = useMemo(() => totalBudget * 1.03, [totalBudget]);
    const peripheralsBudgetLimit = useMemo(() => peripheralsBudget * 1.03, [peripheralsBudget]);

    // Effects
    useEffect(() => {
        if (isOpen) {
            const savedParts = localStorage.getItem('savedParts');
            if (savedParts) {
                try {
                    const parsed = JSON.parse(savedParts);
                    if (Array.isArray(parsed)) {
                        setLocalParts(parsed);
                    }
                } catch (e) {
                    console.error('Error parsing saved parts:', e);
                }
            } else if (parts) {
                setLocalParts(parts);
            }
        }
    }, [isOpen, parts]);

    // Effect to save parts whenever they change
    useEffect(() => {
        // Only save if we have parts and the dialog is open
        if (localParts.length > 0) {
            localStorage.setItem('savedParts', JSON.stringify(localParts));
        }
    }, [localParts]);

    // Updated budget calculation effect
    useEffect(() => {
        const hardwareParts = localParts.filter(part => !isPeripheralItem(part));
        const peripheralParts = localParts.filter(part => isPeripheralItem(part));
    
        const hardwareTotal = hardwareParts.reduce((sum, part) => 
            sum + (part.price * (part.quantity || 1)), 0);
        const peripheralsTotal = peripheralParts.reduce((sum, part) => 
            sum + (part.price * (part.quantity || 1)), 0);
    
        setBudgets({
            hardware: hardwareTotal,
            peripherals: peripheralsTotal
        });
    }, [localParts, isPeripheralItem]);

    // Handlers
    const handleAddPart = () => {
        if (!currentPart.name || !currentPart.price || !currentPart.quantity) {
            setError('חסרים פרטי מוצר חיוניים');
            return;
        }
    
        const type = isCustomType ? customType : currentPart.type;
        if (!type) {
            setError('יש לבחור סוג מוצר');
            return;
        }
    
        // Determine if the part is a peripheral based on type or peripheralType
        const isPeripheral = type === 'peripheral' || 
            isPeripheralType(type) ||
            (currentPart.peripheralType && isPeripheralType(currentPart.peripheralType));
    
        const newPartCost = currentPart.price * (currentPart.quantity || 1);
        const relevantBudget = isPeripheral ? budgets.peripherals : budgets.hardware;
        const relevantLimit = isPeripheral ? peripheralsBudgetLimit : hardwareBudgetLimit;
    
        if (relevantBudget + newPartCost > relevantLimit) {
            setError(`חריגה מתקציב ${isPeripheral ? 'ציוד היקפי' : 'חומרה'}`);
            return;
        }
    
        const newPart: PartsListItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: currentPart.name,
            price: currentPart.price,
            source: 'custom',
            link: currentPart.link || '',
            quantity: currentPart.quantity,
            type: isPeripheral ? 'peripheral' : type,
            peripheralType: isPeripheral ? 
                (isPeripheralType(currentPart.peripheralType || '') ? 
                    (currentPart.peripheralType as PeripheralType) : 
                    type as PeripheralType) : 
                undefined
        };
    
        setLocalParts(prev => [...prev, newPart]);
        setCurrentPart({ type: '', name: '', price: 0, link: '', quantity: 1 });
        setCustomType('');
        setIsCustomType(false);
        setError('');
    };

    // UI components
    const renderPartType = useCallback((part: PartsListItem): string => {
        if (part.type === 'peripheral' && part.peripheralType) {
            // If it's a peripheral with a type, show that type directly
            return part.peripheralType;
        }
        // If the type matches a peripheral name, show it directly
        if (isPeripheralHebrewName(part.type)) {
            return part.type;
        }
        return part.type;
    }, []);

    const handleDeletePart = (id: string) => {
        setLocalParts(prev => prev.filter(part => part.id !== id));
    };

    // Render functions
    const renderBudgetStatus = () => (
        <div className="space-y-4 mb-6">
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-2">
                        <span>תקציב חומרה: {budgets.hardware.toLocaleString()}₪ / {totalBudget.toLocaleString()}₪</span>
                        <span>נותר: {Math.max(0, hardwareBudgetLimit - budgets.hardware).toLocaleString()}₪</span>
                    </div>
                    <Progress 
                        value={(budgets.hardware / hardwareBudgetLimit) * 100} 
                        className="h-2"
                    />
                </div>

                {peripheralsBudget > 0 && (
                    <div>
                        <div className="flex justify-between mb-2">
                            <span>תקציב ציוד היקפי: {budgets.peripherals.toLocaleString()}₪ / {peripheralsBudget.toLocaleString()}₪</span>
                            <span>נותר: {Math.max(0, peripheralsBudgetLimit - budgets.peripherals).toLocaleString()}₪</span>
                        </div>
                        <Progress 
                            value={(budgets.peripherals / peripheralsBudgetLimit) * 100}
                            className="h-2"
                        />
                    </div>
                )}
            </div>

            {preferences?.parts_source && preferences.parts_source.length > 0 && (
                <div className="mt-4 p-3 bg-gray-700/20 rounded">
                    <div className="text-sm mb-2">מקורות מאושרים לרכישה:</div>
                    <div className="flex flex-wrap gap-2">
                        {preferences.parts_source.map(source => (
                            <a
                                key={source.id}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-600/30 rounded hover:bg-gray-600/50 text-blue-400 hover:text-blue-300"
                            >
                                <ExternalLink className="h-4 w-4" />
                                {source.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Render required peripherals status
    const renderRequiredPeripheralsStatus = () => {
        if (!requiredPeripherals.length) return null;

        return (
            <div className="mt-4 p-3 bg-gray-700/20 rounded">
                <div className="text-sm mb-2">ציוד היקפי נדרש:</div>
                <div className="flex flex-wrap gap-2">
                    {requiredPeripherals.map(peripheral => {
                        const isAdded = localParts.some(
                            part => part.type === 'peripheral' && part.peripheralType === peripheral.id
                        );
                        return (
                            <span
                                key={peripheral.id}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                                    isAdded 
                                        ? 'bg-green-600/30 text-green-400'
                                        : 'bg-red-600/30 text-red-400'
                                }`}
                            >
                                {peripheral.name}
                                {isAdded ? ' ✓' : ' ✗'}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={`${darkMode ? 'bg-gray-800 text-white' : ''} max-w-5xl`}>
                <DialogHeader>
                    <DialogTitle className={darkMode ? 'text-white' : ''}>
                        {isInitialList ? 'רשימת חלקים ראשונית' : 'רשימה מלאה'}
                    </DialogTitle>
                    <DialogDescription className={darkMode ? 'text-gray-300' : ''}>
                        {isInitialList 
                            ? 'יש להוסיף 3 פריטים לרשימה הראשונית' 
                            : 'יש להוסיף את כל הרכיבים הנדרשים לרשימה'}
                    </DialogDescription>
                </DialogHeader>
    
                <div dir="rtl" className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {renderBudgetStatus()}
                    {!isInitialList && renderRequiredPeripheralsStatus()}
    
                    {isUploadMode && (
                        <div className="flex gap-2 mb-4">
                            {!isCustomType ? (
                                <Select
                                    dir="rtl"
                                    value={currentPart.type}
                                    onValueChange={handleTypeChange}
                                >
                                    <SelectTrigger className={`w-36 ${darkMode ? 'bg-gray-700 text-white' : ''} text-right`}>
                                        <SelectValue className="text-right" placeholder="סוג חלק" />
                                    </SelectTrigger>
                                    <SelectContent className={`${darkMode ? 'bg-gray-700 text-white' : ''}`}>
                                        {availableTypes.map((type, index) => (
                                            <SelectItem 
                                                key={index}
                                                value={typeof type === 'string' ? type : type.peripheralType}
                                                className={`${darkMode ? 'text-white hover:bg-gray-600' : ''} text-right`}
                                            >
                                                {typeof type === 'string' ? type : type.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem 
                                            value="custom"
                                            className={`${darkMode ? 'text-white hover:bg-gray-600' : ''} text-right`}
                                        >
                                            אחר...
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    dir="rtl"
                                    placeholder="הזן סוג חלק"
                                    className={`w-36 ${darkMode ? 'bg-gray-700 text-white' : ''} text-right placeholder:text-right`}
                                    value={customType}
                                    onChange={(e) => setCustomType(e.target.value)}
                                />
                            )}

                            <Input
                                placeholder="שם החלק"
                                className={`w-48 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
                                value={currentPart.name}
                                onChange={(e) => setCurrentPart({...currentPart, name: e.target.value})}
                            />
                            
                            <Input
                                placeholder="מחיר בש״ח"
                                type="number"
                                className={`w-24 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
                                value={currentPart.price}
                                onChange={(e) => setCurrentPart({...currentPart, price: Number(e.target.value)})}
                            />

                            <Input
                                placeholder="כמות"
                                type="number"
                                className={`w-20 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
                                value={currentPart.quantity}
                                onChange={(e) => setCurrentPart({...currentPart, quantity: Number(e.target.value)})}
                                min="1"
                            />

                            <Input
                                placeholder="קישור"
                                className={`w-36 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
                                value={currentPart.link}
                                onChange={(e) => setCurrentPart({...currentPart, link: e.target.value})}
                            />
                            
                            <Button 
                                onClick={handleAddPart}
                                disabled={isInitialList && localParts.length >= 3}
                                className={darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
    
                    <ScrollArea className="h-96 rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {isUploadMode && <TableHead className="text-right">פעולות</TableHead>}
                                    <TableHead className="text-right">קישור</TableHead>
                                    <TableHead className="text-right">כמות</TableHead>
                                    <TableHead className="text-right">מחיר</TableHead>
                                    <TableHead className="text-right">שם</TableHead>
                                    <TableHead className="text-right">סוג</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {localParts.map((part) => (
                                    <TableRow key={part.id}>
                                        {isUploadMode && (
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeletePart(part.id)}
                                                    className="mr-auto"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            {part.link && (
                                                <a 
                                                    href={part.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-400 flex items-center justify-end gap-1"
                                                >
                                                    צפה
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right ${darkMode ? 'text-white' : ''}`}>
                                            {part.quantity}
                                        </TableCell>
                                        <TableCell className={`text-right ${darkMode ? 'text-white' : ''}`}>
                                            ₪{part.price.toLocaleString()}
                                        </TableCell>
                                        <TableCell className={`text-right ${darkMode ? 'text-white' : ''}`}>
                                            {part.name}
                                        </TableCell>
                                        <TableCell className={`text-right ${darkMode ? 'text-white' : ''}`}>
                                            {renderPartType(part)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
    
                    {isUploadMode && (
                        <div className="flex justify-between items-center pt-4 border-t">
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isInitialList ? 
                                        localParts.length !== 3 : 
                                        !REQUIRED_COMPONENTS.every(type => 
                                            localParts.some(part => part.type === type)
                                        )}
                                    className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : ''} text-white`}
                                >
                                    {isInitialList ? 
                                        `הגש רשימה ראשונית (${localParts.length}/3)` : 
                                        'הגש רשימה מלאה'}
                                </Button>
                                <Button
                                    onClick={handleClose}
                                    variant="outline"
                                    className={darkMode ? 'text-white hover:bg-gray-700' : ''}
                                >
                                    סגור
                                </Button>
                            </div>
                            <div className={`text-lg font-bold ${darkMode ? 'text-white' : ''}`}>
                                סה"כ: ₪{(budgets.hardware + budgets.peripherals).toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PartsListViewer;