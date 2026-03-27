import bcrypt from 'bcrypt'
import db from '../db.js'

export const register = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' })
  }

  await db.read()

  const userExists = db.data.users.find(
    u => u.email === email || u.username === username
  )
  if (userExists) {
    return res.status(409).json({ error: 'Username ou email já registado.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = {
    id: crypto.randomUUID(),
    username,
    email,
    password: hashedPassword,
    level: 1,
    xp: 0,
    skills: []
  }

  db.data.users.push(newUser)
  await db.write()

  req.session.userId = newUser.id
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao iniciar sessão.' })
    }
    const { password: _, ...userSafe } = newUser
    res.status(201).json({ message: 'Conta criada com sucesso!', user: userSafe })
  })
}