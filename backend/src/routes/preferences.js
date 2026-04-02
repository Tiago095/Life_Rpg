import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { savePreferences, getSkills } from '../controllers/preferencesController.js'

const router = Router()
const JWT_SECRET = 'liferpg-secret-key'

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autenticado.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId // disponível nos controllers
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

router.post('/', requireAuth, savePreferences)
router.get('/skills', getSkills)

export default router