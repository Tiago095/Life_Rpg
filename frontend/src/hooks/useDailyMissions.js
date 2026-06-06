import { useEffect, useState, useRef } from 'react'
import { CreateMLCEngine } from '@mlc-ai/web-llm'

const SYSTEM_PROMPT = `You are a quest generator for a self-improvement RPG app.
Always respond with ONLY valid JSON, no markdown, no extra text.
Format:
{
  "title": "string (max 6 words)",
  "description": "string (max 15 words)",
  "xp_reward": number between 50 and 200,
  "estimated_time": "string (e.g. '15 min', '1 hour')",
  "success_rate": number between 40 and 95,
  "objectives": [
    { "id": 1, "description": "string" },
    { "id": 2, "description": "string" },
    { "id": 3, "description": "string" }
  ]
}`

async function generateOne(engine, skillName, type, level) {
  const typeHint = type === 'main'
    ? 'a challenging main quest with meaningful objectives'
    : 'a quick side quest that takes less than 30 minutes'

  const difficultyHint =
    level <= 2 ? 'easy difficulty, simple and short objectives' :
    level <= 4 ? 'medium difficulty, moderately challenging objectives' :
                 'hard difficulty, demanding and ambitious objectives'

  try {
    const reply = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content:
          `Generate ${typeHint} for the skill: ${skillName}. ` +
          `The player is level ${level}, so use ${difficultyHint}. ` +
          `Adjust xp_reward accordingly.`
        }
      ],
      temperature: 0.8,
      max_tokens: 300,
      stream: false,
    })

    const text = reply.choices[0].message.content
    console.log('[LLM] resposta raw:', text)

    // Delay para permitir garbage collection GPU
    await new Promise(r => setTimeout(r, 300))

    return parseResponse(text)
  } catch (err) {
    console.error('[LLM] erro na geração:', err.message)
    // Se o objeto foi disposto, sinaliza para recriar o engine
    if (err.message?.includes('disposed')) {
      throw new Error('ENGINE_DISPOSED')
    }
    throw err
  }
}

function parseResponse(text) {

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
      if (result) return result
    } catch { /* tenta o próximo */ }
  }

  console.warn('[LLM] falhou o parse')
  return null
}

// Singleton — evita múltiplas instâncias WebGPU
let enginePromise = null

export function useDailyMissions(user, onDone) {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState('')
  const hasRun = useRef(false)

  useEffect(() => {
    hasRun.current = false
  }, [user?.id])

  useEffect(() => {
    if (hasRun.current) return
    if (!user) return
    if (!user.skills?.length) return

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
      const userSkills = allSkills.filter(s => user.skills.some(us => us.skillId === s.id))

      const umRes = await fetch('http://localhost:3000/api/missions/user', { headers })
      const userMissions = await umRes.json()

      setStatus('loading-model')
      console.log('[DailyMissions] a carregar modelo...')

      // Reutiliza a promise se já está a carregar — evita duas instâncias WebGPU
      if (!enginePromise) {
        enginePromise = CreateMLCEngine(
          'Llama-3.2-3B-Instruct-q4f16_1-MLC',
          { initProgressCallback: (p) => {
            console.log('[DailyMissions] modelo:', p.text)
            setProgress(p.text)
          }}
        )
      }
      let engine = await enginePromise

      setStatus('generating')
      const toCreate = []

      const totalActiveMain = userMissions.filter(
        um => um.status === 'active' && um.type === 'main'
      ).length
      const mainNeeded = Math.max(0, 3 - totalActiveMain)
      console.log(`[DailyMissions] principais ativas: ${totalActiveMain}, a gerar: ${mainNeeded}`)

      for (let i = 0; i < mainNeeded; i++) {
        const randomSkill = userSkills[Math.floor(Math.random() * userSkills.length)]
        setProgress(`Generating main quest ${i + 1}/${mainNeeded}...`)
        let mission = null, tries = 0
        while (!mission && tries < 3) {
          try {
            mission = await generateOne(engine, randomSkill.name, 'main', user.level)
          } catch (err) {
            if (err.message === 'ENGINE_DISPOSED') {
              // Recria o engine se foi disposto
              enginePromise = null
              enginePromise = CreateMLCEngine(
                'Llama-3.2-3B-Instruct-q4f16_1-MLC',
                { initProgressCallback: (p) => console.log('[DailyMissions] modelo:', p.text) }
              )
              engine = await enginePromise
            }
            tries++
            if (tries >= 3) throw err
          }
        }
        if (mission) toCreate.push({ ...mission, skill_id: randomSkill.id, type: 'main' })
        await new Promise(r => setTimeout(r, 500))  // delay entre quests
      }

      for (const skill of userSkills) {
        setProgress(`Generating secondary quest for ${skill.name}...`)
        let mission = null, tries = 0
        while (!mission && tries < 3) {
          try {
            mission = await generateOne(engine, skill.name, 'secondary', user.level)
          } catch (err) {
            if (err.message === 'ENGINE_DISPOSED') {
              // Recria o engine se foi disposto
              enginePromise = null
              enginePromise = CreateMLCEngine(
                'Llama-3.2-3B-Instruct-q4f16_1-MLC',
                { initProgressCallback: (p) => console.log('[DailyMissions] modelo:', p.text) }
              )
              engine = await enginePromise
            }
            tries++
            if (tries >= 3) throw err
          }
        }
        if (mission) toCreate.push({ ...mission, skill_id: skill.id, type: 'secondary' })
        await new Promise(r => setTimeout(r, 500))  // delay entre quests
      }

      await fetch('http://localhost:3000/api/missions/daily', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ missions: toCreate })
      })

      // Cleanup do modelo para liberar memória GPU
      try {
        if (engine && engine.unload) {
          await engine.unload()
          enginePromise = null
          console.log('[DailyMissions] modelo descarregado')
        }
      } catch (e) {
        console.warn('[DailyMissions] erro ao descarregar:', e.message)
      }

      setStatus('done')
      setProgress('')
      console.log('[DailyMissions] concluído!')
      if (onDone) onDone()
    }

    run().catch(err => {
      console.error('[DailyMissions] ERRO:', err)
      enginePromise = null  // reset para tentar novamente
      hasRun.current = false
      setStatus('error')
    })
  }, [user?.id, user?.skills?.length])

  return { status, progress }
}