import db from '../db.js'
import bcrypt from 'bcrypt'

export const updateProfile = async (req, res) => {
  const { id } = req.params
  const { username, email, password, avatar, language, theme, highContrast } = req.body

  await db.read()

  const userIndex = db.data.users.findIndex(u => u.id === id)
  if (userIndex === -1)
    return res.status(404).json({ code: 'USER_NOT_FOUND' })

  const user = db.data.users[userIndex]

  // verifica username duplicado
  if (username && username !== user.username) {
    const usernameExists = db.data.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== id)
    if (usernameExists)
      return res.status(400).json({ code: 'USERNAME_EXISTS' })
    user.username = username
  }

  // verifica email duplicado
  if (email && email !== user.email) {
    const emailExists = db.data.users.find(u => u.email === email && u.id !== id)
    if (emailExists)
      return res.status(400).json({ code: 'EMAIL_EXISTS' })
    user.email = email
  }

  if (password) user.password = await bcrypt.hash(password, 10)
  if (avatar)   user.avatar   = avatar
  if (language)  user.language = language
  if (theme)     user.theme    = theme
  
  if (typeof highContrast === 'boolean') user.highContrast = highContrast

  db.data.users[userIndex] = user
  await db.write()

  res.json({
    message: 'Perfil atualizado com sucesso',
    user: {
      id:       user.id,
      username: user.username,
      email:    user.email,
      level:    user.level,
      xp:       user.xp,
      maxXp:    user.maxXp,
      avatar:   user.avatar   || null,
      language: user.language || 'English [EN-US]',
      theme:    user.theme    || 'Cyberpunk Blue (Default)',
      highContrast: user.highContrast ?? false
  }
  })
}

// Apagar conta
export const deleteAccount = async (req, res) => {
  const { id } = req.params

  await db.read()

  const userIndex = db.data.users.findIndex(u => u.id === id)
  if (userIndex === -1)
    return res.status(404).json({ code: 'USER_NOT_FOUND' })

  db.data.users.splice(userIndex, 1)
  await db.write()

  res.json({ message: 'Account deleted!' })
}

// Buscar dados do utilizador
export const getUser = async (req, res) => {
  const { id } = req.params

  await db.read()

  const user = db.data.users.find(u => u.id === id)
  if (!user)
    return res.status(404).json({ message: 'User not found!' })

  res.json({
    id:       user.id,
    username: user.username,
    email:    user.email,
    level:    user.level,
    xp:       user.xp,
    maxXp:    user.maxXp,
    avatar:   user.avatar || null,
    language: user.language || 'English [EN-US]',
    theme:    user.theme    || 'Cyberpunk Blue (Default)',
    highContrast: user.highContrast || false
  })
}