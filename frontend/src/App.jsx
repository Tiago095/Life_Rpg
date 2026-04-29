import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Initial_Page from './pages/Initial_Page'
import Create_Account from './pages/Create_Account'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Preferences from './pages/Choose_Preferences'
import Dashboard from './pages/Dashboard'
import Quests from './pages/Quests'
import ComingSoon from './components/Coming_Soon'
import Settings from './pages/Settings'
import MissionCompletePopup from './components/MissionCompletePopup'
import { useDailyMissions } from './hooks/useDailyMissions'
import { useUser } from './context/UserContext'

function DailyMissionsManager() {
  const { user } = useUser()
  const { status, progress } = useDailyMissions(user)

  // Mostra loading overlay enquanto gera
  if (status === 'loading-model' || status === 'generating') {
    return (
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px', padding: '16px 20px',
        maxWidth: '300px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        <p style={{ color: 'var(--color-primary)', margin: 0, fontSize: '13px', fontWeight: 600 }}>
          ⚔️ {status === 'loading-model' ? 'Loading AI...' : 'Generating daily quests...'}
        </p>
        {progress && (
          <p style={{ color: 'var(--color-text-muted)', margin: '6px 0 0', fontSize: '12px' }}>
            {progress}
          </p>
        )}
      </div>
    )
  }

  return null
}


function App() {

    useEffect(() => {
    const theme = sessionStorage.getItem('theme')
    const themeMap = {
      'Neon Green': 'theme-neon-green',
      'Blood Red':  'theme-blood-red',
      'Void Black': 'theme-void-black',
    }
    if (theme && themeMap[theme]) {
      document.body.classList.add(themeMap[theme])
    }
    if (sessionStorage.getItem('highContrast') === 'true') {
      document.body.classList.add('high-contrast')
    }
  }, [])



  return (
    <BrowserRouter>
      <DailyMissionsManager />
      <Routes>
        <Route path="/" element={<Initial_Page />} />
        <Route path="/Create_Account" element={<Create_Account />} />
        <Route path="/Login" element={<Login />}/>
        <Route path="/Sidebar" element={<Sidebar />}/>
        <Route path="/Preferences" element={<Preferences />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Quests" element={<Quests />} />
        <Route path="/Skills"     element={<ComingSoon />} />
        <Route path="/Inventory"  element={<ComingSoon />} />
        <Route path="/Trophy"     element={<ComingSoon />} />
        <Route path="/MarketPlace"  element={<ComingSoon />} />
        <Route path="/Settings"   element={<Settings />} />
        <Route path="/Friends"    element={<ComingSoon />} />
        <Route path="/MC" element={<MissionCompletePopup/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App