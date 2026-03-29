import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { Badge, PageLoader, Empty, Btn, PageHeader } from '../components/common/UI';
import { formatDistanceToNow } from 'date-fns';

export default function MyComplaints() {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    complaintAPI.getMine().then(r => setList(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statuses = ['ALL','SUBMITTED','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'];
  const filtered = list.filter(c => {
    const q = search.toLowerCase();
    const ms = filter === 'ALL' || c.status === filter;
    const mq = !q || c.title?.toLowerCase().includes(q) || c.complaintNumber?.toLowerCase().includes(q);
    return ms && mq;
  });

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="My Complaints" sub={`${list.length} total`}
        action={<Link to="/submit"><Btn size="sm">＋ New</Btn></Link>} />

      <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex:1, minWidth:200 }} />
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:'0.35rem 0.75rem', borderRadius:999, fontSize:'0.78rem', fontWeight:600,
              cursor:'pointer', border:'1px solid',
              borderColor: filter===s ? 'var(--accent)' : 'var(--border)',
              background: filter===s ? 'var(--accentbg)' : 'var(--elevated)',
              color: filter===s ? 'var(--accent2)' : 'var(--text2)' }}>
            {s.replace('_',' ')}
          </button>
        ))}
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r2)', overflow:'hidden' }}>
        {filtered.length === 0 ? (
          <Empty icon="🔍" title="No complaints found"
            action={<Link to="/submit"><Btn size="sm">Submit Complaint</Btn></Link>} />
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--elevated)', borderBottom:'1px solid var(--border)' }}>
                  {['Number','Title','Category','Priority','Status','Submitted'].map(h => (
                    <th key={h} style={{ padding:'0.65rem 1rem', textAlign:'left', fontSize:'0.72rem',
                      fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em',
                      whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => window.location.href = `/complaints/${c.id}`}
                    style={{ borderBottom:'1px solid var(--border2)', cursor:'pointer', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding:'0.7rem 1rem' }}>
                      <code style={{ fontSize:'0.75rem', color:'var(--accent2)',
                        background:'var(--accentbg)', padding:'2px 6px', borderRadius:4 }}>
                        {c.complaintNumber}
                      </code>
                    </td>
                    <td style={{ padding:'0.7rem 1rem', maxWidth:220 }}>
                      <p style={{ fontWeight:500, fontSize:'0.875rem', overflow:'hidden',
                        textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</p>
                    </td>
                    <td style={{ padding:'0.7rem 1rem', fontSize:'0.8rem', color:'var(--text2)' }}>
                      {c.category?.replace('_',' ')}
                    </td>
                    <td style={{ padding:'0.7rem 1rem' }}>
                      {c.priority ? <Badge>{c.priority}</Badge> : <span style={{ color:'var(--text3)' }}>—</span>}
                    </td>
                    <td style={{ padding:'0.7rem 1rem' }}><Badge>{c.status?.replace('_',' ')}</Badge></td>
                    <td style={{ padding:'0.7rem 1rem', fontSize:'0.75rem', color:'var(--text2)', whiteSpace:'nowrap' }}>
                      {c.submittedAt ? formatDistanceToNow(new Date(c.submittedAt), { addSuffix:true }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
