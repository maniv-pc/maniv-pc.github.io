// PaymentDialog.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Checkbox } from 'components/ui/checkbox';
import { Label } from 'components/ui/label';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Order, PaymentDialogProps } from './types';

const BIT_PAYMENT_LINK = process.env.REACT_PUBLIC_BIT_PAYMENT_LINK;

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
    orders,
    darkMode,
    onPaymentMethodChange,
    onTermsAgreement,
    onPaymentConfirm,
    onOrderUpdate
}) => {
    const [ordersForPayment, setOrdersForPayment] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const paymentReadyOrders = orders.filter(order => 
            order.status === 'pending_consultation_payment' || order.status === 'ready'
        );
        setOrdersForPayment(paymentReadyOrders);
    }, [orders]);

    const handlePaymentMethodChange = async (orderId: string, method: string) => {
        try {
            await onPaymentMethodChange(orderId, method);
            
            // If it's a digital payment method, open the relevant link
            if (method === 'bit' && BIT_PAYMENT_LINK) {
                window.open(BIT_PAYMENT_LINK, '_blank', 'noopener,noreferrer');
            }
            
            await onOrderUpdate();
            setError(null);
        } catch (error) {
            console.error('Error updating payment method:', error);
            setError('שגיאה בעדכון אמצעי התשלום');
        }
    };

    const handlePaymentConfirm = async (orderId: string) => {
        try {
            await onPaymentConfirm(orderId);
            await onOrderUpdate();
            setError(null);
        } catch (error) {
            console.error('Error confirming payment:', error);
            setError('שגיאה באישור התשלום');
        }
    };

    const renderPaymentAmount = (order: Order) => {
        const totalCost = order.service_cost;
        const paidAmount = order.paid_amount || 0;
        const remainingBalance = totalCost - paidAmount;
        
        if (order.service_type === 'consultationAndBuild') {
            const consultationPayment = Math.round(totalCost * 0.2);
            const buildPayment = totalCost - consultationPayment;
            
            if (order.status === 'pending_consultation_payment') {
                return (
                    <div className="space-y-2 border-b border-gray-600 pb-2">
                        <div className="flex justify-between">
                            <span className="font-bold text-white">
                                תשלום ייעוץ ראשוני (20%):
                            </span>
                            <div className="text-white">
                                <span className="text-lg">₪{consultationPayment.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>סך עלות שירות:</span>
                            <span>₪{totalCost.toLocaleString()} (נותר: ₪{buildPayment.toLocaleString()})</span>
                        </div>
                    </div>
                );
            } else if (order.status === 'ready') {
                return (
                    <div className="space-y-2 border-b border-gray-600 pb-2">
                        <div className="flex justify-between">
                            <span className="font-bold text-white">
                                תשלום יתרה (80%):
                            </span>
                            <div className="text-white">
                                <span className="text-lg">₪{remainingBalance.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>סך עלות שירות:</span>
                            <span>₪{totalCost.toLocaleString()} (שולם: ₪{paidAmount.toLocaleString()})</span>
                        </div>
                    </div>
                );
            }
        }
        
        return (
            <div className="flex justify-between border-b border-gray-600 pb-2">
                <span className="font-bold text-white">
                    סכום לתשלום:
                </span>
                <div className="text-white">
                    <span className="text-lg">₪{remainingBalance.toLocaleString()}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            {ordersForPayment.length > 0 ? (
                ordersForPayment.map(order => (
                    <Card key={order.id} className={`backdrop-blur-sm border-0 ${darkMode ? 'bg-gray-800/50' : 'bg-white/10'}`}>
                        <CardContent className="p-6" dir="rtl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    הזמנה #{order.id.slice(0, 8)}
                                </h3>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                                    {new Date(order.created_at).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                {renderPaymentAmount(order)}

                                <select 
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                    onChange={(e) => handlePaymentMethodChange(order.id, e.target.value)}
                                    value={order.payment_method || ''}
                                >
                                    <option value="">בחר אמצעי תשלום</option>
                                    <option value="bit">ביט</option>
                                    <option value="paybox">פייבוקס</option>
                                    <option value="bank">העברה בנקאית</option>
                                    <option value="later">תשלום במזומן בסוף העסקה</option>
                                </select>

                                {order.payment_method === 'bank' && (
                                    <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
                                        <p className="text-white">פרטי חשבון בנק:</p>
                                        <p className="text-white">חשבון: 127678451</p>
                                        <p className="text-white">בנק: 11 (דיסקונט)</p>
                                        <p className="text-white">סניף: 443 (קריית ביאליק)</p>
                                    </div>
                                )}

                                {order.payment_method === 'later' && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`terms-${order.id}`}
                                            checked={order.agree_to_terms}
                                            onCheckedChange={(checked) => 
                                                onTermsAgreement(order.id, checked as boolean)}
                                        />
                                        <Label htmlFor={`terms-${order.id}`} className="text-red-500 mr-2">
                                            אני מסכים/ה שאי תשלום יגרור השלכות משפטיות
                                        </Label>
                                    </div>
                                )}

                                <Button
                                    onClick={() => handlePaymentConfirm(order.id)}
                                    disabled={!order.payment_method || 
                                            (order.payment_method === 'later' && !order.agree_to_terms)}
                                    className={`w-full ${darkMode ? 'bg-blue-900 hover:bg-blue-800' : 
                                                        'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    אשר תשלום
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center text-white">
                    אין הזמנות הממתינות לתשלום
                </div>
            )}
        </div>
    );
};