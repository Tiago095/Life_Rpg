import { useState, useEffect, useRef } from 'react'
import { useUser, useTranslation } from '../context/UserContext'
import Sidebar from '../components/Sidebar'
import './Skills.css'

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

const SKILL_PERKS = {
  Exercise: [
    {
      id: 'xp_ex1',
      name: 'Adrenaline Rush',
      req: 1,
      icon: 'bolt',
      description: '+15% XP on workouts',
    },
    {
      id: 'xp_ex2',
      name: 'Marathon Mindset',
      req: 3,
      icon: 'directions_run',
      description: '+25 XP per daily streak',
    },
    {
      id: 'credits_ex',
      name: 'Gym Sponsorship',
      req: 5,
      icon: 'payments',
      description: '+10% credits on physical challenges',
    },
    {
      id: 'loot_ex',
      name: 'Rare Protein Drop',
      req: 8,
      icon: 'inventory_2',
      description: '+5% rare drop chance',
    },
  ],

  Studies: [
    {
      id: 'xp_std1',
      name: 'Fast Learner',
      req: 1,
      icon: 'school',
      description: '+20% XP on study sessions',
    },
    {
      id: 'xp_std2',
      name: 'Night Reader',
      req: 3,
      icon: 'menu_book',
      description: '+30 XP on long tasks',
    },
    {
      id: 'credist_std',
      name: 'Scholarship',
      req: 5,
      icon: 'workspace_premium',
      description: '+12% credits on exams',
    },
    {
      id: 'loot_std',
      name: 'Ancient Knowledge',
      req: 8,
      icon: 'auto_awesome',
      description: '+6% epic drop chance',
    },
  ],

  Organization: [
    {
      id: 'xp_org1',
      name: 'Efficient Planning',
      req: 1,
      icon: 'event_note',
      description: '+15% XP on organized tasks',
    },
    {
      id: 'xp_org2',
      name: 'Perfect Schedule',
      req: 3,
      icon: 'schedule',
      description: '+25 XP per completed schedule',
    },
    {
      id: 'credist_org',
      name: 'Productivity Bonus',
      req: 5,
      icon: 'task_alt',
      description: '+10% credits on routines',
    },
    {
      id: 'loot_org',
      name: 'Lucky Checklist',
      req: 8,
      icon: 'checklist',
      description: '+4% extra item chance',
    },
  ],

  Social: [
    {
      id: 'xp_soc1',
      name: 'People Person',
      req: 1,
      icon: 'forum',
      description: '+18% XP on social activities',
    },
    {
      id: 'xp_soc2',
      name: 'Team Spirit',
      req: 3,
      icon: 'groups',
      description: '+20 XP per daily interaction',
    },
    {
      id: 'credist_soc',
      name: 'Networking',
      req: 5,
      icon: 'handshake',
      description: '+15% credits on events',
    },
    {
      id: 'loot_soc',
      name: 'Gifted Speaker',
      req: 8,
      icon: 'record_voice_over',
      description: '+5% social drop chance',
    },
  ],

  Mindfulness: [
    {
      id: 'xp_md1',
      name: 'Inner Peace',
      req: 1,
      icon: 'spa',
      description: '+20% XP on meditation',
    },
    {
      id: 'xp_md2',
      name: 'Zen Focus',
      req: 3,
      icon: 'self_improvement',
      description: '+30 XP on calm streaks',
    },
    {
      id: 'credist_md',
      name: 'Balanced Mind',
      req: 5,
      icon: 'psychology',
      description: '+8% passive credits',
    },
    {
      id: 'loot_md',
      name: 'Spirit Reward',
      req: 8,
      icon: 'flare',
      description: '+7% spiritual drop chance',
    },
  ],

  Creativity: [
    {
      id: 'xp_cr1',
      name: 'Creative Flow',
      req: 1,
      icon: 'brush',
      description: '+22% XP on creation',
    },
    {
      id: 'xp_cr2',
      name: 'Inspiration Burst',
      req: 3,
      icon: 'lightbulb',
      description: '+35 XP on unique projects',
    },
    {
      id: 'credits_cr',
      name: 'Art Commission',
      req: 5,
      icon: 'palette',
      description: '+12% creative credits',
    },
    {
      id: 'loot_cr',
      name: 'Masterpiece Drop',
      req: 8,
      icon: 'diamond',
      description: '+6% rare item chance',
    },
  ],

  Finance: [
    {
      id: 'xp_fin1',
      name: 'Money Mindset',
      req: 1,
      icon: 'attach_money',
      description: '+15% XP on finance',
    },
    {
      id: 'xp_fin2',
      name: 'Investor Brain',
      req: 3,
      icon: 'trending_up',
      description: '+25 XP on financial goals',
    },
    {
      id: 'credits_fin',
      name: 'Compound Profit',
      req: 5,
      icon: 'account_balance_wallet',
      description: '+20% credits earned',
    },
    {
      id: 'loot_fin',
      name: 'Golden Ticket',
      req: 8,
      icon: 'stars',
      description: '+5% legendary drop chance',
    },
  ],

  Health: [
    {
      id: 'xp_hlt1',
      name: 'Healthy Routine',
      req: 1,
      icon: 'favorite',
      description: '+18% XP on healthy habits',
    },
    {
      id: 'xp_hlt2',
      name: 'Vital Energy',
      req: 3,
      icon: 'monitor_heart',
      description: '+20 XP on completed goals',
    },
    {
      id: 'credits_hlt',
      name: 'Medical Support',
      req: 5,
      icon: 'medical_services',
      description: '+10% credits on health missions',
    },
    {
      id: 'loot_hlt',
      name: 'Recovery Pack',
      req: 8,
      icon: 'healing',
      description: '+5% consumable drop chance',
    },
  ],

  Technical: [
    {
      id: 'xp_tec1',
      name: 'Code Mastery',
      req: 1,
      icon: 'terminal',
      description: '+25% XP on programming',
    },
    {
      id: 'xp_tec2',
      name: 'Debug Genius',
      req: 3,
      icon: 'bug_report',
      description: '+40 XP on difficult tasks',
    },
    {
      id: 'credist_tec',
      name: 'Freelance Hacker',
      req: 5,
      icon: 'memory',
      description: '+15% technical credits',
    },
    {
      id: 'loot_tec',
      name: 'Loot Compiler',
      req: 8,
      icon: 'developer_board',
      description: '+8% tech drop chance',
    },
  ],
};

