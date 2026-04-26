import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#F97316', '#10B981', '#FBBF24', 'var(--text-muted)', '#3B82F6', '#8B5CF6'];

const CategoryPieChart = ({ complaints = [] }) => {
  const { t } = useLanguage();
  
  const data = React.useMemo(() => {
    const statuses = ['Submitted', 'In Progress', 'Resolved', 'Closed'];
    const counts = statuses.map(status => ({
      name: status,
      value: complaints.filter(c => c.status === status).length
    })).filter(d => d.value > 0);
    return counts;
  }, [complaints]);

  if (data.length === 0) return <div style={{height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>No data available</div>;

  const total = complaints.length;

  const renderLegendText = (value, entry) => {
    const { payload } = entry;
    // Ensure we handle parsing correctly
    const percent = total > 0 ? ((payload.value / total) * 100).toFixed(0) : 0;
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500', marginLeft: '4px' }}>{t(value) || value} ({percent}%)</span>;
  };

  return (
    <div style={{ height: 320, width: '100%' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="45%" 
            innerRadius={75}
            outerRadius={105} 
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, t(name) || name]} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          />
          <Legend 
            formatter={renderLegendText}
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
