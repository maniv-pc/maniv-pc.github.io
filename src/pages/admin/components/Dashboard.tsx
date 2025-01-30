// admin/components/Dashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MetricItem {
  date: string;
  income: number;
}

interface DashboardProps {
  metrics: {
    daily: MetricItem[];
    monthly: MetricItem[];
    yearly: MetricItem[];
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  return (

    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Daily Income</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff80' }}
                />
                <YAxis 
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff80' }}
                  tickFormatter={(value) => `₪${value}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`₪${value}`, 'Income']}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₪{metrics.monthly.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Monthly Income</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Yearly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₪{metrics.yearly.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Yearly Income</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;