const VISIBLE_COUNT = 3

const arcPath = (pct, r = 46, cx = 60, cy = 60) => {
  const rad   = (a) => (a * Math.PI) / 180
  const sx    = cx + r * Math.cos(rad(-170))
  const sy    = cy + r * Math.sin(rad(-170))
  const angle = (pct / 100) * 340 - 170
  const ex    = cx + r * Math.cos(rad(angle))
  const ey    = cy + r * Math.sin(rad(angle))
  return `M ${sx} ${sy} A ${r} ${r} 0 ${pct > 50 ? 1 : 0} 1 ${ex} ${ey}`
}

function StatRing({ skill, value, onChange, canAdd, canSub }) {
  const pct    = Math.min((value / 30) * 100, 100)
  const visual = SKILL_VISUAL[skill.name] || { icon: 'star', color: '#64748b' }
  const gradId = `grad-${skill.id}`

  return (
    <div className="sk-stat-card">
      <span
        className="material-symbols-outlined sk-card-watermark"
        style={{ color: visual.color }}
      >
        {visual.icon}
      </span>

      <div className="sk-ring-wrap">
        <svg viewBox="0 0 120 120" className="sk-ring-svg">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={visual.color + 'aa'} />
              <stop offset="100%" stopColor={visual.color} />
            </linearGradient>
          </defs>

          <path d={arcPath(100)} fill="none" stroke="var(--color-border)" strokeWidth="5" strokeLinecap="round" />
          <path d={arcPath(pct)} fill="none" stroke={`url(#${gradId})`} strokeWidth="5" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${visual.color})` }} />

          <circle cx="60" cy="60" r="40" fill={visual.color + '12'} />

          <text x="60" y="58" textAnchor="middle" className="sk-ring-value"
            style={{ fill: visual.color }}>
            {String(value).padStart(2, '0')}
          </text>
          <text x="60" y="70" textAnchor="middle" className="sk-ring-label-inner">RANK</text>
        </svg>
      </div>

      <p className="sk-stat-name" style={{ color: visual.color }}>{skill.name.toUpperCase()}</p>

      <div className="sk-stat-controls">
        <button className="sk-ctrl-btn sk-ctrl-minus"
          onClick={() => canSub && onChange(-1)} disabled={!canSub}>
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button className="sk-ctrl-btn sk-ctrl-plus"
          onClick={() => canAdd && onChange(+1)} disabled={!canAdd}
          style={{ background: visual.color, boxShadow: `0 0 14px ${visual.color}66` }}>
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  )
}

function PerkRow({ perk, unlocked, color }) {
  return (
    <div className={`sk-perk-row ${unlocked ? 'sk-perk-unlocked' : 'sk-perk-locked'}`}>
      <div className="sk-perk-aug">
        <div className="sk-perk-icon-wrap"
          style={ unlocked ? { borderColor: color + '55', background: color + '18' } : {} }>
          <span className="material-symbols-outlined sk-perk-icon"
            style={ unlocked ? { color } : {} }>
            {perk.icon}
          </span>
          {unlocked && <span className="sk-perk-icon-glow" style={{ boxShadow: `0 0 12px ${color}66` }} />}
        </div>
        <span className="sk-perk-name">{perk.name}</span>
      </div>
      <div className="sk-perk-req" style={ unlocked ? { color } : {} }>
        <span>RANK</span>
        <span>{perk.req}</span>
      </div>
      <p className="sk-perk-desc">{perk.description}</p>
      <span className={`sk-perk-badge ${unlocked ? 'sk-badge-unlocked' : 'sk-badge-locked'}`}
        style={ unlocked ? { color, borderColor: color, background: color + '18' } : {} }>
        {unlocked ? 'UNLOCKED' : 'LOCKED'}
      </span>
    </div>
  )
}

export default function Skills() {
  const { user } = useUser()
  const { t }    = useTranslation()
  const token    = localStorage.getItem('token')

  const [userSkills, setUserSkills] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [draftStats, setDraftStats] = useState({})
  const [sp,         setSp]         = useState(4)
  const [savedSp,    setSavedSp]    = useState(4)
  const [activeTab,  setActiveTab]  = useState(null)
  const [originalStats, setOriginalStats] = useState({})

  const [ringOffset, setRingOffset] = useState(0)

useEffect(() => {
  if (!user) return
  setLoading(true)

  fetch('http://localhost:3000/api/skills', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(allSkills => {
  const userSkillsData = user.skills || []

  const matched = allSkills
    .filter(skill => userSkillsData.some(us => us.skillId === skill.id))
    .map(skill => {
      const userSkill = userSkillsData.find(us => us.skillId === skill.id)
      return {
        id: skill.id,
        name: skill.name,
        rank: userSkill?.rank ?? 0,
        ...(SKILL_VISUAL[skill.name] || { icon: 'star', color: '#64748b' }),
      }
    })

      setUserSkills(matched)
      const initDraft = {}
      matched.forEach(s => { initDraft[s.id] = s.rank ?? 0 })
      setDraftStats(initDraft)
      setOriginalStats(initDraft)
      if (matched.length > 0) setActiveTab(matched[0].id)
    })
    .catch(err => console.error('Erro ao buscar skills:', err))
    .finally(() => setLoading(false))

  fetch('http://localhost:3000/api/skills/points', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(data => {
      setSp(data.skillPoints)
      setSavedSp(data.skillPoints)
    })
    .catch(err => console.error('Erro ao buscar skill points:', err))

}, [user])

  const visibleSkills  = userSkills.slice(ringOffset, ringOffset + VISIBLE_COUNT)
  const canSlidePrev   = ringOffset > 0
  const canSlideNext   = ringOffset + VISIBLE_COUNT < userSkills.length
  const showArrows     = userSkills.length > VISIBLE_COUNT

  const slidePrev = () => setRingOffset(o => Math.max(0, o - 1))
  const slideNext = () => setRingOffset(o => Math.min(userSkills.length - VISIBLE_COUNT, o + 1))

 const handleChange = (skillId, delta) => {
    const current = draftStats[skillId] ?? 0
    const original = originalStats[skillId] ?? 0
    const next = current + delta

    if (delta > 0 && sp <= 0) return
    if (delta > 0 && current >= 32) return 
    if (delta < 0 && next < original) return

    setDraftStats(prev => ({ ...prev, [skillId]: next }))
    setSp(prev => prev - delta)
  }

 const handleReset = () => {

    setDraftStats({ ...originalStats })
    setSp(savedSp)
  }

 const handleConfirm = async () => {
  try {
    const payload = {
      skills: userSkills.map(skill => ({
        skillId: skill.id,
        rank: draftStats[skill.id] ?? 0,
      })),
    }

    const res = await fetch('http://localhost:3000/api/skills', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) return

    const data = await res.json()
    setOriginalStats({ ...draftStats })
    setSp(data.skillPoints)
    setSavedSp(data.skillPoints)
  } catch (err) {
    console.error(err)
  }
}
  const activeSkill = userSkills.find(s => s.id === activeTab)
  const activePerks = activeSkill ? (SKILL_PERKS[activeSkill.name] || []) : []
  const activeRank = draftStats[activeSkill?.id] ?? 0
  const activeColor = activeSkill?.color ?? 'var(--color-primary)'

  const hasChanges = JSON.stringify(draftStats) !== JSON.stringify(originalStats)

  return (
    <div className="sk-layout">
      <Sidebar />

      <main className="sk-main">

        <div className="sk-topbar">
          <div className="sk-topbar-left">
            <div className="sk-topbar-icon">
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>
                manage_accounts
              </span>
            </div>
            <span className="sk-topbar-title">SKILL COMMAND CENTER</span>
          </div>
          <div className="sk-sp-display">
            <span className="sk-sp-label">AVAILABLE POINTS</span>
            <span className="sk-sp-value">{sp} SP</span>
          </div>
        </div>

        <section className="sk-section">
          <div className="sk-section-head">
            <h2 className="sk-section-title">SKILL ALLOCATION</h2>
            <div className="sk-action-row">
              <button 
                className="sk-btn-ghost" 
                onClick={handleReset}
                disabled={!hasChanges}
              >
                RESET
              </button>
              <button 
                className="sk-btn-primary" 
                onClick={handleConfirm}
                disabled={!hasChanges}
              >
                CONFIRM CHANGES
              </button>
            </div>
          </div>

          {loading ? (
            <p className="sk-loading">Loading skills…</p>
          ) : userSkills.length === 0 ? (
            <p className="sk-loading">No skills activated yet.</p>
          ) : (
            <div className="sk-carousel-wrap">
              {showArrows && (
                <button
                  className={`sk-arrow sk-arrow-left ${!canSlidePrev ? 'sk-arrow-disabled' : ''}`}
                  onClick={slidePrev} disabled={!canSlidePrev}
                  aria-label="Previous">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
              )}

              <div className="sk-stats-grid">
                {visibleSkills.map(skill => (
                  <StatRing
                    key={skill.id}
                    skill={skill}
                    value={draftStats[skill.id] ?? 0}
                    onChange={d => handleChange(skill.id, d)}
                    canAdd={sp > 0 && (draftStats[skill.id] ?? 0) < 32}
                    canSub={(draftStats[skill.id] ?? 0) > (originalStats[skill.id] ?? 0)}
                  />
                ))}
              </div>

              {showArrows && (
                <button
                  className={`sk-arrow sk-arrow-right ${!canSlideNext ? 'sk-arrow-disabled' : ''}`}
                  onClick={slideNext} disabled={!canSlideNext}
                  aria-label="Next">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              )}
            </div>
          )}

          {showArrows && (
            <div className="sk-dots">
              {Array.from({ length: userSkills.length - VISIBLE_COUNT + 1 }).map((_, i) => (
                <button
                  key={i}
                  className={`sk-dot ${ringOffset === i ? 'sk-dot-active' : ''}`}
                  onClick={() => setRingOffset(i)}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        <section className="sk-section">
          <div className="sk-section-head">
            <h2 className="sk-section-title">NEURAL PERKS</h2>
            <div className="sk-tab-bar">
              {userSkills.map(skill => {
                const visual   = SKILL_VISUAL[skill.name] || { icon: 'star', color: '#64748b' }
                const isActive = activeTab === skill.id
                return (
                  <button
                    key={skill.id}
                    className={`sk-tab-pill ${isActive ? 'sk-tab-pill-active' : ''}`}
                    onClick={() => setActiveTab(skill.id)}
                    title={skill.name}
                    style={ isActive ? {
                      background:  visual.color,
                      boxShadow:   `0 0 14px ${visual.color}66`,
                    } : {} }
                  >
                    <span className="material-symbols-outlined"
                      style={{ color: isActive ? '#fff' : visual.color }}>
                      {visual.icon}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="sk-perks-table">
            <div className="sk-perks-thead">
              <span>AUGMENTATION</span>
              <span>REQUIREMENT</span>
              <span>STATUS</span>
              <span>ACCESS</span>
            </div>
            <div className="sk-perks-body">
              {activePerks.length === 0 ? (
                <p className="sk-perks-empty">No perks for this skill yet.</p>
              ) : (
                activePerks.map(perk => (
                  <PerkRow
                    key={perk.id}
                    perk={perk}
                    unlocked={activeRank >= perk.req}
                    color={activeColor}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}