import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css';
import { useUser } from '../context/UserContext'


const Sidebar = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  console.log(user)
  const xpPercentage = user 
  ? (user.xp / user.maxXp) * 100 
  : 0;

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'grid_view',   path: '/Dashboard' },
    { id: 'Skills',    label: 'Skills',    icon: 'swords',      path: '/Skills' },
    { id: 'Quests',    label: 'Quests',    icon: 'history_edu', path: '/Quests' },
    { id: 'Inventory', label: 'Inventory', icon: 'backpack',    path: '/Inventory' },
    { id: 'Trophy',    label: 'Trophy Room', icon: 'trophy',    path: '/Trophy' },
    { id: 'Settings',  label: 'Settings',  icon: 'settings',   path: '/Settings' },
  ]

  return (
    <aside className="sb-sidebar-container">
      <div className="sb-profile-section">
        <div className="sb-profile-header">
          <div className="sb-avatar-wrapper">
            <div className="sb-avatar-frame">
              <div className="sb-avatar-placeholder"></div>
            </div>
            <div className="sb-level-badge">LVL {user.level}</div>
          </div>
          <h2 className="sb-username">{user.username}</h2>
        </div>

        <div className="sb-xp-container">
          <div className="sb-xp-info">
            <span className="sb-xp-label">XP PROGRESS</span>
            <span className="sb-xp-percent">{xpPercentage}%</span>
          </div>
          <div className="sb-xp-bar-bg">
            <div className="sb-xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
          </div>
          <p className="sb-xp-numbers">{user.xp} / {user.maxXp} XP</p>
        </div>
      </div>

      <nav className="sb-sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={item.id}>
            {index === menuItems.length - 1 && <div className="sb-separator" />}
            <button
              className={`sb-nav-item ${location.pathname === item.path ? 'sb-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="material-symbols-outlined sb-nav-icon-font">{item.icon}</span>
              <span className="sb-nav-item-label">{item.label}</span>
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;