import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent } from "./ui/card";

const RevenueChart = ({ data, totalRevenue, formatCurrency }) => {
  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-4">
        <div className='flex flex-col items-center gap-2'>
          <div className="text-2xl font-bold mt-2">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis hide={true} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="received" fill="#56aeff" radius={[15, 15, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;