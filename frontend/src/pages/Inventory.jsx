import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useUser } from '../context/UserContext'
import './Inventory.css'

const SKILL_VISUAL = {
  'Exercise':     { icon: 'fitness_center',   color: '#3b82f6' },
  'Studies':      { icon: 'auto_stories',     color: '#8b5cf6' },
  'Organization': { icon: 'calendar_month',   color: '#ef4444' },
  'Social':       { icon: 'groups',           color: '#22c55e' },
  'Mindfulness':  { icon: 'self_improvement', color: '#f59e0b' },
  'Creativity':   { icon: 'palette',          color: '#ec4899' },
  'Finance':      { icon: 'savings',          color: '#14b8a6' },
  'Health':       { icon: 'favorite',         color: '#f43f5e' },
  'Technical':    { icon: 'code',             color: '#6366f1' },
}

const SKILL_PREFERENCE = {
  'Exercise':     'STRENGTH',
  'Studies':      'INTELLECT',
  'Organization': 'DISCIPLINE',
  'Social':       'CHARISMA',
  'Mindfulness':  'FOCUS',
  'Creativity':   'CREATIVITY',
  'Finance':      'WISDOM',
  'Health':       'VITALITY',
  'Technical':    'LOGIC',
}

const GEAR_SLOTS = [
  { id: 'headgear', label: 'HEADGEAR', icon: 'face',            top: '4%',  left: '50%', transform: 'translateX(-50%)' },
  { id: 'bodygear', label: 'BODY',     icon: 'shield',          top: '32%', left: '50%', transform: 'translateX(-50%)' },
  { id: 'gloves',   label: 'GLOVES',   icon: 'back_hand',       top: '38%', left: '12%', transform: undefined },
  { id: 'utility',  label: 'UTILITY',  icon: 'watch',           top: '38%', left: '72%', transform: undefined },
  { id: 'boots',    label: 'BOOTS',    icon: 'directions_walk', top: '82%', left: '50%', transform: 'translateX(-50%)' },
]

export const RARITY_COLOR = {
  COMMON:    '#64748b',
  UNCOMMON:  '#22c55e',
  RARE:      '#3b82f6',
  EPIC:      '#a855f7',
  LEGENDARY: '#f59e0b',
}

function BenefitText({ text }) {
  if (!text) return <span>No benefit description.</span>
  const parts = text.split(/(\+\d+%[^,.]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        /^\+\d+%/.test(part)
          ? <strong key={i} className="inv-benefit-highlight">{part}</strong>
          : part
      )}
    </>
  )
}

