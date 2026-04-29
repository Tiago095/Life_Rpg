import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getMissions,
  getUserMissions,
  acceptMission,
  toggleObjective,
  abandonMission,
  getDailyStatus, 
  saveDailyMissions
} from '../controllers/missionsController.js'

const router = Router()

router.get('/',                                        requireAuth, getMissions)
router.get('/user',                                    requireAuth, getUserMissions)
router.post('/:missionId/accept',                      requireAuth, acceptMission)
router.patch('/:userMissionId/objective/:objectiveId', requireAuth, toggleObjective)
router.patch('/:userMissionId/abandon',                requireAuth, abandonMission)
router.get('/daily/status', requireAuth, getDailyStatus)
router.post('/daily',       requireAuth, saveDailyMissions)

export default router