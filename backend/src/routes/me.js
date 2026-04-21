import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import db from '../db.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  await db.read()
  const user = db.data.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' })

  const { password: _, ...userSafe } = user
  res.json({ user: userSafe })
})

export default router