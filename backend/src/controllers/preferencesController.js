import db from '../db.js'

export const savePreferences = async (req, res) => {
  try {
    const { skillIds } = req.body

    if (!Array.isArray(skillIds) || skillIds.length < 3) {
      return res.status(400).json({ error: 'Tens de selecionar pelo menos 3 skills.' })
    }

    const numericSkillIds = skillIds.map(id => Number(id))

    await db.read()

    const validIds = db.data.skills.map(s => s.id)
    const allValid = numericSkillIds.every(id => validIds.includes(id))
    if (!allValid) {
      return res.status(400).json({ error: 'Uma ou mais skills são inválidas.' })
    }

    const user = db.data.users.find(u => u.id === req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' })
    }

    user.skills = numericSkillIds.map(id => ({ skillId: id, rank: 0 }))
    user.skillPoints = 1
    await db.write()

    res.json({ message: 'Preferências guardadas com sucesso!', skills: numericSkillIds })

  } catch (err) {
    console.error('Erro em POST /preferences:', err)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}