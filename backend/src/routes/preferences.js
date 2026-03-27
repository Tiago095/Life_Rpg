import { Router } from 'express'
import { savePreferences, getSkills } from '../controllers/preferencesController.js'

const router = Router()

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado.' })
  }
  next()
}

router.post('/', requireAuth, savePreferences)
router.get('/skills', getSkills)

export default router