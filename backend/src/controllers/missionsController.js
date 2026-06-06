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

  const existingIndex = db.data.user_missions.findIndex(
    um => um.user_id === req.userId &&
          um.mission_id === Number(missionId) &&
          um.status === 'available'
  )

  if (existingIndex !== -1) {
    // Limite de missões ativas (também para secundárias diárias)
    const MAX_ACTIVE = 6
    const activeMissions = db.data.user_missions
      .filter(um => um.user_id === req.userId && um.status === 'active')
      .sort((a, b) => new Date(a.accepted_at) - new Date(b.accepted_at))

    if (activeMissions.length >= MAX_ACTIVE) {
      const oldest = activeMissions[0]
      const oldestIndex = db.data.user_missions.findIndex(um => um.id === oldest.id)
      db.data.user_missions[oldestIndex].status = 'abandoned'
      db.data.user_missions[oldestIndex].abandoned_reason = 'auto_limit'
    }

    db.data.user_missions[existingIndex].status = 'active'
    db.data.user_missions[existingIndex].accepted_at = new Date().toISOString()
    await db.write()
    return res.json({ ...db.data.user_missions[existingIndex], autoAbandoned: activeMissions.length >= MAX_ACTIVE })
  }

  const alreadyActive = db.data.user_missions.find(
    um => um.user_id === req.userId &&
          um.mission_id === Number(missionId) &&
          um.status === 'active'
  )
  if (alreadyActive)
    return res.status(400).json({ code: 'MISSION_ALREADY_ACTIVE' })

  // Limite de missões ativas
  const MAX_ACTIVE = 6
  const activeMissions = db.data.user_missions
    .filter(um => um.user_id === req.userId && um.status === 'active')
    .sort((a, b) => new Date(a.accepted_at) - new Date(b.accepted_at))

  let autoAbandoned = null
  if (activeMissions.length >= MAX_ACTIVE) {
    const oldest = activeMissions[0]
    const oldestIndex = db.data.user_missions.findIndex(um => um.id === oldest.id)
    db.data.user_missions[oldestIndex].status = 'abandoned'
    db.data.user_missions[oldestIndex].abandoned_reason = 'auto_limit'
    autoAbandoned = oldest
  }

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
  res.status(201).json({ ...newUserMission, autoAbandoned })
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

  let itemAwarded = null

  const allDone = um.objectives_progress.every(o => o.completed)
  if (allDone) {
    um.status = 'completed'
    um.completed_at = new Date().toISOString()

    const mission   = db.data.missions.find(m => m.id === um.mission_id)
    const userIndex = db.data.users.findIndex(u => u.id === req.userId)

    if (mission && userIndex !== -1) {
      const user = db.data.users[userIndex]

    try {
      const bonusPercent = calculateXpBonus(user, mission, db.data) || 0;
      const finalXp = mission.xp_reward * (1 + bonusPercent / 100);
      user.xp += finalXp;
      user.skillPoints = (user.skillPoints ?? 0) + 1
    } catch (err) {
      console.error('Erro ao calcular bonus XP:', err)
    }

      const levels   = db.data.levels.sort((a, b) => b.level - a.level)
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

    // --- Calcula drop bonus das skills ---
    const dropBonus = (user.skills ?? []).reduce((total, us) => {
      const perks = db.data.skillPerks.filter(
        p => p.skillId === us.skillId &&
            p.effectType === 'drop_percent' &&
            us.rank >= p.requiredRank
      )
      return total + perks.reduce((sum, p) => sum + p.value, 0)
    }, 0)

    // --- Sorteio de item ---
    const items = db.data.items

    // Com dropBonus, tira de common e uncommon e distribui por rare+
    const baseWeights = {
      common:    50,
      uncommon:  28,
      rare:      14,
      epic:       6,
      legendary:  2,
    }

    // Distribui o bonus proporcionalmente pelas raridades premium (rare, epic, legendary)
    const premiumTotal = baseWeights.rare + baseWeights.epic + baseWeights.legendary  // 22
    const bonusCapped = Math.min(dropBonus, 40)  // cap de 40% para não tornar common impossível

    const rarityWeights = {
      common:    Math.max(5,  baseWeights.common    - bonusCapped * 0.6),
      uncommon:  Math.max(5,  baseWeights.uncommon  - bonusCapped * 0.4),
      rare:      baseWeights.rare      + bonusCapped * (baseWeights.rare      / premiumTotal),
      epic:      baseWeights.epic      + bonusCapped * (baseWeights.epic      / premiumTotal),
      legendary: baseWeights.legendary + bonusCapped * (baseWeights.legendary / premiumTotal),
    }

    // Constrói pool ponderada (arredonda para inteiros)
    const pool = items.flatMap(item =>
      Array(Math.round(rarityWeights[item.rarity] ?? 10)).fill(item)
    )
    const winner = pool[Math.floor(Math.random() * pool.length)]

      // Adiciona ao inventário do utilizador
      if (!user.inventory) user.inventory = []

      const existing = user.inventory.find(i => i.itemId === winner.id)
      if (existing) {
        existing.quantity = (existing.quantity ?? 1) + 1
      } else {
        user.inventory.push({
          itemId:   winner.id,
          quantity: 1,
        })
      }

      itemAwarded = winner   // devolve ao frontend
      db.data.users[userIndex] = user
    }
  }

  db.data.user_missions[umIndex] = um
  await db.write()

  res.json({ userMission: um, completed: allDone, itemAwarded })
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
      estimated_time: m.estimated_time ?? null,   // ← novo
      success_rate: m.success_rate ?? null,        // ← novo
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