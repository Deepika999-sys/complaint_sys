import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard, Badge, PageLoader, Empty, Btn, PageHeader } from '../components/common/UI';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintAPI.getMine()
      .then(r => setList(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total    = list.length;
  const open     = list.filter(c => !['RESOLVED','CLOSED'].includes(c.status)).length;
  const resolved = list.filter(c => ['RESOLVED','CLOSED'].includes(c.status)).length;
  const high     = list.filter(c => c.priority === 'HIGH').length;

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name?.split(' ')[0]} 👋`}
        sub="Track your complaints"
        action={<Link to="/submit"><Btn size="sm">＋ New Complaint</Btn></Link>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
        gap:'1rem', marginBottom:'1.75rem' }}>
        <StatCard label="Total"    value={total}    icon="📋" color="var(--accent)" />
        <StatCard label="Open"     value={open}     icon="🕐" color="var(--warning)" />
        <StatCard label="Resolved" value={resolved} icon="✅" color="var(--success)" />
        <StatCard label="High"     value={high}     icon="🔴" color="var(--danger)" />
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r2)', overflow:'hidden' }}>
        <div style={{ padding:'0.85rem 1.25rem', borderBottom:'1px solid var(--border2)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:'0.95rem', fontWeight:700 }}>Recent Complaints</h3>
          <Link to="/my-complaints" style={{ fontSize:'0.8rem' }}>View all →</Link>
        </div>
        {list.length === 0 ? (
          <Empty icon="📭" title="No complaints yet"
            action={<Link to="/submit"><Btn size="sm">Submit First Complaint</Btn></Link>} />
        ) : (
          list.slice(0,6).map(c => (
            <Link key={c.id} to={`/complaints/${c.id}`} style={{ textDecoration:'none' }}>
              <div style={{ padding:'0.85rem 1.25rem', borderBottom:'1px solid var(--border2)',
                display:'flex', gap:'1rem', alignItems:'center', cursor:'pointer',
                transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:'0.15rem',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</p>
                  <p style={{ fontSize:'0.78rem', color:'var(--text2)' }}>
                    {c.complaintNumber} · {c.category?.replace('_',' ')} · {c.location}
                  </p>
                </div>
                <div style={{ display:'flex', gap:'0.4rem', alignItems:'center', flexShrink:0 }}>
                  {c.priority && <Badge>{c.priority}</Badge>}
                  <Badge>{c.status?.replace('_',' ')}</Badge>
                  <span style={{ fontSize:'0.73rem', color:'var(--text2)' }}>
                    {c.submittedAt ? formatDistanceToNow(new Date(c.submittedAt), { addSuffix:true }) : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
