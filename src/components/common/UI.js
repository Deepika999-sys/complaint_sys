import React from 'react';

/* ── Spinner ─────────────────────────────────── */
export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid rgba(47,129,247,0.2)',
      borderTopColor: '#2f81f7',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  );
}

export function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight: 280, gap: '0.6rem', color: 'var(--text2)' }}>
      <Spinner /> <span>Loading...</span>
    </div>
  );
}

/* ── Btn ─────────────────────────────────────── */
export function Btn({ children, variant = 'primary', size = 'md', loading, onClick, type = 'button', style }) {
  const pad = size === 'sm' ? '0.35rem 0.75rem' : size === 'lg' ? '0.75rem 1.75rem' : '0.55rem 1.15rem';
  const fs  = size === 'sm' ? '0.8rem' : size === 'lg' ? '1rem' : '0.875rem';
  const variants = {
    primary: { background:'var(--accent)',   color:'#fff' },
    danger:  { background:'var(--danger)',   color:'#fff' },
    success: { background:'var(--success)',  color:'#fff' },
    ghost:   { background:'var(--elevated)', color:'var(--text2)', border:'1px solid var(--border)' },
    outline: { background:'transparent',     color:'var(--accent2)', border:'1px solid var(--accent)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={!!loading}
      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
        padding: pad, fontSize: fs, fontWeight: 600, borderRadius:'var(--r1)',
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        transition:'opacity 0.2s, filter 0.2s', whiteSpace:'nowrap',
        ...variants[variant], ...style }}>
      {loading ? <Spinner size={14} /> : null}
      {children}
    </button>
  );
}

/* ── Badge ───────────────────────────────────── */
export function Badge({ children }) {
  const map = {
    HIGH:        { bg:'rgba(248,81,73,0.12)',   color:'#f85149' },
    MEDIUM:      { bg:'rgba(210,153,34,0.12)',  color:'#d29922' },
    LOW:         { bg:'rgba(63,185,80,0.12)',   color:'#3fb950' },
    SUBMITTED:   { bg:'rgba(163,113,247,0.12)', color:'#a371f7' },
    ASSIGNED:    { bg:'rgba(47,129,247,0.12)',  color:'#58a6ff' },
    IN_PROGRESS: { bg:'rgba(210,153,34,0.12)',  color:'#d29922' },
    RESOLVED:    { bg:'rgba(63,185,80,0.12)',   color:'#3fb950' },
    CLOSED:      { bg:'rgba(139,148,158,0.12)', color:'#8b949e' },
    REJECTED:    { bg:'rgba(248,81,73,0.12)',   color:'#f85149' },
    CRITICAL:    { bg:'rgba(248,81,73,0.15)',   color:'#f85149' },
    MAJOR:       { bg:'rgba(210,153,34,0.15)',  color:'#d29922' },
    MINOR:       { bg:'rgba(63,185,80,0.15)',   color:'#3fb950' },
  };
  const text = String(children).replace('_',' ');
  const c = map[String(children)] || { bg:'rgba(139,148,158,0.12)', color:'#8b949e' };
  return (
    <span style={{ display:'inline-block', padding:'2px 9px', borderRadius:999,
      fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase',
      background: c.bg, color: c.color, whiteSpace:'nowrap' }}>
      {text}
    </span>
  );
}

/* ── Card ────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)',
      borderRadius:'var(--r2)', padding:'1.25rem', ...style }}>
      {children}
    </div>
  );
}

/* ── StatCard ────────────────────────────────── */
export function StatCard({ label, value, icon, color = '#2f81f7', sub }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)',
      borderRadius:'var(--r2)', padding:'1.2rem 1.4rem',
      display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
      <div>
        <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.06em', color:'var(--text2)', marginBottom:'0.3rem' }}>{label}</p>
        <p style={{ fontSize:'1.9rem', fontWeight:800, fontFamily:'var(--ff-head)',
          lineHeight:1, color:'var(--text1)' }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize:'0.75rem', color:'var(--text2)', marginTop:'0.25rem' }}>{sub}</p>}
      </div>
      <div style={{ width:42, height:42, borderRadius:'var(--r1)', flexShrink:0,
        background: color + '18', display:'flex', alignItems:'center',
        justifyContent:'center', color }}>
        {icon}
      </div>
    </div>
  );
}

/* ── FormField ───────────────────────────────── */
export function FormField({ label, error, required, hint, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
      {label && (
        <label style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text2)' }}>
          {label}{required && <span style={{ color:'var(--danger)' }}> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p style={{ fontSize:'0.75rem', color:'var(--text3)' }}>{hint}</p>}
      {error && <p style={{ fontSize:'0.75rem', color:'var(--danger)' }}>{error}</p>}
    </div>
  );
}

/* ── PageHeader ──────────────────────────────── */
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      flexWrap:'wrap', gap:'0.75rem', marginBottom:'1.5rem' }}>
      <div>
        <h2 style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--text1)', marginBottom:'0.15rem' }}>{title}</h2>
        {sub && <p style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Empty ───────────────────────────────────── */
export function Empty({ icon = '📭', title, message, action }) {
  return (
    <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--text2)' }}>
      <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>{icon}</div>
      <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'0.3rem', color:'var(--text1)' }}>{title}</h3>
      {message && <p style={{ fontSize:'0.875rem', marginBottom:'1rem' }}>{message}</p>}
      {action}
    </div>
  );
}

/* ── Modal ───────────────────────────────────── */
export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div className="fade-up" style={{ background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:'var(--r3)', padding:'1.75rem', width:'100%', maxWidth:500 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
          <h3 style={{ fontSize:'1.05rem', fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text2)',
            fontSize:'1.25rem', cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
