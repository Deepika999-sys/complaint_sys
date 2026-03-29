import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Btn, FormField } from '../components/common/UI';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill all fields'); return; }
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success('Welcome back!');
      navigate(res.role === 'ROLE_USER' ? '/dashboard' : '/admin');
    } else {
      toast.error(res.message);
    }
  }

  function fillDemo(role) {
    const c = {
      admin: { email:'admin@complaints.com', password:'admin123' },
      user:  { email:'user@complaints.com',  password:'user123'  },
      staff: { email:'electrical@complaints.com', password:'staff123' },
    };
    setForm(c[role]);
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)', padding:'1rem' }}>
      <div className="fade-up" style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:52, height:52, borderRadius:12, margin:'0 auto 0.75rem',
            background:'var(--accentbg)', border:'1px solid var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--accent2)', fontSize:'1.5rem' }}>⚡</div>
          <h1 style={{ fontFamily:'var(--ff-head)', fontSize:'1.75rem', fontWeight:800 }}>CivicDesk</h1>
          <p style={{ color:'var(--text2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>
            Smart Complaint Management
          </p>
        </div>

        {/* Card */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'var(--r3)', padding:'2rem' }}>
          <h2 style={{ fontSize:'1.15rem', fontWeight:700, marginBottom:'1.5rem' }}>Sign In</h2>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <FormField label="Email" required>
              <input type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </FormField>
            <FormField label="Password" required>
              <div style={{ position:'relative' }}>
                <input type={show ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  style={{ paddingRight:'2.5rem' }} />
                <button type="button" onClick={() => setShow(!show)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:'0.8rem' }}>
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </FormField>
            <Btn type="submit" loading={loading} size="lg" style={{ width:'100%', marginTop:'0.25rem' }}>
              Sign In
            </Btn>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop:'1.5rem', padding:'0.85rem',
            background:'var(--elevated)', borderRadius:'var(--r1)', border:'1px solid var(--border2)' }}>
            <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text2)',
              textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>
              Demo Accounts
            </p>
            <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
              {['admin','user','staff'].map(r => (
                <button key={r} onClick={() => fillDemo(r)} style={{
                  padding:'3px 10px', fontSize:'0.75rem', fontWeight:700, borderRadius:999,
                  cursor:'pointer', border:'1px solid',
                  borderColor: r==='admin' ? 'rgba(163,113,247,0.4)' : r==='user' ? 'rgba(47,129,247,0.4)' : 'rgba(210,153,34,0.4)',
                  background: r==='admin' ? 'rgba(163,113,247,0.1)' : r==='user' ? 'rgba(47,129,247,0.1)' : 'rgba(210,153,34,0.1)',
                  color: r==='admin' ? 'var(--purple)' : r==='user' ? 'var(--accent2)' : 'var(--warning)',
                }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.85rem', color:'var(--text2)' }}>
            No account? <Link to="/register" style={{ fontWeight:600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
