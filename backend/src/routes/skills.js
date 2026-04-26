import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import db from '../db.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  await db.read()
  res.json(db.data.skills)
})

export default router