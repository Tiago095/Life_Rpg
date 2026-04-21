import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { savePreferences, getSkills } from '../controllers/preferencesController.js'

const router = Router()

router.post('/', requireAuth, savePreferences)
router.get('/skills', getSkills)

export default router