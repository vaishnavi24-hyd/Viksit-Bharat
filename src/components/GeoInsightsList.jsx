import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const colorMap = {
  'Roads & Potholes': '#F97316', // Orange
  'Water & Sanitation': '#3B82F6', // Blue
  'Garbage & Waste': '#10B981', // Green
  'Electricity & Power': '#EAB308', // Yellow
  'Emergency': '#EF4444', // Red
  'Other': '#6B7280' // Gray
};

const GeoInsightsList = ({ complaints = [] }) => {
  const { t } = useLanguage();
  const [expandedLevels, setExpandedLevels] = useState({});

  const toggleLevel = (id) => {
    setExpandedLevels(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getDominantCategory = (items) => {
    const counts = {};
    items.forEach(c => {
      const type = c.type === 'Emergency' ? 'Emergency' : (c.issueType || 'Other');
      counts[type] = (counts[type] || 0) + 1;
    });
    
    let dominant = null;
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = type;
      }
    });
    
    return { dominant, maxCount, color: colorMap[dominant] || colorMap['Other'] };
  };

  const groupedData = useMemo(() => {
    const tree = {};

    complaints.forEach(c => {
      let state = c.state;
      let district = c.district;
      let city = c.city;
      let area = c.area;

      // Fallback: Parse from existing address string if structured fields are missing
      if (!state && !city && !area && c.address) {
        const parts = c.address.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          area = parts[0];
          city = parts[1];
          state = parts[parts.length - 1];
          district = parts[1]; // fallback district to city
        } else if (parts.length === 2) {
          area = parts[0];
          city = parts[1];
          state = parts[1];
        } else {
          area = parts[0];
        }
      }

      state = state || 'Unknown State';
      district = district || 'Unknown District';
      city = city || 'Unknown City';
      area = area || 'Unknown Area';

      if (!tree[state]) tree[state] = { name: state, level: 'state', children: {}, items: [] };
      tree[state].items.push(c);

      if (!tree[state].children[district]) tree[state].children[district] = { name: district, level: 'district', children: {}, items: [] };
      tree[state].children[district].items.push(c);

      if (!tree[state].children[district].children[city]) tree[state].children[district].children[city] = { name: city, level: 'city', children: {}, items: [] };
      tree[state].children[district].children[city].items.push(c);

      if (!tree[state].children[district].children[city].children[area]) tree[state].children[district].children[city].children[area] = { name: area, level: 'area', children: {}, items: [] };
      tree[state].children[district].children[city].children[area].items.push(c);
    });

    const formatNode = (node, idPath) => {
      const { dominant, maxCount, color } = getDominantCategory(node.items);
      const total = node.items.length;
      
      const validLocs = node.items.filter(c => c.latitude && c.longitude);
      const avgLat = validLocs.length > 0 ? validLocs.reduce((sum, c) => sum + c.latitude, 0) / validLocs.length : null;
      const avgLng = validLocs.length > 0 ? validLocs.reduce((sum, c) => sum + c.longitude, 0) / validLocs.length : null;
      
      const heatmapData = {
        lat: avgLat,
        lng: avgLng,
        dominantCategory: dominant,
        count: total
      };
      
      const childrenArr = Object.values(node.children)
        .map(child => formatNode(child, `${idPath}-${child.name}`))
        .sort((a, b) => b.total - a.total);

      return {
        id: idPath,
        name: node.name,
        level: node.level,
        total,
        dominant,
        maxCount,
        color,
        heatmapData,
        children: childrenArr
      };
    };

    return Object.values(tree)
      .map(stateNode => formatNode(stateNode, `state-${stateNode.name}`))
      .sort((a, b) => b.total - a.total);
  }, [complaints]);

  const renderNode = (node, depth = 0) => {
    const isExpanded = expandedLevels[node.id];
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} style={{ marginLeft: depth > 0 ? '1.5rem' : '0', borderLeft: depth > 0 ? '2px solid #E5E7EB' : 'none', paddingLeft: depth > 0 ? '1rem' : '0', marginBottom: '0.5rem' }}>
        <div 
          onClick={() => hasChildren && toggleLevel(node.id)}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '8px', 
            border: '1px solid #E5E7EB',
            cursor: hasChildren ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => hasChildren ? (e.currentTarget.style.backgroundColor = '#F9FAFB') : null}
          onMouseLeave={(e) => hasChildren ? (e.currentTarget.style.backgroundColor = 'var(--card-bg)') : null}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasChildren ? (isExpanded ? <ChevronDown size={18} color="var(--text-muted)"/> : <ChevronRight size={18} color="var(--text-muted)"/>) : <MapPin size={18} color="var(--text-muted)"/>}
            <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: depth === 0 ? '1.1rem' : '1rem' }}>{node.name}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '12px' }}>{node.total} Total</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>
              {node.dominant === 'Emergency' ? '🚨' : '🔴'} {node.dominant} Dominant
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({node.maxCount}/{node.total})</span>
            <div style={{ width: '16px', height: '16px', backgroundColor: node.color, borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div style={{ marginTop: '0.5rem' }}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!groupedData.length) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>No location insights available.</div>;
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      {groupedData.map(stateNode => renderNode(stateNode, 0))}
    </div>
  );
};

export default GeoInsightsList;
