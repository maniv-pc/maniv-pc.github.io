import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, supabase } from 'context/auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'components/ui/tabs';
import { Button } from 'components/ui/button';
import { Switch } from 'components/ui/switch';
import { Label } from 'components/ui/label';
import { Alert, AlertDescription} from 'components/ui/alert'

// Component imports
import { AuthForm } from './components/auth/AuthForm';
import { OrderCard } from './components/order/OrderCard';
import { PaymentDialog } from './components/order/PaymentDialog';
import { PreferencesForm } from './components/preferences/PreferencesForm';
import { ReferralManager } from './components/referral/ReferralManager';

// Type imports
import { Order } from './components/order/types';
import { Referral } from './components/referral/types';

export const PortalApp = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const { user, signOut, isSigningOut } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('darkMode') === 'true';
        }
        return false;
    });
    const [referrals, setReferrals] = useState<Referral[]>([]);
    
    // This effect runs whenever user changes
    useEffect(() => {
        let mounted = true;
    
        const clearPerformanceEntries = () => {
            const entries = performance.getEntriesByType('mark')
                .concat(performance.getEntriesByType('measure'));
            entries.forEach(entry => performance.clearMarks(entry.name));
        };

        const initializeData = async () => {
            console.log('User Changed in Portal:', { 
                hasUser: !!user,
                userId: user?.id 
            });

            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                console.log('Starting fetch data...');
                setIsLoading(true);

                // Only proceed if component is still mounted
                if (!mounted) return;

                console.log('Fetching user role...');
                await updateUserRole();

                if (!mounted) return;

                console.log('Fetching orders...');
                await fetchOrders();

                if (!mounted) return;

                console.log('Fetching referrals...');
                await fetchReferrals();

                console.log('All data fetched successfully');
            } catch (error) {
                if (mounted) {
                    console.error('User change fetch failed:', error);
                    setError((error as Error).message);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        clearPerformanceEntries(); // נקה מדידות קודמות
        initializeData();

        // Cleanup function
        return () => {
            mounted = false;
            clearPerformanceEntries();
        };
    }, [user]); // Dependency on user

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            document.body.style.backgroundColor = '#111827';
        } else {
            root.classList.remove('dark');
            document.body.style.backgroundColor = '';
        }
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);
    
    const updateUserRole = async () => {
        try {
            const timerName = 'updateUserRole';
            // אם הטיימר כבר קיים, לא נריץ שוב
            if (performance.getEntriesByName(timerName).length > 0) {
                console.log(`${timerName} already running`);
                return;
            }
            
            performance.mark(`${timerName}-start`);
    
            // Get offers and update role in parallel
            const [offersResponse, currentProfileResponse] = await Promise.all([
                supabase
                    .from('offers')
                    .select('id')
                    .eq('email', user?.email)
                    .limit(1),
                supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user?.id)
                    .single()
            ]);
    
            if (offersResponse.error) throw offersResponse.error;
            
            // Only update role if it's different from current
            const newRole = offersResponse.data && offersResponse.data.length > 0 ? 'Customer' : 'NotRelated';
            
            if (!currentProfileResponse.error && currentProfileResponse.data?.role !== newRole) {
                await supabase
                    .from('profiles')
                    .update({ role: newRole })
                    .eq('id', user?.id);
            }
    
            performance.mark(`${timerName}-end`);
            performance.measure(timerName, `${timerName}-start`, `${timerName}-end`);
    
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            console.time('fetchOrders');
            
            // Run all initial queries in parallel
            const [globalPrefsResponse, pendingOffersResponse, authOrdersResponse] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('preferences, peripherals_budget')
                    .eq('id', user?.id)
                    .single(),
                    
                supabase
                    .from('offers')
                    .select(`
                        id,
                        created_at,
                        status,
                        budget,
                        preferences,
                        peripherals_budget,
                        service_cost,
                        service_type,
                        use_types,
                        operating_system,
                        delivery_type,
                        address,
                        city,
                        game_resolution,
                        video_software
                    `)
                    .eq('email', user?.email)
                    .eq('status', 'pending'),
                    
                supabase
                    .from('authenticated_orders')
                    .select(`
                        *,
                        offers!inner (
                            id,
                            budget,
                            service_cost,
                            preferences,
                            peripherals_budget,
                            service_type,
                            use_types,
                            operating_system,
                            game_resolution,
                            video_software,
                            delivery_type,
                            address,
                            city
                        )
                    `)
                    .eq('user_id', user?.id)
            ]);
    
            console.log('Initial queries complete', {
                globalPrefs: !!globalPrefsResponse.data,
                pendingOffers: pendingOffersResponse.data?.length,
                authOrders: authOrdersResponse.data?.length
            });
    
            if (globalPrefsResponse.error) throw globalPrefsResponse.error;
            if (pendingOffersResponse.error) throw pendingOffersResponse.error;
            if (authOrdersResponse.error) throw authOrdersResponse.error;
    
            const globalPrefs = globalPrefsResponse.data;
    
            // Transform offers with proper preference handling
            const transformedOffers = (pendingOffersResponse.data || []).map(offer => ({
                ...offer,
                status: 'pending' as const,
                paid_amount: 0,
                preferences: {
                    parts_source: [],
                    existing_hardware: [],
                    custom_sources: [],
                    custom_peripherals: [],
                    ...(globalPrefs?.preferences || {}),
                    ...(offer.preferences || {})
                },
                peripherals_budget: offer.peripherals_budget ?? globalPrefs?.peripherals_budget ?? 0
            }));
    
            // Transform authenticated orders
            const transformedAuthOrders = (authOrdersResponse.data || []).map(order => ({
                id: order.id,
                offer_id: order.offer_id,
                created_at: order.created_at,
                status: order.status,
                budget: order.offers.budget,
                service_cost: order.offers.service_cost,
                paid_amount: order.paid_amount || 0,
                service_type: order.offers.service_type,
                use_types: order.offers.use_types || [],
                operating_system: order.offers.operating_system,
                delivery_type: order.offers.delivery_type,
                address: order.offers.address,
                city: order.offers.city,
                game_resolution: order.offers.game_resolution,
                video_software: order.offers.video_software,
                parts_list: order.parts_list,
                build_date: order.build_date,
                payment_method: order.payment_method,
                preferences: {
                    parts_source: [],
                    existing_hardware: [],
                    custom_sources: [],
                    custom_peripherals: [],
                    ...(globalPrefs?.preferences || {}),
                    ...(order.offers?.preferences || {})
                },
                peripherals_budget: order.offers.peripherals_budget
            }));
    
            // Combine and set orders
            setOrders([...transformedOffers, ...transformedAuthOrders]);
            
            console.timeEnd('fetchOrders');
        } catch (error: any) {
            console.error("Error fetching orders:", error);
            setError(error.message);
            throw error; // Re-throw to be caught by fetchData
        }
    };
    
    const fetchReferrals = async () => {
        try {
            const { data, error } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_id', user?.id);
    
            if (error) throw error;
            setReferrals(data || []);
        } catch (error: any) {
            console.error("Error fetching referrals:", error);
            setError(error.message);
        }
    };    

    const handleApproveOrder = async (orderId: string) => {
        try {
            // קבל את נתוני ההצעה
            const { data: offerData, error: fetchError } = await supabase
                .from('offers')
                .select('preferences, peripherals_budget, service_cost, service_type')
                .eq('id', orderId)
                .single();
    
            if (fetchError) throw fetchError;
            if (!offerData) throw new Error('Offer not found');
    
            // אם אין העדפות ספציפיות, קבל את ההעדפות הגלובליות
            const hasSpecificPreferences = offerData.preferences !== null;
            let effectivePreferences = offerData.preferences;
            let effectivePeripheralsBudget = offerData.peripherals_budget;
    
            if (!hasSpecificPreferences) {
                // קבל את ההעדפות הגלובליות
                const { data: globalPrefs, error: globalError } = await supabase
                    .from('profiles')
                    .select('preferences, peripherals_budget')
                    .eq('id', user?.id)
                    .single();
    
                if (globalError) throw globalError;
    
                effectivePreferences = globalPrefs?.preferences || null;
                effectivePeripheralsBudget = globalPrefs?.peripherals_budget || null;
            }
    
            // חשב את תוספת השירות לציוד היקפי
            const peripheralServiceFee = effectivePeripheralsBudget 
                ? Math.round(effectivePeripheralsBudget * 0.1) 
                : 0;
    
            // עדכן את ההצעה עם ההעדפות והסכום הסופי
            const { error: updateError } = await supabase
                .from('offers')
                .update({ 
                    status: 'confirmed',
                    preferences: effectivePreferences,
                    peripherals_budget: effectivePeripheralsBudget,
                    service_cost: offerData.service_cost + peripheralServiceFee // הוסף את התוספת לservice_cost
                })
                .eq('id', orderId);
    
            if (updateError) throw updateError;
    
            // צור הזמנה מאומתת
            const { error: insertError } = await supabase
                .from('authenticated_orders')
                .insert([{
                    offer_id: orderId,
                    user_id: user?.id,
                    status: offerData.service_type.includes('consultation') 
                        ? 'pending_initial_list' 
                        : 'pending_parts_upload',
                    created_at: new Date().toISOString()
                }]);
    
            if (insertError) throw insertError;
    
            await fetchOrders();
    
        } catch (error: any) {
            console.error('Error in handleApproveOrder:', error);
            setError(error.message);
        }
    };

    const handleCancelOrder = async (orderId: string, isInitialOrder: boolean) => {
        try {
            const table = isInitialOrder ? 'offers' : 'authenticated_orders';
            const { error: updateError } = await supabase
                .from(table)
                .update({ 
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString()
                })
                .eq('id', orderId);
            
            if (updateError) throw updateError;
            await fetchOrders();
        } catch (error: any) {
            console.error('Error cancelling order:', error);
            setError('Error cancelling order');
        }
    };

    const handlePaymentMethodChange = async (orderId: string, method: string) => {
        try {
            const { error } = await supabase
                .from('authenticated_orders')
                .update({ payment_method: method })
                .eq('id', orderId);
    
            if (error) throw error;
        } catch (error) {
            console.error('Error updating payment method:', error);
            setError('Error updating payment method');
        }
    };

    const handlePaymentConfirm = async (orderId: string) => {
        try {
            const { data: order, error: fetchError } = await supabase
                .from('authenticated_orders')
                .select('*, offers!inner(service_cost, service_type)')
                .eq('id', orderId)
                .single();
    
            if (fetchError) throw fetchError;
    
            let newStatus = order.status;
            let newPaidAmount = order.paid_amount || 0;
            const totalCost = order.offers.service_cost;
            
            // Handle consultation payment for combined service
            if (order.status === 'pending_consultation_payment' && 
                order.offers.service_type === 'consultationAndBuild') {
                // Add 20% payment to paid_amount
                newPaidAmount = Math.round(totalCost * 0.2);
                newStatus = 'pending_parts_upload';
            }
            // Handle final payment
            else if (order.status === 'ready') {
                // Add remaining balance to paid_amount
                newPaidAmount = totalCost;
                if (order.payment_method === 'later') {
                    newStatus = order.delivery_type === 'build_at_home' ? 'delivered' : 'ready';
                } else {
                    newStatus = order.delivery_type === 'pickup' ? 'ready' : 'delivered';
                }
            }
    
            const { error: updateError } = await supabase
                .from('authenticated_orders')
                .update({ 
                    status: newStatus,
                    paid_amount: newPaidAmount
                })
                .eq('id', orderId);
    
            if (updateError) throw updateError;
            await fetchOrders();
        } catch (error) {
            console.error('Error confirming payment:', error);
            setError('Error confirming payment');
        }
    };
    
    const handleTermsAgreement = async (orderId: string, agreed: boolean) => {
        try {
            const { error } = await supabase
                .from('authenticated_orders')
                .update({ agree_to_terms: agreed })  // Changed from agreeToTerms to agree_to_terms
                .eq('id', orderId);
    
            if (error) throw error;
            await fetchOrders();
        } catch (error) {
            console.error('Error updating terms agreement:', error);
            setError('Error updating terms agreement');
        }
    };

    const handleOrderSchedule = async (date: Date, orderId: string) => {
        try {
            // First get the authenticated order to get the offer_id
            const { data: currentOrder, error: fetchError } = await supabase
                .from('authenticated_orders')
                .select('offer_id')
                .eq('id', orderId)
                .single();
                
            if (fetchError) throw fetchError;
    
            // Check if selected time is in weekend hours
            const day = date.getDay();
            const hour = date.getHours();
            const isWeekendRate = (day === 5 && hour >= 16) || day === 6;
            
            // Then get the current service cost from offers
            const { data: offerData, error: offerFetchError } = await supabase
                .from('offers')
                .select('service_cost')
                .eq('id', currentOrder.offer_id)
                .single();
    
            if (offerFetchError) throw offerFetchError;
            
            // Calculate new service cost if weekend rate applies
            const currentServiceCost = offerData.service_cost;
            const updatedServiceCost = isWeekendRate 
                ? (currentServiceCost + 50)
                : currentServiceCost;
    
            // Update the offers table first
            const { error: offerUpdateError } = await supabase
                .from('offers')
                .update({ service_cost: updatedServiceCost })
                .eq('id', currentOrder.offer_id);
    
            if (offerUpdateError) throw offerUpdateError;
    
            // Then update the authenticated_orders table
            const { error: orderUpdateError } = await supabase
                .from('authenticated_orders')
                .update({ 
                    build_date: date.toISOString(),
                    status: 'schedule_pending_approval',
                    weekend_fee_applied: isWeekendRate,
                    proposed_by: 'customer'
                })
                .eq('id', orderId);
            
            if (orderUpdateError) throw orderUpdateError;
            
            await fetchOrders();
    
        } catch (error) {
            console.error('Error scheduling build:', error);
            throw error;
        }
    };
    
    const handleCreateReferral = async (customerName: string, customerEmail: string) => {
        try {
            // Generate a random 6-character code
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const newReferral = {
                referrer_id: user?.id,
                code,
                new_customer_name: customerName,
                new_customer_email: customerEmail,
                used: false,
                created_at: new Date().toISOString()
            };
    
            const { error } = await supabase
                .from('referrals')
                .insert([newReferral]);
    
            if (error) throw error;
            
            // Refresh referrals list
            await fetchReferrals();
        } catch (error: any) {
            console.error("Error creating referral:", error);
            throw error;
        }
    };

    const handleLogout = async () => {
        console.log('Logout initiated');
        if (!isSigningOut) {
            try {
                await signOut();
                // console.log('Logout completed');
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-950 flex items-center justify-center p-4">
                <AuthForm darkMode={darkMode} />
            </div>
        );
    }

    // Main Portal UI

    if (isLoading) return null;
    
    return (
        <div className={`min-h-screen p-4 ${darkMode ? 'dark bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-purple-900 to-blue-950'}`}>
            <div className="container mx-auto">
                <div className="flex justify-between mb-4" dir="rtl">
                    <div className={`flex items-center space-x-2 ${darkMode ? 'bg-gray-800/50' : 'bg-white/10'} p-2 rounded backdrop-blur-sm`}>
                        <Switch
                            id="dark-mode"
                            checked={darkMode}
                            onCheckedChange={setDarkMode}
                            className="data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        <Label htmlFor="dark-mode" className="text-white mr-2">מצב כהה</Label>
                    </div>
                    <Button 
                        onClick={handleLogout} 
                        disabled={isSigningOut}
                        className={`bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white ${
                            isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isSigningOut ? 'מתנתק...' : 'התנתק'}
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-white/10 backdrop-blur-sm w-full justify-center">
                        <TabsTrigger value="orders" className="text-white data-[state=active]:bg-white/20">
                            הזמנות
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="text-white data-[state=active]:bg-white/20">
                            העדפות
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="text-white data-[state=active]:bg-white/20">
                            תשלומים
                        </TabsTrigger>
                        <TabsTrigger value="referrals" className="text-white data-[state=active]:bg-white/20">
                            הפניות
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders">
                        <div className="space-y-4" dir="rtl">
                            {/* Price Quotes/Offers Section */}
                            <h2 className="text-2xl font-bold text-white text-right">הצעות מחיר</h2>
                            {orders
                            .filter(order => order.status === 'pending')
                            .map(order => (
                                <React.Fragment key={order.id}>
                                    {orders.length === 0 && (
                                        <Alert className="mb-4">
                                            <AlertDescription>
                                                יש לבדוק את ההעדפות לפני אישור הצעת המחיר
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <OrderCard
                                        order={order}
                                        onApprove={handleApproveOrder}
                                        onCancel={handleCancelOrder}
                                        darkMode={darkMode}
                                        onOrderUpdate={fetchOrders}
                                        onPaymentClick={() => setActiveTab('payments')}
                                        preferences={order.preferences}
                                        peripheralsBudget={order.peripherals_budget}
                                    />
                                </React.Fragment>
                            ))
                        }
                            
                            <h2 className="text-2xl font-bold text-white text-right">הזמנות בתהליך</h2>
                            {/* In-Process Orders Section */}
                            {orders
                                .filter(order => [
                                    'approved',
                                    'pending_initial_list',
                                    'pending_consultation_payment',
                                    'pending_parts_upload',
                                    'pending_schedule',
                                    'schedule_pending_approval',
                                    'building'
                                ].includes(order.status))
                                .map(order => {
                                    return (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onCancel={handleCancelOrder}
                                            darkMode={darkMode}
                                            onOrderUpdate={fetchOrders}
                                            onSchedule={(date) => handleOrderSchedule(date, order.id)}  // הוספנו את זה
                                            onPaymentClick={() => setActiveTab('payments')}
                                            preferences={order.preferences}
                                            peripheralsBudget={order.peripherals_budget}
                                        />
                                    );
                                })
                            }
                            
                            <h2 className="text-2xl font-bold text-white text-right">הזמנות שהושלמו</h2>
                            {/* Completed Orders Section */}
                            {orders
                                .filter(order => ['ready', 'delivered'].includes(order.status))
                                .map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onCancel={handleCancelOrder}
                                        darkMode={darkMode}
                                        onOrderUpdate={fetchOrders}
                                        onPaymentClick={() => setActiveTab('payments')}
                                        preferences={order.preferences}
                                        peripheralsBudget={order.peripherals_budget}
                                    />
                                ))
                            }

                            {/* Cancelled Orders Section - New */}
                            {orders.some(order => {
                                if (!['cancelled', 'cancellation_pending'].includes(order.status)) return false;
                                if (!order.cancelled_at) return false;
                                
                                const cancelDate = new Date(order.cancelled_at);
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                
                                return cancelDate > weekAgo;
                            }) && (
                                <>
                                    <h2 className="text-2xl font-bold text-white text-right mt-8">
                                        הזמנות שבוטלו
                                    </h2>
                                    {orders
                                        .filter(order => {
                                            if (!['cancelled', 'cancellation_pending'].includes(order.status)) return false;
                                            if (!order.cancelled_at) return false;
                                            
                                            const cancelDate = new Date(order.cancelled_at);
                                            const weekAgo = new Date();
                                            weekAgo.setDate(weekAgo.getDate() - 7);
                                            
                                            return cancelDate > weekAgo;
                                        })
                                        .map(order => (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                darkMode={darkMode}
                                                onOrderUpdate={fetchOrders}
                                                preferences={order.preferences}
                                                peripheralsBudget={order.peripherals_budget}
                                            />
                                        ))
                                    }
                                </>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="preferences">
                        <PreferencesForm
                            darkMode={darkMode}
                            orders={orders}
                            userId={user.id}
                            onOrdersUpdate={fetchOrders}
                        />
                    </TabsContent>

                    <TabsContent value="payments">
                        <PaymentDialog
                            orders={orders.filter(order => 
                                order.status === 'pending_consultation_payment' || 
                                order.status === 'ready'
                            )}
                            darkMode={darkMode}
                            onPaymentMethodChange={handlePaymentMethodChange}
                            onTermsAgreement={handleTermsAgreement}
                            onPaymentConfirm={handlePaymentConfirm}
                            onOrderUpdate={fetchOrders}
                        />
                    </TabsContent>

                    <TabsContent value="referrals">
                        <ReferralManager
                            userId={user.id}
                            userEmail={user.email}
                            darkMode={darkMode}
                            orders={orders}
                            referrals={referrals}
                            onCreateReferral={handleCreateReferral}
                        />
                    </TabsContent>
                </Tabs>
            </div>
    </div>
    )
}

export default PortalApp;