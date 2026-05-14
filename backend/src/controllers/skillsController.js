import db from '../db.js'

export const getSkillPoints = async (req, res) => {
  try {
    const userId = req.userId
    const user = db.data.users.find(u => u.id === userId)
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
    const userId = req.userId
    const { skills } = req.body

    if (!userId) return res.status(401).json({ error: 'No user' })
    if (!Array.isArray(skills)) return res.status(400).json({ error: 'Invalid skills format' })

    const user = db.data.users.find(u => u.id === userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

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