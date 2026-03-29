import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Btn, PageLoader, Empty, PageHeader } from '../components/common/UI';
import { formatDistanceToNow } from 'date-fns';

const roleColor = r => r==='ROLE_ADMIN' ? 'var(--purple)' : r==='ROLE_STAFF' ? 'var(--warning)' : 'var(--accent)';
const roleLabel = r => r==='ROLE_ADMIN' ? 'Admin' : r==='ROLE_STAFF' ? 'Staff' : 'User';

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleF, setRoleF]   = useState('ALL');
  const [promoting, setPromoting] = useState(null);
  const [deptInput, setDeptInput] = useState('');

  function load() {
    adminAPI.getUsers().then(r => setUsers(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function promote(id) {
    if (!deptInput.trim()) { toast.error('Enter department name'); return; }
    try { await adminAPI.promote(id, deptInput); toast.success('Promoted'); setPromoting(null); setDeptInput(''); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  }
  async function deactivate(id, name) {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try { await adminAPI.deactivate(id); toast.success('Deactivated'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  }

  const filtered = users.filter(u => {
    const q  = search.toLowerCase();
    const mq = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const mr = roleF === 'ALL' || u.role === roleF;
    return mq && mr;
  });

  const totals = { total: users.length, admin: users.filter(u=>u.role==='ROLE_ADMIN').length,
    staff: users.filter(u=>u.role==='ROLE_STAFF').length, user: users.filter(u=>u.role==='ROLE_USER').length };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="User Management" sub={`${users.length} registered users`} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.85rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total',  value:totals.total, color:'var(--text2)' },
          { label:'Admins', value:totals.admin, color:'var(--purple)' },
          { label:'Staff',  value:totals.staff, color:'var(--warning)' },
          { label:'Users',  value:totals.user,  color:'var(--accent)' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:'var(--r2)', padding:'1rem', textAlign:'center' }}>
            <p style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'var(--ff-head)', color:s.color }}>{s.value}</p>
            <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text2)',
              textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1.1rem', flexWrap:'wrap' }}>
        <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex:1, minWidth:180 }} />
        {['ALL','ROLE_USER','ROLE_STAFF','ROLE_ADMIN'].map(r => (
          <button key={r} onClick={() => setRoleF(r)}
            style={{ padding:'0.35rem 0.75rem', borderRadius:999, fontSize:'0.78rem', fontWeight:600,
              cursor:'pointer', border:'1px solid',
              borderColor: roleF===r ? 'var(--accent)' : 'var(--border)',
              background: roleF===r ? 'var(--accentbg)' : 'var(--elevated)',
              color: roleF===r ? 'var(--accent2)' : 'var(--text2)' }}>
            {r === 'ALL' ? 'All' : roleLabel(r)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <Empty icon="👥" title="No users found" /> : (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)',
          borderRadius:'var(--r2)', overflow:'hidden' }}>
          {filtered.map((u, i) => (
            <div key={u.id} style={{ padding:'0.85rem 1.25rem',
              borderBottom: i < filtered.length-1 ? '1px solid var(--border2)' : 'none',
              display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
              <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0,
                background: roleColor(u.role) + '18', border:`1px solid ${roleColor(u.role)}33`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700, fontSize:'0.9rem', color: roleColor(u.role) }}>
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:150 }}>
                <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{u.name}</p>
                <p style={{ fontSize:'0.78rem', color:'var(--text2)' }}>{u.email}</p>
                {u.departmentName && <p style={{ fontSize:'0.72rem', color:'var(--text3)' }}>{u.departmentName}</p>}
              </div>
              <span style={{ padding:'3px 10px', borderRadius:999, fontSize:'0.72rem', fontWeight:700,
                background: roleColor(u.role) + '18', color: roleColor(u.role),
                border:`1px solid ${roleColor(u.role)}33` }}>
                {roleLabel(u.role)}
              </span>
              <span style={{ fontSize:'0.75rem', color:'var(--text2)', whiteSpace:'nowrap' }}>
                {u.createdAt ? formatDistanceToNow(new Date(u.createdAt), { addSuffix:true }) : ''}
              </span>
              <span style={{ fontSize:'0.72rem', fontWeight:600, color: u.active ? 'var(--success)' : 'var(--danger)' }}>
                {u.active ? '● Active' : '● Inactive'}
              </span>
              <div style={{ display:'flex', gap:'0.4rem' }}>
                {u.role === 'ROLE_USER' && u.active && (
                  promoting === u.id ? (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <input value={deptInput} onChange={e => setDeptInput(e.target.value)}
                        placeholder="Department name" style={{ width:155, fontSize:'0.8rem', padding:'0.3rem 0.6rem' }} />
                      <Btn size="sm" variant="success" onClick={() => promote(u.id)}>✓</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => { setPromoting(null); setDeptInput(''); }}>✕</Btn>
                    </div>
                  ) : (
                    <Btn size="sm" variant="ghost" onClick={() => setPromoting(u.id)}>Make Staff</Btn>
                  )
                )}
                {u.role !== 'ROLE_ADMIN' && u.active && (
                  <Btn size="sm" variant="danger" onClick={() => deactivate(u.id, u.name)}>Deactivate</Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
