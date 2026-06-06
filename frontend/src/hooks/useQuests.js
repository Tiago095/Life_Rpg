import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'

const RANK_BY_XP = (xp) => {
  if (xp >= 200) return { rank: 'S', rankColor: 'var(--color-primary)' }
  if (xp >= 150) return { rank: 'A', rankColor: '#f59e0b' }
  if (xp >= 100) return { rank: 'B', rankColor: '#10b981' }
  return { rank: 'C', rankColor: '#64748b' }
}

const VISUAL_DEFAULTS = {
  time: '—',
  successRate: '—%',
  image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80',
}

export function useQuests() {
  const { user, updateUser } = useUser()
  const [quests, setQuests] = useState({ inProgress: [], available: [], completed: [] })
  const [loading, setLoading] = useState(true)

  const fetchQuests = () => {
    const token = localStorage.getItem('token')
    if (!token || !user?.skills?.length) { setLoading(false); return }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch('http://localhost:3000/api/missions',      { headers }).then(r => r.json()),
      fetch('http://localhost:3000/api/missions/user', { headers }).then(r => r.json()),
      fetch('http://localhost:3000/api/skills',        { headers }).then(r => r.json()),
    ]).then(([missions, userMissions, skills]) => {
      fetch('http://localhost:3000/api/skills',        { headers }).then(r => r.json()),
    ]).then(([missions, userMissions, skills]) => {

      const skillMap = Object.fromEntries(skills.map(s => [s.id, s.name]))
      const acceptedMissionIds = new Set(userMissions.map(um => um.mission_id))
      const availableTemplates = missions
        .filter(m => !m.daily)
        .filter(m => user.skills.some(us => us.skillId === m.skill_id))

      const transform = (mission, userMission = null) => {
        const progress = userMission
          ? Math.round(
              userMission.objectives_progress.filter(o => o.completed).length /
              userMission.objectives_progress.length * 100
            )
          : 0

        const skillName = userMission?.skill?.name ?? skillsMap[mission.skill_id] ?? 'Unknown'

        return {
          id:          userMission?.id ?? `available-${mission.id}`,
          mission_id:  mission.id,
          ...RANK_BY_XP(mission.xp_reward),
          category:    userMission?.skill?.name ?? skillMap[mission.skill_id] ?? mission.skill_id,
          title:       mission.title,
          description: mission.description,
          xp:          mission.xp_reward,
          progress,
          progressLabel: userMission?.status === 'completed' ? 'COMPLETED'
                       : userMission?.status === 'abandoned' ? 'ABANDONED'
                       : userMission                         ? 'IN PROGRESS'
                       : 'NOT STARTED',
          image:       VISUAL_DEFAULTS.image,
          time:        mission.estimated_time  ?? VISUAL_DEFAULTS.time,
          successRate: mission.success_rate != null
                      ? `${mission.success_rate}%`
                      : VISUAL_DEFAULTS.successRate,
          completedAt: userMission?.completed_at ?? null,
          objectives: mission.objectives.map(obj => {
            const prog = userMission?.objectives_progress.find(p => p.objective_id === obj.id)
            return {
              id:    obj.id,
              done:  prog?.completed ?? false,
              label: obj.description,
              sub:   '',
            }
          }),
        }
      }

      setQuests({
        inProgress: userMissions
          .filter(um => um.status === 'active')
          .map(um => transform(um.mission, um))
          .filter(Boolean),

        completed: userMissions
          .filter(um => um.status === 'completed')
          .map(um => transform(um.mission, um))
          .filter(Boolean),

        available: [
          // Missões globais que o utilizador nunca aceitou e que correspondem às suas skills
          ...availableTemplates
            .filter(m => !acceptedMissionIds.has(m.id))
            .map(m => transform(m, null)),

          // ← Missões diárias secundárias à espera de ser aceites
          ...userMissions
            .filter(um => um.status === 'available')
            .map(um => transform(um.mission, um))
            .filter(Boolean)
        ]
      })
    })
    .catch(err => console.error('useQuests error:', err))
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user) fetchQuests()
  }, [user])

  const acceptMission = async (missionId) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:3000/api/missions/${missionId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      const err = await res.json()
      console.error('Erro ao aceitar missão:', err)
      return false
    }
    fetchQuests()
    return true
  }

const toggleObjective = async (userMissionId, objectiveId) => {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `http://localhost:3000/api/missions/${userMissionId}/objective/${objectiveId}`,
    { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) {
    console.error('Erro ao atualizar objetivo:', await res.json())
    return null
  }
  const data = await res.json()

  if (data.completed) {
    const meRes = await fetch('http://localhost:3000/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (meRes.ok) {
      const meData = await meRes.json()
      updateUser(meData.user)
    }
  }

  fetchQuests()
  // Devolve completed + itemAwarded para o componente usar
  return { completed: data.completed, itemAwarded: data.itemAwarded ?? null }
}

  return { quests, loading, acceptMission, toggleObjective, fetchQuests }
}