import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Btn, FormField, PageHeader, Card } from '../components/common/UI';

const CATEGORIES = [
  { value:'ELECTRICAL',    label:'Electrical',     emoji:'⚡', color:'#d29922' },
  { value:'WATER_SUPPLY',  label:'Water Supply',   emoji:'💧', color:'#58a6ff' },
  { value:'CLEANLINESS',   label:'Cleanliness',    emoji:'🧹', color:'#3fb950' },
  { value:'SAFETY',        label:'Safety',         emoji:'🛡', color:'#f85149' },
  { value:'ADMINISTRATIVE',label:'Administrative', emoji:'📄', color:'#a371f7' },
];
const SEVERITIES = [
  { value:'CRITICAL', label:'Critical', desc:'Immediate danger or complete failure', color:'#f85149' },
  { value:'MAJOR',    label:'Major',    desc:'Serious issue affecting many people',  color:'#d29922' },
  { value:'MINOR',    label:'Minor',    desc:'Minor inconvenience or small issue',   color:'#3fb950' },
];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', description:'', category:'', severity:'', location:'', landmark:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); }

  function validate() {
    const e = {};
    if (!form.title.trim())         e.title       = 'Title is required';
    if (!form.description.trim())   e.description = 'Description is required';
    if (form.description.length < 20) e.description = 'Minimum 20 characters';
    if (!form.category)             e.category    = 'Select a category';
    if (!form.severity)             e.severity    = 'Select severity';
    if (!form.location.trim())      e.location    = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await complaintAPI.submit(form);
      toast.success(`Submitted: ${res.data.data.complaintNumber}`);
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth:720, margin:'0 auto' }}>
      <PageHeader title="Submit a Complaint" sub="Fill in the details below" />
      <form onSubmit={submit}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Category */}
          <Card>
            <p style={{ fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.06em', color:'var(--text2)', marginBottom:'0.85rem' }}>
              Category <span style={{ color:'var(--danger)' }}>*</span>
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'0.6rem' }}>
              {CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => set('category', c.value)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem',
                    padding:'0.85rem 0.5rem', borderRadius:'var(--r1)', cursor:'pointer',
                    border: `2px solid ${form.category === c.value ? c.color : 'var(--border)'}`,
                    background: form.category === c.value ? c.color + '15' : 'var(--elevated)',
                    color: form.category === c.value ? c.color : 'var(--text2)',
                    transition:'all 0.15s' }}>
                  <span style={{ fontSize:'1.3rem' }}>{c.emoji}</span>
                  <span style={{ fontSize:'0.78rem', fontWeight:600 }}>{c.label}</span>
                </button>
              ))}
            </div>
            {errors.category && <p style={{ color:'var(--danger)', fontSize:'0.75rem', marginTop:'0.4rem' }}>{errors.category}</p>}
          </Card>

          {/* Severity */}
          <Card>
            <p style={{ fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.06em', color:'var(--text2)', marginBottom:'0.85rem' }}>
              Severity <span style={{ color:'var(--danger)' }}>*</span>
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {SEVERITIES.map(s => (
                <button key={s.value} type="button" onClick={() => set('severity', s.value)}
                  style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.75rem 1rem',
                    borderRadius:'var(--r1)', cursor:'pointer', textAlign:'left',
                    border: `2px solid ${form.severity === s.value ? s.color : 'var(--border)'}`,
                    background: form.severity === s.value ? s.color + '12' : 'var(--elevated)',
                    transition:'all 0.15s' }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                  <div>
                    <p style={{ fontWeight:700, fontSize:'0.875rem',
                      color: form.severity === s.value ? s.color : 'var(--text1)' }}>{s.label}</p>
                    <p style={{ fontSize:'0.78rem', color:'var(--text2)' }}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.severity && <p style={{ color:'var(--danger)', fontSize:'0.75rem', marginTop:'0.4rem' }}>{errors.severity}</p>}
          </Card>

          {/* Details */}
          <Card>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <FormField label="Title" required error={errors.title}>
                <input placeholder="Brief description of the issue"
                  value={form.title} onChange={e => set('title', e.target.value)} maxLength={200} />
              </FormField>
              <FormField label="Description" required error={errors.description}
                hint={`${form.description.length} chars (min 20)`}>
                <textarea rows={4} placeholder="Describe the issue in detail..."
                  value={form.description} onChange={e => set('description', e.target.value)}
                  style={{ resize:'vertical' }} />
              </FormField>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem' }}>
                <FormField label="Location" required error={errors.location}>
                  <input placeholder="Street, Block, Area..."
                    value={form.location} onChange={e => set('location', e.target.value)} />
                </FormField>
                <FormField label="Landmark (optional)">
                  <input placeholder="Near hospital, school..."
                    value={form.landmark} onChange={e => set('landmark', e.target.value)} />
                </FormField>
              </div>
            </div>
          </Card>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem' }}>
            <Btn variant="ghost" onClick={() => navigate(-1)}>Cancel</Btn>
            <Btn type="submit" loading={loading} size="lg">Submit Complaint</Btn>
          </div>
        </div>
      </form>
    </div>
  );
}
