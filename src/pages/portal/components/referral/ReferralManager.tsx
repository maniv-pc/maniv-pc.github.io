import React, { useState } from 'react';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { ReferralManagerProps, ReferralFormState } from './types';

export const ReferralManager: React.FC<ReferralManagerProps> = ({
    darkMode,
    userId,
    userEmail,
    orders,
    referrals,
    onCreateReferral
}) => {

    const [formState, setFormState] = useState<ReferralFormState>({
        customerName: '',
        customerEmail: '',
        error: null
    });

    const canAccessReferrals = orders?.some(order => 
        ['building', 'ready', 'delivered'].includes(order.status) || 
        (order.service_type === 'consultationOnly' && order.status === 'delivered')
    );

    if (!canAccessReferrals) {
        return (
            <Card className={`backdrop-blur-sm border-0 ${darkMode ? 'bg-gray-800/50' : 'bg-white/10'}`}>
                <CardHeader>
                    <CardTitle className="text-white" dir="rtl">ניהול הפניות</CardTitle>
                </CardHeader>
                <CardContent className="text-white text-center">
                    <p>עמוד ההפניות יהיה זמין לאחר שתגיע לשלב תיאום הבנייה או סיום הייעוץ.</p>
                </CardContent>
            </Card>
        );
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (referrals.length >= 2) {
            setFormState(prev => ({ ...prev, error: 'ניתן ליצור עד 2 קודי הפניה בלבד' }));
            return;
        }

        if (formState.customerEmail === userEmail) {
            setFormState(prev => ({ ...prev, error: 'לא ניתן ליצור קוד הפניה עבור עצמך' }));
            return;
        }

        if (!formState.customerName.trim()) {
            setFormState(prev => ({ ...prev, error: 'נא להזין שם לקוח' }));
            return;
        }

        try {
            await onCreateReferral(formState.customerName, formState.customerEmail);
            setFormState({
                customerName: '',
                customerEmail: '',
                error: null
            });
        } catch (error: any) {
            setFormState(prev => ({ ...prev, error: 'שגיאה ביצירת קוד הפניה' }));
        }
    };

    return (
        <Card className={`backdrop-blur-sm border-0 ${darkMode ? 'bg-gray-800/50' : 'bg-white/10'}`}>
            <CardHeader>
                <CardTitle className="text-white" dir="rtl">ניהול הפניות</CardTitle>
            </CardHeader>
            <CardContent className="text-white">
                <div className="space-y-6" dir="rtl">
                    {/* Create new referral */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">צור קוד הפניה חדש</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="text"
                                placeholder="שם החבר"
                                value={formState.customerName}
                                onChange={(e) => setFormState(prev => ({ 
                                    ...prev, 
                                    customerName: e.target.value,
                                    error: null 
                                }))}
                                className="bg-white text-black"
                                required
                                dir="rtl"
                            />
                            <Input
                                type="email"
                                placeholder="אימייל החבר"
                                value={formState.customerEmail}
                                onChange={(e) => setFormState(prev => ({ 
                                    ...prev, 
                                    customerEmail: e.target.value,
                                    error: null 
                                }))}
                                className="bg-white text-black"
                                required
                                dir="rtl"
                            />
                            <Button 
                                type="submit"
                                disabled={referrals.length >= 2}
                                className={`w-full ${darkMode ? 'bg-blue-900 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                צור קוד הפניה
                            </Button>

                            {formState.error && (
                                <Alert className="border-red-500/50 bg-red-900/20">
                                    <AlertDescription className="text-red-300">
                                        {formState.error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </form>
                    </div>

                    {/* List existing referrals */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">קודי הפניה קיימים</h3>
                        {referrals.length > 0 ? (
                            <div className="space-y-4">
                                {referrals.map((referral) => (
                                    <div key={referral.id} className="p-4 bg-white/10 rounded">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold">קוד: {referral.code}</p>
                                                <p className="text-sm">שם: {referral.new_customer_name}</p>
                                                <p className="text-sm">אימייל: {referral.new_customer_email}</p>
                                                <p className="text-sm">סטטוס: {referral.used ? 'נוצל' : 'פעיל'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>אין קודי הפניה פעילים</p>
                        )}
                    </div>

                    {/* Information about referral program */}
                    <div className="mt-6 p-4 bg-blue-900/50 rounded">
                        <h4 className="font-semibold mb-2">על תוכנית ההפניות</h4>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>תוכל ליצור עד 2 קודי הפניה</li>
                            <li>כאשר חבר משתמש בקוד ההפניה שלך, הוא מקבל 20% הנחה על עלות השירות</li>
                            <li>קודי ההפניה תקפים לשימוש חד פעמי בלבד</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};