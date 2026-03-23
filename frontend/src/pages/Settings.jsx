import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import './Settings.css'

export default function Settings() {
  const [alias, setAlias]                 = useState('ITHRAPY')
  const [editingAlias, setEditingAlias]   = useState(false)
  const [showPassword, setShowPassword]   = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [highContrast, setHighContrast]   = useState(false)
  const [theme, setTheme]                 = useState('Cyberpunk Blue (Default)')
  const [language, setLanguage]           = useState('English [EN-US]')

  const applyTheme = (themeName) => {
  document.body.classList.remove(
    'theme-neon-green',
    'theme-blood-red',
    'theme-void-black'
  )
  const themeMap = {
    'Neon Green':  'theme-neon-green',
    'Blood Red':   'theme-blood-red',
    'Void Black':  'theme-void-black',
  }
  if (themeMap[themeName]) {
    document.body.classList.add(themeMap[themeName])
  }
  setTheme(themeName)
}

  return (
    <div className="st-layout">
      <Sidebar />

      <div className="st-main">
        <div className='st-bg-grid'/>

        {/* TOP BAR */}
        <div className="st-topbar">
          <div className="st-topbar-left">
            <div className="st-topbar-icon">
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>terminal</span>
            </div>
            <h1 className="st-topbar-title">Profile & System Settings</h1>
          </div>
          <button className="st-notif-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#64748b' }}>notifications</span>
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="st-scroll">

          {/* ===== OPERADOR IDENTITY ===== */}
          <section className="st-section">
            <div className="st-section-header">
              <span className="material-symbols-outlined st-section-icon">fingerprint</span>
              <h2 className="st-section-title">Operador Identity</h2>
            </div>

            <div className="st-identity-row">
              {/* Avatar */}
              <div className="st-avatar-wrapper">
                <div className="st-avatar">
                  <img
                    src="./vite.svg"
                    alt="avatar"
                    className="st-avatar-img"
                  />
                  <button className="st-avatar-edit">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>photo_camera</span>
                  </button>
                </div>
                <span className="st-avatar-label">AVATAR MATRIX SYNC: 100%</span>
              </div>

              {/* Alias */}
              <div className="st-alias-block">
                <label className="st-label">Operador Alias</label>
                <div className="st-input-wrapper">
                  <input
                    className="st-input"
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    readOnly={!editingAlias}
                  />
                  <button className="st-input-icon-btn" onClick={() => setEditingAlias(!editingAlias)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>
                      {editingAlias ? 'check' : 'edit'}
                    </span>
                  </button>
                </div>
                <p className="st-hint">This is your public identifier across the neural network.</p>
                <button className="st-outline-btn">Request Alias Reset</button>
              </div>
            </div>
          </section>

          <div className="st-divider" />

          {/* ===== NEURAL LINK SECURITY ===== */}
          <section className="st-section">
            <div className="st-section-header">
              <span className="material-symbols-outlined st-section-icon">security</span>
              <h2 className="st-section-title">Neural Link Security</h2>
            </div>

            <div className="st-two-col">
              {/* Email */}
              <div className="st-field">
                <label className="st-label">Registered Email</label>
                <div className="st-input-wrapper">
                  <input
                    className="st-input"
                    type="email"
                    defaultValue="operator@neural-link.net"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="st-field">
                <label className="st-label">Encryption Key (Password)</label>
                <div className="st-input-wrapper">
                  <input
                    className="st-input"
                    type={showPassword ? 'text' : 'password'}
                    defaultValue="password123"
                  />
                  <button className="st-input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>
                      {showPassword ? 'visibility_off' : 'history'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2FA */}
            <div className="st-2fa-box">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>verified_user</span>
              <div>
                <p className="st-2fa-title">Two-Factor Auth Enabled</p>
                <p className="st-2fa-sub">Biometric scan required for all major transactions.</p>
              </div>
            </div>
          </section>

          <div className="st-divider" />

          {/* ===== USER PREFERENCES ===== */}
          <section className="st-section">
            <div className="st-section-header">
              <span className="material-symbols-outlined st-section-icon">tune</span>
              <h2 className="st-section-title">User Preferences</h2>
            </div>

            {/* Toggle: Neural Notifications */}
            <div className="st-toggle-row">
              <div>
                <p className="st-toggle-title">Neural Notifications</p>
                <p className="st-toggle-sub">Direct-to-mind HUD alerts for quest updates.</p>
              </div>
              <button
                className={`st-toggle ${notifications ? 'st-toggle-on' : ''}`}
                onClick={() => setNotifications(!notifications)}
              >
                <div className="st-toggle-thumb" />
              </button>
            </div>

            {/* Toggle: High Contrast */}
            <div className="st-toggle-row">
              <div>
                <p className="st-toggle-title">High Contrast HUD</p>
                <p className="st-toggle-sub">Enhanced visibility for combat scenarios.</p>
              </div>
              <button
                className={`st-toggle ${highContrast ? 'st-toggle-on' : ''}`}
                onClick={() => setHighContrast(!highContrast)}
              >
                <div className="st-toggle-thumb" />
              </button>
            </div>

            {/* Selects */}
            <div className="st-two-col" style={{ marginTop: '24px' }}>
              <div className="st-field">
                <label className="st-label">UI Theme Override</label>
                <div className="st-select-wrapper">
                  <select
                    className="st-select"
                    value={theme}
                    onChange={(e) => applyTheme(e.target.value)}
                  >
                    <option>Cyberpunk Blue (Default)</option>
                    <option>Neon Green</option>
                    <option>Blood Red</option>
                    <option>Void Black</option>
                  </select>
                  <span className="material-symbols-outlined st-select-icon">expand_more</span>
                </div>
              </div>

              <div className="st-field">
                <label className="st-label">System Language</label>
                <div className="st-select-wrapper">
                  <select
                    className="st-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English [EN-US]</option>
                    <option>Portuguese [PT-PT]</option>
                    <option>Spanish [ES]</option>
                    <option>Japanese [JA]</option>
                  </select>
                  <span className="material-symbols-outlined st-select-icon">expand_more</span>
                </div>
              </div>
            </div>
          </section>

          <div className="st-divider" />

          {/* ===== DANGER ZONE ===== */}
          <section className="st-section">
            <div className="st-danger-box">
              <div className="st-danger-header">
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ef4444' }}>warning</span>
                <h2 className="st-danger-title">Danger Zone</h2>
              </div>
              <div className="st-danger-row">
                <div>
                  <p className="st-danger-item-title">Terminate Operador Profile</p>
                  <p className="st-danger-item-sub">This will permanently delete all skills, items, and quest history. This action is irreversible.</p>
                </div>
                <button className="st-delete-btn">Delete Account</button>
              </div>
            </div>
          </section>

          {/* ===== SAVE / DISCARD ===== */}
          <div className="st-actions">
            <button className="st-discard-btn">Discard</button>
            <button className="st-save-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}