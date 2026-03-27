import db from '../db.js'
import bcrypt from 'bcrypt'

export const login = async (req, res) => {
  const { email, password } = req.body


  if (!email || !password)
    return res.status(400).json({ message: 'All fields are required.' })

  const user = db.data.users.find(u => u.email === email)
  if (!user)
    return res.status(400).json({ message: 'Invalid Credentials' })

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword)
    return res.status(400).json({ message: 'Invalid Credentials' })

  res.json({
    message: 'Login successfully',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level,
      xp: user.xp,
      maxXp: user.maxXp
    }
  })
}