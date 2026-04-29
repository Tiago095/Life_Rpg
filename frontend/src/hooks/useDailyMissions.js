import { useEffect, useState, useRef } from 'react'
import { CreateMLCEngine } from '@mlc-ai/web-llm'

const SYSTEM_PROMPT = `You are a quest generator for a self-improvement RPG app.
Always respond with ONLY valid JSON, no markdown, no extra text.
Format:
{
  "title": "string (max 6 words)",
  "description": "string (max 15 words)",
  "xp_reward": number between 50 and 200,
  "objectives": [
    { "id": 1, "description": "string" },
    { "id": 2, "description": "string" },
    { "id": 3, "description": "string" }
  ]
}`

async function generateOne(engine, skillName, type) {
  const typeHint = type === 'main'
    ? 'a challenging main quest with meaningful objectives'
    : 'a quick side quest that takes less than 30 minutes'

  const reply = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Generate ${typeHint} for the skill: ${skillName}` }
    ],
    temperature: 0.8,
    max_tokens: 350,
    stream: false,
  })

  const text = reply.choices[0].message.content
  console.log('[LLM] resposta raw:', text)  // ← log da LLM

  const attempts = [
    () => JSON.parse(text),
    () => JSON.parse(text.trim()),
    () => { const m = text.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null },
    () => { const clean = text.replace(/```json|```/g, '').trim(); return JSON.parse(clean) },
    () => {
      const m = text.match(/\{[\s\S]*\}/)
      if (!m) return null
      const clean = m[0]
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
        .replace(/,\s*([}\]])/g, '$1')
      return JSON.parse(clean)
    }
  ]

  for (const attempt of attempts) {
    try {
      const result = attempt()
      if (result) {
        console.log('[LLM] parsed com sucesso:', result)
        return result
      }
    } catch { /* tenta o próximo */ }
  }

  console.warn('[LLM] falhou o parse, a tentar novamente')
  return null
}

export function useDailyMissions(user, onDone) {  // ← onDone callback novo
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState('')
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    console.log('[DailyMissions] useEffect disparou, user:', user)
    if (!user) { console.log('[DailyMissions] sem user'); return }
    if (!user.skills?.length) { console.log('[DailyMissions] sem skills:', user); return }

    hasRun.current = true

    const run = async () => {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      setStatus('checking')
      const statusRes = await fetch('http://localhost:3000/api/missions/daily/status', { headers })
      const { generated } = await statusRes.json()
      console.log('[DailyMissions] já gerado hoje?', generated)
      if (generated) { setStatus('done'); return }

      const skillsRes = await fetch('http://localhost:3000/api/skills', { headers })
      const allSkills = await skillsRes.json()
      const userSkills = allSkills.filter(s => user.skills.includes(s.id))
      console.log('[DailyMissions] skills:', userSkills.map(s => s.name))

      const umRes = await fetch('http://localhost:3000/api/missions/user', { headers })
      const userMissions = await umRes.json()

      setStatus('loading-model')
      console.log('[DailyMissions] a carregar modelo...')
      const engine = await CreateMLCEngine(
        'Llama-3.2-3B-Instruct-q4f16_1-MLC',
        { initProgressCallback: (p) => {
          console.log('[DailyMissions] modelo:', p.text)
          setProgress(p.text)
        }}
      )
      console.log('[DailyMissions] modelo pronto!')

      setStatus('generating')
      const toCreate = []

      // 3 missões principais no total
      const totalActiveMain = userMissions.filter(
        um => um.status === 'active' && um.type === 'main'
      ).length
      const mainNeeded = Math.max(0, 3 - totalActiveMain)
      console.log(`[DailyMissions] principais ativas: ${totalActiveMain}, a gerar: ${mainNeeded}`)

      for (let i = 0; i < mainNeeded; i++) {
        const randomSkill = userSkills[Math.floor(Math.random() * userSkills.length)]
        setProgress(`Generating main quest ${i + 1}/${mainNeeded}...`)
        console.log(`[DailyMissions] a gerar principal ${i + 1} para skill: ${randomSkill.name}`)
        let mission = null, tries = 0
        while (!mission && tries < 3) {
          mission = await generateOne(engine, randomSkill.name, 'main')
          tries++
        }
        if (mission) toCreate.push({ ...mission, skill_id: randomSkill.id, type: 'main' })
      }

      // 1 missão secundária por skill
      for (const skill of userSkills) {
        setProgress(`Generating secondary quest for ${skill.name}...`)
        console.log(`[DailyMissions] a gerar secundária para skill: ${skill.name}`)
        let mission = null, tries = 0
        while (!mission && tries < 3) {
          mission = await generateOne(engine, skill.name, 'secondary')
          tries++
        }
        if (mission) toCreate.push({ ...mission, skill_id: skill.id, type: 'secondary' })
      }

      console.log('[DailyMissions] a guardar', toCreate.length, 'missões...')
      const saveRes = await fetch('http://localhost:3000/api/missions/daily', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ missions: toCreate })
      })
      console.log('[DailyMissions] guardado, status:', saveRes.status)

      setStatus('done')
      setProgress('')
      console.log('[DailyMissions] concluído!')

      // ← notifica o useQuests para refazer o fetch
      if (onDone) onDone()
    }

    run().catch(err => {
      console.error('[DailyMissions] ERRO:', err)
      hasRun.current = false
      setStatus('error')
    })
  }, [user?.id])

  return { status, progress }
}