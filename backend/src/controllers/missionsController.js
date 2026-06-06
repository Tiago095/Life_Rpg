import db from '../db.js'
import { calculateXpBonus } from '../../util/xpCalculator.js'

export const getMissions = async (req, res) => {
  await db.read()
  res.json(db.data.missions)
}

export const getUserMissions = async (req, res) => {
  await db.read()

  const userMissions = db.data.user_missions.filter(um => um.user_id === req.userId)

  const enriched = userMissions.map(um => {
    const mission = db.data.missions.find(m => m.id === um.mission_id)
    const skill   = db.data.skills.find(s => s.id === mission?.skill_id)
    return { ...um, mission, skill }
  })

  res.json(enriched)
}

export const acceptMission = async (req, res) => {
  const { missionId } = req.params

  await db.read()

  const mission = db.data.missions.find(m => m.id === Number(missionId))
  if (!mission)
    return res.status(404).json({ code: 'MISSION_NOT_FOUND' })

  const alreadyActive = db.data.user_missions.find(
    um => um.user_id === req.userId &&
          um.mission_id === Number(missionId) &&
          um.status === 'active'
  )
  if (alreadyActive)
    return res.status(400).json({ code: 'MISSION_ALREADY_ACTIVE' })

  const newUserMission = {
    id: crypto.randomUUID(),
    user_id: req.userId,
    mission_id: Number(missionId),
    status: 'active',
    accepted_at: new Date().toISOString(),
    completed_at: null,
    objectives_progress: mission.objectives.map(obj => ({
      objective_id: obj.id,
      completed: false
    }))
  }

  db.data.user_missions.push(newUserMission)
  await db.write()

  res.status(201).json(newUserMission)
}

export const toggleObjective = async (req, res) => {
  const { userMissionId, objectiveId } = req.params

  await db.read()

  const umIndex = db.data.user_missions.findIndex(
    um => um.id === userMissionId && um.user_id === req.userId
  )
  if (umIndex === -1)
    return res.status(404).json({ code: 'USER_MISSION_NOT_FOUND' })

  const um = db.data.user_missions[umIndex]
  if (um.status !== 'active')
    return res.status(400).json({ code: 'MISSION_NOT_ACTIVE' })

  const obj = um.objectives_progress.find(o => o.objective_id === Number(objectiveId))
  if (!obj)
    return res.status(404).json({ code: 'OBJECTIVE_NOT_FOUND' })

  obj.completed = !obj.completed

  const allDone = um.objectives_progress.every(o => o.completed)
if (allDone) {
  um.status = 'completed'
  um.completed_at = new Date().toISOString()

  const mission = db.data.missions.find(m => m.id === um.mission_id)
  const userIndex = db.data.users.findIndex(u => u.id === req.userId)

  if (mission && userIndex !== -1) {
    const user = db.data.users[userIndex]

    try {
      const bonusPercent = calculateXpBonus(user, mission, db.data) || 0
      const finalXp = mission.xp_reward * (1 + bonusPercent / 100)
      user.xp += finalXp
    } catch (err) {
      console.error('Erro ao calcular bonus XP:', err)
      user.xp += mission.xp_reward
    }

    const levels = db.data.levels.sort((a, b) => b.level - a.level)
    const newLevel = levels.find(l => user.xp >= l.xp_required)
    if (newLevel && newLevel.level > user.level) {
      user.level = newLevel.level
    }

    if (user.activeConsumables) {
      for (const [itemId, active] of Object.entries(user.activeConsumables)) {
        active.charges -= 1
        if (active.charges <= 0) {
          delete user.activeConsumables[itemId]
          user.inventory = (user.inventory || []).filter(i => i.itemId !== itemId)
        }
      }
    }

    db.data.users[userIndex] = user
  }
}

  db.data.user_missions[umIndex] = um
  await db.write()

  res.json({ userMission: um, completed: allDone })
}

export const abandonMission = async (req, res) => {
  const { userMissionId } = req.params

  await db.read()

  const umIndex = db.data.user_missions.findIndex(
    um => um.id === userMissionId && um.user_id === req.userId
  )
  if (umIndex === -1)
    return res.status(404).json({ code: 'USER_MISSION_NOT_FOUND' })

  if (db.data.user_missions[umIndex].status !== 'active')
    return res.status(400).json({ code: 'MISSION_NOT_ACTIVE' })

  db.data.user_missions[umIndex].status = 'abandoned'
  await db.write()

  res.json({ message: 'Missão abandonada.' })
}