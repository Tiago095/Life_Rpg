import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Inventory.css'
import Sidebar from '../components/Sidebar'

// ─── Sidebar (inline, uses same props pattern) ───────────────────────────────

const avatarMap = {}
const getAvatarKey = (avatar) => {
  if (!avatar) return 'avatar1'
  if (avatar.includes('/')) return avatar.split('/').pop().replace('.png', '')
  return avatar
}

const SKILL_VISUAL = {
  'Exercise':     { icon: 'fitness_center',  color: '#3b82f6' },
  'Studies':      { icon: 'auto_stories',    color: '#8b5cf6' },
  'Organization': { icon: 'calendar_month',  color: '#ef4444' },
  'Social':       { icon: 'groups',          color: '#22c55e' },
  'Mindfulness':  { icon: 'self_improvement',color: '#f59e0b' },
  'Creativity':   { icon: 'palette',         color: '#ec4899' },
  'Finance':      { icon: 'savings',         color: '#14b8a6' },
  'Health':       { icon: 'favorite',        color: '#f43f5e' },
  'Technical':    { icon: 'code',            color: '#6366f1' },
}

// ─── Gear Slot Icon mapping ────────────────────────────────────────────────────

const SLOT_ICON = {
  headgear:  'face',
  bodygear:  'security',
  gloves_l:  'back_hand',
  gloves_r:  'back_hand',
  utility:   'watch',
  boots:     'downhill_skiing',
  weapon:    'bolt',
  offhand:   'headset_mic',
  accessory: 'keyboard',
}

const RARITY_COLOR = {
  common:    '#64748b',
  uncommon:  '#22c55e',
  rare:      '#3b82f6',
  epic:      '#8b5cf6',
  legendary: '#f59e0b',
}

// ─── Equipment Doll (center silhouette + slots) ────────────────────────────────

const EquipmentDoll = ({ equipped = {}, onSlotClick, selectedSlot }) => {
  const slots = [
    { key: 'headgear',  label: 'HEADGEAR', className: 'slot-headgear' },
    { key: 'gloves_l',  label: 'GLOVES',   className: 'slot-gloves-l' },
    { key: 'bodygear',  label: '',          className: 'slot-body' },
    { key: 'gloves_r',  label: 'GLOVES',   className: 'slot-gloves-r' },
    { key: 'utility',   label: 'UTILITY',  className: 'slot-utility' },
    { key: 'boots',     label: 'BOOTS',    className: 'slot-boots' },
  ]

  return (
        <div className="inv-doll-wrapper">
        <div className="inv-doll-ring inv-ring-outer" />
        <div className="inv-doll-ring inv-ring-inner" />

        <div className="inv-doll-silhouette">
            <span className="material-symbols-outlined inv-doll-icon">person</span>
        </div>

        {slots.map(({ key, label, className }) => {
            const item = equipped[key]
            const isSelected = selectedSlot === key
            return (
            <button
                key={key}
                className={`inv-slot ${className} ${isSelected ? 'inv-slot--selected' : ''} ${item ? 'inv-slot--equipped' : ''}`}
                onClick={() => onSlotClick(key)}
                title={label || key}
            >
                <span className="material-symbols-outlined inv-slot-icon">
                {item?.icon || SLOT_ICON[key] || 'help'}
                </span>
                {label && <span className="inv-slot-label">{label}</span>}
            </button>
            )
        })}

        <div className="inv-level-bar">
            <div className="inv-level-badge">LVL {12}</div>
            <div className="inv-level-track">
            <div className="inv-level-fill" style={{ width: '65%' }} />
            </div>
            <span className="inv-level-next">65% TO NEXT</span>
        </div>
        </div>
  )
}

// ─── Item Detail Panel ─────────────────────────────────────────────────────────

