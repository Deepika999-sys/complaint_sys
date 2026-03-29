import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const icons = {
  dashboard: '⬡',
  complaints: '📋',
  submit: '＋',
  departments: '🏢',
  rules: '⚙',
  users: '👥',
  analytics: '📊',
  logout: '→',
  menu: '☰',
};

export default function Layout({ children }) {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() { logout(); navigate('/login'); }

  const userLinks = [
    { to: '/dashboard',     label: 'Dashboard',     icon: icons.dashboard },
    { to: '/submit',        label: 'New Complaint',  icon: icons.submit },
    { to: '/my-complaints', label: 'My Complaints',  icon: icons.complaints },
  ];
  const adminLinks = [
    { to: '/admin',              label: 'Dashboard',     icon: icons.dashboard },
    { to: '/admin/complaints',   label: 'All Complaints', icon: icons.complaints },
    { to: '/admin/departments',  label: 'Departments',    icon: icons.departments },
    { to: '/admin/rules',        label: 'Priority Rules', icon: icons.rules },
    { to: '/admin/users',        label: 'Users',          icon: icons.users },
  ];
  const staffLinks = [
    { to: '/admin',            label: 'Dashboard',  icon: icons.dashboard },
    { to: '/admin/complaints', label: 'Complaints', icon: icons.complaints },
  ];

  const links = isAdmin ? adminLinks : isStaff ? staffLinks : userLinks;
  const roleLabel = isAdmin ? 'Admin' : isStaff ? 'Staff' : 'User';
  const roleColor = isAdmin ? 'var(--purple)' : isStaff ? 'var(--warning)' : 'var(--accent)';

  const sidebarStyle = {
    width: 220, background: 'var(--surface)',
    borderRight: '1px solid var(--border2)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, bottom: 0,
    zIndex: 100, transition: 'transform 0.25s ease',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:99 }} />
      )}

      {/* Sidebar */}
      <aside style={{ ...sidebarStyle,
        transform: open ? 'translateX(0)' : window.innerWidth < 768 ? 'translateX(-100%)' : 'translateX(0)' }}>

        {/* Logo */}
        <div style={{ padding:'1.25rem 1rem', borderBottom:'1px solid var(--border2)',
          display:'flex', alignItems:'center', gap:'0.65rem' }}>
          <div style={{ width:34, height:34, borderRadius:'var(--r1)',
            background:'var(--accentbg)', border:'1px solid var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--accent2)', fontSize:'1rem' }}>⚡</div>
          <span style={{ fontFamily:'var(--ff-head)', fontSize:'1rem',
            fontWeight:800, color:'var(--text1)' }}>CivicDesk</span>
        </div>

        {/* User info */}
        <div style={{ padding:'0.85rem 1rem', borderBottom:'1px solid var(--border2)',
          display:'flex', alignItems:'center', gap:'0.65rem' }}>
          <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
            background: roleColor + '18', border:`1px solid ${roleColor}33`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:700, fontSize:'0.85rem', color: roleColor }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow:'hidden' }}>
            <p style={{ fontSize:'0.85rem', fontWeight:600,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ fontSize:'0.7rem', fontWeight:700, color: roleColor }}>{roleLabel}</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'0.6rem', display:'flex', flexDirection:'column', gap:'2px', overflowY:'auto' }}>
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/admin' || to === '/dashboard'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:'0.6rem',
                padding:'0.5rem 0.75rem', borderRadius:'var(--r1)',
                fontSize:'0.875rem', fontWeight:500, textDecoration:'none',
                color: isActive ? 'var(--accent2)' : 'var(--text2)',
                background: isActive ? 'var(--accentbg)' : 'transparent',
                transition:'all 0.15s',
              })}>
              <span style={{ fontSize:'1rem', width:18, textAlign:'center' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding:'0.75rem' }}>
          <button onClick={handleLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.6rem',
              padding:'0.5rem 0.75rem', borderRadius:'var(--r1)', fontSize:'0.875rem',
              fontWeight:500, color:'var(--text2)', background:'transparent',
              border:'1px solid var(--border)', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--danger)'; e.currentTarget.style.borderColor='rgba(248,81,73,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.borderColor='var(--border)'; }}>
            <span style={{ fontSize:'1rem' }}>{icons.logout}</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: window.innerWidth < 768 ? 0 : 220, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <header style={{ height:56, background:'var(--surface)', borderBottom:'1px solid var(--border2)',
          display:'flex', alignItems:'center', padding:'0 1.25rem', gap:'1rem',
          position:'sticky', top:0, zIndex:50 }}>
          <button onClick={() => setOpen(true)}
            style={{ background:'none', border:'none', color:'var(--text2)', fontSize:'1.15rem',
              display: window.innerWidth < 768 ? 'block' : 'none' }}>
            {icons.menu}
          </button>
          <p style={{ fontSize:'0.875rem', color:'var(--text2)' }}>Smart Complaint Management</p>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:30, height:30, borderRadius:'50%',
              background: roleColor + '18',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.8rem', fontWeight:700, color: roleColor }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{user?.name}</span>
          </div>
        </header>
        <main className="fade-up" style={{ flex:1, padding:'1.75rem', maxWidth:1200, width:'100%', margin:'0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
