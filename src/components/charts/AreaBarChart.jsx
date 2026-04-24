import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaBarChart = () => {
  const { API_URL } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/analytics/areas`).then(res => setData(res.data)).catch(console.error);
  }, [API_URL]);

  if (data.length === 0) return <div style={{height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>Loading...</div>;

  return (
    <div style={{ height: 320, width: '100%' }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: 'var(--text-muted)'}} 
            dy={10}
            tickFormatter={(value) => value ? (value.split(',')[0].length > 10 ? value.substring(0, 10)+'...' : value.split(',')[0]) : ''}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: 'var(--text-muted)'}} 
          />
          <Tooltip 
            formatter={(value) => [value, t('totalComplaints') || 'Complaints']}
            labelFormatter={(label) => t(label) || label}
            cursor={{fill: '#F3F4F6'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaBarChart;
