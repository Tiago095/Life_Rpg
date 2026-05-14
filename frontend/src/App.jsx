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
import Skills from './pages/Skills'

function App() {

    useEffect(() => {
  const theme = localStorage.getItem('theme')
  const themeMap = {
    'Neon Green': 'theme-neon-green',
    'Blood Red':  'theme-blood-red',
    'Void Black': 'theme-void-black',
  }
  if (theme && themeMap[theme]) {
    document.body.classList.add(themeMap[theme])
  }
  if (localStorage.getItem('highContrast') === 'true') { 
    document.body.classList.add('high-contrast')
  }
}, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Initial_Page />} />
        <Route path="/Create_Account" element={<Create_Account />} />
        <Route path="/Login" element={<Login />}/>
        <Route path="/Sidebar" element={<Sidebar />}/>
        <Route path="/Preferences" element={<Preferences />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Quests" element={<Quests />} />
        <Route path="/Skills"     element={<Skills />} />
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