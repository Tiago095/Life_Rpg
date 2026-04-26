import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getMissions,
  getUserMissions,
  acceptMission,
  toggleObjective,
  abandonMission,
} from '../controllers/missionsController.js'

const router = Router()

router.get('/',                                        requireAuth, getMissions)
router.get('/user',                                    requireAuth, getUserMissions)
router.post('/:missionId/accept',                      requireAuth, acceptMission)
router.patch('/:userMissionId/objective/:objectiveId', requireAuth, toggleObjective)
router.patch('/:userMissionId/abandon',                requireAuth, abandonMission)

export default router