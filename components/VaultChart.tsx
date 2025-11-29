import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Vault } from '../types';

interface VaultChartProps {
  data: Vault['history'];
  color: string;
}

const VaultChart: React.FC<VaultChartProps> = ({ data, color }) => {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            hide
          />
          <YAxis
            hide
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              color: '#f8fafc',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: color }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'APY']}
          />
          <Area
            type="monotone"
            dataKey="apy"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${color})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VaultChart;
