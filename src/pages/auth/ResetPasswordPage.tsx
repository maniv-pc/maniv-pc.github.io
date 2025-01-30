import React, { useState } from 'react';
import { supabase } from 'context/auth';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { Alert, AlertDescription } from 'components/ui/alert';
// import { AUTH_VIEW } from '../portal/components/auth/types';

export const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stage, setStage] = useState<'request' | 'reset'>('request');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const checkEmailExists = async (email: string) => {
        const { data: offerCheck } = await supabase
            .from('offers')
            .select('email')
            .eq('email', email)
            .single();

        const { data: profileCheck } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();

        return offerCheck || profileCheck;
    };

    const handleResetPasswordRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Validate email format
            if (!validateEmail(email)) {
                setError('כתובת דוא"ל לא תקינה');
                return;
            }

            // Check email existence
            const emailExists = await checkEmailExists(email);
            if (!emailExists) {
                setError('כתובת דוא"ל זו אינה רשומה במערכת');
                return;
            }

            // Send reset password email
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            setSuccess(true);
            setStage('reset');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'שגיאה בשליחת מייל איפוס סיסמה');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validate password
        if (newPassword !== confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('הסיסמה צריכה להיות באורך של לפחות 6 תווים');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            // Redirect to portal after successful password reset
            window.location.href = '/portal';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'שגיאה בעדכון סיסמה');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-blue-950">
            <Card className="w-full max-w-md backdrop-blur-sm bg-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-center">
                        {stage === 'request' ? 'איפוס סיסמה' : 'הגדרת סיסמה חדשה'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form 
                        onSubmit={stage === 'request' ? handleResetPasswordRequest : handlePasswordReset} 
                        className="space-y-4"
                    >
                        {stage === 'request' ? (
                            <>
                                <Input
                                    type="email"
                                    placeholder="הזן כתובת דואל"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white text-black"
                                    required
                                    dir="rtl"
                                />
                            </>
                        ) : (
                            <>
                                <Input
                                    type="password"
                                    placeholder="סיסמה חדשה"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-white text-black"
                                    required
                                    dir="rtl"
                                />
                                <Input
                                    type="password"
                                    placeholder="אימות סיסמה"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-white text-black"
                                    required
                                    dir="rtl"
                                />
                            </>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && stage === 'request' && (
                            <Alert variant="default">
                                <AlertDescription>
                                    קישור לאיפוס סיסמה נשלח בהצלחה. בדוק את תיבת הדואר שלך.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading 
                                ? 'שולח...' 
                                : stage === 'request' 
                                    ? 'שלח קישור איפוס' 
                                    : 'עדכן סיסמה'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};