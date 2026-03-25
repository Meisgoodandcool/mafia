import { useRouter } from 'next/router'

const ROLES = [
  'Leader', 'Co-Leader', 'Advisor',
  'Recruitment Manager', 'Events Manager', 'Giveaway Manager',
  'Media Manager', 'Community Manager', 'Tickets Manager',
  'Intelligence Manager', 'Public Relations', 'Mission Director'
]

export { ROLES }

export default function Layout({ children, title, role }) {
  const router = useRouter()

  function logout() {
    sessionStorage.removeItem('mafia_role')
    router.push('/')
  }

  return (
    <div style={styles.page}>
      <div style={styles.scanlines} />
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.emblem}>✦</span>
          <div>
            <h1 style={styles.headerTitle}>THE MAFIA</h1>
            <p style={styles.headerSub}>DonutSMP</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.roleTag}>{role === 'hicom' ? 'HIGH COMMAND' : 'STAFF'}</span>
          <button onClick={logout} style={styles.logoutBtn}>LOGOUT</button>
        </div>
      </header>
      <main style={styles.main}>
        {children}
      </main>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    position: 'relative',
  },
  scanlines: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(10,10,10,0.98)',
    borderBottom: '1px solid #1a0000',
    borderBottomColor: 'rgba(204,34,0,0.3)',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  emblem: {
    fontSize: 20,
    color: '#cc2200',
  },
  headerTitle: {
    fontSize: 16,
    letterSpacing: '0.25em',
    color: '#e8e0d8',
    lineHeight: 1.1,
  },
  headerSub: {
    fontSize: 9,
    letterSpacing: '0.2em',
    color: '#555550',
    textTransform: 'uppercase',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  roleTag: {
    fontSize: 9,
    letterSpacing: '0.2em',
    color: '#cc2200',
    border: '1px solid rgba(204,34,0,0.3)',
    padding: '4px 10px',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #2a2a2a',
    color: '#555550',
    fontSize: 9,
    letterSpacing: '0.15em',
    padding: '6px 14px',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
  },
  main: {
    position: 'relative',
    zIndex: 1,
    padding: '32px',
    maxWidth: 1200,
    margin: '0 auto',
  }
}
