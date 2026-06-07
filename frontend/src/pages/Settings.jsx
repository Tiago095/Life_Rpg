import { useState, useEffect, useRef  } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AvatarModal from '../components/AvatarModal'
import { useUser, useTranslation, getErrorMessage } from '../context/UserContext'
import './Settings.css'

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

export default function Settings() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useUser()
  const { t } = useTranslation()

  const originalHighContrast = useRef(user?.highContrast ?? false)

  const [alias, setAlias]               = useState('')
  const [editingAlias, setEditingAlias] = useState(false)
  const [aliasError, setAliasError]     = useState('')

  const [newEmail, setNewEmail]         = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [avatarName, setAvatarName]     = useState('')
  const [avatarSrc, setAvatarSrc]       = useState(null)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const [highContrast, setHighContrast]     = useState(false)
  const [theme, setTheme] = useState('Cyberpunk Blue (Default)')
  const [language, setLanguage] = useState('English [EN-US]') 

  const [saveError, setSaveError]         = useState('')
  const [saveSuccess, setSaveSuccess]     = useState('')
  const [loading, setLoading]             = useState(false)

 useEffect(() => {
  if (!user) return
  setAlias(user.username || '')
  setNewEmail(user.email || '')
  const key = getAvatarKey(user.avatar)
  setAvatarName(key)
  setAvatarSrc(avatarMap[key] || null)
  setHighContrast(user.highContrast ?? false)
  setTheme(user.theme || 'Cyberpunk Blue (Default)')
  setLanguage(user.language || 'English [EN-US]')
  originalHighContrast.current = user.highContrast ?? false
  if (user.theme) applyTheme(user.theme)
  document.body.classList.toggle('high-contrast', user.highContrast ?? false)
}, [user])

  if (!user) return null

  useEffect(() => {
    return () => {
      document.body.classList.toggle('high-contrast', originalHighContrast.current)
    }
  }, [])

  const originalUsername     = user?.username     || ''
  const originalEmail        = user?.email        || ''
  const originalAvatarKey    = getAvatarKey(user.avatar)
  const originalLanguage     = user?.language     || 'English [EN-US]'
  const originalTheme        = user?.theme        || 'Cyberpunk Blue (Default)'

  const applyTheme = (themeName) => {
    document.body.classList.remove('theme-neon-green', 'theme-blood-red', 'theme-void-black')
    const themeMap = {
      'Neon Green': 'theme-neon-green',
      'Blood Red':  'theme-blood-red',
      'Void Black': 'theme-void-black',
    }
    if (themeMap[themeName]) document.body.classList.add(themeMap[themeName])
    localStorage.setItem('theme', themeName)
    setTheme(themeName)
  }

  const handleHighContrast = (val) => {
    document.body.classList.toggle('high-contrast', val)
    setHighContrast(val)
  }

  const handleAliasConfirm = () => {
    if (!editingAlias) {
      setEditingAlias(true)
    } else {
      setEditingAlias(false)
      setAliasError('')
    }
  }

  const handleAvatarConfirm = (name, src) => {
    setAvatarName(name)
    setAvatarSrc(src)
    updateUser({ avatar: name })
  }

  const handleSave = async () => {
    setSaveError('')
    setSaveSuccess('')
    setLoading(true)

    const token = localStorage.getItem('token')
    const body = {}

    if (language !== originalLanguage) body.language = language
     if (theme !== originalTheme) {
      body.theme = theme
      applyTheme(theme) 
    }
    if (alias !== originalUsername)   body.username = alias
    if (newEmail !== originalEmail)   body.email    = newEmail
    if (newPassword)                  body.password = newPassword
    if (highContrast !== originalHighContrast.current) body.highContrast = highContrast

    if (Object.keys(body).length === 0) {
      setSaveError(t.noChanges)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        if (typeof data.user.highContrast === 'boolean')
          originalHighContrast.current = data.user.highContrast

        updateUser(data.user)

        if (body.theme) applyTheme(body.theme)

        setNewPassword('')
        setEditingAlias(false)
        setSaveSuccess(t.saved)
      } else {
        setSaveError(getErrorMessage(data.code, language))
      }
    } catch (err) {
      setSaveError(getErrorMessage('CONNECTION_ERROR', language))
    } finally {
      setLoading(false)
    }
  }

  const handleDiscard = () => {
    setAlias(originalUsername)
    setNewEmail(originalEmail)
    setNewPassword('')
    setEditingAlias(false)
    setAliasError('')
    setSaveError('')
    setSaveSuccess('')
    setTheme(originalTheme)
    applyTheme(originalTheme) 
    setHighContrast(originalHighContrast.current)
    document.body.classList.toggle('high-contrast', originalHighContrast.current)
  }

  const handleDelete = async () => {
    const confirm = window.confirm(t.terminateMsg)
    if (!confirm) return

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`http://localhost:3000/api/user/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        logout()
        navigate('/')
      }
    } catch (err) {
      setSaveError('Erro ao eliminar conta')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="st-layout">
      <Sidebar />

      <div className="st-main">
        <div className="st-bg-grid" />

        <div className="st-topbar">
          <div className="st-topbar-left">
            <div className="st-topbar-icon">
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>terminal</span>
            </div>
            <h1 className="st-topbar-title">{t.profileSettings}</h1>
          </div>
          <button className="st-notif-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#64748b' }}>notifications</span>
          </button>
        </div>

        <div className="st-scroll">

          <section className="st-section">
            <div className="st-section-header">
              <span className="material-symbols-outlined st-section-icon">fingerprint</span>
              <h2 className="st-section-title">{t.operadorIdentity}</h2>
            </div>

            <div className="st-identity-row">
              <div className="st-avatar-wrapper">
                <div className="st-avatar" style={{ cursor: 'pointer' }} onClick={() => setShowAvatarModal(true)}>
                  <img
                    src={avatarSrc || avatar1}
                    alt="avatar"
                    className="st-avatar-img"
                  />
                  <button
                    className="st-avatar-edit"
                    onClick={(e) => { e.stopPropagation(); setShowAvatarModal(true) }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>photo_camera</span>
                  </button>
                </div>
                <span className="st-avatar-label">{t.avatarSync}</span>
              </div>

              {/* Alias */}
              <div className="st-alias-block">
                <label className="st-label">{t.operadorAlias}</label>
                <div className="st-input-wrapper">
                  <input
                    className="st-input"
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    readOnly={!editingAlias}
                  />
                  <button className="st-input-icon-btn" onClick={handleAliasConfirm}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>
                      {editingAlias ? 'check' : 'edit'}
                    </span>
                  </button>
                </div>
                {aliasError && <p className="st-field-error">{aliasError}</p>}
                <p className="st-hint">{t.aliasHint}</p>
              </div>
            </div>
          </section>

          <div className="st-divider" />

          <section className="st-section">
            <div className="st-section-header">
              <span className="material-symbols-outlined st-section-icon">security</span>
              <h2 className="st-section-title">{t.neuralSecurity}</h2>
            </div>

            <div className="st-two-col">
              <div className="st-field">
                <label className="st-label">{t.registeredEmail}</label>
                <div className="st-input-wrapper">
                  <input
                    className="st-input"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="st-field">
                <label className="st-label">{t.encryptionKey}</label>
                <div className="st-input-wrapper">
                  <input
                    className="st-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.newEncryptionKey}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button className="st-input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="st-divider" />

          <section className="st-section">
            <div className="st-section-header">
              <span className="material-symbols-outlined st-section-icon">tune</span>
              <h2 className="st-section-title">{t.userPreferences}</h2>
            </div>

            <div className="st-toggle-row">
              <div>
                <p className="st-toggle-title">{t.highContrast}</p>
                <p className="st-toggle-sub">{t.highContrastSub}</p>
              </div>
              <button className={`st-toggle ${highContrast ? 'st-toggle-on' : ''}`} onClick={() => handleHighContrast(!highContrast)}>
                <div className="st-toggle-thumb" />
              </button>
            </div>

            <div className="st-two-col" style={{ marginTop: '24px' }}>
              <div className="st-field">
                <label className="st-label">{t.uiTheme}</label>
                <div className="st-select-wrapper">
                  <select className="st-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option>Cyberpunk Blue (Default)</option>
                    <option>Neon Green</option>
                    <option>Blood Red</option>
                    <option>Void Black</option>
                  </select>
                  <span className="material-symbols-outlined st-select-icon">expand_more</span>
                </div>
              </div>

              <div className="st-field">
                <label className="st-label">{t.systemLanguage}</label>
                <div className="st-select-wrapper">
                  <select className="st-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="English [EN-US]">{t.en}</option>
                  </select>
                  <span className="material-symbols-outlined st-select-icon">expand_more</span>
                </div>
              </div>
            </div>
          </section>

          <div className="st-divider" />

          <section className="st-section">
            <div className="st-danger-box">
              <div className="st-danger-header">
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ef4444' }}>warning</span>
                <h2 className="st-danger-title">{t.dangerZone}</h2>
              </div>
              <div className="st-danger-row">
                <div>
                  <p className="st-danger-item-title">{t.terminateProfile}</p>
                  <p className="st-danger-item-sub">{t.terminateSub}</p>
                </div>
                <button className="st-delete-btn" onClick={handleDelete}>{t.deleteAccount}</button>
              </div>
            </div>
          </section>

          <div className="st-actions">
            {saveError   && <p className="st-save-error">{saveError}</p>}
            {saveSuccess && <p className="st-save-success">{saveSuccess}</p>}
            <button className="st-logout-btn" onClick={handleLogout}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
              {t.logout}
            </button>
            <button className="st-discard-btn" onClick={handleDiscard}>{t.discard}</button>
            <button className="st-save-btn" onClick={handleSave} disabled={loading}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>Save</span>
              {loading ? t.saving : t.saveChanges}
            </button>
          </div>

        </div>
      </div>
      
      {showAvatarModal && (
        <AvatarModal
          currentAvatar={avatarName}
          onConfirm={handleAvatarConfirm}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </div>
  )
}