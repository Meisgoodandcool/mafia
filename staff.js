import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout, { ROLES } from '../components/Layout'

export default function Staff() {
  const router = useRouter()
  const [staff, setStaff] = useState([])
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('select') // select | portal
  const [tab, setTab] = useState('tasks') // tasks | infractions | reports
  const [reportForm, setReportForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const role = sessionStorage.getItem('mafia_role')
    if (!role) { router.push('/'); return }
    fetchStaff()
  }, [])

  async function fetchStaff() {
    setLoading(true)
    const res = await fetch('/api/staff')
    const data = await res.json()
    setStaff(data)
    setLoading(false)
  }

  async function selectMember(member) {
    setSelected(member)
    setView('portal')
    setTab('tasks')
  }

  async function markTaskComplete(taskId) {
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId: selected.id, taskId, status: 'complete' })
    })
    const res = await fetch('/api/staff')
    const data = await res.json()
    setStaff(data)
    const updated = data.find(m => m.id === selected.id)
    if (updated) setSelected(updated)
  }

  async function submitReport() {
    if (!reportForm.title) return
    setSubmitting(true)
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId: selected.id, ...reportForm, madeBy: selected.username })
    })
    setSubmitting(false)
    setSubmitted(true)
    setReportForm({ title: '', description: '' })
    setTimeout(() => setSubmitted(false), 3000)
    const res = await fetch('/api/staff')
    const data = await res.json()
    setStaff(data)
    const updated = data.find(m => m.id === selected.id)
    if (updated) setSelected(updated)
  }

  const tasks = selected ? JSON.parse(selected.tasks || '[]') : []
  const infractions = selected ? JSON.parse(selected.infractions || '[]') : []
  const reports = selected ? JSON.parse(selected.reports || '[]') : []

  const pendingTasks = tasks.filter(t => t.status !== 'complete')
  const completedTasks = tasks.filter(t => t.status === 'complete')

  return (
    <Layout role="staff">
      {view === 'select' && (
        <div style={s.centerWrap}>
          <div style={s.selectBox}>
            <div style={s.selectHeader}>
              <span style={s.selectIcon}>✦</span>
              <h2 style={s.selectTitle}>SELECT YOUR PROFILE</h2>
              <p style={s.selectSub}>Choose your name to access your portal</p>
            </div>
            {loading ? (
              <p style={s.muted}>Loading roster...</p>
            ) : staff.length === 0 ? (
              <p style={s.muted}>No staff members found. Contact High Command.</p>
            ) : (
              <div style={s.nameList}>
                {ROLES.map(role => {
                  const members = staff.filter(m => m.role === role)
                  if (!members.length) return null
                  return (
                    <div key={role} style={s.roleSection}>
                      <p style={s.roleLabel}>{role.toUpperCase()}</p>
                      {members.map(m => (
                        <button key={m.id} style={s.nameBtn} onClick={() => selectMember(m)}>
                          <span style={s.nameAvatar}>{m.username?.[0]?.toUpperCase() || '?'}</span>
                          <span>{m.username}</span>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'portal' && selected && (
        <div>
          <button style={s.backBtn} onClick={() => setView('select')}>← CHANGE MEMBER</button>

          <div style={s.memberBanner}>
            <div style={s.bannerAvatar}>{selected.username?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <h2 style={s.bannerName}>{selected.username}</h2>
              <p style={s.bannerRole}>{selected.role}</p>
            </div>
            <div style={s.bannerStats}>
              <div style={s.statPill}>
                <span style={s.statNum}>{pendingTasks.length}</span>
                <span style={s.statLbl}>pending tasks</span>
              </div>
              <div style={s.statPill}>
                <span style={s.statNum}>{infractions.length}</span>
                <span style={s.statLbl}>infractions</span>
              </div>
            </div>
          </div>

          <div style={s.tabs}>
            {['tasks', 'infractions', 'reports'].map(t => (
              <button
                key={t}
                style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
                onClick={() => setTab(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={s.tabContent}>
            {tab === 'tasks' && (
              <div>
                {tasks.length === 0 ? (
                  <div style={s.emptyState}>
                    <p style={s.muted}>No tasks assigned yet.</p>
                  </div>
                ) : (
                  <div>
                    {pendingTasks.length > 0 && (
                      <div style={s.taskSection}>
                        <p style={s.sectionLabel}>PENDING</p>
                        {pendingTasks.map(task => (
                          <div key={task.id} style={s.taskCard}>
                            <div style={s.taskCardLeft}>
                              <p style={s.taskTitle}>{task.title}</p>
                              {task.description && <p style={s.taskDesc}>{task.description}</p>}
                              <p style={s.taskDate}>Assigned {new Date(task.date).toLocaleDateString()}</p>
                            </div>
                            <button style={s.completeBtn} onClick={() => markTaskComplete(task.id)}>
                              MARK COMPLETE
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {completedTasks.length > 0 && (
                      <div style={s.taskSection}>
                        <p style={s.sectionLabel}>COMPLETED</p>
                        {completedTasks.map(task => (
                          <div key={task.id} style={{ ...s.taskCard, opacity: 0.4 }}>
                            <div>
                              <p style={{ ...s.taskTitle, textDecoration: 'line-through' }}>{task.title}</p>
                              <p style={s.taskDate}>{new Date(task.date).toLocaleDateString()}</p>
                            </div>
                            <span style={s.doneTag}>DONE</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 'infractions' && (
              <div>
                {infractions.length === 0 ? (
                  <div style={s.emptyState}>
                    <p style={s.muted}>No infractions on record. Keep it up.</p>
                  </div>
                ) : (
                  <div>
                    {infractions.map(inf => (
                      <div key={inf.id} style={s.infractionCard}>
                        <div style={s.sevBadge(inf.severity)}>{inf.severity?.toUpperCase()}</div>
                        <div>
                          <p style={s.infReason}>{inf.reason}</p>
                          <p style={s.taskDate}>{new Date(inf.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'reports' && (
              <div>
                <div style={s.reportForm}>
                  <p style={s.sectionLabel}>SUBMIT A REPORT</p>
                  <input
                    style={s.input}
                    placeholder="Report title..."
                    value={reportForm.title}
                    onChange={e => setReportForm({ ...reportForm, title: e.target.value })}
                  />
                  <textarea
                    style={{ ...s.input, height: 80, resize: 'vertical', marginTop: 10 }}
                    placeholder="Describe the report in detail..."
                    value={reportForm.description}
                    onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                  />
                  {submitted && <p style={s.successMsg}>Report submitted successfully.</p>}
                  <button style={s.submitBtn} onClick={submitReport} disabled={submitting}>
                    {submitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
                  </button>
                </div>

                {reports.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <p style={s.sectionLabel}>YOUR REPORTS</p>
                    {reports.map(rep => (
                      <div key={rep.id} style={s.reportItem}>
                        <div style={s.repStatus(rep.status)}>{rep.status?.toUpperCase()}</div>
                        <div>
                          <p style={s.taskTitle}>{rep.title}</p>
                          {rep.description && <p style={s.taskDesc}>{rep.description}</p>}
                          <p style={s.taskDate}>{new Date(rep.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}

const s = {
  centerWrap: { display: 'flex', justifyContent: 'center', paddingTop: 20 },
  selectBox: { width: '100%', maxWidth: 560 },
  selectHeader: { textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(204,34,0,0.15)' },
  selectIcon: { fontSize: 24, color: '#cc2200', display: 'block', marginBottom: 12 },
  selectTitle: { fontSize: 18, letterSpacing: '0.2em', color: '#e8e0d8', marginBottom: 8 },
  selectSub: { fontSize: 11, color: '#555550', letterSpacing: '0.05em' },
  nameList: { display: 'flex', flexDirection: 'column', gap: 20 },
  roleSection: {},
  roleLabel: { fontSize: 9, letterSpacing: '0.2em', color: '#cc2200', marginBottom: 8 },
  nameBtn: {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', background: '#111', border: '1px solid #1a1a1a',
    color: '#e8e0d8', padding: '12px 16px', cursor: 'pointer',
    fontFamily: 'Georgia, serif', fontSize: 14, marginBottom: 4,
    textAlign: 'left', transition: 'border-color 0.2s',
  },
  nameAvatar: {
    width: 30, height: 30, background: '#1a0500',
    border: '1px solid rgba(204,34,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, color: '#cc2200', flexShrink: 0,
  },
  backBtn: {
    background: 'none', border: 'none', color: '#555550',
    fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
    fontFamily: 'Georgia, serif', marginBottom: 24, padding: 0,
  },
  memberBanner: {
    display: 'flex', alignItems: 'center', gap: 20,
    background: '#111', border: '1px solid #1a1a1a',
    borderLeft: '3px solid #cc2200', padding: '20px 24px', marginBottom: 24,
  },
  bannerAvatar: {
    width: 50, height: 50, background: '#1a0500',
    border: '1px solid rgba(204,34,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, color: '#cc2200', flexShrink: 0,
  },
  bannerName: { fontSize: 20, color: '#e8e0d8', marginBottom: 4 },
  bannerRole: { fontSize: 10, letterSpacing: '0.15em', color: '#cc2200' },
  bannerStats: { marginLeft: 'auto', display: 'flex', gap: 20 },
  statPill: { textAlign: 'center' },
  statNum: { display: 'block', fontSize: 22, color: '#e8e0d8' },
  statLbl: { fontSize: 9, color: '#555550', letterSpacing: '0.1em' },
  tabs: { display: 'flex', borderBottom: '1px solid #1a1a1a', marginBottom: 24 },
  tab: {
    background: 'none', border: 'none', borderBottom: '2px solid transparent',
    color: '#555550', padding: '12px 20px', fontSize: 10, letterSpacing: '0.2em',
    cursor: 'pointer', fontFamily: 'Georgia, serif', marginBottom: -1,
  },
  tabActive: { color: '#cc2200', borderBottomColor: '#cc2200' },
  tabContent: {},
  emptyState: { padding: '40px 0', textAlign: 'center' },
  muted: { fontSize: 12, color: '#333330', letterSpacing: '0.05em' },
  taskSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 9, letterSpacing: '0.2em', color: '#555550', marginBottom: 12 },
  taskCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#111', border: '1px solid #1a1a1a', padding: '14px 18px', marginBottom: 8,
  },
  taskCardLeft: { flex: 1 },
  taskTitle: { fontSize: 14, color: '#e8e0d8', marginBottom: 3 },
  taskDesc: { fontSize: 12, color: '#888880', marginBottom: 4 },
  taskDate: { fontSize: 10, color: '#333330', letterSpacing: '0.05em' },
  completeBtn: {
    background: 'none', border: '1px solid rgba(200,168,75,0.3)', color: '#c8a84b',
    fontSize: 9, letterSpacing: '0.15em', padding: '6px 12px',
    cursor: 'pointer', fontFamily: 'Georgia, serif', flexShrink: 0,
  },
  doneTag: { fontSize: 9, color: '#333330', letterSpacing: '0.1em' },
  infractionCard: {
    display: 'flex', gap: 16, alignItems: 'flex-start',
    background: '#111', border: '1px solid #1a1a1a',
    borderLeft: '2px solid #cc2200', padding: '14px 18px', marginBottom: 8,
  },
  sevBadge: (sev) => ({
    fontSize: 8, letterSpacing: '0.1em', padding: '3px 8px', flexShrink: 0,
    background: sev === 'severe' ? 'rgba(204,34,0,0.15)' : sev === 'strike' ? 'rgba(200,168,75,0.1)' : 'rgba(85,85,80,0.2)',
    color: sev === 'severe' ? '#cc2200' : sev === 'strike' ? '#c8a84b' : '#555550',
    border: `1px solid ${sev === 'severe' ? 'rgba(204,34,0,0.3)' : sev === 'strike' ? 'rgba(200,168,75,0.3)' : '#2a2a2a'}`,
  }),
  infReason: { fontSize: 13, color: '#e8e0d8', marginBottom: 3 },
  reportForm: { background: '#111', border: '1px solid #1a1a1a', padding: '20px', marginBottom: 16 },
  input: {
    width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a',
    color: '#e8e0d8', padding: '10px 12px', fontSize: 13,
    fontFamily: 'Georgia, serif', outline: 'none', display: 'block',
  },
  successMsg: { fontSize: 11, color: '#4a9', letterSpacing: '0.05em', marginTop: 8 },
  submitBtn: {
    marginTop: 12, background: '#cc2200', border: 'none', color: '#fff',
    padding: '10px 20px', fontSize: 11, letterSpacing: '0.2em',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  reportItem: {
    display: 'flex', gap: 16, alignItems: 'flex-start',
    background: '#111', border: '1px solid #1a1a1a', padding: '14px 18px', marginBottom: 8,
  },
  repStatus: (st) => ({
    fontSize: 8, letterSpacing: '0.1em', padding: '3px 8px', flexShrink: 0,
    background: 'rgba(85,85,80,0.2)', color: '#555550', border: '1px solid #2a2a2a',
  }),
}
