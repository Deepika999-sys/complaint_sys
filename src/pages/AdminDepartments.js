import React, { useEffect, useState } from 'react';
import { departmentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Card, Btn, FormField, PageLoader, Empty, PageHeader, Modal } from '../components/common/UI';

const ALL_CATS = ['ELECTRICAL','WATER_SUPPLY','CLEANLINESS','SAFETY','ADMINISTRATIVE'];
const blank = { name:'', description:'', contactEmail:'', contactPhone:'', handledCategories:[] };

export default function AdminDepartments() {
  const [depts, setDepts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(blank);
  const [saving, setSaving]     = useState(false);

  function load() {
    departmentAPI.getAll().then(r => setDepts(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function toggleCat(cat) {
    setForm(f => ({
      ...f,
      handledCategories: f.handledCategories.includes(cat)
        ? f.handledCategories.filter(c => c !== cat)
        : [...f.handledCategories, cat]
    }));
  }

  function openNew()  { setForm(blank); setEditing(null); setShowForm(true); }
  function openEdit(d) {
    setForm({ name:d.name, description:d.description||'', contactEmail:d.contactEmail||'',
      contactPhone:d.contactPhone||'', handledCategories:d.handledCategories||[] });
    setEditing(d.id); setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    if (!form.handledCategories.length) { toast.error('Select at least one category'); return; }
    setSaving(true);
    try {
      if (editing) { await departmentAPI.update(editing, form); toast.success('Updated'); }
      else         { await departmentAPI.create(form);           toast.success('Created'); }
      setShowForm(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  }

  async function deactivate(id, name) {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try { await departmentAPI.deactivate(id); toast.success('Deactivated'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Departments" sub={`${depts.length} departments`}
        action={<Btn size="sm" onClick={openNew}>＋ Add Department</Btn>} />

      {showForm && (
        <Modal title={editing ? 'Edit Department' : 'New Department'} onClose={() => setShowForm(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <FormField label="Name" required><input value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
            <FormField label="Description"><input value={form.description} onChange={e => set('description', e.target.value)} /></FormField>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <FormField label="Email"><input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} /></FormField>
              <FormField label="Phone"><input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} /></FormField>
            </div>
            <div>
              <p style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text2)', marginBottom:'0.5rem' }}>
                Categories <span style={{ color:'var(--danger)' }}>*</span>
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                {ALL_CATS.map(cat => (
                  <button key={cat} type="button" onClick={() => toggleCat(cat)}
                    style={{ padding:'3px 10px', fontSize:'0.78rem', fontWeight:600,
                      borderRadius:999, cursor:'pointer', border:'1px solid',
                      borderColor: form.handledCategories.includes(cat) ? 'var(--accent)' : 'var(--border)',
                      background: form.handledCategories.includes(cat) ? 'var(--accentbg)' : 'var(--elevated)',
                      color: form.handledCategories.includes(cat) ? 'var(--accent2)' : 'var(--text2)' }}>
                    {cat.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.65rem', marginTop:'0.5rem' }}>
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
              <Btn onClick={save} loading={saving}>{editing ? 'Update' : 'Create'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {depts.length === 0 ? (
        <Empty icon="🏢" title="No departments" action={<Btn size="sm" onClick={openNew}>Add First</Btn>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
          {depts.map(d => (
            <Card key={d.id} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:'0.925rem' }}>{d.name}</p>
                  {d.description && <p style={{ fontSize:'0.78rem', color:'var(--text2)', marginTop:'0.15rem' }}>{d.description}</p>}
                </div>
                <div style={{ display:'flex', gap:'0.35rem', flexShrink:0 }}>
                  <button onClick={() => openEdit(d)} style={{ padding:'4px 8px', fontSize:'0.75rem', borderRadius:'var(--r1)',
                    background:'var(--elevated)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer' }}>✏</button>
                  <button onClick={() => deactivate(d.id, d.name)} style={{ padding:'4px 8px', fontSize:'0.75rem',
                    borderRadius:'var(--r1)', background:'rgba(248,81,73,0.08)',
                    border:'1px solid rgba(248,81,73,0.25)', color:'var(--danger)', cursor:'pointer' }}>🗑</button>
                </div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
                {(d.handledCategories || []).map(cat => (
                  <span key={cat} style={{ padding:'2px 8px', fontSize:'0.72rem', fontWeight:600, borderRadius:999,
                    background:'var(--accentbg)', color:'var(--accent2)', border:'1px solid rgba(47,129,247,0.25)' }}>
                    {cat.replace('_',' ')}
                  </span>
                ))}
              </div>
              {(d.contactEmail || d.contactPhone) && (
                <p style={{ fontSize:'0.75rem', color:'var(--text2)', borderTop:'1px solid var(--border2)', paddingTop:'0.5rem' }}>
                  {d.contactEmail}{d.contactEmail && d.contactPhone && ' · '}{d.contactPhone}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
