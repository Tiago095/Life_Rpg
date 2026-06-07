import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import exerciseImg  from '../assets/MissionImage/Exercise.png'
import focusImg     from '../assets/MissionImage/Focos.png'
import organizationImg from '../assets/MissionImage/Organization.webp'
import socialImg from '../assets/MissionImage/Social.webp'
import creativeImg from '../assets/MissionImage/Creativity.webp'
import financeImg from '../assets/MissionImage/Finance.webp'
import healthImg from '../assets/MissionImage/Health.webp'
import technicalImg from '../assets/MissionImage/Technical.webp'

const RANK_BY_XP = (xp) => {
  if (xp >= 200) return { rank: 'S', rankColor: 'var(--color-primary)' }
  if (xp >= 150) return { rank: 'A', rankColor: '#f59e0b' }
  if (xp >= 100) return { rank: 'B', rankColor: '#10b981' }
  return { rank: 'C', rankColor: '#64748b' }
}

const SKILL_IMAGE = {
  'Exercise':    exerciseImg,
  'Mindfulness': focusImg,
  'Studies':     'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80',
  'Organization': organizationImg,
  'Social':      socialImg,
  'Creativity':    creativeImg,
  'Finance':       financeImg,
  'Health':        healthImg,
  'Technical':     technicalImg,
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

          const skillName = userMission?.skill?.name ?? skillMap[mission.skill_id]

        return {
          id:          userMission?.id ?? `available-${mission.id}`,
          mission_id:  mission.id,
          type:        userMission?.type ?? null,
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
          image: SKILL_IMAGE[skillName] ?? VISUAL_DEFAULTS.image,
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
          ...availableTemplates
            .filter(m => !acceptedMissionIds.has(m.id))
            .map(m => transform(m, null)),

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

  const acceptMission = async (missionId, force = false) => {
    const token = localStorage.getItem('token')

    if (!force) {
      const activeSecondary = quests.inProgress.filter(q => q.type === 'secondary')
      if (activeSecondary.length >= 3) {
        const oldest = [...activeSecondary].sort((a, b) =>
          new Date(a.accepted_at) - new Date(b.accepted_at)
        )[0]
        return { needsConfirmation: true, oldest }
      }
    }

    const res = await fetch(`http://localhost:3000/api/missions/${missionId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      const err = await res.json()
      console.error('Erro ao aceitar missão:', err)
      return null
    }
    const data = await res.json()
    fetchQuests()
    return { success: true, data }
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
    return { completed: data.completed, itemAwarded: data.itemAwarded ?? null }
  }

  const abandonMission = async (userMissionId) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`http://localhost:3000/api/missions/${userMissionId}/abandon`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    console.error('Erro ao abandonar missão:', await res.json())
    return false
  }
  fetchQuests()
  return true
}

  return { quests, loading, acceptMission, toggleObjective, fetchQuests, abandonMission }
}