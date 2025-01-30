// ReferralManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Alert, AlertDescription } from 'components/ui/alert';
import { supabase } from 'context/auth';

interface ReferralTableRow {
  code: string;
  referrer_email: string;
  new_customer_name: string;
  new_customer_email: string;
  discount_percentage: number;
  used: boolean;
  created_at: string;
  used_at?: string;
}

export const ReferralManagement: React.FC = () => {
  const [referrals, setReferrals] = useState<ReferralTableRow[]>([]);
  const [newDiscount, setNewDiscount] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('used', false)
        .order('created_at', { ascending: false });
  
      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    }
  };

  const handleUpdateDiscount = async () => {
    try {
      setError(null);
      setSuccess(false);
      
      if (!referralCode || !newDiscount) {
        throw new Error('נא למלא את כל השדות');
      }

      const discount = parseInt(newDiscount);
      if (isNaN(discount) || discount < 0 || discount > 50) {
        throw new Error('אחוז ההנחה חייב להיות בין 0 ל-50');
      }

      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('used, new_customer_email')
        .eq('code', referralCode)
        .single();

      if (referralError) throw new Error('קוד הפניה לא נמצא');
      
      if (referralData.used) {
        throw new Error('לא ניתן לשנות הנחה עבור קוד שכבר נוצל');
      }

      // Check if email exists in previous orders
      const { data: existingOrders, error: orderError } = await supabase
        .from('offers')
        .select('id')
        .eq('email', referralData.new_customer_email)
        .limit(1);

      if (orderError) throw orderError;

      if (existingOrders && existingOrders.length > 0) {
        throw new Error('לא ניתן לתת הנחה ללקוח קיים');
      }

      const { error } = await supabase
        .from('referrals')
        .update({ discount_percentage: discount })
        .eq('code', referralCode);

      if (error) throw error;

      setSuccess(true);
      setReferralCode('');
      setNewDiscount('');
      fetchReferrals();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 mb-6">
        <CardHeader>
          <CardTitle className="text-white">ניהול הפניות פעילות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2">קוד</th>
                  <th className="text-left p-2">מפנה</th>
                  <th className="text-left p-2">שם לקוח</th>
                  <th className="text-left p-2">אימייל</th>
                  <th className="text-right p-2">הנחה</th>
                  <th className="text-right p-2">סטטוס</th>
                  <th className="text-right p-2">תאריך שימוש</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.code} className="border-b border-white/10">
                    <td className="p-2">{referral.code}</td>
                    <td className="p-2">{referral.referrer_email}</td>
                    <td className="p-2">{referral.new_customer_name}</td>
                    <td className="p-2">{referral.new_customer_email}</td>
                    <td className="p-2 text-right">{referral.discount_percentage}%</td>
                    <td className="p-2 text-right">
                      {referral.used ? 'נוצל' : 'פעיל'}
                    </td>
                    <td className="p-2 text-right">
                      {referral.used_at ? new Date(referral.used_at).toLocaleDateString('he-IL') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">עדכון אחוזי הנחה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input 
              placeholder="קוד הפניה"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="bg-white/10 text-white placeholder-white/50"
            />
            <Input 
              type="number"
              placeholder="אחוז הנחה חדש"
              value={newDiscount}
              onChange={(e) => setNewDiscount(e.target.value)}
              className="bg-white/10 text-white placeholder-white/50"
              min="0"
              max="50"
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-500/10 text-green-500 border-green-500">
                <AlertDescription>ההנחה עודכנה בהצלחה</AlertDescription>
              </Alert>
            )}
            <Button 
              onClick={handleUpdateDiscount}
              className="w-full"
            >
              עדכן הנחה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralManagement;