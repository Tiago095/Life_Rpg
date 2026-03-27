import { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id:       sessionStorage.getItem('userId')   || null,
    username: sessionStorage.getItem('username') || 'OPERADOR',
    email:    sessionStorage.getItem('email')    || '',
    level:    sessionStorage.getItem('level')    || 1,
    xp:       sessionStorage.getItem('xp')       || 0,
    maxXp:    sessionStorage.getItem('maxXp')    || 1000,
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

export function useUser() {
  return useContext(UserContext)
}