const ItemDetail = ({ item }) => {
  if (!item) return (
    <div className="inv-detail-empty">
      <span className="material-symbols-outlined">category</span>
      <p>Select an item to view details</p>
    </div>
  )

  const rarityColor = RARITY_COLOR[item.rarity?.toLowerCase()] || RARITY_COLOR.common

  return (
    <div className="inv-detail-panel">
      <div className="inv-detail-header">
        <h3 className="inv-detail-name">{item.name}</h3>
        <span className="material-symbols-outlined inv-detail-equipped-icon" style={{ color: '#3b82f6' }}>
          {item.equipped ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      </div>
      <p className="inv-detail-rarity" style={{ color: rarityColor }}>
        {item.rarity?.toUpperCase()} {item.slot?.toUpperCase()}
      </p>
      {item.description && (
        <p className="inv-detail-desc">"{item.description}"</p>
      )}
      {item.realWorldBenefit && (
        <div className="inv-detail-benefit">
          <div className="inv-benefit-header">
            <span className="material-symbols-outlined">rocket_launch</span>
            <span>REAL WORLD BENEFIT</span>
          </div>
          <p>{item.realWorldBenefit}</p>
        </div>
      )}
    </div>
  )
}

// ─── Gear Grid (right panel) ────────────────────────────────────────────────────

const GearGrid = ({ items = [], onSelect, selectedId }) => (
  <div className="inv-gear-grid">
    {items.map((item) => (
      <button
        key={item.id}
        className={`inv-gear-cell ${selectedId === item.id ? 'inv-gear-cell--active' : ''} ${item.equipped ? 'inv-gear-cell--equipped' : ''}`}
        onClick={() => onSelect(item)}
      >
        <span className="material-symbols-outlined inv-gear-cell-icon">
          {item.icon || SLOT_ICON[item.slot] || 'help'}
        </span>
        {item.rarity && (
          <div
            className="inv-gear-rarity-dot"
            style={{ background: RARITY_COLOR[item.rarity.toLowerCase()] }}
          />
        )}
      </button>
    ))}
    {/* Fill empty slots */}
    {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
      <div key={`empty-${i}`} className="inv-gear-cell inv-gear-cell--empty" />
    ))}
  </div>
)

// ─── Bonus Panel ──────────────────────────────────────────────────────────────

const BonusPanel = ({ stats = [], buffs = [] }) => (
  <div className="inv-bonus-panel">
    <div className="inv-bonus-header">
      <span className="material-symbols-outlined">monitoring</span>
      <span>BONUS</span>
    </div>
    <div className="inv-stats-list">
      {stats.map((s) => (
        <div key={s.label} className="inv-stat-row">
          <span className="material-symbols-outlined inv-stat-icon" style={{ color: s.color }}>{s.icon}</span>
          <span className="inv-stat-label">{s.label}</span>
          <span className="inv-stat-value" style={{ color: s.bonus ? '#22c55e' : '#64748b' }}>
            {s.bonus || 'BASE STAT'}
          </span>
        </div>
      ))}
    </div>
    {buffs.length > 0 && (
      <>
        <div className="inv-buffs-label">ACTIVE BUFFS</div>
        <div className="inv-buffs-row">
          {buffs.map((b) => (
            <span key={b.label} className={`inv-buff-tag inv-buff-${b.type || 'default'}`}>{b.label}</span>
          ))}
        </div>
      </>
    )}
  </div>
)

// ─── Main Inventory Page ───────────────────────────────────────────────────────

/**
 * InventoryPage props:
 * @param {object}   user         – current user object (level, xp, maxXp, username, avatar, energy, maxEnergy, skills)
 * @param {object}   t            – translation strings
 * @param {number}   questCount   – badge count for Quests nav item
 * @param {object[]} gearItems    – all gear items [{id, name, slot, rarity, icon, description, realWorldBenefit, equipped}]
 * @param {object[]} consumables  – consumable items
 * @param {object[]} stats        – stat rows [{label, icon, color, bonus}]
 * @param {object[]} buffs        – active buffs [{label, type}]
 * @param {string}   searchQuery  – controlled search input value
 * @param {function} onSearch     – search change handler
 * @param {function} onEquip      – called with (item) when slot clicked
 */
