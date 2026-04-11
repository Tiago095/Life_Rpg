import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useTranslation } from '../context/UserContext'
import './Sidebar.css'

import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'
import avatar4 from '../assets/avatars/avatar4.png'
import avatar5 from '../assets/avatars/avatar5.png'

const avatarMap = { avatar1, avatar2, avatar3, avatar4, avatar5 }

const Sidebar = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useUser()
  const { t }     = useTranslation()

  const xpPercentage = Math.round((Number(user.xp) / Number(user.maxXp)) * 100) || 0
  const menuItems = [
    { id: 'Dashboard', label: t.dashboard,  icon: 'grid_view',   path: '/Dashboard' },
    { id: 'Skills',    label: t.skills,     icon: 'swords',      path: '/Skills' },
    { id: 'Quests',    label: t.quests,     icon: 'history_edu', path: '/Quests' },
    { id: 'Inventory', label: t.inventory,  icon: 'backpack',    path: '/Inventory' },
    { id: 'Trophy',    label: t.trophyRoom, icon: 'trophy',      path: '/Trophy' },
  ]

  return (
    <aside className="sb-sidebar-container">
      <div className="sb-profile-section">
        <div className="sb-profile-header">
          <div className="sb-avatar-wrapper">
            <div className="sb-avatar-frame">
              <img
                src={avatarMap[user.avatar] || avatar1}
                alt="avatar"
                className="sb-avatar-img"
              />
            </div>
            <div className="sb-level-badge">LVL {user.level}</div>
          </div>
          <h2 className="sb-username">{user.username}</h2>
        </div>

        <div className="sb-xp-container">
          <div className="sb-xp-info">
            <span className="sb-xp-label">{t.xpProgress}</span>
            <span className="sb-xp-percent">{xpPercentage}%</span>
          </div>
          <div className="sb-xp-bar-bg">
            <div className="sb-xp-bar-fill" style={{ width: `${xpPercentage}%` }} />
          </div>
          <p className="sb-xp-numbers">{user.xp} / {user.maxXp} XP</p>
        </div>
      </div>

      <nav className="sb-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sb-nav-item ${location.pathname === item.path ? 'sb-active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="material-symbols-outlined sb-nav-icon-font">{item.icon}</span>
            <span className="sb-nav-item-label">{item.label}</span>
            {item.badge && <span className="sb-item-notification-badge">{item.badge}</span>}
          </button>
        ))}

        <div className="sb-separator" />

        <button
          className={`sb-nav-item ${location.pathname === '/Settings' ? 'sb-active' : ''}`}
          onClick={() => navigate('/Settings')}
        >
          <span className="material-symbols-outlined sb-nav-icon-font">settings</span>
          <span className="sb-nav-item-label">{t.settings}</span>
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar