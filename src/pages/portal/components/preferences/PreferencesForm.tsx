import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from 'components/ui/card';
import { Checkbox } from 'components/ui/checkbox';
import { Label } from 'components/ui/label';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { 
    PreferencesFormProps, 
    PreferencesData,
    SourceItem,
    PeripheralItem,
    SourceType
} from './types';
import { partsSourceCategories, defaultPeripherals } from './constants';
import { supabase } from 'context/auth';
import { AlertCircle } from 'lucide-react';

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
    darkMode,
    orders,
    userId,
    onOrdersUpdate
}) => {
    const [activeTab, setActiveTab] = useState('global');
    const [selectedOfferId, setSelectedOfferId] = useState<string>('');
    const [preferences, setPreferences] = useState<PreferencesData>({
        parts_source: [],
        existing_hardware: [],
        custom_sources: [],
        custom_peripherals: [],
    });
    const [peripheralsBudget, setPeripheralsBudget] = useState<number | null>(null);
    const [newPeripheralName, setNewPeripheralName] = useState('');
    const [newSourceName, setNewSourceName] = useState('');
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [sourceType, setSourceType] = useState<SourceType>('local');
    const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isSourceTypeOpen, setIsSourceTypeOpen] = useState(false);

    const pendingOrders = orders.filter(order => order.status === 'pending');

    useEffect(() => {
        if (activeTab === 'global') {
            fetchGlobalPreferences();
        } else if (selectedOfferId) {
            fetchOfferPreferences(selectedOfferId);
        }
    }, [activeTab, selectedOfferId]);

    const fetchGlobalPreferences = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('preferences, peripherals_budget')
                .eq('id', userId)
                .single();
    
            if (error) throw error;
            setPreferences(data?.preferences || {
                parts_source: [],
                existing_hardware: [],
                custom_sources: [],
                custom_peripherals: []
            });
            setPeripheralsBudget(data?.peripherals_budget || 0);
            setHasUnsavedChanges(false);
        } catch (error: any) {
            console.error('Error fetching global preferences:', error);
            setError(error.message);
        }
    };
    
    const fetchOfferPreferences = async (offerId: string) => {
        try {
            const { data, error } = await supabase
                .from('offers')
                .select('preferences, peripherals_budget')
                .eq('id', offerId)
                .single();
    
            if (error) throw error;
            setPreferences(data?.preferences || {
                parts_source: [],
                existing_hardware: [],
                custom_sources: [],
                custom_peripherals: []
            });
            setPeripheralsBudget(data?.peripherals_budget || 0);
            setHasUnsavedChanges(false);
        } catch (error: any) {
            console.error('Error fetching offer preferences:', error);
            setError(error.message);
        }
    };
    
    
    const handleSavePreferences = async () => {
        try {
            // בדוק אם יש תוכן בהעדפות
            const hasContent = preferences.parts_source.length > 0 || 
                            preferences.existing_hardware.length > 0 ||
                            (preferences.custom_sources?.length ?? 0) > 0 ||
                            (preferences.custom_peripherals?.length ?? 0) > 0;

            // בדוק תקינות תקציב ציוד היקפי
            const hasPeripherals = preferences.existing_hardware.length > 0;
            const isValidBudget = hasPeripherals ? (peripheralsBudget ?? 0) > 0 : true;

            if (hasPeripherals && !isValidBudget) {
                setError('חובה לקבוע תקציב ציוד היקפי כאשר נבחר ציוד היקפי');
                return;
            }

            const dataToUpdate = {
                preferences: hasContent ? preferences : null,
                peripherals_budget: hasContent && hasPeripherals ? peripheralsBudget : null
            };

            if (activeTab === 'global') {
                const { error } = await supabase
                    .from('profiles')
                    .update(dataToUpdate)
                    .eq('id', userId);

                if (error) throw error;
            } else if (selectedOfferId) {
                const { error } = await supabase
                    .from('offers')
                    .update(dataToUpdate)
                    .eq('id', selectedOfferId);

                if (error) throw error;
            }

            setHasUnsavedChanges(false);
            setError(null);
            
            // עדכן את ההזמנות כדי לראות את השינויים
            if (onOrdersUpdate) {
                await onOrdersUpdate();
            }
        } catch (error: any) {
            console.error('Error saving preferences:', error);
            setError(error.message);
        }
    };

    const handleSourceSelect = (source: SourceItem, checked: boolean) => {
        const currentPreferences = preferences || {
            parts_source: [],
            existing_hardware: [],
            custom_sources: [],
            custom_peripherals: []
        };
    
        const updatedSources = checked
            ? [...currentPreferences.parts_source, source]
            : currentPreferences.parts_source.filter(s => s.id !== source.id);
        
        setPreferences({ 
            ...currentPreferences, 
            parts_source: updatedSources 
        });
        setHasUnsavedChanges(true);
    };
    
    const handleAddCustomSource = () => {
        if (!newSourceName || !newSourceUrl) {
            setTemporaryError('יש להזין שם וכתובת אתר');
            return;
        }
    
        const currentPreferences = preferences || {
            parts_source: [],
            existing_hardware: [],
            custom_sources: [],
            custom_peripherals: []
        };
    
        const newSource: SourceItem = {
            id: `custom_${Date.now()}`,
            name: newSourceName,
            url: newSourceUrl,
            isCustom: true,
            sourceType
        };
    
        setPreferences({
            ...currentPreferences,
            custom_sources: [...(currentPreferences.custom_sources || []), newSource],
            parts_source: [...currentPreferences.parts_source, newSource]
        });
        setNewSourceName('');
        setNewSourceUrl('');
        setHasUnsavedChanges(true);
    };

    const handleAddCustomPeripheral = () => {
        if (!newPeripheralName) {
            setError('יש להזין שם לציוד ההיקפי');
            return;
        }

        const newPeripheral: PeripheralItem = {
            id: `custom_${Date.now()}`,
            name: newPeripheralName,
            isCustom: true
        };

        setPreferences({
            ...preferences,
            custom_peripherals: [...(preferences.custom_peripherals || []), newPeripheral],
            existing_hardware: [...preferences.existing_hardware, newPeripheral]
        });
        setNewPeripheralName('');
        setHasUnsavedChanges(true);
    };

    // Update error setting to include auto-clear
    const setTemporaryError = (message: string) => {
        if (errorTimeout) {
            clearTimeout(errorTimeout);
        }
        setError(message);
        const timeout = setTimeout(() => {
            setError(null);
        }, 3000); // Clear after 3 seconds
        setErrorTimeout(timeout);
    };

    const renderPreferencesContent = () => {

        const getCustomSourcesByType = (type: SourceType) => 
            preferences.custom_sources?.filter(source => source.sourceType === type) || [];

        const currentPreferences = preferences || {
            parts_source: [],
            existing_hardware: [],
            custom_sources: [],
            custom_peripherals: []
        };

        return (
            <>
                {/* Parts Sources Section with Alert */}
                <div className="mb-8 relative">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">מקורות חלקים</h3>
                        <Alert className="border-0 bg-transparent p-0 w-fit flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            <AlertDescription className="text-amber-500 text-sm">
                                העדפות אלו רלוונטיות רק להצעות מחיר שטרם אושרו
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* Sources Categories */}
                    {partsSourceCategories.map((category) => {
                        const customSourcesForCategory = getCustomSourcesByType(
                            category.name === 'חנויות מקומיות' ? 'local' :
                            category.name === 'חנויות בינלאומיות' ? 'international' : 'secondhand'
                        );

                        return (
                            <div key={category.name} className="mb-4">
                                <h4 className="font-medium text-white/80 mb-2">{category.name}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {[...category.sources, ...customSourcesForCategory].map((source) => (
                                        <div key={source.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={source.id}
                                                checked={preferences.parts_source.some(s => s.id === source.id)}
                                                onCheckedChange={(checked) => handleSourceSelect(source, checked as boolean)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={source.id}>{source.name}</Label>
                                                <a href={source.url} target="_blank" rel="noopener noreferrer" 
                                                   className="text-blue-400 hover:text-blue-300 text-sm">
                                                    (קישור לאתר)
                                                </a>
                                                {source.isCustom && (
                                                    <span className="text-gray-400 text-sm">(מותאם אישית)</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Unknown Sources Section */}
                    {getCustomSourcesByType('unknown').length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-medium text-white/80 mb-2">לא ידוע</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {getCustomSourcesByType('unknown').map((source) => (
                                    <div key={source.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={source.id}
                                            checked={preferences.parts_source.some(s => s.id === source.id)}
                                            onCheckedChange={(checked) => handleSourceSelect(source, checked as boolean)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={source.id}>{source.name}</Label>
                                            <a href={source.url} target="_blank" rel="noopener noreferrer"
                                               className="text-blue-400 hover:text-blue-300 text-sm">
                                                (קישור לאתר)
                                            </a>
                                            <span className="text-gray-400 text-sm">(מותאם אישית)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Custom Source */}
                    <div className="mt-6 space-y-4">
                        <h4 className="font-medium">הוסף מקור מותאם אישית</h4>
                        <div className="flex gap-4 relative isolate">
                            <Input
                                placeholder="שם המקור"
                                value={newSourceName}
                                onChange={(e) => setNewSourceName(e.target.value)}
                                className={`${darkMode ? 'bg-gray-700' : 'bg-white/10'} text-white`}
                            />
                            <Input
                                placeholder="כתובת אתר"
                                value={newSourceUrl}
                                onChange={(e) => setNewSourceUrl(e.target.value)}
                                className={`${darkMode ? 'bg-gray-700' : 'bg-white/10'} text-white`}
                            />
                            <div className="relative">
                                    <Select
                                        value={sourceType}
                                        onValueChange={(value: SourceType) => setSourceType(value)}
                                        onOpenChange={setIsSourceTypeOpen}
                                        dir="rtl"
                                    >
                                    <SelectTrigger 
                                        className={`${darkMode ? 'bg-gray-700' : 'bg-white/10'} text-white relative z-20`}
                                    >
                                        <SelectValue placeholder="סוג מקור" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        className={`${darkMode ? 'bg-gray-700' : 'bg-white/10'} text-white border-0 z-50`}
                                        position="popper"
                                        sideOffset={5}
                                        align="end"
                                    >
                                        <div className="bg-inherit">
                                            <SelectItem value="local" className="text-right">חנויות מקומיות</SelectItem>
                                            <SelectItem value="international" className="text-right">חנויות בינלאומיות</SelectItem>
                                            <SelectItem value="secondhand" className="text-right">שוק יד שנייה</SelectItem>
                                            <SelectItem value="unknown" className="text-right">לא ידוע</SelectItem>
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAddCustomSource} className='bg-white/20'>
                                הוסף מקור
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="transition-all duration-200 pointer-events-none" style={{ height: isSourceTypeOpen ? '160px' : '0' }} />

                {/* Peripherals Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">ציוד היקפי</h3>
                        <div className="flex-grow flex justify-center items-center gap-4">
                            <Label className="font-bold">תקציב ציוד היקפי:</Label>
                            <Input
                                type="number"
                                value={peripheralsBudget || ''}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value > 0 && preferences.existing_hardware.length > 0) {
                                        setPeripheralsBudget(value);
                                        setHasUnsavedChanges(true);
                                    }
                                }}
                                placeholder="הזן תקציב"
                                className={`w-32 ${darkMode ? 'bg-gray-700' : ''}`}
                                disabled={preferences.existing_hardware.length === 0}
                            />
                            <span className="text-sm text-gray-300">
                                תקציב נפרד מתקציב החומרה
                            </span>
                        </div>
                    </div>

                    {/* All Peripherals */}
                    <div className="mb-4">
                        <h4 className="font-medium mb-2">ציוד היקפי</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {[...defaultPeripherals, ...(preferences.custom_peripherals || [])].map((peripheral) => (
                                <div key={peripheral.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={peripheral.id}
                                        checked={preferences.existing_hardware.some(h => h.id === peripheral.id)}
                                        // In the checkbox onChange handler:
                                        onCheckedChange={(checked) => {
                                            const updatedHardware = checked
                                                ? [...preferences.existing_hardware, peripheral]
                                                : preferences.existing_hardware.filter(h => h.id !== peripheral.id);
                                            
                                            // Update preferences
                                            setPreferences({
                                                ...preferences,
                                                existing_hardware: updatedHardware
                                            });
                                            
                                            // Handle peripherals budget based on selection
                                            if (checked && peripheralsBudget === 0) {
                                                setPeripheralsBudget(1); // Set minimum budget when first peripheral is selected
                                            } else if (!checked && updatedHardware.length === 0) {
                                                setPeripheralsBudget(null); // Reset budget to null when no peripherals are selected
                                            }
                                            
                                            setHasUnsavedChanges(true);
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={peripheral.id}>{peripheral.name}</Label>
                                        {peripheral.isCustom && (
                                            <span className="text-gray-400 text-sm">(מותאם אישית)</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Custom Peripheral */}
                    <div className="space-y-4">
                        <h4 className="font-medium">הוסף ציוד היקפי מותאם אישית</h4>
                        <div className="flex gap-4">
                            <Input
                                placeholder="שם הציוד"
                                value={newPeripheralName}
                                onChange={(e) => setNewPeripheralName(e.target.value)}
                                className={`w-48 ${darkMode ? 'bg-gray-700' : ''}`}
                            />
                            <Button onClick={handleAddCustomPeripheral} className='bg-white/20'>
                                הוסף ציוד
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <Card className={`backdrop-blur-sm border-0 ${darkMode ? 'bg-gray-800/50' : 'bg-white/10'}`}>
            <CardContent className="text-white pt-6">
                <Tabs dir="rtl" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="w-full flex flex-row-reverse">
                        <TabsTrigger 
                            className="data-[state=active]:bg-white/20" 
                            value="specific" 
                            disabled={pendingOrders.length === 0}
                        >
                            העדפות להצעה ספציפית
                        </TabsTrigger>
                        <TabsTrigger 
                            className="data-[state=active]:bg-white/20" 
                            value="global"
                        >
                            העדפות גלובליות
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="global" className="text-right">
                        {renderPreferencesContent()}
                    </TabsContent>

                    <TabsContent value="specific" className="text-right">
                        <div className="mb-6 text-right" dir="rtl">
                            <div className="flex items-center gap-4">
                                <Label>בחר הצעת מחיר:</Label>
                                <Select
                                    value={selectedOfferId}
                                    onValueChange={setSelectedOfferId}
                                    dir="rtl"
                                >
                                    <SelectTrigger className={`w-48 ${darkMode ? 'bg-gray-700' : 'bg-white/10'} text-white`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={`${darkMode ? 'bg-gray-700' : 'bg-white/10'} text-white text-right`}>
                                        {pendingOrders.map(order => (
                                            <SelectItem 
                                                key={order.id} 
                                                value={order.id}
                                            >
                                                הצעה {order.id.slice(-6)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {selectedOfferId && renderPreferencesContent()}
                    </TabsContent>
                </Tabs>

                {/* Save Button */}
                <div className="mt-6 flex justify-center">
                    <Button 
                        onClick={handleSavePreferences}
                        disabled={!hasUnsavedChanges}
                        className={`${!hasUnsavedChanges ? 'opacity-50' : ''} bg-green-700 hover:bg-green-800`}
                    >
                        שמור העדפות
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default PreferencesForm;