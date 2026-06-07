import db from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken' 

const JWT_SECRET = 'liferpg-secret-key'

export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'All fields are required.' })
  await db.read()

  const user = db.data.users.find(u => u.email === email)
  if (!user)
    return res.status(400).json({ message: 'Invalid Credentials' })
  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword)
    return res.status(400).json({ message: 'Invalid Credentials' })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' })
  res.json({
    message: 'Login com sucesso',
    token,
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
      highContrast: user.highContrast ?? false,
      skills:       user.skills    ?? [],
    }
  })
}