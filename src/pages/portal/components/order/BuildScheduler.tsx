import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from 'components/ui/dialog';
import { Button } from 'components/ui/button';
import { Calendar } from 'components/ui/calendar';
import { Alert, AlertDescription } from 'components/ui/alert';
import { BuildSchedulerProps } from './types';

// Time slots configuration
const TIME_SLOTS = ['08:00', '12:00', '16:00', '20:00'];
const SATURDAY_EXTRA_COST = 50;

const isExtraCostTime = (date: Date, timeSlot: string) => {
    const day = date.getDay();
    const hour = parseInt(timeSlot.split(':')[0]);
    
    // Friday after 16:00 or any time Saturday
    return (day === 5 && hour >= 16) || day === 6;
};

export const BuildScheduler: React.FC<BuildSchedulerProps> = ({
    isOpen,
    onClose,
    darkMode,
    onSchedule,
    onOrderUpdate
}) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [showTimeSelection, setShowTimeSelection] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const disabledDates = {
        before: addDays(new Date(), 1),
        after: addDays(new Date(), 30)
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            setShowTimeSelection(true);
        }
        setSelectedTime(null);
        setShowConfirm(false);
        setError(null);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setShowConfirm(true);
    };

    const handleSchedule = async () => {
        if (!selectedDate || !selectedTime) return;
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            // Create a new date object to avoid modifying the original
            const scheduledDateTime = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':').map(Number);
            
            // Set the exact hours and minutes, maintaining the date's timezone
            scheduledDateTime.setHours(hours, minutes, 0, 0);
            
            await onSchedule(scheduledDateTime);
            if (onOrderUpdate) {
                await onOrderUpdate();
            }
            setShowConfirm(false);
            onClose();
        } catch (error) {
            console.error('Error scheduling build:', error);
            setError('אירעה שגיאה בקביעת המועד. אנא נסה שוב.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showExtraCostWarning = selectedDate && selectedTime && 
        isExtraCostTime(selectedDate, selectedTime);

    const renderTimeSlots = () => (
        <div className="grid grid-cols-2 gap-3">
            {TIME_SLOTS.map((time) => {
                const wouldIncurExtraCost = selectedDate && isExtraCostTime(selectedDate, time);
                
                return (
                    <Button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`${
                            selectedTime === time 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-gray-600 hover:bg-gray-700'
                        } text-white relative`}
                    >
                        {time}
                        {wouldIncurExtraCost && (
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1 rounded-full">
                                +₪50
                            </span>
                        )}
                    </Button>
                );
            })}
        </div>
    );

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                onClose();
            }}
        >
            <DialogContent className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                <DialogHeader>
                    <DialogTitle>קביעת מועד להרכבה</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4" dir="rtl">
                    <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) => 
                                date < disabledDates.before ||
                                date > disabledDates.after
                            }
                            className={darkMode ? 'text-white' : ''}
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {selectedDate && (
                        <Alert>
                            <AlertDescription>
                                תאריך נבחר: {format(selectedDate, 'dd/MM/yyyy')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {showTimeSelection && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-medium">בחר שעת הרכבה:</h3>
                                {renderTimeSlots()}
                            </div>
                        </div>
                    )}

                    {showConfirm && selectedDate && selectedTime && (
                        <div className="space-y-4">
                            <Alert>
                                <AlertDescription>
                                    המועד המבוקש: {format(selectedDate, 'dd/MM/yyyy')} בשעה {selectedTime}
                                    {showExtraCostWarning && (
                                        <>
                                            <br />
                                            כולל תוספת של ₪{SATURDAY_EXTRA_COST} עבור הרכבה בסוף שבוע
                                        </>
                                    )}
                                    <br />
                                    שים לב - המועד יהיה סופי רק לאחר אישור המערכת
                                </AlertDescription>
                            </Alert>
                            <div className="flex space-x-2 space-x-reverse">
                                <Button
                                    onClick={handleSchedule}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? 'מעבד...' : 'אשר תאריך'}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowConfirm(false);
                                        setSelectedTime(null);
                                    }}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    חזור
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};