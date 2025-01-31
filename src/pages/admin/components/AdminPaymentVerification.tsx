// AdminPaymentVerification.tsx
import React, { useState } from 'react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Alert, AlertDescription } from 'components/ui/alert';
import { supabase } from 'context/auth';
import type { Order } from '../types/order';

interface AdminPaymentVerificationProps {
  order: Order;
  onVerify: () => Promise<void>;
  darkMode: boolean;
}

export const AdminPaymentVerification: React.FC<AdminPaymentVerificationProps> = ({
  order,
  onVerify,
  darkMode
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerification = async () => {
    setIsVerifying(true);
    setError(null);
  
    // Early return if we don't have offer data
    if (!order.offers) {
      setError('מידע חסר על ההזמנה');
      setIsVerifying(false);
      return;
    }
  
    try {
      let updates: any = {
        transaction_id: order.payment_method === 'later' 
          ? `CASH-${Date.now()}` 
          : verificationCode
      };
  
      // Update paid_amount based on status
      if (order.status === 'pending_consultation_payment') {
        // For consultation payment (20% of total)
        updates.paid_amount = Math.round(order.offers.service_cost * 0.2);
        updates.status = 'pending_parts_upload';
      } else if (order.status === 'ready') {
        // For final payment (remaining balance)
        updates.paid_amount = order.offers.service_cost;
        updates.status = order.offers.delivery_type === 'pickup' ? 'ready' : 'delivered';
      }
  
      // For cash payments, additional handling
      if (order.payment_method === 'later') {
        updates.status = order.offers.delivery_type === 'build_at_home' ? 'delivered' : 'ready';
      }
  
      const { error: updateError } = await supabase
        .from('authenticated_orders')
        .update(updates)
        .eq('id', order.id);
  
      if (updateError) throw updateError;
      await onVerify();
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <div className="mt-4 p-4 bg-gray-700/50 rounded">
      <h4 className="text-white font-medium mb-2">אימות תשלום</h4>
      
      {order.payment_method !== 'later' && (
        <Input
          placeholder="הזן מספר אסמכתא"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className={`mb-2 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
        />
      )}
      
      <div className="flex gap-2">
        <Button
          onClick={handleVerification}
          disabled={isVerifying || (!verificationCode && order.payment_method !== 'later')}
          className={`${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isVerifying ? 'מאמת...' : 'אמת תשלום'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};