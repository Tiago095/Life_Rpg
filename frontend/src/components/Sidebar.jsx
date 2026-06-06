import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useTranslation } from '../context/UserContext'
import './Sidebar.css'

import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'
import avatar4 from '../assets/avatars/avatar4.png'
import avatar5 from '../assets/avatars/avatar5.png'

const avatarMap = { avatar1, avatar2, avatar3, avatar4, avatar5 }

const getAvatarKey = (avatar) => {
  if (!avatar) return 'avatar1'
  if (avatar.includes('/')) return avatar.split('/').pop().replace('.png', '')
  return avatar
}

const XP_LEVELS = [
  { level: 1, xp_required: 0    },
  { level: 2, xp_required: 100  },
  { level: 3, xp_required: 250  },
  { level: 4, xp_required: 500  },
  { level: 5, xp_required: 900  },
  { level: 6, xp_required: 1400 },
]

const Sidebar = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useUser()
  const { t }     = useTranslation()

  const avatarKey = getAvatarKey(user?.avatar)

  const current = XP_LEVELS.find(l => l.level === user?.level)
  const next    = XP_LEVELS.find(l => l.level === (user?.level ?? 1) + 1)
  const xpPercentage = current && next
    ? Math.min(100, Math.round(((user.xp - current.xp_required) / (next.xp_required - current.xp_required)) * 100))
    : 100

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
                src={avatarMap[avatarKey] || avatar1}
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
          <p className="sb-xp-numbers">{Math.floor(user.xp)} / {next?.xp_required ?? '—'} XP</p>
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