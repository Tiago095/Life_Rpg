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

function App() {
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
        <Route path="/Skills"     element={<ComingSoon />} />
        <Route path="/Inventory"  element={<ComingSoon />} />
        <Route path="/Trophy"     element={<ComingSoon />} />
        <Route path="/MarketPlace"  element={<ComingSoon />} />
        <Route path="/Settings"   element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App