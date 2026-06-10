import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const JWT_SECRET = 'liferpg-secret-key'

export const register = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' })
  }

  await db.read()

  const userExists = db.data.users.find(
    u => u.email === email || u.username === username
  )
  if (userExists) {
    return res.status(409).json({ error: 'Username or email already registered.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = {
    id: crypto.randomUUID(),
    username,
    email,
    password: hashedPassword,
    level: 1,
    xp: 0,
    "avatar":"avatar1",
    "language": "English [EN-US]",
    "theme": "Cyberpunk Blue (Default)",
    "highContrast": true,
    skills: []
  }

  db.data.users.push(newUser)
  await db.write()

 const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1d' })
 const { password: _, ...userSafe } = newUser
  res.status(201).json({ message: 'Account created successfully!', user: userSafe, token })
}