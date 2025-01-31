// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from 'context/auth';
import { getBaseUrl } from 'config';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { Alert, AlertDescription } from 'components/ui/alert';

export const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // בדיקת פרמטרים בטעינה
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('error')) {
            const params = new URLSearchParams(hash.split('#')[1]);
            const error = params.get('error_description');
            setError(decodeURIComponent(error?.replace(/\+/g, ' ') || 'הלינק לא תקין או שפג תוקפו'));
        }
    }, []);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // First try to get the current session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            // אם אין סשן, ננסה לבדוק אם יש פרמטרים בURL
            if (!session) {
                // נסה לקחת את הטוקן מהURL
                const hash = window.location.hash;
                if (!hash.includes('access_token')) {
                    throw new Error('לינק לא תקין או שפג תוקפו. אנא בקש איפוס סיסמה מחדש.');
                }
            }

            // עדכון הסיסמה
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            // הודעת הצלחה והפניה
            alert('הסיסמה עודכנה בהצלחה!');
            window.location.href = `${getBaseUrl()}/#/portal`;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'שגיאה בעדכון סיסמה');
        } finally {
            setIsLoading(false);
        }
    };

    // הוספנו חזרה לדף הבית אם יש שגיאה
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-blue-950">
                <Card className="w-full max-w-md backdrop-blur-sm bg-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-center">שגיאה באיפוס סיסמה</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive" className="text-white">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button 
                            onClick={() => window.location.href = `${getBaseUrl()}`}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            חזרה לדף הבית
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-blue-950">
            <Card className="w-full max-w-md backdrop-blur-sm bg-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-center">הגדרת סיסמה חדשה</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="סיסמה חדשה"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-white text-black"
                            required
                            dir="rtl"
                            minLength={9}
                        />
                        <Input
                            type="password"
                            placeholder="אימות סיסמה"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-white text-black"
                            required
                            dir="rtl"
                            minLength={9}
                        />

                        {error && (
                            <Alert variant="destructive" className='text-white'>
                                <AlertDescription >{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'מעדכן...' : 'המשך לפורטל'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};