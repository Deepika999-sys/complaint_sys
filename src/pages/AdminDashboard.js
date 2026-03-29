import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { StatCard, PageLoader, Card, PageHeader } from '../components/common/UI';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#2f81f7','#3fb950','#d29922','#f85149','#a371f7','#58a6ff'];

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)',
      borderRadius:6, padding:'0.6rem 0.85rem', fontSize:'0.8rem' }}>
      {label && <p style={{ color:'var(--text2)', marginBottom:2 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color || 'var(--text1)', fontWeight:600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.dashboard().then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data)   return <div style={{ color:'var(--text2)', padding:'2rem' }}>Failed to load analytics.</div>;

  const catData  = Object.entries(data.complaintsByCategory || {}).map(([name, value]) => ({ name: name.replace('_',' '), value }));
  const statData = Object.entries(data.complaintsByStatus   || {}).map(([name, value]) => ({ name: name.replace('_',' '), value }));
  const prioData = Object.entries(data.complaintsByPriority || {}).map(([name, value]) => ({
    name, value, fill: name==='HIGH' ? '#f85149' : name==='MEDIUM' ? '#d29922' : '#3fb950'
  }));
  const deptData = (data.departmentPerformance || []).map(d => ({
    name: d.departmentName.replace(' Department',''),
    Assigned: d.totalAssigned, Resolved: d.resolved, Pending: d.pending,
  }));

  return (
    <div>
      <PageHeader title="Analytics Dashboard" sub="System-wide complaint insights" />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'1rem', marginBottom:'1.75rem' }}>
        <StatCard label="Total"        value={data.totalComplaints}        icon="📋" color="var(--accent)" />
        <StatCard label="Open"         value={data.openComplaints}         icon="🕐" color="var(--warning)" />
        <StatCard label="Resolved"     value={data.resolvedComplaints}     icon="✅" color="var(--success)" />
        <StatCard label="High Priority" value={data.highPriorityComplaints} icon="🔴" color="var(--danger)" />
        <StatCard label="Avg Resolution"
          value={data.averageResolutionTimeHours != null ? `${data.averageResolutionTimeHours}h` : '—'}
          icon="⏱" color="var(--purple)" />
        <StatCard label="Satisfaction"
          value={data.averageSatisfactionRating != null ? `${data.averageSatisfactionRating}/5` : '—'}
          icon="⭐" color="#58a6ff" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
        <Card>
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'1.25rem' }}>Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={catData} margin={{ top:0, right:10, left:-10, bottom:0 }}>
              <XAxis dataKey="name" tick={{ fill:'var(--text2)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text2)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" name="Complaints" radius={[4,4,0,0]}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'1.25rem' }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={statData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={55} outerRadius={80} paddingAngle={3}>
                {statData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span style={{ color:'var(--text2)', fontSize:'0.78rem' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'1.25rem' }}>Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={prioData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={60} outerRadius={85} paddingAngle={4}>
                {prioData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip content={<Tip />} />
              <Legend iconType="circle" iconSize={8}
                formatter={(v, e) => <span style={{ color: e.payload?.fill, fontSize:'0.78rem' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'1.25rem' }}>Department Performance</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={deptData} margin={{ top:0, right:10, left:-10, bottom:0 }}>
              <XAxis dataKey="name" tick={{ fill:'var(--text2)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text2)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Legend iconType="square" iconSize={8}
                formatter={v => <span style={{ color:'var(--text2)', fontSize:'0.78rem' }}>{v}</span>} />
              <Bar dataKey="Assigned" fill="#2f81f7" radius={[3,3,0,0]} />
              <Bar dataKey="Resolved" fill="#3fb950" radius={[3,3,0,0]} />
              <Bar dataKey="Pending"  fill="#d29922" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'1.1rem' }}>🏢 Department Metrics</h3>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Department','Assigned','Resolved','Pending','Avg Hours'].map(h => (
                  <th key={h} style={{ padding:'0.6rem 0.85rem', textAlign:'left', fontSize:'0.72rem',
                    fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.departmentPerformance || []).map((d, i) => (
                <tr key={i} style={{ borderBottom:'1px solid var(--border2)' }}>
                  <td style={{ padding:'0.7rem 0.85rem', fontWeight:600, fontSize:'0.875rem' }}>{d.departmentName}</td>
                  <td style={{ padding:'0.7rem 0.85rem', color:'var(--accent2)' }}>{d.totalAssigned}</td>
                  <td style={{ padding:'0.7rem 0.85rem', color:'var(--success)' }}>{d.resolved}</td>
                  <td style={{ padding:'0.7rem 0.85rem', color:'var(--warning)' }}>{d.pending}</td>
                  <td style={{ padding:'0.7rem 0.85rem', color:'var(--text2)' }}>
                    {d.avgResolutionHours != null ? `${d.avgResolutionHours}h` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
