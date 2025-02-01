import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Alert, AlertDescription } from 'components/ui/alert';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "components/ui/alert-dialog"
import { Input } from "components/ui/input"
import { BuildScheduler } from './BuildScheduler';
import { PartsListViewer } from './PartsListViewer';
import type { OrderCardProps, Order } from './types';
import { PreferencesData } from 'types/preferences';

const STATUS_LABELS: Record<Order['status'], string> = {
    pending: 'ממתין לאישור',
    approved: 'אושר',
    pending_initial_list: 'ממתין לרשימה ראשונית',
    pending_consultation_payment: 'ממתין לתשלום ייעוץ',
    pending_parts_upload: 'ממתין להעלאת חלקים',
    pending_schedule: 'ממתין לקביעת מועד',
    schedule_pending_approval: 'ממתין לאישור מועד',
    ready: 'מוכן',
    delivered: 'נמסר',
    cancelled: 'בוטל',
    cancellation_pending: 'ממתין לאישור ביטול',
    building: 'בבנייה'
};

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    onApprove,
    onCancel,
    darkMode,
    onOrderUpdate,
    onSchedule,
    onPaymentClick,
    preferences,
}) => {
    const [showPartsViewer, setShowPartsViewer] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelConfirmWord, setCancelConfirmWord] = useState('');

    const handleApprove = async () => {
        if (!onApprove) return;
        setIsSubmitting(true);
        try {
            await onApprove(order.id);
        } catch (error) {
            console.error('Error approving order:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!onCancel) return;
        setShowCancelDialog(true);
    };

    const handleCancelConfirm = async () => {
        if (!onCancel || cancelConfirmWord.toLowerCase() !== 'ביטול') return;
        
        setIsSubmitting(true);
        try {
            await onCancel(order.id, order.status === 'pending');
            setShowCancelDialog(false);
        } catch (error) {
            console.error('Error cancelling order:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSchedulerOpen = () => {
        setShowScheduler(true);
    };

    const handleSchedule = async (date: Date) => {
        if (!onSchedule || !onOrderUpdate) return;
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            await onSchedule(date);
            await onOrderUpdate();
            setShowScheduler(false);
        } catch (error) {
            console.error('Error scheduling build:', error);
            setError('אירעה שגיאה בקביעת המועד. אנא נסה שוב.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadgeVariant = (status: Order['status']): "default" | "destructive" | "outline" | "secondary" => {
        switch (status) {
            case 'cancelled':
            case 'cancellation_pending':
                return 'destructive';
            case 'ready':
            case 'delivered':
                return 'secondary';
            case 'building':
                return 'outline';
            default:
                return 'default';
        }
    };

    const renderServiceCost = (order: Order) => {
        const paidAmount = order.paid_amount || 0;
        
        if (order.status === 'pending') {
            // עבור הצעות מחיר - הצג את העלות הבסיסית + תוספת מחושבת
            const effectivePeripheralsBudget = order.peripherals_budget || 0;
            const peripheralsFee = effectivePeripheralsBudget ? Math.round(effectivePeripheralsBudget * 0.1) : 0;
            const totalServiceCost = order.service_cost + peripheralsFee;
    
            return (
                <div className="flex flex-col space-y-1">
                    <div className="text-sm text-gray-300 dark:text-gray-400">עלות שירות:</div>
                    <div className="font-medium text-white flex items-baseline gap-2">
                        <span>₪{totalServiceCost.toLocaleString()}</span>
                    </div>
                    
                    <div className="text-sm text-gray-400 flex flex-col">
                        <span>שירות בסיסי: ₪{order.service_cost.toLocaleString()}</span>
                        {peripheralsFee > 0 && (
                            <span>תוספת ציוד היקפי: ₪{peripheralsFee.toLocaleString()}</span>
                        )}
                    </div>
                </div>
            );
        } else {
            // עבור הזמנות בתהליך - הצג את הסכום הכולל מתוך offers
            const totalCost = order.service_cost;
            const remainingBalance = Math.max(0, totalCost - paidAmount);
    
            return (
                <div className="flex flex-col space-y-1">
                    <div className="text-sm text-gray-300 dark:text-gray-400">עלות שירות:</div>
                    <div className="font-medium text-white">
                        <span>₪{totalCost.toLocaleString()}</span>
                    </div>
                    
                    {remainingBalance > 0 && (
                        <div className="text-sm text-amber-400">
                            יתרה לתשלום: ₪{remainingBalance.toLocaleString()}
                        </div>
                    )}
    
                    {order.payment_method === 'later' && (
                        <div className="text-sm text-amber-500 dark:text-amber-400">
                            תשלום במזומן בסיום
                        </div>
                    )}
                </div>
            );
        }
    };

    const renderBuildDate = (order: Order) => {
        if (!order.build_date) return null;
    
        const date = new Date(order.build_date);
        const isWeekendRate = order.weekend_fee_applied;
        
        return (
            <div className="mt-4 p-3 bg-gray-700/50 rounded">
                <div className="text-sm text-gray-300">
                    {order.status === 'schedule_pending_approval' ? 'תאריך הרכבה שהוצע:' : 
                     order.status === 'building' ? 'תאריך הרכבה סוכם:' : 'מועד הרכבה:'}
                </div>
                <div className="font-medium text-white">
                    {date.toLocaleDateString('he-IL')} בשעה {date.toLocaleTimeString('he-IL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}
                </div>
                {isWeekendRate && (
                    <div className="text-sm text-amber-400 mt-1">
                        * כולל תוספת של ₪50 עבור הרכבה בסוף שבוע
                    </div>
                )}
            </div>
        );
    }

    const renderBudgetInfo = () => {
        // For pending offers, use the offer's values, falling back to global preferences
        const effectivePreferences = order.status === 'pending' 
            ? preferences  // This already includes merged preferences from profiles
            : order.offers?.preferences || preferences;  // For authenticated orders

        // Similar logic for peripherals budget
        const effectivePeripheralsBudget = order.status === 'pending'
            ? order.peripherals_budget
            : (order.offers?.peripherals_budget ?? order.peripherals_budget) ?? 0;
        
        return (
            <div className="flex flex-col space-y-1">
                <div className="text-sm text-gray-300 dark:text-gray-400">תקציב:</div>
                <div className="font-medium text-white">
                    <span>תקציב חומרה: ₪{order.budget.toLocaleString()}</span>
                    {Number(effectivePeripheralsBudget || 0) > 0 && (
                        <span className="mr-2 text-gray-300">
                            | תקציב ציוד היקפי: ₪{(effectivePeripheralsBudget || 0).toLocaleString()}
                        </span>
                    )}
                </div>
                {effectivePreferences?.parts_source && effectivePreferences.parts_source.length > 0 && (
                    <div className="text-sm text-gray-400 mt-1">
                        מקורות מועדפים: {effectivePreferences.parts_source.map((source, index) => (
                            // Add a more unique key using source.id and index as fallback
                            <React.Fragment key={source.id || `source-${index}`}>
                                {index > 0 && ", "}
                                <a 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    {source.name}
                                </a>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderDeliveryInfo = (order: Order) => {

        if (order.service_type === 'consultationOnly') {
            return 'אין';
        }

        if (!order.delivery_type) return '';

        const addressStr = order?.address && order?.city 
          ? `${order.address}, ${order.city}` 
          : '';
      
        switch (order.delivery_type) {
          case 'pickup':
            return 'איסוף עצמי';
          case 'build_at_home':
            return addressStr ? `הרכבה בבית הלקוח (${addressStr})` : 'הרכבה בבית הלקוח';
          case 'shipping':
            return addressStr ? `משלוח (${addressStr})` : 'משלוח';
          default:
            return '';
        }
    };

    // מרכז את כל הלוגיקה של הדיאלוג
    const renderSchedulerDialog = () => {
        if (!showScheduler || !onSchedule) return null;
        
        return (
            <BuildScheduler
                isOpen={showScheduler}
                onClose={() => {
                    setShowScheduler(false);
                }}
                darkMode={darkMode}
                onSchedule={handleSchedule}
                onOrderUpdate={onOrderUpdate}
            />
        );
    };

    const renderAdditionalInfo = () => {
        const items = [];
        
        if (order.operating_system) {
            items.push(`מערכת הפעלה: ${order.operating_system}`);
        }
        if (order.game_resolution) {
            items.push(`רזולוציית משחק: ${order.game_resolution}`);
        }
        if (order.video_software) {
            items.push(`תוכנות עריכה: ${order.video_software}`);
        }
        
        return items.length > 0 ? (
            <div className="flex flex-wrap gap-x-4 text-sm text-gray-300 dark:text-gray-400">
                {items.map((item, index) => (
                    <span key={index}>{item}</span>
                ))}
            </div>
        ) : null;
    };

    return (
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/10'} mb-4`}>
            <CardHeader>
                {order.status === 'pending' && (
                    <Alert className="mb-4 bg-amber-500/20 border-amber-500">
                        <AlertDescription className="text-amber-500 text-sm">
                            ניתן לקבוע כעת את העדפות רכישת החלקים והציוד ההיקפי, כולל תקציב נפרד לציוד ההיקפי
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex justify-between items-start">
                    <CardTitle className="text-white">
                        {order.status === 'pending' 
                            ? `הצעה ${order.id.slice(-6)}`
                            : `הזמנה ${order.offer_id?.slice(-6) || order.id.slice(-6)}`}
                    </CardTitle>
                    <Badge 
                        variant={getStatusBadgeVariant(order.status)}
                        className="text-white border-white">
                        {STATUS_LABELS[order.status]}
                    </Badge>
                    
                </div>
                <CardDescription className={`
                    ${darkMode 
                        ? 'text-gray-300' 
                        : 'text-gray-200'
                    }`}>
                    נוצרה ב-{new Date(order.created_at).toLocaleDateString('he-IL')}
                </CardDescription>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {renderBudgetInfo()}
                        {renderServiceCost(order)}
                        {order.service_type && (
                            <div className="flex flex-col space-y-1">
                                <div className="text-sm text-gray-300 dark:text-gray-400">סוג שירות:</div>
                                <div className="font-medium text-white">
                                    {order.service_type === 'consultationOnly' ? 'ייעוץ בלבד' : 
                                     order.service_type === 'buildOnly' ? 'הרכבה בלבד' : 
                                     'ייעוץ והרכבה'}
                                </div>
                            </div>
                        )}
                        {order.delivery_type && (
                            <div className="flex flex-col space-y-1">
                                <div className="text-sm text-gray-300 dark:text-gray-400">אופן הרכבה:</div>
                                <div className="font-medium text-white">
                                    {renderDeliveryInfo(order)}
                                </div>
                            </div>
                        )}
                    </div>

                    {renderAdditionalInfo()}

                    {order.parts_list && (
                        <Button 
                            variant="outline"
                            onClick={() => setShowPartsViewer(true)}
                            className={`w-full mt-2 text-white`}
                        >
                            צפה ברשימת חלקים
                        </Button>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex justify-between gap-2">
                {['pending_consultation_payment', 'ready'].includes(order.status) && onPaymentClick && (
                    <Button
                        onClick={() => onPaymentClick()}
                        variant={darkMode ? "destructive" : "default"}
                        className={`${darkMode ? 'bg-amber-700 hover:bg-amber-800' : 'bg-amber-500 hover:bg-amber-600'} 'text-white'`}
                    >
                        עבור לתשלום
                    </Button>
                )}

                {order.status === 'pending' && onApprove && (
                    <Button
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        variant="default"
                        className={`${darkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white`}
                        >
                        {isSubmitting ? 'מעבד...' : 'אשר הזמנה'}
                    </Button>
                )}
                
                {order.status === 'pending_schedule' && (
                    <Button
                        onClick={handleSchedulerOpen}
                        variant="default"
                        className={`${darkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                        >
                        קבע מועד הרכבה
                    </Button>
                )}

                {onCancel && !['cancelled', 'delivered'].includes(order.status) && (
                    <Button
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        variant="destructive"
                        className={`${darkMode ? 'bg-red-800 hover:bg-red-900' : 'bg-red-600 hover:bg-red-700'} text-white`}
                    >
                        {isSubmitting ? 'מעבד...' : 'בטל הזמנה'}
                    </Button>
                )}

                {renderBuildDate(order)}

            </CardFooter>

            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent className={darkMode ? 'bg-gray-800' : 'bg-purple-400'}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={darkMode ? 'text-white' : ''}>
                            אישור ביטול הזמנה
                        </AlertDialogTitle>
                        <AlertDialogDescription className={darkMode ? 'text-gray-300' : ''}>
                            "על מנת לבטל את הזמנתך, אנא הקלד את הביטוי "ביטול הזמנה
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        type="text"
                        value={cancelConfirmWord}
                        onChange={(e) => setCancelConfirmWord(e.target.value)}
                        placeholder='הקלד כאן - ביטול הזמנה'
                        className={`mt-2 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel className={darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'text-white hover:bg-pink-400'}>
                            ביטול
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelConfirm}
                            disabled={cancelConfirmWord.toLowerCase() !== 'ביטול הזמנה'}
                            className={`
                                ${darkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'}
                                text-white
                            `}
                        >
                            אישור
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {showPartsViewer && order.parts_list && (
                <PartsListViewer
                    isOpen={showPartsViewer}
                    onClose={() => setShowPartsViewer(false)}
                    parts={order.parts_list?.full_list || order.parts_list?.initial_list}
                    isInitialList={!order.parts_list?.full_list}
                    darkMode={darkMode}
                    totalBudget={order.budget}
                    preferences={preferences as PreferencesData}
                    peripheralsBudget={order.status === 'pending' 
                        ? order.peripherals_budget 
                        : (order.offers?.peripherals_budget ?? order.peripherals_budget) ?? 0}
                />
            )}
            {renderSchedulerDialog()}
        </Card>
    );
};

export default OrderCard;