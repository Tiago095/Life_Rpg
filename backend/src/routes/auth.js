import { Router } from 'express'
import bcrypt from 'bcrypt'
import db from '../db.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  // 1. Validar campos
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' })
  }

  await db.read()

  // 2. Verificar se username ou email já existem
  const userExists = db.data.users.find(
    u => u.email === email || u.username === username
  )
  if (userExists) {
    return res.status(409).json({ error: 'Username ou email já registado.' })
  }

  // 3. Encriptar a password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 4. Criar o utilizador
  const newUser = {
    id: crypto.randomUUID(),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  }

  // 5. Guardar na base de dados
  db.data.users.push(newUser)
  await db.write()

  // 6. Responder (sem devolver a password)
  const { password: _, ...userSafe } = newUser
  res.status(201).json({ message: 'Conta criada com sucesso!', user: userSafe })
})

export default router