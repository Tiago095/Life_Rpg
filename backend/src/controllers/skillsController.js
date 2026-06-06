import db from '../db.js'

export const getSkills = async (req, res) => {
  await db.read()
  res.json(db.data.skills)
}

export const getSkillPoints = async (req, res) => {
  try {
    await db.read()
    const user = db.data.users.find(u => u.id === req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.skillPoints === undefined) {
      user.skillPoints = 4
      await db.write()
    }

    return res.json({ skillPoints: user.skillPoints })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export const updateUserSkills = async (req, res) => {
  try {
    await db.read()
    const { skills } = req.body

    const user = db.data.users.find(u => u.id === req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (!Array.isArray(skills)) return res.status(400).json({ error: 'Invalid skills format' })

    if (user.skillPoints === undefined) user.skillPoints = 4

    const oldSkills = user.skills || []
    const spGasto = skills.reduce((acc, s) => {
      const oldRank = oldSkills.find(o => o.skillId === s.skillId)?.rank ?? 0
      return acc + (Number(s.rank) - oldRank)
    }, 0)

    if (spGasto > user.skillPoints) {
      return res.status(400).json({ error: 'Not enough skill points' })
    }

    user.skillPoints -= spGasto
    user.skills = skills.map(s => ({
      skillId: s.skillId,
      rank: Number(s.rank) || 0,
    }))

    await db.write()

    return res.json({ success: true, skills: user.skills, skillPoints: user.skillPoints })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}