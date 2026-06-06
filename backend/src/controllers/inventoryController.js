import db from '../db.js'

const SKILL_UNLOCKS = {
  Exercise:     ['bodygear', 'boots'],
  Studies:      ['headgear'],
  Organization: ['utility'],
  Social:       ['gloves'],
  Mindfulness:  ['utility', 'consumable'],
  Creativity:   ['headgear', 'consumable'],
  Finance:      ['utility'],
  Health:       ['bodygear', 'consumable'],
  Technical:    ['gloves'],
}

export const getInventory = async (req, res) => {
  await db.read()

  const user = db.data.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' })

  const userSkillIds  = (user.skills || []).map(s => s.skillId)
  const activeSkills  = db.data.skills
    .filter(s => userSkillIds.includes(s.id))
    .map(s => s.name)

  const unlockedSlots = activeSkills.length > 0
    ? [...new Set(activeSkills.flatMap(name => SKILL_UNLOCKS[name] || []))]
    : null

  const equippedSlots     = user.equippedSlots     || {}
  const userInventory     = user.inventory         || []
  const activeConsumables = user.activeConsumables || {}

  const items = db.data.items
    .filter(item => {
      const invEntry = userInventory.find(inv => inv.itemId === item.id)
      return invEntry && invEntry.quantity > 0
    })
    .map(item => {
      const invEntry = userInventory.find(inv => inv.itemId === item.id)
      const active   = activeConsumables[item.id]
      return {
        ...item,
        quantity: invEntry.quantity,
        charges: invEntry.charges,
        isEquipped: Object.values(equippedSlots).includes(item.id),
        equippedInSlot: Object.keys(equippedSlots).find(slot => equippedSlots[slot] === item.id) || null,
        isActive: !!active,
        activeCharges: active?.charges ?? null,
      }
    })
    .filter(item => item.quantity > 0)

  res.json({ items, unlockedSlots, totalItems: items.length })
}

export const getEquipped = async (req, res) => {
  await db.read()

  const user = db.data.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' })

  const equippedSlots = user.equippedSlots || {}
  const ALL_SLOTS     = ['headgear', 'bodygear', 'gloves', 'utility', 'boots']

  const equipped = {}
  for (const slot of ALL_SLOTS) {
    const itemId   = equippedSlots[slot] || null
    equipped[slot] = itemId
      ? (db.data.items.find(i => i.id === itemId) || null)
      : null
  }

  res.json({ equipped })
}

export const getActiveConsumables = async (req, res) => {
  await db.read()

  const user = db.data.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' })

  const active = user.activeConsumables || {}

  const activeConsumables = Object.values(active)
    .map(a => {
      const item = db.data.items.find(i => i.id === a.itemId)
      if (!item) return null
      return { ...item, activeCharges: a.charges }
    })
    .filter(Boolean)

  res.json({ activeConsumables })
}

export const equipItem = async (req, res) => {
  const { itemId } = req.body
  if (!itemId) return res.status(400).json({ code: 'ITEM_ID_REQUIRED' })

  await db.read()

  const user = db.data.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' })

  const item = db.data.items.find(i => i.id === itemId)
  if (!item) return res.status(404).json({ code: 'ITEM_NOT_FOUND' })

  if (item.category === 'consumable')
    return res.status(400).json({ code: 'CONSUMABLE_CANNOT_BE_EQUIPPED' })

  if (!user.equippedSlots) user.equippedSlots = {}

  const previousItemId = user.equippedSlots[item.slot] || null
  user.equippedSlots[item.slot] = itemId

  const userIndex = db.data.users.findIndex(u => u.id === req.userId)
  db.data.users[userIndex] = user
  await db.write()

  res.json({
    message: `${item.name} equipped in [${item.slot}]`,
    slot: item.slot,
    equipped: item,
    previousItem: previousItemId
      ? (db.data.items.find(i => i.id === previousItemId) || null)
      : null,
  })
}

export const unequipItem = async (req, res) => {
  const { slot } = req.body
  if (!slot) return res.status(400).json({ code: 'SLOT_REQUIRED' })

  await db.read()

  const user = db.data.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' })

  const equippedSlots = user.equippedSlots || {}
  const itemId        = equippedSlots[slot]

  if (!itemId)
    return res.status(400).json({ code: 'SLOT_ALREADY_EMPTY' })

  delete equippedSlots[slot]
  user.equippedSlots = equippedSlots

  const userIndex = db.data.users.findIndex(u => u.id === req.userId)
  db.data.users[userIndex] = user
  await db.write()

  res.json({
    message: `Slot [${slot}] cleared`,
    slot,
    unequippedItem: db.data.items.find(i => i.id === itemId) || null,
  })
}

export const consumeItem = async (req, res) => {
  const { itemId } = req.body
  if (!itemId) return res.status(400).json({ code: 'ITEM_ID_REQUIRED' })

  await db.read()

  const user = db.data.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' })

  const inventoryItem = (user.inventory || []).find(i => i.itemId === itemId)
  if (!inventoryItem) return res.status(404).json({ code: 'ITEM_NOT_IN_INVENTORY' })
  if (inventoryItem.quantity <= 0) return res.status(400).json({ code: 'ITEM_OUT_OF_STOCK' })

  const item = db.data.items.find(i => i.id === itemId)
  if (!item) return res.status(404).json({ code: 'ITEM_NOT_FOUND' })
  if (item.category !== 'consumable')
    return res.status(400).json({ code: 'ITEM_NOT_CONSUMABLE' })

  if (!user.activeConsumables) user.activeConsumables = {}

  const chargesToAdd = item.chargesMax ?? inventoryItem.charges ?? 1

  if (user.activeConsumables[itemId]) {
    user.activeConsumables[itemId].charges += chargesToAdd
  } else {
      user.activeConsumables[itemId] = {
      itemId,
      charges: chargesToAdd,
      activatedAt: Date.now(),
    }
  }

  inventoryItem.quantity -= 1
  if (inventoryItem.quantity <= 0) {
    user.inventory = user.inventory.filter(i => i.itemId !== itemId)
  }

  const activeCharges = user.activeConsumables[itemId].charges

  const userIndex = db.data.users.findIndex(u => u.id === req.userId)
  db.data.users[userIndex] = user
  await db.write()

  res.json({
    message: `${item.name} now has ${activeCharges} active charge(s)`,
    item,
    activeCharges,
  })
}

export const spendConsumableCharges = async (req, res) => {
  await db.read()

  const user = db.data.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' })

  if (!user.activeConsumables) user.activeConsumables = {}

  const spent   = []
  const expired = []

  for (const [itemId, active] of Object.entries(user.activeConsumables)) {
    active.charges -= 1
    const item = db.data.items.find(i => i.id === itemId)

    if (active.charges <= 0) {
      delete user.activeConsumables[itemId]
      user.inventory = (user.inventory || []).filter(i => i.itemId !== itemId)
      expired.push({ id: itemId, name: item?.name || itemId })
    } else {
      spent.push({ id: itemId, name: item?.name || itemId, chargesLeft: active.charges })
    }
  }

  const userIndex = db.data.users.findIndex(u => u.id === req.userId)
  db.data.users[userIndex] = user
  await db.write()

  res.json({ spent, expired })
}