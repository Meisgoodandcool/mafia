import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout, { ROLES } from '../components/Layout'

export default function Hicom() {
  const router = useRouter()
  const [staff, setStaff] = useState([])
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('roster') // roster | member
  const [modal, setModal] = useState(null) // null | 'addStaff' | 'addInfraction' | 'addTask' | 'addReport'
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const role = sessionStorage.getItem('mafia_role')
    if (role !== 'hicom') { router.push('/'); return }
    fetchStaff()
  }, [])

  async function fetchStaff() {
    setLoading(true)
    const res = await fetch('/api/staff')
    const data = await res.json()
    setStaff(data)
    setLoading(false)
  }

  async function handleAddStaff() {
    if (!form.username || !form.role) return
    await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setModal(null)
    setForm({})
    fetchStaff()
  }

  async function handleDeleteStaff(id) {
    if (!confirm('Remove this member from the roster?')) return
    await fetch('/api/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setSelected(null)
    setView('roster')
    fetchStaff()
  }

  async function handleAddInfraction() {
    if (!form.reason) return
    await fetch('/api/infractions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId: selected.id, reason: form.reason, severity: form.severity || 'warning' })
    })
    setModal(null)
    setForm({})
    refreshSelected()
  }

  async function handleAddTask() {
    if (!form.title) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId: selected.id, title: form.title, description: form.description || '' })
    })
    setModal(null)
    setForm({})
    refreshSelected()
  }

  async function handleAddReport() {
    if (!form.title) return
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId: selected.id, title: form.title, description: form.description || '', madeBy: 'HICOM' })
    })
    setModal(null)
    setForm({})
    refreshSelected()
  }

  async function refreshSelected() {
    const res = await fetch('/api/staff')
    const data = await res.json()
    setStaff(data)
    const updated = data.find(m => m.id === selected.id)
    if (updated) setSelected(updated)
  }

  function openMember(member) {
    setSelected(member)
    setView('member')
  }

  const groupedByRole = ROLES.map(role => ({
    role,
    members: staff.filter(m => m.role === role)
  })).filter(g => g.members.length > 0)

  const infractions = selected ? JSON.parse(selected.infractions || '[]') : []
  const tasks = selected ? JSON.parse(selected.tasks || '[]') : []
  const reports = selected ? JSON.parse(selected.reports || '[]') : []

  return (
    <Layout role="hicom">
      {view === 'roster' && (
        <div>
          <div style={s.pageHeader}>
            <div>
              <h2 style={s.pageTitle}>HIGH COMMAND PORTAL</h2>
              <p style={s.pageSub}>Full database access — {staff.length} active members</p>
            </div>
            <button style={s.primaryBtn} onClick={() => setModal('addStaff')}>+ ADD MEMBER</button>
          </div>

          {loading ? (
            <p style={s.muted}>Loading roster...</p>
          ) : staff.length === 0 ? (
            <div style={s.empty}>
              <p style={s.muted}>No staff members yet. Add one to get started.</p>
            </div>
          ) : (
            <div>
              {groupedByRole.map(group => (
                <div key={group.role} style={s.roleGroup}>
                  <div style={s.roleHeader}>
                    <span style={s.roleName}>{group.role.toUpperCase()}</span>
                    <span style={s.roleCount}>{group.members.length}</span>
                  </div>
                  <div style={s.memberGrid}>
                    {group.members.map(member => (
                      <div key={member.id} style={s.memberCard} onClick={() => openMember(member)}>
                        <div style={s.memberAvatar}>{member.username?.[0]?.toUpperCase() || '?'}</div>
                        <div style={s.memberInfo}>
                          <p style={s.memberName}>{member.username}</p>
                          <p style={s.memberRole}>{member.role}</p>
                        </div>
                        <div style={s.memberStats}>
                          <span style={s.statBadge}>
                            {JSON.parse(member.infractions || '[]').length} infractions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'member' && selected && (
        <div>
          <button style={s.backBtn} onClick={() => setView('roster')}>← BACK TO ROSTER</button>

          <div style={s.memberHeader}>
            <div style={s.bigAvatar}>{selected.username?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <h2 style={s.memberPageName}>{selected.username}</h2>
              <p style={s.memberPageRole}>{selected.role}</p>
              {selected.minecraft && <p style={s.memberPageSub}>MC: {selected.minecraft}</p>}
            </div>
            <button style={s.dangerBtn} onClick={() => handleDeleteStaff(selected.id)}>REMOVE MEMBER</button>
          </div>

          <div style={s.threeCol}>
            {/* Infractions */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <span style={s.panelTitle}>INFRACTIONS</span>
                <button style={s.smallBtn} onClick={() => setModal('addInfraction')}>+ ADD</button>
              </div>
              {infractions.length === 0 ? (
                <p style={s.muted}>No infractions.</p>
              ) : infractions.map(inf => (
                <div key={inf.id} style={s.infractionItem}>
                  <div style={s.infractionDot(inf.severity)} />
                  <div>
                    <p style={s.itemTitle}>{inf.reason}</p>
                    <p style={s.itemDate}>{new Date(inf.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <span style={s.panelTitle}>TASKS</span>
                <button style={s.smallBtn} onClick={() => setModal('addTask')}>+ ADD</button>
              </div>
              {tasks.length === 0 ? (
                <p style={s.muted}>No tasks assigned.</p>
              ) : tasks.map(task => (
                <div key={task.id} style={s.taskItem}>
                  <span style={s.taskStatus(task.status)}>{task.status}</span>
                  <div>
                    <p style={s.itemTitle}>{task.title}</p>
                    {task.description && <p style={s.itemDate}>{task.description}</p>}
                    <p style={s.itemDate}>{new Date(task.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reports */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <span style={s.panelTitle}>REPORTS</span>
                <button style={s.smallBtn} onClick={() => setModal('addReport')}>+ ADD</button>
              </div>
              {reports.length === 0 ? (
                <p style={s.muted}>No reports.</p>
              ) : reports.map(rep => (
                <div key={rep.id} style={s.reportItem}>
                  <p style={s.itemTitle}>{rep.title}</p>
                  {rep.description && <p style={s.reportDesc}>{rep.description}</p>}
                  <p style={s.itemDate}>{rep.madeBy} · {new Date(rep.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === 'addStaff' && (
        <Modal title="ADD STAFF MEMBER" onClose={() => { setModal(null); setForm({}) }}>
          <Field label="MINECRAFT USERNAME">
            <input style={s.input} value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" />
          </Field>
          <Field label="DISCORD TAG">
            <input style={s.input} value={form.discord || ''} onChange={e => setForm({ ...form, discord: e.target.value })} placeholder="user#0000" />
          </Field>
          <Field label="ROLE">
            <select style={s.input} value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="">Select role...</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <button style={s.primaryBtn} onClick={handleAddStaff}>ADD MEMBER</button>
        </Modal>
      )}

      {modal === 'addInfraction' && (
        <Modal title="ADD INFRACTION" onClose={() => { setModal(null); setForm({}) }}>
          <Field label="REASON">
            <input style={s.input} value={form.reason || ''} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Describe the infraction..." />
          </Field>
          <Field label="SEVERITY">
            <select style={s.input} value={form.severity || 'warning'} onChange={e => setForm({ ...form, severity: e.target.value })}>
              <option value="warning">Warning</option>
              <option value="strike">Strike</option>
              <option value="severe">Severe</option>
            </select>
          </Field>
          <button style={s.primaryBtn} onClick={handleAddInfraction}>ISSUE INFRACTION</button>
        </Modal>
      )}

      {modal === 'addTask' && (
        <Modal title="ASSIGN TASK" onClose={() => { setModal(null); setForm({}) }}>
          <Field label="TASK TITLE">
            <input style={s.input} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title..." />
          </Field>
          <Field label="DESCRIPTION">
            <textarea style={{ ...s.input, height: 80 }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Details..." />
          </Field>
          <button style={s.primaryBtn} onClick={handleAddTask}>ASSIGN TASK</button>
        </Modal>
      )}

      {modal === 'addReport' && (
        <Modal title="ADD REPORT" onClose={() => { setModal(null); setForm({}) }}>
          <Field label="REPORT TITLE">
            <input style={s.input} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Report title..." />
          </Field>
          <Field label="DETAILS">
            <textarea style={{ ...s.input, height: 80 }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Report details..." />
          </Field>
          <button style={s.primaryBtn} onClick={handleAddReport}>SUBMIT REPORT</button>
        </Modal>
      )}
    </Layout>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div style={ms.overlay}>
      <div style={ms.box}>
        <div style={ms.header}>
          <span style={ms.title}>{title}</span>
          <button style={ms.close} onClick={onClose}>✕</button>
        </div>
        <div style={ms.body}>{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 10, letterSpacing: '0.15em', color: '#666660', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const ms = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', zIndex: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  box: {
    background: '#111', border: '1px solid #2a0000',
    borderTop: '2px solid #cc2200', width: 440, maxWidth: '95vw',
  },
  header: {
    padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', borderBottom: '1px solid #1a1a1a',
  },
  title: { fontSize: 11, letterSpacing: '0.2em', color: '#cc2200' },
  close: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 },
  body: { padding: 20 },
}

const s = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 },
  pageTitle: { fontSize: 22, letterSpacing: '0.15em', color: '#e8e0d8', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#555550', letterSpacing: '0.05em' },
  primaryBtn: {
    background: '#cc2200', border: 'none', color: '#fff',
    padding: '10px 20px', fontSize: 11, letterSpacing: '0.2em',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  dangerBtn: {
    background: 'none', border: '1px solid #cc2200', color: '#cc2200',
    padding: '8px 16px', fontSize: 10, letterSpacing: '0.15em',
    cursor: 'pointer', fontFamily: 'Georgia, serif', marginLeft: 'auto',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#555550',
    fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
    fontFamily: 'Georgia, serif', marginBottom: 24, padding: 0,
  },
  roleGroup: { marginBottom: 28 },
  roleHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 12, paddingBottom: 8,
    borderBottom: '1px solid rgba(204,34,0,0.15)',
  },
  roleName: { fontSize: 10, letterSpacing: '0.2em', color: '#cc2200' },
  roleCount: { fontSize: 10, color: '#333330' },
  memberGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 },
  memberCard: {
    background: '#111', border: '1px solid #1a1a1a',
    padding: '12px 16px', display: 'flex', alignItems: 'center',
    gap: 12, cursor: 'pointer', transition: 'border-color 0.2s',
  },
  memberAvatar: {
    width: 36, height: 36, background: '#1a0500',
    border: '1px solid rgba(204,34,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, color: '#cc2200', flexShrink: 0,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, color: '#e8e0d8', marginBottom: 2 },
  memberRole: { fontSize: 10, color: '#555550', letterSpacing: '0.05em' },
  memberStats: {},
  statBadge: { fontSize: 9, color: '#555550', letterSpacing: '0.05em' },
  empty: { textAlign: 'center', padding: '60px 0' },
  muted: { fontSize: 12, color: '#333330', letterSpacing: '0.05em' },
  memberHeader: {
    display: 'flex', alignItems: 'center', gap: 20,
    background: '#111', border: '1px solid #1a1a1a',
    borderLeft: '3px solid #cc2200', padding: '20px 24px',
    marginBottom: 24,
  },
  bigAvatar: {
    width: 56, height: 56, background: '#1a0500',
    border: '1px solid rgba(204,34,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, color: '#cc2200', flexShrink: 0,
  },
  memberPageName: { fontSize: 22, color: '#e8e0d8', letterSpacing: '0.05em', marginBottom: 4 },
  memberPageRole: { fontSize: 11, color: '#cc2200', letterSpacing: '0.15em' },
  memberPageSub: { fontSize: 11, color: '#555550', marginTop: 2 },
  threeCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 },
  panel: { background: '#111', border: '1px solid #1a1a1a', padding: '16px 20px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' },
  panelTitle: { fontSize: 10, letterSpacing: '0.2em', color: '#cc2200' },
  smallBtn: {
    background: 'none', border: '1px solid #2a2a2a', color: '#555550',
    fontSize: 9, letterSpacing: '0.1em', padding: '4px 10px',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  infractionItem: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #161616' },
  infractionDot: (sev) => ({
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4,
    background: sev === 'severe' ? '#cc2200' : sev === 'strike' ? '#c8a84b' : '#555550'
  }),
  taskItem: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #161616' },
  taskStatus: (st) => ({
    fontSize: 8, letterSpacing: '0.1em', padding: '3px 7px', flexShrink: 0,
    background: st === 'complete' ? 'rgba(200,168,75,0.1)' : 'rgba(85,85,80,0.2)',
    color: st === 'complete' ? '#c8a84b' : '#555550',
    border: `1px solid ${st === 'complete' ? 'rgba(200,168,75,0.3)' : '#2a2a2a'}`,
  }),
  reportItem: { marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #161616' },
  itemTitle: { fontSize: 13, color: '#e8e0d8', marginBottom: 2 },
  reportDesc: { fontSize: 12, color: '#888880', marginBottom: 4 },
  itemDate: { fontSize: 10, color: '#333330', letterSpacing: '0.05em' },
  input: {
    width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a',
    color: '#e8e0d8', padding: '10px 12px', fontSize: 13,
    fontFamily: 'Georgia, serif', outline: 'none', resize: 'vertical',
  },
}
