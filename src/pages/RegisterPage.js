import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Btn, FormField } from '../components/common/UI';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'' });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Fill required fields'); return; }
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return; }
    const res = await register(form);
    if (res.success) { toast.success('Account created!'); navigate('/dashboard'); }
    else toast.error(res.message);
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)', padding:'1rem' }}>
      <div className="fade-up" style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
          <div style={{ width:48, height:48, borderRadius:12, margin:'0 auto 0.75rem',
            background:'var(--accentbg)', border:'1px solid var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--accent2)', fontSize:'1.3rem' }}>⚡</div>
          <h1 style={{ fontFamily:'var(--ff-head)', fontSize:'1.6rem', fontWeight:800 }}>CivicDesk</h1>
          <p style={{ color:'var(--text2)', fontSize:'0.875rem', marginTop:'0.2rem' }}>Create your account</p>
        </div>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'var(--r3)', padding:'2rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.5rem' }}>Register</h2>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <FormField label="Full Name" required>
              <input placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} />
            </FormField>
            <FormField label="Email" required>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </FormField>
            <FormField label="Password" required hint="Minimum 6 characters">
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
            </FormField>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <FormField label="Phone">
                <input placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </FormField>
              <FormField label="Address">
                <input placeholder="Your area" value={form.address} onChange={e => set('address', e.target.value)} />
              </FormField>
            </div>
            <Btn type="submit" loading={loading} size="lg" style={{ width:'100%', marginTop:'0.25rem' }}>
              Create Account
            </Btn>
          </form>
          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.85rem', color:'var(--text2)' }}>
            Have an account? <Link to="/login" style={{ fontWeight:600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
