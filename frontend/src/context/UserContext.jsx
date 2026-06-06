import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'


const UserContext = createContext(null)

const avatarPath = (avatar) =>
  avatar?.startsWith('/src') ? avatar : `/src/assets/avatars/${avatar || 'avatar1'}.png`

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) { setLoading(false); return }

  fetch('http://localhost:3000/api/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      const u = data.user
      setUser({ ...u, avatar: avatarPath(u.avatar) })

      const themeMap = {
        'Neon Green': 'theme-neon-green',
        'Blood Red':  'theme-blood-red',
        'Void Black': 'theme-void-black',
      }
      document.body.classList.remove('theme-neon-green', 'theme-blood-red', 'theme-void-black', 'high-contrast')
      if (u.theme && themeMap[u.theme]) document.body.classList.add(themeMap[u.theme])
      if (u.highContrast) document.body.classList.add('high-contrast')
    })
    .catch(() => localStorage.removeItem('token'))
    .finally(() => setLoading(false))
}, [])

const login = async (token, userData) => {
  localStorage.setItem('token', token)
  setUser({ ...userData, avatar: avatarPath(userData.avatar) })

  try {
    const res = await fetch('http://localhost:3000/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setUser({ ...data.user, avatar: avatarPath(data.user.avatar) })
    }
  } catch (err) {
    console.error('Erro ao carregar perfil completo:', err)
  }
}

const refreshUser = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const res = await fetch('http://localhost:3000/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setUser({ ...data.user, avatar: avatarPath(data.user.avatar) })
    }
  } catch (err) {
    console.error('Erro ao actualizar perfil:', err)
  }
}

  const updateUser = (newData) => {
    setUser(prev => ({
      ...prev,
      ...newData,
      avatar: newData.avatar ? avatarPath(newData.avatar) : prev?.avatar
    }))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('theme')
    localStorage.removeItem('highContrast')
    document.body.className = ''
    setUser(null)
  }

  if (loading) return null

  return (
    <UserContext.Provider value={{ user, login , updateUser, logout , refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}

export function useTranslation() {
  const { user } = useUser()
  const language = user?.language || 'English [EN-US]'
  const t = translations[language] || translations['English [EN-US]']
  return { t }
}

export function getErrorMessage(code, language) {
  const lang   = language || 'English [EN-US]'
  const errors = translations[lang]?.errors || translations['English [EN-US]'].errors
  return errors[code] || errors['UNKNOWN_ERROR']
}