import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import './Choose_Preferences.css'

const attributes = [
  {
    id: 1,
    category: 'STRENGTH',
    categoryIcon: 'fitness_center',
    title: 'Exercise',
    desc: 'Improve vitality, strength, and physical endurance scores.',
    level: 'LVL 01',
    image: '/src/assets/strength.png',
    active: false,
  },
  {
    id: 2,
    category: 'INTELLECT',
    categoryIcon: 'school',
    title: 'Studies',
    desc: 'Accelerate learning speed and cognitive complexity limits.',
    level: 'LVL 01',
    image: '/src/assets/Intellec.png',
    active: false,
  },
  {
    id: 3,
    category: 'STRUCTURE',
    categoryIcon: 'grid_view',
    title: 'Organization',
    desc: 'Boost time management efficiency and task completion rates.',
    level: 'LVL 01',
    image: '/src/assets/structure.png',
    active: false,
  },
  {
    id: 4,
    category: 'CHARISMA',
    categoryIcon: 'groups',
    title: 'Social',
    desc: 'Unlocks networking nodes and influence-based dialogues.',
    level: 'LVL 01',
    image: '/src/assets/Social.png',
    active: false,
  },
  {
    id: 5,
    category: 'FOCUS',
    categoryIcon: 'self_improvement',
    title: 'Mindfulness',
    desc: 'Reduce stress-debuff accumulation and increase focus regen.',
    level: 'LVL 01',
    image: '/src/assets/Focus.png',
    active: false,
  },
  {
    id: 6,
    category: 'INNOVATION',
    categoryIcon: 'lightbulb',
    title: 'Creativity',
    desc: 'Unlocks unique crafting options and aesthetic upgrades.',
    level: 'LVL 01',
    image: '/src/assets/Inovation.png',
    active: false,
  },
  {
    id: 7,
    category: 'RESOURCE MGMT',
    categoryIcon: 'account_balance',
    title: 'Finance',
    desc: 'Optimize gold accumulation and item purchase discounts.',
    level: 'LVL 01',
    image: '/src/assets/Mgmt.png',
    active: false,
  },
  {
    id: 8,
    category: 'SUSTAINABILITY',
    categoryIcon: 'favorite',
    title: 'Health',
    desc: 'Track nutritional intake and sleep hygiene for regen boosts.',
    level: 'LVL 01',
    image: '/src/assets/Susten.png',
    active: false,
  },
  {
    id: 9,
    category: 'HARD SKILLS',
    categoryIcon: 'code',
    title: 'Technical',
    desc: 'Master tools, codebases, and machinery for high-tier job quests.',
    level: 'LVL 01',
    image: '/src/assets/HSkills.png',
    active: false,
  },
]

export default function AttributeSelection() {
  const navigate = useNavigate()
  const [toggles, setToggles] = useState(
    Object.fromEntries(attributes.map(a => [a.id, a.active]))
  )
  const [error, setError] = useState('')
  const { refreshUser, user } = useUser()

  const handleToggle = (id) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleReset = () => {
    setToggles(Object.fromEntries(attributes.map(a => [a.id, a.active])))
  }

const handleConfirm = async () => {
  setError('')
  const selectedIds = Object.entries(toggles)
    .filter(([, active]) => active)
    .map(([id]) => id)

  if (selectedIds.length < 3) {
    setError('You must select at least 3 skills.')
    return
  }

  const token = localStorage.getItem('token')

  const res = await fetch('http://localhost:3000/api/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ skillIds: selectedIds })
  })

  const data = await res.json()

  if (!res.ok) {
    setError(data.error)
    return
  }

  await refreshUser()
  navigate('/Dashboard')
}


  return (
    <div className="as-wrapper">

      <nav className="as-nav">
        <div className="as-nav-left">
          <div className="as-nav-logo">
            <span className="material-symbols-outlined as-nav-logo-icon">shield</span>
          </div>
          <div className="as-nav-brand">
            <span className="as-nav-title">Life RPG</span>
            <span className="as-nav-sub">Attribute Selection</span>
          </div>
        </div>
        <div className="as-nav-hero">
          <div className="as-nav-hero-info">
            <span className="as-nav-hero-name">{user?.username}</span>
            <span className="as-nav-hero-level">LEVEL {user?.level || 1}</span>
          </div>
          <div className="as-nav-avatar">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : <span className="material-symbols-outlined">person</span>
            }
          </div>
      </div>
      </nav>

      <main className="as-main">
        <div className="as-container">

          <div className="as-header">
            <h1 className="as-title">Choose Your Paths</h1>
            <p className="as-desc">
              Select the life dimensions you wish to master in this cycle. Active paths will generate
              daily quests and provide experience multipliers. All skills start at{' '}
              <span className="as-desc-accent">LVL 01</span> by default.
            </p>
          </div>

          <div className="as-grid">
            {attributes.map((attr, i) => (
              <div
                key={attr.id}
                className={`as-card ${toggles[attr.id] ? 'as-card--active' : ''}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="as-card-image">
                  <img src={attr.image} alt={attr.title} />
                  <div className="as-card-image-overlay" />
                  <div className="as-card-category">
                    <span className="material-symbols-outlined as-card-cat-icon">{attr.categoryIcon}</span>
                    <span className="as-card-cat-text">{attr.category}</span>
                  </div>
                </div>

                <div className="as-card-body">
                  <div className="as-card-title-row">
                    <span className="as-card-title">{attr.title}</span>
                    <span className="as-card-level">{attr.level}</span>
                  </div>
                  <p className="as-card-desc">{attr.desc}</p>
                  <div className="as-card-footer">
                    <span className={`as-card-status ${toggles[attr.id] ? 'as-card-status--active' : ''}`}>
                      {toggles[attr.id] ? 'Activated' : 'Inactive'}
                    </span>
                    <button
                      className={`as-toggle ${toggles[attr.id] ? 'as-toggle--on' : ''}`}
                      onClick={() => handleToggle(attr.id)}
                      aria-label={`Toggle ${attr.title}`}
                    >
                      <span className="as-toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
        <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

          <div className="as-bottom-bar">
            <div className="as-bottom-info">
              <span className="material-symbols-outlined as-bottom-icon">info</span>
              <span className="as-bottom-text">
                Selected attributes will be locked for the next 7 game-days.
              </span>
            </div>
            <div className="as-bottom-actions">
              <button className="as-btn-reset" onClick={handleReset}>Reset</button>
              <button className="as-btn-confirm" onClick={handleConfirm}>Confirm Selection</button>
            </div>
          </div>

        </div>
      </main>

      <footer className="as-statusbar">
        <div className="as-statusbar-left">
          <span className="as-status-dot as-status-dot--green" />
          <span className="as-status-text">SERVER: ONLINE</span>
          <span className="as-status-dot as-status-dot--blue" />
          <span className="as-status-text">SYNCING: ATTRIBUTES</span>
        </div>
        <div className="as-statusbar-right">
          <span className="as-status-text">SYSTEM VERSION 2.2.4 ALPHA</span>
        </div>
      </footer>

    </div>
  )
}