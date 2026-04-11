import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './Dashboard.css'
import { useTranslation } from '../context/UserContext'

const mockUser = {
  gold: 4250,
  skills: [
    { id: 1, name: 'STRENGTH',   rank: 5, icon: 'fitness_center', color: '#3b82f6' },
    { id: 2, name: 'INTELLECT',  rank: 3, icon: 'auto_stories',   color: '#8b5cf6' },
    { id: 3, name: 'STRUCTURE',  rank: 8, icon: 'calendar_month', color: '#ef4444' },
    { id: 4, name: 'ENDURANCE',  rank: 2, icon: 'directions_run', color: '#22c55e' },
    { id: 5, name: 'FOCUS',      rank: 6, icon: 'center_focus_strong', color: '#f59e0b' },
  ],
  quests: [
    {
      id: 1,
      title: '30-minute Cardio Raid',
      description: 'Slay the sloth monster with inte...',
      tag: 'ELITE',
      tagColor: '#ef4444',
      rewards: '+250 XP / +50 G',
      icon: 'directions_run',
      iconBg: '#1e3a5f',
      active: true
    },
    {
      id: 2,
      title: 'The Library Grimo...',
      description: 'Absorb knowledge from the anci...',
      tag: 'SIDE QUEST',
      tagColor: '#6d28d9',
      rewards: '+150 XP / +20 G',
      icon: 'menu_book',
      iconBg: '#2d1b69',
      active: true
    }
  ]
}

const mockChatMessages = [
  { user: 'IronWill',    message: 'Anyone up for a 5 AM focus session?',          color: '#3b82f6' },
  { user: 'Scholar_Zee', message: 'Just leveled up my Organization skill! Huge!', color: '#8b5cf6' }
]

// =============================================
// CALENDAR HELPERS
// =============================================
const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const DAY_LABELS  = ['M','T','W','T','F','S','S']

function getCalendarDays(year, month) {
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth    = new Date(year, month + 1, 0).getDate()
  const offset         = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  // dias do mês anterior
  const prevMonthDays  = new Date(year, month, 0).getDate()

  const days = []
  for (let i = offset - 1; i >= 0; i--)
    days.push({ day: prevMonthDays - i, current: false })
  for (let i = 1; i <= daysInMonth; i++)
    days.push({ day: i, current: true })
  return days
}

