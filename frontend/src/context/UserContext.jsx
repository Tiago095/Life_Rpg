import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const UserContext = createContext(null)

// helper para converter o avatar guardado na db para path completo
const avatarPath = (avatar) =>
  avatar?.startsWith('/src') ? avatar : `/src/assets/avatars/${avatar || 'avatar1'}.png`

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)  // ← evita flash de dados errados

  // Ao iniciar a app, se existir token, vai buscar os dados ao backend
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    fetch('http://localhost:3000/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUser({ ...data.user, avatar: avatarPath(data.user.avatar) }))
      .catch(() => {
        // token inválido ou expirado — limpa tudo
        localStorage.removeItem('token')
      })
      .finally(() => setLoading(false))
  }, [])

  const updateUser = (newData) => {
    setUser(prev => ({
      ...prev,
      ...newData,
      // garante que o avatar é sempre o path completo
      avatar: newData.avatar ? avatarPath(newData.avatar) : prev?.avatar
    }))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // Não renderiza nada enquanto verifica o token (evita flash)
  if (loading) return null

  return (
    <UserContext.Provider value={{ user, updateUser, logout }}>
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