export default function Inventory() {
  const navigate    = useNavigate()
  const { user }    = useUser()

  const [tab,           setTab]          = useState('gear')
  const [selectedItem,  setSelectedItem] = useState(null)
  const [equippedSlots, setEquippedSlots]= useState({})
  const [searchQuery,   setSearchQuery]  = useState('')
  const [userSkills,    setUserSkills]   = useState([])
  const [allItems,      setAllItems]     = useState([])
  const [loading,       setLoading]      = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => {
  if (!user?.id) return
  setLoading(true)

  Promise.all([
    fetch('http://localhost:3000/api/skills', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
    fetch('http://localhost:3000/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
    fetch('http://localhost:3000/api/inventory', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
    fetch('http://localhost:3000/api/inventory/equipped', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
  ])
    .then(([allSkills, meData, invData, equippedData]) => {
      const userSkillsData = meData.user.skills || []
      const matched = allSkills
        .filter(s => userSkillsData.some(us => us.skillId === s.id))
        .map(s => {
          const us = userSkillsData.find(u => u.skillId === s.id)
          return {
            id: s.id,
            name: s.name,
            rank: us?.rank ?? 0,
            ...(SKILL_VISUAL[s.name] || { icon: 'star', color: '#64748b' }),
          }
        })
      setUserSkills(matched)

      const normalizedItems = (invData.items || []).map(item => {
        const skillName = matched.find(s => s.id === item.skillId)?.name
        return {
          ...item,
          desc: item.description,
          benefit: item.realWorldBenefit,
          rarity: item.rarity?.toUpperCase() || 'COMMON',
          skillRequired: skillName,
        }
      })
      setAllItems(normalizedItems)

      const equippedMap = {}
      Object.entries(equippedData.equipped || {}).forEach(([slot, item]) => {
        if (item) {
          const skillName = matched.find(s => s.id === item.skillId)?.name  // ← idem
          equippedMap[slot] = {
            ...item,
            desc: item.description,
            benefit: item.realWorldBenefit,
            rarity: item.rarity?.toUpperCase() || 'COMMON',
            skillRequired: skillName,
          }
        }
      })
      setEquippedSlots(equippedMap)

      if (Object.keys(equippedMap).length > 0) {
        setSelectedItem(Object.values(equippedMap)[0])
      } else if (normalizedItems.length > 0) {
        setSelectedItem(normalizedItems[0])
      }
    })
    .catch(err => console.error('Inventory load error:', err))
    .finally(() => setLoading(false))
}, [user?.id])

  const activeSkillNames = userSkills.map(s => s.name)

  const filteredGear = allItems
  .filter(item => item.category !== 'consumable')
  .filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredConsumables = allItems
    .filter(item => item.category === 'consumable')
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const skillBonuses = userSkills.map(skill => {
  const equippedItemsForSkill = Object.values(equippedSlots)
    .filter(item => item && item.skillId === skill.id)

  const totalBonus = equippedItemsForSkill.reduce((sum, item) => {
    return sum + (item.effects?.[0]?.value || 0)
  }, 0)

  return {
    id: skill.id,
    name: skill.name,
    preference: SKILL_PREFERENCE[skill.name],
    icon: skill.icon,
    color: skill.color,
    totalBonus,
    equippedItems: equippedItemsForSkill,
  }
})

  const handleEquip = async (item) => {
    try {
      const res = await fetch('http://localhost:3000/api/inventory/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item.id }),
      })
      if (!res.ok) throw new Error('Failed to equip item')
      const data = await res.json()
      const equipped = data.equipped
      const normalizedEquipped = {
        ...equipped,
        desc: equipped.description,
        benefit: equipped.realWorldBenefit,
        rarity: equipped.rarity?.toUpperCase() || 'COMMON',
      }
      setEquippedSlots(prev => ({ ...prev, [equipped.slot]: normalizedEquipped }))
      setSelectedItem(normalizedEquipped)
    } catch (err) {
      console.error('Equip error:', err)
    }
  }

  const handleUnequip = async (slot) => {
    try {
      const res = await fetch('http://localhost:3000/api/inventory/unequip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slot }),
      })
      if (!res.ok) throw new Error('Failed to unequip item')
      setEquippedSlots(prev => {
        const updated = { ...prev }
        delete updated[slot]
        return updated
      })
      setSelectedItem(null)
    } catch (err) {
      console.error('Unequip error:', err)
    }
  }

  const handleConsume = async (item) => {
    try {
      const res = await fetch('http://localhost:3000/api/inventory/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item.id }),
      })
      if (!res.ok) throw new Error('Failed to consume item')
      setAllItems(prev => prev.filter(i => i.id !== item.id))
      setSelectedItem(null)
    } catch (err) {
      console.error('Consume error:', err)
    }
  }

  const getItemQuantity = (itemId) => {
    const inv = allItems.find(item => item.id === itemId)
    return inv?.quantity || 0
  }

  const isItemEquipped = (itemId) => {
    return Object.values(equippedSlots).some(item => item?.id === itemId)
  }

  const getEquippedSlot = (itemId) => {
    return Object.entries(equippedSlots).find(([_, item]) => item?.id === itemId)?.[0]
  }

  const level = user?.level    ?? 12
  const xpPct = user?.xpPercent ?? 65

  const currentList = tab === 'gear' ? filteredGear : filteredConsumables
  const emptyCount  = Math.max(0, 6 - currentList.length)

  return (
    <div className="inv-layout">
      <Sidebar />

      <main className="inv-main">
        <div className="inv-bg-grid"/>

        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}>
            <div style={{ color: 'white', fontSize: '18px' }}>Loading inventory...</div>
          </div>
        )}

        {/* HEADER */}
        <div className="inv-topbar">
          <div className="inv-topbar-left">
            <div className="inv-topbar-icon">
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '26px' }}>inventory_2</span>
            </div>
            <h1 className="inv-topbar-title">INVENTORY COMMAND CENTER</h1>
          </div>
        </div>

        <div className="inv-body">

          {/* LEFT: bonus + buffs */}
          <div className="inv-left">
            <div className="inv-card">
              <div className="inv-card-header">
                <span className="material-symbols-outlined inv-card-icon">bar_chart</span>
                <h3 className="inv-card-title">BONUS</h3>
              </div>
              <div className="inv-bonus-list">
                {skillBonuses.length > 0 ? skillBonuses.map((s, i) => (
                <div key={i} className="inv-bonus-row">
                  <span
                    className="material-symbols-outlined inv-bonus-skill-icon"
                    style={{ color: s.color }}
                  >
                    {s.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.name}</div>
                    <div className="inv-bonus-label">{s.preference}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {s.totalBonus > 0 ? (
                      <>
                        <div style={{ fontSize: '12px', color: '#4ade80' }}>+{s.totalBonus}% EXP BONUS</div>
                        {s.equippedItems.map(item => (
                          <div key={item.id} style={{ fontSize: '11px', color: '#64748b' }}>
                            {item.name}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#475569' }}>—</div>
                    )}
                  </div>
                </div>
              )) : (
                <p className="inv-empty-hint">No active skills selected.</p>
              )}
              </div>
            </div>
          </div>

          <div className="inv-centre">
            <div className="inv-mannequin-wrap">
              <div className="inv-ring inv-ring-outer" />
              <div className="inv-ring inv-ring-inner" />

              <div className="inv-character">
                <span className="material-symbols-outlined inv-char-icon">person</span>
              </div>

              {GEAR_SLOTS.map(slot => {
                const equipped = equippedSlots[slot.id]
                return (
                  <div
                    key={slot.id}
                    className={`inv-slot${equipped ? ' inv-slot--equipped' : ''}`}
                    style={{ top: slot.top, left: slot.left, transform: slot.transform }}
                    onClick={() => equipped && setSelectedItem(equipped)}
                    title={slot.label}
                  >
                    <span className="material-symbols-outlined inv-slot-icon">
                      {equipped ? equipped.icon : slot.icon}
                    </span>
                    <span className="inv-slot-label">{slot.label}</span>
                  </div>
                )
              })}
            </div>

            <div className="inv-xp-bar-wrap">
              <div className="inv-xp-level">LVL {level}</div>
              <div className="inv-xp-track">
                <div className="inv-xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <div className="inv-xp-label">{xpPct}% TO NEXT</div>
            </div>
          </div>

          {/* RIGHT: tabs + grid + detail */}
          <div className="inv-right">
            <div className="inv-tabs">
              <button
                className={`inv-tab${tab === 'gear' ? ' inv-tab--active' : ''}`}
                onClick={() => setTab('gear')}
              >
                GEAR
              </button>
              <button
                className={`inv-tab${tab === 'consumables' ? ' inv-tab--active' : ''}`}
                onClick={() => setTab('consumables')}
              >
                CONSUMABLES
              </button>
            </div>

            <div className="inv-grid">
              {currentList.map(item => (
                <div
                  key={item.id}
                  className={`inv-grid-cell${selectedItem?.id === item.id ? ' inv-grid-cell--active' : ''}`}
                  onClick={() => setSelectedItem(item)}
                  style={{ position: 'relative' }}
                >
                  <span
                    className="material-symbols-outlined inv-grid-icon"
                    style={{ color: RARITY_COLOR[item.rarity] }}
                  >
                    {item.icon}
                  </span>
                  {item.quantity > 1 && (
                    <span style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      fontSize: '12px',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      fontWeight: 'bold'
                    }}>
                      x{item.quantity}
                    </span>
                  )}
                </div>
              ))}
              {Array.from({ length: emptyCount }).map((_, i) => (
                <div key={`empty-${i}`} className="inv-grid-cell inv-grid-cell--empty" />
              ))}
            </div>

            {selectedItem && (
              <div className="inv-detail">
                <div className="inv-detail-header">
                  <div>
                    <h3 className="inv-detail-name">{selectedItem.name.toUpperCase()}</h3>
                    <span
                      className="inv-detail-rarity"
                      style={{ color: RARITY_COLOR[selectedItem.rarity] }}
                    >
                      {selectedItem.rarity}{' '}
                      {selectedItem.slot?.replace('_l', '').replace('_r', '').toUpperCase()}
                    </span>
                  </div>
                  <span className="material-symbols-outlined inv-detail-check">verified</span>
                </div>

                <p className="inv-detail-desc">"{selectedItem.desc}"</p>

                {selectedItem.benefit && (
                  <div className="inv-detail-benefit">
                    <div className="inv-benefit-header">
                      <span className="material-symbols-outlined inv-benefit-icon">
                        {selectedItem.category === 'consumable' ? 'local_bar' : 'shield'}
                      </span>
                      <span className="inv-benefit-label">
                        {selectedItem.category === 'consumable' ? 'EFFECT' : 'BONUS'}
                      </span>
                    </div>
                    <p className="inv-benefit-text">
                      <BenefitText text={selectedItem.benefit} />
                    </p>
                  </div>
                )}

                {selectedItem.category === 'gear' && (
                  <button
                    className="inv-equip-btn"
                    onClick={() => isItemEquipped(selectedItem.id)
                      ? handleUnequip(getEquippedSlot(selectedItem.id))
                      : handleEquip(selectedItem)
                    }
                  >
                    <span className="material-symbols-outlined">
                      {isItemEquipped(selectedItem.id) ? 'close' : 'shield'}
                    </span>
                    {isItemEquipped(selectedItem.id) ? 'UNEQUIP ITEM' : 'EQUIP ITEM'}
                  </button>
                )}

                {selectedItem.category === 'consumable' && (
                  <button className="inv-equip-btn" onClick={() => handleConsume(selectedItem)}>
                    <span className="material-symbols-outlined">local_bar</span>
                    CONSUME ({selectedItem.quantity})
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}