const InventoryPage = ({
  user = {},
  t = {},
  questCount = 0,
  gearItems = DEFAULT_GEAR,
  consumables = DEFAULT_CONSUMABLES,
  stats = DEFAULT_STATS,
  buffs = DEFAULT_BUFFS,
  searchQuery = '',
  onSearch,
  onEquip,
}) => {
  const [activeTab, setActiveTab] = useState('gear')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [search, setSearch] = useState(searchQuery)

  const items = activeTab === 'gear' ? gearItems : consumables
  const filteredItems = items.filter(i =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Build equipped map from gearItems
  const equipped = {}
  gearItems.filter(i => i.equipped).forEach(i => {
    equipped[i.slot] = i
  })

  // Auto-select equipped bodygear on mount
  useEffect(() => {
    const body = gearItems.find(i => i.equipped && i.slot === 'bodygear')
    if (body) setSelectedItem(body)
  }, [])

  const handleSlotClick = (slotKey) => {
    setSelectedSlot(slotKey)
    const item = equipped[slotKey]
    if (item) setSelectedItem(item)
  }

  const handleItemSelect = (item) => {
    setSelectedItem(item)
    setSelectedSlot(item.slot)
    onEquip?.(item)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className="inv-root">
      <Sidebar/>

      <main className="inv-main">
        {/* Top bar */}
        <header className="inv-topbar">
          <div className="inv-topbar-title">
            <span className="material-symbols-outlined">backpack</span>
            <h1>INVENTORY COMMAND CENTER</h1>
          </div>
          <div className="inv-search-wrapper">
            <span className="material-symbols-outlined inv-search-icon">search</span>
            <input
              className="inv-search-input"
              placeholder="Search Item …"
              value={search}
              onChange={handleSearch}
            />
          </div>
        </header>

        <div className="inv-content">
          {/* Left: bonus + doll */}
          <div className="inv-left-col">
            <BonusPanel stats={stats} buffs={buffs} />
            <EquipmentDoll
              equipped={equipped}
              onSlotClick={handleSlotClick}
              selectedSlot={selectedSlot}
            />
          </div>

          {/* Right: gear grid + detail */}
          <div className="inv-right-col">
            <div className="inv-tabs">
              <button
                className={`inv-tab ${activeTab === 'gear' ? 'inv-tab--active' : ''}`}
                onClick={() => setActiveTab('gear')}
              >GEAR</button>
              <button
                className={`inv-tab ${activeTab === 'consumables' ? 'inv-tab--active' : ''}`}
                onClick={() => setActiveTab('consumables')}
              >CONSUMABLES</button>
            </div>
            <GearGrid
              items={filteredItems}
              onSelect={handleItemSelect}
              selectedId={selectedItem?.id}
            />
            <ItemDetail item={selectedItem} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default InventoryPage

// ─── Default mock data (replace with real API data) ───────────────────────────

const DEFAULT_GEAR = [
  {
    id: 'shield-1',
    name: "Iron Resolve",
    slot: 'bodygear',
    rarity: 'rare',
    icon: 'security',
    equipped: true,
    description: null,
    realWorldBenefit: null,
  },
  {
    id: 'masters-plate',
    name: "Master's Plate",
    slot: 'bodygear',
    rarity: 'rare',
    icon: 'security',
    equipped: false,
    description: 'A relic from the ancient Kitchen Wars. It smells faintly of rosemary and discipline.',
    realWorldBenefit: 'Grants +10% exp Strength for successfully finishing a full week of meal prep. Prevents the "Late Night Takeout" debuff.',
  },
  { id: 'g3', name: 'Focus Helm',    slot: 'headgear', rarity: 'uncommon', icon: 'face',          equipped: false, description: null, realWorldBenefit: null },
  { id: 'g4', name: 'Swift Gloves',  slot: 'gloves_l', rarity: 'common',   icon: 'back_hand',     equipped: false, description: null, realWorldBenefit: null },
  { id: 'g5', name: 'Data Gauntlet', slot: 'gloves_r', rarity: 'epic',     icon: 'back_hand',     equipped: false, description: null, realWorldBenefit: null },
  { id: 'g6', name: 'Watch of Hours',slot: 'utility',  rarity: 'rare',     icon: 'watch',         equipped: false, description: null, realWorldBenefit: null },
]

const DEFAULT_CONSUMABLES = [
  { id: 'c1', name: 'XP Boost',     slot: 'consumable', rarity: 'uncommon', icon: 'rocket_launch', equipped: false, description: '+20% XP for 1 hour.', realWorldBenefit: null },
  { id: 'c2', name: 'Energy Drink', slot: 'consumable', rarity: 'common',   icon: 'bolt',          equipped: false, description: 'Restores 5 Energy.',    realWorldBenefit: null },
]

const DEFAULT_STATS = [
  { label: 'FOCUS',     icon: 'filter_drama',     color: '#3b82f6', bonus: '+5% EXP BONUS' },
  { label: 'STRENGTH',  icon: 'fitness_center',   color: '#22c55e', bonus: '+10% EXP BONUS' },
  { label: 'INTELLECT', icon: 'auto_stories',      color: '#8b5cf6', bonus: '+2% EXP BONUS' },
  { label: 'CHARISMA',  icon: 'groups',            color: '#f59e0b', bonus: null },
]

const DEFAULT_BUFFS = [
  { label: 'WELL RESTED', type: 'default' },
  { label: 'HYDRATED',    type: 'green' },
  { label: 'CAFFEINATED', type: 'default' },
]