// =============================================
// COMPONENT
// =============================================
export default function Dashboard() {
  const [chatInput, setChatInput] = useState('')
  const {t} = useTranslation()

  // --- data state (swap useState mock → useEffect fetch later) ---
  const [gold,       setGold]       = useState(mockUser.gold)
  const [attributes, setAttributes] = useState([])
  const [quests,     setQuests]     = useState([])

  // --- calendar state ---
  const today      = new Date()
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())   // 0-indexed
  const calDays    = getCalendarDays(calYear, calMonth)

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const isToday = (dayObj) =>
    dayObj.current &&
    dayObj.day === today.getDate() &&
    calMonth === today.getMonth() &&
    calYear  === today.getFullYear()


  useEffect(() => {
    // top 3 skills por rank
    const top3 = [...mockUser.skills]
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 3)
    setAttributes(top3)
    setQuests(mockUser.quests.filter(q => q.active))
  }, [])

  const navigate = useNavigate()  

  return (
    <div className="db-layout">
      <Sidebar />

      <main className="db-main">
        <div className="db-bg-grid" />

        {/* HEADER */}
        <div className="db-header">
          <div className="db-header-left">
            <h1 className="db-title">{t.questJournal}</h1>
            <p className="db-subtitle">{t.welcomeBack}</p>
          </div>
          <div className="db-header-right">
            <button className="db-icon-btn" onClick={() => navigate('/MarketPlace')}>
              <span className="material-symbols-outlined">shopping_cart</span>
            </button>
            <div className="db-currency">
              <span className="material-symbols-outlined db-currency-icon">toll</span>
              <span className="db-currency-amount">{gold.toLocaleString()} Cr</span>
            </div>
          </div>
        </div>

        {/* CORE ATTRIBUTES — top 3 by rank */}
        <div className="db-section">
          <div className="db-section-header">
            <div className="db-section-title-row">
              <span className="material-symbols-outlined db-section-icon">pentagon</span>
              <h2 className="db-section-title">{t.coreAttributes}</h2>
            </div>
            <button className="db-view-all" onClick={() => navigate('/Skills')}>{t.viewAllSkills}</button>
          </div>

          <div className="db-attributes-grid">
            {attributes.map((attr) => (
              <div key={attr.id} className="db-attribute-card">
                <div
                  className="db-attribute-icon-wrap"
                  style={{ background: `${attr.color}22`, border: `1px solid ${attr.color}44` }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: attr.color, fontSize: '32px' }}
                  >
                    {attr.icon}
                  </span>
                </div>
                <h3 className="db-attribute-label">{attr.name}</h3>
                <p className="db-attribute-rank"> {t.rank} {attr.rank}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVE QUESTS */}
        <div className="db-section">
          <div className="db-section-header">
            <div className="db-section-title-row">
              <span className="material-symbols-outlined db-section-icon">list_alt</span>
              <h2 className="db-section-title">{t.activeQuests}</h2>
            </div>
          </div>

          <div className="db-quests-list">
            {quests.map((quest) => (
              <div key={quest.id} className="db-quest-card">
                <div className="db-quest-icon-wrap" style={{ background: quest.iconBg }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: '#93c5fd', fontSize: '22px' }}
                  >
                    {quest.icon}
                  </span>
                </div>
                <div className="db-quest-info">
                  <div className="db-quest-title-row">
                    <span className="db-quest-title">{quest.title}</span>
                    <span className="db-quest-tag" style={{ background: quest.tagColor }}>
                      {quest.tag}
                    </span>
                  </div>
                  <p className="db-quest-desc">{quest.description}</p>
                </div>
                <div className="db-quest-rewards">
                  <span className="db-rewards-label">{t.rewards}</span>
                  <span className="db-rewards-value">{quest.rewards}</span>
                </div>
                <button
                  className="db-embark-btn"
                  style={{ background: quest.tagColor === '#6d28d9' ? '#7c3aed' : '#3b82f6' }}
                >
                  {t.embark}
                </button>
              </div>
            ))}

            <button className="db-forge-card" onClick={() => navigate('/Quests')}>
              <span className="material-symbols-outlined db-forge-icon">add_circle</span>
              <span className="db-forge-label">{t.forgeNewQuest}</span>
            </button>
          </div>
        </div>

      </main>

      {/* RIGHT PANEL */}
      <aside className="db-right-panel">

        {/* WORLD CALENDAR */}
        <div className="db-panel-card">
          <div className="db-panel-header">
            <span className="material-symbols-outlined db-panel-icon">calendar_view_week</span>
            <h3 className="db-panel-title">{t.worldCalendar}</h3>
          </div>

          <div className="db-calendar">
            <div className="db-cal-month-row">
              <span className="db-cal-month">{MONTH_NAMES[calMonth]} {calYear}</span>
              <div className="db-cal-nav">
                <button className="db-cal-btn" onClick={prevMonth}>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="db-cal-btn" onClick={nextMonth}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="db-cal-grid">
              {DAY_LABELS.map((day, i) => (
                <span key={i} className="db-cal-day-label">{day}</span>
              ))}
              {calDays.map((dayObj, i) => (
                <span
                  key={i}
                  className={`db-cal-date ${!dayObj.current ? 'db-cal-prev-month' : ''} ${isToday(dayObj) ? 'db-cal-today' : ''}`}
                >
                  {dayObj.day}
                </span>
              ))}
            </div>

            <div className="db-cal-event">
              <span className="db-cal-event-dot" />
              <div>
                <p className="db-cal-event-label">{t.mainEventToday}</p>
                <p className="db-cal-event-name">Cardio Raid - 18:00 UTC</p>
              </div>
            </div>
          </div>
        </div>

        {/* PARTY FINDER */}
        <div className="db-panel-card">
          <div className="db-panel-header">
            <span className="material-symbols-outlined db-panel-icon">group_add</span>
            <h3 className="db-panel-title">{t.partyFinder}</h3>
          </div>
          <div className="db-party-body">
            <div className="db-party-avatar">
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#475569' }}>
                person_add
              </span>
            </div>
            <p className="db-party-text">
              {t.partyText}
            </p>
            <button className="db-invite-btn" onClick={() => navigate('/Friends')}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
              {t.inviteFriends}
            </button>
          </div>
        </div>

        {/* GLOBAL TAVERN CHAT */}
        <div className="db-panel-card db-chat-card">
          <div className="db-panel-header">
            <h3 className="db-panel-title">{t.globalChat}</h3>
            <span className="db-chat-online" />
          </div>
          <div className="db-chat-messages">
            {mockChatMessages.map((msg, i) => (
              <p key={i} className="db-chat-msg">
                <span className="db-chat-user" style={{ color: msg.color }}>{msg.user}:</span>
                {' '}{msg.message}
              </p>
            ))}
          </div>
          <input
            className="db-chat-input"
            placeholder={t.sendMessage}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
        </div>

      </aside>
    </div>
  )
}