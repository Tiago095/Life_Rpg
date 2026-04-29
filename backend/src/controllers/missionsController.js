import db from '../db.js'


// GET /api/missions — todas as missões disponíveis (templates)
export const getMissions = async (req, res) => {
  await db.read()
  res.json(db.data.missions)
}

// GET /api/missions/user — missões do utilizador autenticado
export const getUserMissions = async (req, res) => {
  await db.read()

  const userMissions = db.data.user_missions.filter(um => um.user_id === req.userId)

  // Join com os dados da missão
  const enriched = userMissions.map(um => {
    const mission = db.data.missions.find(m => m.id === um.mission_id)
    const skill   = db.data.skills.find(s => s.id === mission?.skill_id)
    return { ...um, mission, skill }
  })

  res.json(enriched)
}

// POST /api/missions/:missionId/accept — aceitar uma missão
export const acceptMission = async (req, res) => {
  const { missionId } = req.params
  await db.read()

  const mission = db.data.missions.find(m => m.id === Number(missionId))
  if (!mission)
    return res.status(404).json({ code: 'MISSION_NOT_FOUND' })

  // Verifica se já existe como 'available' (missão secundária diária)
  const existingIndex = db.data.user_missions.findIndex(
    um => um.user_id === req.userId &&
          um.mission_id === Number(missionId) &&
          um.status === 'available'
  )

  if (existingIndex !== -1) {
    // Muda de 'available' para 'active'
    db.data.user_missions[existingIndex].status = 'active'
    db.data.user_missions[existingIndex].accepted_at = new Date().toISOString()
    await db.write()
    return res.json(db.data.user_missions[existingIndex])
  }

  // Verifica se já está ativa
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

// PATCH /api/missions/:userMissionId/objective/:objectiveId — marcar objetivo
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

  // Verificar se todos os objetivos estão completos
  const allDone = um.objectives_progress.every(o => o.completed)
if (allDone) {
  um.status = 'completed'
  um.completed_at = new Date().toISOString()

  const mission = db.data.missions.find(m => m.id === um.mission_id)
  const userIndex = db.data.users.findIndex(u => u.id === req.userId)

  if (mission && userIndex !== -1) {
    const user = db.data.users[userIndex]
    user.xp += mission.xp_reward

    // Level up
    const levels = db.data.levels.sort((a, b) => b.level - a.level)
    const newLevel = levels.find(l => user.xp >= l.xp_required)
    if (newLevel && newLevel.level > user.level) {
      user.level = newLevel.level
    }

    db.data.users[userIndex] = user
  }
}

  db.data.user_missions[umIndex] = um
  await db.write()

  res.json({ userMission: um, completed: allDone })
}

// PATCH /api/missions/:userMissionId/abandon — abandonar missão
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

// Verifica se já foram geradas missões hoje
export const getDailyStatus = async (req, res) => {
  await db.read()
  const today = new Date().toISOString().split('T')[0]

  const todayMissions = db.data.user_missions.filter(
    um => um.user_id === req.userId && um.daily_date === today
  )

  res.json({ generated: todayMissions.length > 0 })
}

// Guarda as missões diárias geradas pelo WebLLM
export const saveDailyMissions = async (req, res) => {
  await db.read()
  const today = new Date().toISOString().split('T')[0]
  const { missions } = req.body

  // Apaga missões secundárias disponíveis do dia anterior
  db.data.user_missions = db.data.user_missions.filter(
    um => !(
      um.user_id === req.userId &&
      um.type === 'secondary' &&
      um.status === 'available'
    )
  )

  for (const m of missions) {
    // Garante sempre 3 objetivos
    const objectives = (m.objectives || []).slice(0, 3)
    while (objectives.length < 3) {
      objectives.push({ id: objectives.length + 1, description: 'Complete the task' })
    }

    // Guarda o template
    const newMission = {
      id: Date.now() + Math.floor(Math.random() * 9999),
      title: m.title,
      description: m.description,
      skill_id: m.skill_id,
      xp_reward: m.xp_reward,
      objectives,
      daily: true,
      created_by: req.userId
    }
    db.data.missions.push(newMission)

    if (m.type === 'main') {
      // Missões principais são aceites automaticamente
      db.data.user_missions.push({
        id: crypto.randomUUID(),
        user_id: req.userId,
        mission_id: newMission.id,
        type: 'main',
        daily_date: today,
        status: 'active',
        accepted_at: new Date().toISOString(),
        completed_at: null,
        objectives_progress: objectives.map(obj => ({
          objective_id: obj.id,
          completed: false
        }))
      })
    } else {
      // Missões secundárias ficam disponíveis para o utilizador aceitar
      db.data.user_missions.push({
        id: crypto.randomUUID(),
        user_id: req.userId,
        mission_id: newMission.id,
        type: 'secondary',
        daily_date: today,
        status: 'available',  // ← utilizador tem de aceitar
        accepted_at: null,
        completed_at: null,
        objectives_progress: objectives.map(obj => ({
          objective_id: obj.id,
          completed: false
        }))
      })
    }
  }

  await db.write()
  res.status(201).json({ created: missions.length })
}