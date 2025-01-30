import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Alert, AlertDescription } from 'components/ui/alert';
import { useAuth, supabase } from 'context/auth';
import { AUTH_VIEW, AuthView, AuthFormProps} from './types';

interface FormState {
    email: string;
    password: string;
    fullName: string;
    phone: string;
}

interface FormErrors {
    error: string | null;
    fullNameError: string | null;
    phoneError: string | null;
}

const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/-/g, '');
    return /^0\d{9}$/.test(cleanPhone);
};

const formatPhone = (phone: string): string => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length >= 3) {
        return cleanPhone.slice(0, 3) + "-" + cleanPhone.slice(3);
    }
    return cleanPhone;
};

export const AuthForm: React.FC<AuthFormProps> = ({ 
    darkMode, 
    initialView = AUTH_VIEW.SIGN_IN // Add default value
}) => {
    const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
    const [authView, setAuthView] = useState<AuthView>(initialView);
    const [validNames, setValidNames] = useState<string[]>([]);
    const [formState, setFormState] = useState<FormState>({
        email: '',
        password: '',
        fullName: '',
        phone: ''
    });
    const [errors, setErrors] = useState<FormErrors>({
        error: null,
        fullNameError: null,
        phoneError: null
    });

    useEffect(() => {
        const fetchValidNames = async () => {
            // אם אנחנו לא בתצוגת הרישום, אין צורך לטעון את השמות
            if (authView !== AUTH_VIEW.SIGN_UP) {
                return;
            }
    
            try {                
                const { data, error } = await supabase
                    .from('offers')
                    .select('full_name, email')
                    .not('full_name', 'is', null);
    
                if (error) {
                    console.error('Error fetching names:', error);
                    throw error;
                }
                
                const namesArray = data?.map(order => order.full_name.toLowerCase().trim()) || [];
                const uniqueNames = Array.from(new Set(namesArray));
                
                setValidNames(uniqueNames);
            } catch (error: any) {
                console.error('Error in fetchValidNames:', error);
                setErrors(prev => ({ 
                    ...prev, 
                    error: 'Error fetching valid names: ' + error.message 
                }));
            }
        };
    
        fetchValidNames();
    }, [authView]); // הוספנו את authView כדי שהפונקציה תרוץ מחדש כשמשתנה התצוגה

    const validateInputs = (): boolean => {
        let isValid = true;
        const newErrors: FormErrors = {
            error: null,
            fullNameError: null,
            phoneError: null
        };
    
        if (authView === AUTH_VIEW.SIGN_UP) {
            // Debug logs
            console.log('Validating inputs with:', {
                enteredName: formState.fullName,
                validNames: validNames,
                nameExists: validNames.includes(formState.fullName)
            });
    
            // Optional: Log each name comparison for debugging
            validNames.forEach(validName => {
                console.log(`Comparing "${formState.fullName}" with "${validName}"`, {
                    matches: formState.fullName === validName,
                    enteredLength: formState.fullName.length,
                    validLength: validName.length
                });
            });
    
            if (!validNames.includes(formState.fullName.trim())) {
                console.log('Name validation failed');
                newErrors.fullNameError = 'השם המלא חייב להתאים להזמנה הראשונית';
                isValid = false;
            }
    
            if (!validatePhone(formState.phone)) {
                console.log('Phone validation failed:', formState.phone);
                newErrors.phoneError = 'מספר טלפון לא תקין. חייב להתחיל ב-0 ולהכיל 10 ספרות';
                isValid = false;
            }
        }
    
        console.log('Validation result:', { isValid, errors: newErrors });
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({ error: null, fullNameError: null, phoneError: null });
    
        if (!validateInputs()) {
            return;
        }
    
        try {
            if (authView === AUTH_VIEW.SIGN_IN) {
                await signIn(formState.email, formState.password);
            } 
            else if (authView === AUTH_VIEW.SIGN_UP) {
                await signUp(formState.email, formState.password, {
                    fullName: formState.fullName.trim(),
                    phone: formState.phone.replace(/-/g, '')
                });
                
                // Show success message
                setErrors(prev => ({ 
                    ...prev, 
                    error: "יצירת המשתמש הצליחה! שימו לב שתקבלו הודעה במייל שלכם לאישור כתובת המייל להרשמה מלאה" 
                }));
                
                // Reset form and switch to sign in view after delay
                setTimeout(() => {
                    setAuthView(AUTH_VIEW.SIGN_IN);
                    setFormState({
                        email: '',
                        password: '',
                        fullName: '',
                        phone: ''
                    });
                }, 3000);
            } 
            else {
                await resetPassword(formState.email);
            }
        } catch (error: any) {
            const errorMessage = error.message === 'Invalid login credentials' 
                ? 'אימייל או סיסמה לא נכונים'
                : error.message === 'Unauthorized Access' 
                ? 'אין לך הרשאה להתחבר דרך פורטל זה'
                : error.message;
            setErrors(prev => ({ 
                ...prev, 
                error: errorMessage 
            }));
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedPhone = formatPhone(e.target.value.replace(/\D/g, ''));
        setFormState(prev => ({
            ...prev,
            phone: formattedPhone
        }));
        setErrors(prev => ({
            ...prev,
            phoneError: null
        }));
    };

    return (
        <Card className={`w-full max-w-md backdrop-blur-sm ${darkMode ? 'bg-gray-800/50' : 'bg-white/10'}`}>
            <CardHeader className="text-center">
                <CardTitle className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-white'}`}>
                    {authView === AUTH_VIEW.SIGN_IN ? ' התחברות - לקוחות מניב לך מחשב' : 
                     authView === AUTH_VIEW.SIGN_UP ? ' הרשמה - לקוחות מניב לך מחשב' : 
                     'איפוס סיסמה'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="אימייל"
                        value={formState.email}
                        onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white text-black font-medium"
                        dir="rtl"
                    />
                    
                    {authView !== AUTH_VIEW.RESET_PASSWORD && (
                        <Input
                            type="password"
                            placeholder="סיסמה"
                            value={formState.password}
                            onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                            className="bg-white text-black font-medium"
                            dir="rtl"
                        />
                    )}

                    {authView === AUTH_VIEW.SIGN_UP && (
                        <>
                            <div>
                                <Input
                                    type="text"
                                    placeholder="שם מלא"
                                    value={formState.fullName}
                                    onChange={(e) => {
                                        setFormState(prev => ({
                                            ...prev,
                                            fullName: e.target.value
                                        }));
                                        setErrors(prev => ({
                                            ...prev,
                                            fullNameError: null
                                        }));
                                    }}
                                    className="bg-white text-black font-medium"
                                    dir="rtl"
                                />
                                {errors.fullNameError && (
                                    <p className="text-red-400 text-sm mt-1" dir="rtl">
                                        {errors.fullNameError}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Input
                                    type="tel"
                                    placeholder="טלפון"
                                    value={formState.phone}
                                    onChange={handlePhoneChange}
                                    className="bg-white text-black font-medium"
                                    dir="rtl"
                                />
                                {errors.phoneError && (
                                    <p className="text-red-400 text-sm mt-1" dir="rtl">
                                        {errors.phoneError}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                    
                    {errors.error && (
                        <Alert variant={errors.error.includes('הצליחה') ? 'default' : 'destructive'} 
                            className={errors.error.includes('הצליחה') ? 'bg-green-500/10 text-green-500 border-green-500' : 'text-white'}>
                            <AlertDescription dir="rtl">{errors.error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            {authView === AUTH_VIEW.SIGN_IN ? 'התחבר' :
                             authView === AUTH_VIEW.SIGN_UP ? 'הרשם' :
                             'שלח לינק לאיפוס סיסמה'}
                        </Button>
                        
                        <Button
                            onClick={() => signInWithGoogle()} // Wrap in arrow function
                            variant="outline"
                            className="w-full bg-white text-black hover:bg-gray-100"
                        >
                            Google המשך עם 
                        </Button>
                    </div>

                    <div className="flex justify-between text-sm text-white">
                        <button
                            type="button"
                            className="hover:underline"
                            onClick={() => {
                                setAuthView(
                                    authView === AUTH_VIEW.SIGN_IN ? AUTH_VIEW.SIGN_UP : AUTH_VIEW.SIGN_IN
                                );
                                setErrors({
                                    error: null,
                                    fullNameError: null,
                                    phoneError: null
                                });
                            }}
                        >
                            {authView === AUTH_VIEW.SIGN_IN ? 'צור חשבון' : 'יש לך חשבון? התחבר'}
                        </button>
                        
                        {authView === AUTH_VIEW.SIGN_IN && (
                            <button
                                type="button"
                                className="hover:underline"
                                onClick={() => setAuthView(AUTH_VIEW.RESET_PASSWORD)}
                            >
                                שכחת סיסמה?
                            </button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};