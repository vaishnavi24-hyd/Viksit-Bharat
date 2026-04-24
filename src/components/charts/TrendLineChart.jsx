import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrendLineChart = () => {
  const { API_URL } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/analytics/trends`).then(res => setData(res.data)).catch(console.error);
  }, [API_URL]);
  
  if (data.length === 0) return <div>Loading...</div>;

  return (
    <div style={{ height: 320, width: '100%' }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value, name) => [value, t(name)]} />
          <Legend formatter={(value) => t(value)} />
          <Line type="monotone" dataKey="complaints" name="totalComplaints" stroke="#16A34A" strokeWidth={3} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendLineChart;
