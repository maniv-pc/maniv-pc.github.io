import React, { useState, useEffect } from 'react';
import { Card, CardContent } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Alert, AlertDescription } from 'components/ui/alert';
import { supabase } from 'context/auth';
import { AdminPaymentVerification } from './AdminPaymentVerification';
import { PartsListViewer } from '../../portal/components/order/PartsListViewer';
import { BuildScheduler } from '../../portal/components/order/BuildScheduler';
import { PreferencesData } from 'types/preferences';
import type { Order, OrderStatus, Filters } from '../types/order';
import emailjs from '@emailjs/browser'

interface OrderManagementProps {
  orders: Order[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  fetchOrders: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
}

const statusFlow: Record<OrderStatus, OrderStatus> = {
  'pending': 'approved',
  'approved': 'pending_initial_list',
  'pending_initial_list': 'pending_consultation_payment',
  'pending_consultation_payment': 'pending_parts_upload',
  'pending_parts_upload': 'pending_schedule',
  'pending_schedule': 'schedule_pending_approval',
  'schedule_pending_approval': 'building',
  'building': 'ready',
  'ready': 'delivered',
  'delivered': 'delivered',
  'cancellation_pending':'cancelled',
  'cancelled': 'cancelled'
};

const EMAIL_SERVICE = 'service_qy3nij6';
const EMAIL_P_KEY = 'ulj1-31N6L81zpCEt';

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  filters,
  setFilters,
  fetchOrders,
  fetchMetrics
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPartsViewer, setShowPartsViewer] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);

  useEffect(() => {
    const filtered = orders.filter(order => {
      if (filters.email && !order.offers?.email?.toLowerCase().includes(filters.email.toLowerCase())) return false;
      if (filters.name && !order.offers?.full_name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.serviceType && order.offers?.service_type !== filters.serviceType) return false;
      if (filters.status && order.status !== filters.status) return false;
      return true;
    });
    setFilteredOrders(filtered);
  }, [orders, filters]);

  const ordersByStatus = {
    offers: filteredOrders.filter(order => order.status === 'pending'),
    initialList: orders.filter(order => order.status === 'pending_initial_list'),
    partsList: orders.filter(order => order.status === 'pending_parts_upload'),
    scheduleApproval: orders.filter(order => order.status === 'schedule_pending_approval'),
    building: orders.filter(order => ['building', 'ready'].includes(order.status)),
    cancellationPending: orders.filter(order => order.status === 'cancellation_pending'),
    other: orders.filter(order => 
      !['pending', 'pending_initial_list', 'pending_parts_upload', 
        'schedule_pending_approval', 'building', 'ready', 
        'cancellation_pending'].includes(order.status)
    )
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('authenticated_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;
      await fetchOrders();
      await fetchMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartsUpload = async (orderId: string, parts: any[]) => {
    try {
      // Check if this is an initial list and validate the number of parts
      if (selectedOrder?.status === 'pending_initial_list' && parts.length > 3) {
        setError('הרשימה הראשונית יכולה להכיל עד 3 פריטים בלבד');
        return;
      }
  
      const { error } = await supabase
        .from('authenticated_orders')
        .update({
          parts_list: { 
            // אם זו רשימה ראשונית שמור ב-initial_list, אחרת ב-full_list
            [selectedOrder?.status === 'pending_initial_list' ? 'initial_list' : 'full_list']: parts,
            upload_date: new Date().toISOString()
          },
          status: selectedOrder?.status ? statusFlow[selectedOrder.status] : undefined
        })
        .eq('id', orderId);
  
      if (error) throw error;
      setShowPartsViewer(false);
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getServiceTypeDisplay = (type: string) => {
    return type === 'consultationOnly' ? 'ייעוץ בלבד' : 
           type === 'buildOnly' ? 'הרכבה בלבד' : 
           'ייעוץ והרכבה';
  };
  
  const getDeliveryTypeDisplay = (delivery: string, street?: string, city?: string) => {
    if (delivery === 'build_at_home' && street && city) {
      return `הרכבה בבית הלקוח (${street}, ${city})`;
    }
    return delivery === 'pickup' ? 'איסוף עצמי' : 'משלוח';
  };

  const getPreviousStatus = (currentStatus: OrderStatus): OrderStatus => {
    const entries = Object.entries(statusFlow);
    const previousEntry = entries.find(([_, nextStatus]) => nextStatus === currentStatus);
    return previousEntry ? previousEntry[0] as OrderStatus : 'pending';
  };

  const handleScheduleApproval = async (orderId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('authenticated_orders')
        .update({
          status: approved ? 'building' : 'pending_schedule'
        })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSendReminder = async (order: Order) => {
      try {
        const emailParams = {
          to_email: order.offers?.email,
          to_name: order.offers?.full_name,
          order_id: order.id,
          current_status: order.status,
          next_step: getNextStepMessage(order.status)
        };
        
        await emailjs.send(
          EMAIL_SERVICE,
          'order_reminder_template',
          emailParams,
          EMAIL_P_KEY
        );
    
        alert('Reminder sent successfully');
      } catch (error) {
        console.error('Failed to send reminder:', error);
        alert('Failed to send reminder');
      }
    };
    
    const getNextStepMessage = (status: OrderStatus): string => {
      switch(status) {
        case 'pending_consultation_payment': return 'Complete consultation payment';
        case 'pending_parts_upload': return 'Review and approve parts list';
        case 'pending_schedule': return 'Schedule build appointment';
        default: return 'Move to next step';
      }
    };

    const renderBudgetInfo = (order: Order) => (
      <div className="text-gray-400 mt-2">
        <p>תקציב חומרה: ₪{(order.offers?.budget || 0).toLocaleString()}</p>
        {order.offers?.peripherals_budget ? (
          <p>תקציב ציוד היקפי: ₪{order.offers.peripherals_budget.toLocaleString()}</p>
        ) : null}
      </div>
    );

    const renderOrderCard = (order: Order) => (
      <Card key={order.id} className="bg-gray-800 mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col text-right" dir="rtl"> {/* Added RTL support */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {order.status === 'pending' 
                    ? `הצעה ${order.id.slice(-6)}`  // אם זו הצעה ממתינה, נציג את ID של ההצעה
                    : `הזמנה ${order.id.slice(-6)} (במקור הצעה ${order.offer_id?.slice(-6)})`  // אם זו הזמנה, נציג את ה-ID של ההזמנה ואת ID ההצעה המקורית
                  }
                  {ordersByStatus.other.includes(order) && (
                    <Button 
                      onClick={() => handleSendReminder(order)}
                      className="text-sm bg-yellow-600 hover:bg-yellow-700 mr-2"
                    >
                      שלח תזכורת
                    </Button>
                  )}
                </h3>
                <p className="text-gray-400">
                  {order.offers?.full_name} ({order.offers?.email})
                </p>
                <div className="text-gray-400">
                  {getServiceTypeDisplay(order.offers?.service_type || '')} | 
                  {getDeliveryTypeDisplay(
                    order.offers?.delivery_type || '', 
                    order.offers?.address,
                    order.offers?.city
                  )}
                </div>
                <div className="text-gray-400 mt-2">
                  {order.offers?.operating_system && (
                    <p>מערכת הפעלה: {order.offers.operating_system}</p>
                  )}
                  {order.offers?.use_types && order.offers.use_types.length > 0 && (
                    <p>שימושים: {order.offers?.use_types?.join(', ')}</p>
                  )}
                  {order.offers?.game_resolution && (
                    <p>רזולוציית משחק: {order.offers.game_resolution}</p>
                  )}
                  {order.offers?.video_software && (
                    <p>תוכנות עריכה: {order.offers.video_software}</p>
                  )}
                </div>
                {renderBudgetInfo(order)}
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end"> {/* Added justify-end for RTL */}
              {/* Action buttons */}
              {order.status === 'pending_initial_list' && (
                <Button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowPartsViewer(true);
                  }}
                  className="bg-pink-400 hover:bg-pink-500"
                >
                  העלה רשימה ראשונית
                </Button>
              )}
              {(order.status === 'pending_consultation_payment' || order.status === 'ready') && 
                order.payment_method && !order.transaction_id && (
                  <AdminPaymentVerification
                    order={order}
                    onVerify={fetchOrders}
                    darkMode={true}
                  />
              )}
              {order.status === 'pending_parts_upload' && (
                <Button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowPartsViewer(true);
                  }}
                  className="bg-pink-700 hover:bg-pink-800"
                >
                  העלה מפרט מלא
                </Button>
              )}
              {order.status === 'schedule_pending_approval' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleScheduleApproval(order.id, true)}
                    className="bg-green-600"
                  >
                    אשר הצעת לו"ז
                  </Button>
                  <Button
                    onClick={() => handleScheduleApproval(order.id, false)}
                    className="bg-red-600"
                  >
                    דחה הצעת לו"ז
                  </Button>
                </div>
              )}
              {order.status === 'building' && (
                <Button
                  onClick={() => handleUpdateStatus(order.id, 'ready')}
                  className="bg-gray-700 hover:bg-gray-800"
                >
                  סימון להזמנה מוכנה
                </Button>
              )}
              {order.status === 'cancellation_pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                    className="bg-red-600"
                  >
                    אפשור ביטול הזמנה
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(order.id, getPreviousStatus(order.status))}
                    className="bg-green-600"
                  >
                    מניעת ביטול הזמנה
                  </Button>
                </div>
              )}
            </div>
          </div>
      </CardContent>
    </Card>
  );

  
  return (
    <div className="space-y-6" dir="rtl"> {/* Added RTL support */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Input 
          placeholder="סנן לפי שם"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="bg-white/10 text-white placeholder-white/50 text-right"
        />
        <Input 
          placeholder="סנן לפי אימייל"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          className="bg-white/10 text-white placeholder-white/50 text-right"
        />
        <Select 
          value={filters.serviceType}
          onValueChange={(value) => setFilters({ ...filters, serviceType: value })}
        >
          <SelectTrigger className="bg-white/10 text-white text-right">
            <SelectValue placeholder="סוג שירות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consultation">ייעוץ</SelectItem>
            <SelectItem value="full_build">הרכבה מלאה</SelectItem>
            <SelectItem value="repair">תיקון</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="bg-white/10 text-white text-right">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">ממתין לאישור</SelectItem>
            <SelectItem value="approved">מאושר</SelectItem>
            <SelectItem value="building">בבנייה</SelectItem>
            <SelectItem value="delivered">נמסר</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order sections */}
      {Object.entries(ordersByStatus).map(([section, sectionOrders]) => 
        sectionOrders.length > 0 && (
          <div key={section}>
            <h2 className="text-xl font-bold text-white mb-4 text-right">
              {section.replace(/([A-Z])/g, ' $1').trim()}
            </h2>
            {sectionOrders.map(order => renderOrderCard(order))}
          </div>
        )
      )}

      {/* Parts List Viewer Dialog */}
      {showPartsViewer && selectedOrder && (
        <PartsListViewer
          isOpen={showPartsViewer}
          onClose={() => setShowPartsViewer(false)}
          parts={selectedOrder.parts_list?.full_list || selectedOrder.parts_list?.initial_list || []}
          isInitialList={selectedOrder.status === 'pending_initial_list'}
          darkMode={true}
          isUploadMode={true}
          onUploadParts={(parts) => handlePartsUpload(selectedOrder.id, parts)}
          totalBudget={selectedOrder.offers?.budget || 0}
          preferences={selectedOrder.offers?.preferences as PreferencesData}
          peripheralsBudget={selectedOrder.offers?.peripherals_budget || 0}
        />
      )}
    </div>
  );
};

export default OrderManagement;