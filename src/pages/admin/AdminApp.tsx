import React, { useState, useEffect } from 'react';
import { supabase, useAuth } from 'context/auth';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'components/ui/tabs';
import OrderManagement from './components/OrderManagement';
import { Dashboard } from './components/Dashboard';
import { ReferralManagement } from './components/ReferralManagement';
import { Order, OrderStatus } from './types/order';

interface Metrics {
  daily: MetricItem[];
  monthly: MetricItem[];
  yearly: MetricItem[];
}

interface MetricItem {
  date: string;
  income: number;
}

const AdminApp = () => {
  const { user, signIn, signOut, maintainUserRole } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    daily: [],
    monthly: [],
    yearly: []
  });
  const [filters, setFilters] = useState({
    email: '',
    name: '',
    useType: '',
    serviceType: '',
    status: ''
  });
  
  // Auth check
  useEffect(() => {
    if (user) {
      checkAdminAccess();
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchMetrics();
    }
  }, [isAuthenticated]);
  
  const checkAdminAccess = async () => {
    try {
      if (!user) {
        setIsAuthenticated(false);
        return;
      }
  
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
  
      if (profileError) throw profileError;
      if (!profile || profile.role !== 'Admin') {
        throw new Error('Unauthorized access');
      }
  
      const { error: maintainError } = await maintainUserRole(user.id);
      if (maintainError) throw maintainError;
  
      setIsAuthenticated(true);
      setError(null);
    } catch (error: any) {
      console.error('Admin access check failed:', error);
      setError('Unauthorized access');
      setIsAuthenticated(false);
      signOut();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  const fetchMetrics = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const { data: dailyData, error: dailyError } = await supabase
      .from('authenticated_orders')
      .select('created_at, paid_amount')
      .gte('created_at', startOfDay.toISOString())
      .order('created_at');

      if (dailyError) throw dailyError;

      const dailyMetrics = dailyData.reduce<MetricItem[]>((acc, order) => {
        const date = new Date(order.created_at).toLocaleTimeString();
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.income += order.paid_amount;
        } else {
          acc.push({ date, income: order.paid_amount });
        }
        return acc;
      }, []);
      
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('authenticated_orders')
        .select('created_at, paid_amount')
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at');
  
      if (monthlyError) throw monthlyError;
  
      const { data: yearlyData, error: yearlyError } = await supabase
        .from('authenticated_orders')
        .select('created_at, paid_amount')
        .gte('created_at', startOfYear.toISOString())
        .order('created_at');
  
      if (yearlyError) throw yearlyError;
  
      const monthlyMetrics = monthlyData.reduce<MetricItem[]>((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.income += order.paid_amount;
        } else {
          acc.push({ date, income: order.paid_amount });
        }
        return acc;
      }, []);
  
      const yearlyMetrics = yearlyData.reduce<MetricItem[]>((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short' });
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.income += order.paid_amount;
        } else {
          acc.push({ date, income: order.paid_amount });
        }
        return acc;
      }, []);
  
      setMetrics(prev => ({
        ...prev,
        daily: dailyMetrics,
        monthly: monthlyMetrics,
        yearly: yearlyMetrics
      }));
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };
  
  const fetchOrders = async () => {
    try {
      // First fetch pending offers
      const { data: pendingOffers, error: offersError } = await supabase
        .from('offers')
        .select(`
          *,
          service_type,
          service_cost,
          delivery_type,
          status,
          address,
          city,
          budget,
          operating_system,
          use_types,
          game_resolution,
          video_software,
          preferences,
          peripherals_budget
        `)
        .eq('status', 'pending');

      if (offersError) throw offersError;

      // Then fetch authenticated orders with their related offers
      const { data: authenticatedOrders, error: ordersError } = await supabase
        .from('authenticated_orders')
        .select(`
          *,
          offers (
            full_name,
            email,
            service_type,
            service_cost,
            delivery_type,
            status,
            address,
            city,
            budget,
            operating_system,
            use_types,
            game_resolution,
            video_software,
            preferences,
            peripherals_budget
          )
        `);

      if (ordersError) throw ordersError;

      // Transform pending offers to match Order type
      const transformedOffers = pendingOffers.map(offer => ({
        id: offer.id,              // ID של ההצעה
        offer_id: offer.id,        // offer_id זהה ל-ID כי זו הצעה מקורית
        status: 'pending' as OrderStatus,
        created_at: offer.created_at,
        updated_at: offer.created_at,
        paid_amount: 0,
        agree_to_terms: false,
        weekend_fee_applied: false,
        user_id: '',
        offers: {
          ...offer
        }
      }));

      // Combine and filter all orders
      let allOrders = [...transformedOffers, ...(authenticatedOrders || [])];
      
      // Apply filters
      if (filters.email) {
        allOrders = allOrders.filter(order => 
          order.offers?.email?.toLowerCase().includes(filters.email.toLowerCase())
        );
      }
      if (filters.name) {
        allOrders = allOrders.filter(order => 
          order.offers?.full_name?.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
      if (filters.serviceType) {
        allOrders = allOrders.filter(order => 
          order.offers?.service_type === filters.serviceType
        );
      }
      if (filters.status) {
        allOrders = allOrders.filter(order => 
          order.status === filters.status
        );
      }

      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
};

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black"
                disabled={isLoading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-black"
                disabled={isLoading}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                className="w-full text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-950 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <Button onClick={handleLogout} className="text-white bg-red-600 hover:bg-red-700">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="text-white">
          <TabsList className="bg-white/10 text-white">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-white/20 text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-white/20 text-white"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="referrals"
              className="data-[state=active]:bg-white/20 text-white"
            >
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard metrics={metrics} />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement 
              orders={orders}
              filters={filters}
              setFilters={setFilters}
              fetchOrders={fetchOrders}
              fetchMetrics={fetchMetrics}
            />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminApp;