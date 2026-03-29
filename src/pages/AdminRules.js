import React, { useEffect, useState } from 'react';
import { ruleAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Badge, Card, Btn, FormField, PageLoader, Empty, PageHeader, Modal } from '../components/common/UI';

const CATS  = ['ELECTRICAL','WATER_SUPPLY','CLEANLINESS','SAFETY','ADMINISTRATIVE'];
const SEVS  = ['CRITICAL','MAJOR','MINOR'];
const PRIOS = ['HIGH','MEDIUM','LOW'];
const pColor = p => p==='HIGH' ? '#f85149' : p==='MEDIUM' ? '#d29922' : '#3fb950';
const blank  = { category:'', severity:'', locationKeyword:'', assignedPriority:'', ruleDescription:'', ruleOrder:10 };

export default function AdminRules() {
  const [rules, setRules]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(blank);
  const [saving, setSaving]     = useState(false);

  function load() {
    ruleAPI.getAll().then(r => setRules(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function openNew()  { setForm(blank); setEditing(null); setShowForm(true); }
  function openEdit(r) {
    setForm({ category:r.category, severity:r.severity, locationKeyword:r.locationKeyword||'',
      assignedPriority:r.assignedPriority, ruleDescription:r.ruleDescription||'', ruleOrder:r.ruleOrder });
    setEditing(r.id); setShowForm(true);
  }

  async function save() {
    if (!form.category || !form.severity || !form.assignedPriority) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      if (editing) { await ruleAPI.update(editing, form); toast.success('Updated'); }
      else         { await ruleAPI.create(form);           toast.success('Created'); }
      setShowForm(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  }

  async function toggle(id) {
    try { await ruleAPI.toggle(id); load(); } catch { toast.error('Error'); }
  }
  async function del(id) {
    if (!window.confirm('Delete this rule?')) return;
    try { await ruleAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Error'); }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Priority Rules" sub="Auto-assign priority based on rules"
        action={<Btn size="sm" onClick={openNew}>＋ Add Rule</Btn>} />

      {showForm && (
        <Modal title={editing ? 'Edit Rule' : 'New Priority Rule'} onClose={() => setShowForm(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <FormField label="Category" required>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select...</option>
                  {CATS.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                </select>
              </FormField>
              <FormField label="Severity" required>
                <select value={form.severity} onChange={e => set('severity', e.target.value)}>
                  <option value="">Select...</option>
                  {SEVS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Assign Priority" required>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                {PRIOS.map(p => (
                  <button key={p} type="button" onClick={() => set('assignedPriority', p)}
                    style={{ flex:1, padding:'0.5rem', borderRadius:'var(--r1)', fontWeight:700,
                      fontSize:'0.8rem', cursor:'pointer', border:`2px solid ${form.assignedPriority===p ? pColor(p) : 'var(--border)'}`,
                      background: form.assignedPriority===p ? pColor(p)+'18' : 'var(--elevated)',
                      color: form.assignedPriority===p ? pColor(p) : 'var(--text2)' }}>
                    {p}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Location Keyword" hint="e.g. 'hospital' — triggers if location contains this word">
              <input value={form.locationKeyword} onChange={e => set('locationKeyword', e.target.value)} placeholder="hospital" />
            </FormField>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'0.75rem' }}>
              <FormField label="Description"><input value={form.ruleDescription} onChange={e => set('ruleDescription', e.target.value)} /></FormField>
              <FormField label="Order" hint="Lower = higher priority"><input type="number" min={1} value={form.ruleOrder} onChange={e => set('ruleOrder', Number(e.target.value))} /></FormField>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.65rem' }}>
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
              <Btn onClick={save} loading={saving}>{editing ? 'Update' : 'Create'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {rules.length === 0 ? (
        <Empty icon="⚙" title="No rules" message="Add rules to auto-assign priority"
          action={<Btn size="sm" onClick={openNew}>Add First Rule</Btn>} />
      ) : (
        <Card style={{ padding:0, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--elevated)', borderBottom:'1px solid var(--border)' }}>
                  {['#','Category','Severity','Keyword','→ Priority','Description','Active',''].map(h => (
                    <th key={h} style={{ padding:'0.6rem 0.9rem', textAlign:'left', fontSize:'0.7rem',
                      fontWeight:700, color:'var(--text2)', textTransform:'uppercase',
                      letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...rules].sort((a,b) => a.ruleOrder-b.ruleOrder).map(r => (
                  <tr key={r.id} style={{ borderBottom:'1px solid var(--border2)', opacity: r.active ? 1 : 0.45 }}>
                    <td style={{ padding:'0.65rem 0.9rem', fontSize:'0.8rem', color:'var(--text2)' }}>#{r.ruleOrder}</td>
                    <td style={{ padding:'0.65rem 0.9rem', fontSize:'0.8rem', fontWeight:600 }}>{r.category?.replace('_',' ')}</td>
                    <td style={{ padding:'0.65rem 0.9rem' }}><Badge>{r.severity}</Badge></td>
                    <td style={{ padding:'0.65rem 0.9rem', fontSize:'0.78rem', color:'var(--text2)' }}>{r.locationKeyword || '—'}</td>
                    <td style={{ padding:'0.65rem 0.9rem' }}><Badge>{r.assignedPriority}</Badge></td>
                    <td style={{ padding:'0.65rem 0.9rem', fontSize:'0.78rem', color:'var(--text2)',
                      maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {r.ruleDescription || '—'}
                    </td>
                    <td style={{ padding:'0.65rem 0.9rem' }}>
                      <button onClick={() => toggle(r.id)} style={{ background:'none', border:'none',
                        cursor:'pointer', fontSize:'1.1rem' }}>
                        {r.active ? '🟢' : '⚪'}
                      </button>
                    </td>
                    <td style={{ padding:'0.65rem 0.9rem' }}>
                      <div style={{ display:'flex', gap:'0.35rem' }}>
                        <button onClick={() => openEdit(r)} style={{ padding:'3px 7px', borderRadius:4,
                          background:'var(--elevated)', border:'1px solid var(--border)',
                          color:'var(--text2)', cursor:'pointer', fontSize:'0.78rem' }}>✏</button>
                        <button onClick={() => del(r.id)} style={{ padding:'3px 7px', borderRadius:4,
                          background:'rgba(248,81,73,0.08)', border:'1px solid rgba(248,81,73,0.25)',
                          color:'var(--danger)', cursor:'pointer', fontSize:'0.78rem' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
