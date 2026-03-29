import React, { useEffect, useState } from 'react';
import { complaintAPI } from '../services/api';
import { Badge, PageLoader, Empty, PageHeader } from '../components/common/UI';
import { formatDistanceToNow } from 'date-fns';

export default function AdminComplaints() {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPrio] = useState('ALL');

  useEffect(() => {
    complaintAPI.getAll().then(r => setList(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = list.filter(c => {
    const q  = search.toLowerCase();
    const mq = !q || c.title?.toLowerCase().includes(q) || c.complaintNumber?.toLowerCase().includes(q) || c.submittedByName?.toLowerCase().includes(q);
    const ms = status === 'ALL' || c.status === status;
    const mp = priority === 'ALL' || c.priority === priority;
    return mq && ms && mp;
  });

  function Chip({ label, active, onClick }) {
    return (
      <button onClick={onClick} style={{ padding:'0.3rem 0.7rem', borderRadius:999, fontSize:'0.75rem',
        fontWeight:600, cursor:'pointer', border:'1px solid',
        borderColor: active ? 'var(--accent)' : 'var(--border)',
        background: active ? 'var(--accentbg)' : 'var(--elevated)',
        color: active ? 'var(--accent2)' : 'var(--text2)' }}>
        {label.replace('_',' ')}
      </button>
    );
  }

  return (
    <div>
      <PageHeader title="All Complaints" sub={`${filtered.length} of ${list.length}`} />

      <div style={{ background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:'var(--r2)', padding:'1rem', marginBottom:'1.25rem',
        display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        <input placeholder="Search title, number, user..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
          {['ALL','SUBMITTED','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'].map(s => (
            <Chip key={s} label={s} active={status===s} onClick={() => setStatus(s)} />
          ))}
          <span style={{ width:1, background:'var(--border)', margin:'0 4px' }} />
          {['ALL','HIGH','MEDIUM','LOW'].map(p => (
            <Chip key={p} label={p} active={priority===p} onClick={() => setPrio(p)} />
          ))}
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)',
          borderRadius:'var(--r2)', overflow:'hidden' }}>
          {filtered.length === 0 ? <Empty icon="🔍" title="No complaints match" message="Adjust your filters" /> : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--elevated)', borderBottom:'1px solid var(--border)' }}>
                    {['Number','Title','User','Category','Priority','Status','Dept','Submitted'].map(h => (
                      <th key={h} style={{ padding:'0.6rem 0.9rem', textAlign:'left', fontSize:'0.7rem',
                        fontWeight:700, color:'var(--text2)', textTransform:'uppercase',
                        letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} onClick={() => window.location.href = `/complaints/${c.id}`}
                      style={{ borderBottom:'1px solid var(--border2)', cursor:'pointer', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding:'0.65rem 0.9rem' }}>
                        <code style={{ fontSize:'0.72rem', color:'var(--accent2)',
                          background:'var(--accentbg)', padding:'2px 5px', borderRadius:3 }}>
                          {c.complaintNumber}
                        </code>
                      </td>
                      <td style={{ padding:'0.65rem 0.9rem', maxWidth:180 }}>
                        <p style={{ fontSize:'0.85rem', fontWeight:500, overflow:'hidden',
                          textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</p>
                        <p style={{ fontSize:'0.73rem', color:'var(--text2)', overflow:'hidden',
                          textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.location}</p>
                      </td>
                      <td style={{ padding:'0.65rem 0.9rem', fontSize:'0.8rem', color:'var(--text2)', whiteSpace:'nowrap' }}>{c.submittedByName}</td>
                      <td style={{ padding:'0.65rem 0.9rem', fontSize:'0.78rem', color:'var(--text2)' }}>{c.category?.replace('_',' ')}</td>
                      <td style={{ padding:'0.65rem 0.9rem' }}>{c.priority ? <Badge>{c.priority}</Badge> : <span style={{ color:'var(--text3)' }}>—</span>}</td>
                      <td style={{ padding:'0.65rem 0.9rem' }}><Badge>{c.status?.replace('_',' ')}</Badge></td>
                      <td style={{ padding:'0.65rem 0.9rem', fontSize:'0.78rem', color:'var(--text2)', whiteSpace:'nowrap' }}>{c.departmentName || '—'}</td>
                      <td style={{ padding:'0.65rem 0.9rem', fontSize:'0.72rem', color:'var(--text2)', whiteSpace:'nowrap' }}>
                        {c.submittedAt ? formatDistanceToNow(new Date(c.submittedAt), { addSuffix:true }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
