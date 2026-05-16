import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { savePreferences } from '../controllers/preferencesController.js'

const router = Router()

router.post('/', requireAuth, savePreferences)

export default router