import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id:       sessionStorage.getItem('userId')   || null,
    username: sessionStorage.getItem('username') || 'OPERADOR',
    email:    sessionStorage.getItem('email')    || '',
    level:    sessionStorage.getItem('level')    || 1,
    xp:       sessionStorage.getItem('xp')       || 0,
    maxXp:    sessionStorage.getItem('maxXp')    || 1000,
    avatar:   sessionStorage.getItem('avatar')   || "/src/assets/avatars/avatar1.png",
    language: sessionStorage.getItem('language') || "English [EN-US]", 
    theme:    sessionStorage.getItem('theme')    || "Cyberpunk Blue (Default)",
    highContrast: sessionStorage.getItem('highContrast') === 'true' || false,
  })

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }))
  }

  const logout = () => {
    sessionStorage.clear()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useTranslation() {
  const { user } = useUser()
  const language = user?.language || sessionStorage.getItem('language') || 'English [EN-US]'
  const t = translations[language] || translations['English [EN-US]']
  return { t }
}

export function getErrorMessage(code, language) {
  const lang   = language || sessionStorage.getItem('language') || 'English [EN-US]'
  const errors = translations[lang]?.errors || translations['English [EN-US]'].errors
  
  return errors[code] || errors['UNKNOWN_ERROR']
}

export function useUser() {
  return useContext(UserContext)
}