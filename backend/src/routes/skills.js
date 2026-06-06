import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getSkills, getSkillPoints, updateUserSkills } from '../controllers/skillsController.js'

const router = Router()

router.get('/',       requireAuth, getSkills)
router.get('/points', requireAuth, getSkillPoints)
router.put('/',       requireAuth, updateUserSkills)

export default router