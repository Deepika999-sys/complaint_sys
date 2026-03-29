import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI, departmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Badge, Card, Btn, PageLoader, PageHeader } from '../components/common/UI';
import { format } from 'date-fns';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { isAdmin, isStaff, user } = useAuth();
  const navigate = useNavigate();
  const [c, setC]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [depts, setDepts]   = useState([]);
  const [resolveNote, setResolveNote] = useState('');
  const [assignDept, setAssignDept]   = useState('');
  const [feedback, setFeedback]       = useState({ rating:5, feedback:'' });
  const [saving, setSaving] = useState(false);

  function reload() {
    return complaintAPI.getById(id).then(r => setC(r.data.data));
  }

  useEffect(() => {
    Promise.all([
      complaintAPI.getById(id),
      isAdmin ? departmentAPI.getAll() : Promise.resolve({ data:{ data:[] } }),
    ]).then(([cr, dr]) => {
      setC(cr.data.data);
      setDepts(dr.data.data || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id, isAdmin]);

  async function doResolve() {
    if (!resolveNote.trim()) { toast.error('Notes required'); return; }
    setSaving(true);
    try { await complaintAPI.resolve(id, { resolutionNotes: resolveNote }); toast.success('Resolved!'); await reload(); setResolveNote(''); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  }

  async function doAssign() {
    if (!assignDept) { toast.error('Select a department'); return; }
    setSaving(true);
    try { await complaintAPI.assign(id, { departmentId: Number(assignDept) }); toast.success('Assigned!'); await reload(); setAssignDept(''); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  }

  async function doFeedback() {
    setSaving(true);
    try { await complaintAPI.feedback(id, feedback); toast.success('Thank you!'); await reload(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  }

  async function doStatus(status) {
    setSaving(true);
    try { await complaintAPI.updateStatus(id, { status }); toast.success('Updated'); await reload(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  }

  if (loading) return <PageLoader />;
  if (!c) return <div style={{ padding:'2rem', color:'var(--text2)' }}>Complaint not found.</div>;

  const canResolve  = (isAdmin||isStaff) && !['RESOLVED','CLOSED','REJECTED'].includes(c.status);
  const canAssign   = isAdmin && !['RESOLVED','CLOSED'].includes(c.status);
  const canFeedback = !isAdmin && !isStaff && ['RESOLVED','CLOSED'].includes(c.status) && !c.rating;

  const timeline = [
    { label:'Submitted',   time: c.submittedAt },
    { label:'Assigned',    time: c.assignedAt },
    { label:'In Progress', time: c.inProgressAt },
    { label:'Resolved',    time: c.resolvedAt },
    { label:'Closed',      time: c.closedAt },
  ];

  return (
    <div style={{ maxWidth:860, margin:'0 auto' }}>
      <PageHeader title={c.title} sub={c.complaintNumber}
        action={<Btn variant="ghost" size="sm" onClick={() => navigate(-1)}>← Back</Btn>} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.25rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>

          {/* Status bar */}
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center',
            padding:'0.75rem 1.25rem', background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:'var(--r2)' }}>
            <Badge>{c.status?.replace('_',' ')}</Badge>
            {c.priority && <Badge>{c.priority}</Badge>}
            {c.severity && <Badge>{c.severity}</Badge>}
            <span style={{ marginLeft:'auto', fontSize:'0.78rem', color:'var(--text2)' }}>
              {c.category?.replace('_',' ')} · {c.location}
            </span>
          </div>

          {/* Description */}
          <Card>
            <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.75rem' }}>Description</h3>
            <p style={{ color:'var(--text2)', lineHeight:1.7, fontSize:'0.9rem' }}>{c.description}</p>
            {c.departmentName && (
              <p style={{ marginTop:'0.85rem', fontSize:'0.8rem', color:'var(--text2)' }}>
                🏢 Assigned to: <strong style={{ color:'var(--text1)' }}>{c.departmentName}</strong>
              </p>
            )}
          </Card>

          {/* Resolution */}
          {c.resolutionNotes && (
            <Card style={{ borderColor:'rgba(63,185,80,0.3)', background:'rgba(63,185,80,0.05)' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--success)', marginBottom:'0.5rem' }}>Resolution</h3>
              <p style={{ color:'var(--text2)', fontSize:'0.9rem' }}>{c.resolutionNotes}</p>
              {c.resolutionTimeHours != null && (
                <p style={{ fontSize:'0.78rem', color:'var(--text2)', marginTop:'0.5rem' }}>
                  ⏱ Resolved in {c.resolutionTimeHours} hour(s)
                </p>
              )}
            </Card>
          )}

          {/* Rating */}
          {c.rating && (
            <Card>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.5rem' }}>User Feedback</h3>
              <p style={{ fontSize:'1.2rem', marginBottom:'0.3rem' }}>
                {'⭐'.repeat(c.rating)}{'☆'.repeat(5-c.rating)}
              </p>
              {c.feedback && <p style={{ fontSize:'0.875rem', color:'var(--text2)' }}>{c.feedback}</p>}
            </Card>
          )}

          {/* Admin: Assign */}
          {canAssign && (
            <Card>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.85rem' }}>Assign Department</h3>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <select value={assignDept} onChange={e => setAssignDept(e.target.value)} style={{ flex:1 }}>
                  <option value="">Select department...</option>
                  {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <Btn onClick={doAssign} loading={saving} size="sm">Assign</Btn>
              </div>
            </Card>
          )}

          {/* Staff/Admin: Resolve */}
          {canResolve && (
            <Card>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.85rem' }}>Resolve Complaint</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {c.status === 'ASSIGNED' && (
                  <Btn size="sm" variant="ghost" loading={saving}
                    onClick={() => doStatus('IN_PROGRESS')}>Mark In Progress</Btn>
                )}
                <textarea rows={3} placeholder="Describe the resolution..."
                  value={resolveNote} onChange={e => setResolveNote(e.target.value)}
                  style={{ resize:'vertical' }} />
                <Btn onClick={doResolve} loading={saving} variant="success">✓ Mark Resolved</Btn>
              </div>
            </Card>
          )}

          {/* User: Feedback */}
          {canFeedback && (
            <Card style={{ borderColor:'rgba(210,153,34,0.3)' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.85rem' }}>Rate Resolution</h3>
              <div style={{ display:'flex', gap:'6px', marginBottom:'0.75rem' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setFeedback(f => ({ ...f, rating:n }))}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.5rem' }}>
                    {n <= feedback.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <textarea rows={2} placeholder="Comments (optional)"
                value={feedback.feedback} onChange={e => setFeedback(f => ({ ...f, feedback:e.target.value }))}
                style={{ marginBottom:'0.75rem', resize:'none' }} />
              <Btn size="sm" onClick={doFeedback} loading={saving}>Submit Feedback</Btn>
            </Card>
          )}

          {/* History */}
          {c.history && c.history.length > 0 && (
            <Card>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.85rem' }}>Activity Log</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {c.history.map((h, i) => (
                  <div key={i} style={{ display:'flex', gap:'0.75rem', fontSize:'0.82rem',
                    padding:'0.55rem 0.75rem', background:'var(--elevated)', borderRadius:'var(--r1)' }}>
                    <div style={{ flex:1 }}>
                      <span style={{ color:'var(--text2)' }}>{h.changedBy}</span>
                      {' → '}
                      <Badge>{h.newStatus?.replace('_',' ')}</Badge>
                      {h.remarks && <span style={{ color:'var(--text2)', marginLeft:'0.4rem' }}>{h.remarks}</span>}
                    </div>
                    <span style={{ color:'var(--text2)', whiteSpace:'nowrap' }}>
                      {h.changedAt ? format(new Date(h.changedAt), 'dd MMM, HH:mm') : ''}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column: timeline + info */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <Card>
            <h3 style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text2)', marginBottom:'1rem' }}>Timeline</h3>
            {timeline.map((t, i) => (
              <div key={i} style={{ display:'flex', gap:'0.75rem', marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', marginTop:3, flexShrink:0,
                    background: t.time ? 'var(--success)' : 'var(--border)',
                    border: `2px solid ${t.time ? 'var(--success)' : 'var(--border)'}` }} />
                  {i < timeline.length-1 && (
                    <div style={{ width:2, flex:1, minHeight:16, background:'var(--border2)', margin:'2px 0' }} />
                  )}
                </div>
                <div style={{ paddingBottom:'0.25rem' }}>
                  <p style={{ fontSize:'0.82rem', fontWeight:600,
                    color: t.time ? 'var(--text1)' : 'var(--text3)' }}>{t.label}</p>
                  {t.time && (
                    <p style={{ fontSize:'0.72rem', color:'var(--text2)' }}>
                      {format(new Date(t.time), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <h3 style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text2)', marginBottom:'0.75rem' }}>Details</h3>
            {[
              { label:'Submitted by', value: c.submittedByName },
              { label:'Department',   value: c.departmentName || '—' },
              { label:'Assigned to',  value: c.assignedStaffName || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between',
                padding:'0.45rem 0', borderBottom:'1px solid var(--border2)', fontSize:'0.8rem' }}>
                <span style={{ color:'var(--text2)' }}>{label}</span>
                <span style={{ fontWeight:500, textAlign:'right', maxWidth:130,
                  overflow:'hidden', textOverflow:'ellipsis' }}>{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
