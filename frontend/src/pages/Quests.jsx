import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import './Quests.css'
import { useTranslation } from '../context/UserContext'
import MissionCompletePopup from '../components/MissionCompletePopup'

const questsData = {
  inProgress: [
    {
      id: 1,
      rank: 'A',
      rankColor: '#f59e0b',
      category: 'Physical Skill Protocol',
      title: 'Morning Workout Protocol',
      xp: 850,
      cr: 120,
      progress: 45,
      progressLabel: 'COMPLETION',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
      time: '30:00',
      successRate: '78%',
      objectives: [
        { id: 1, done: true,  label: 'Complete warm-up routine', sub: '10 minutes of stretching' },
        { id: 2, done: true,  label: 'Main workout session',     sub: 'Complete all sets', active: true },
        { id: 3, done: false, label: 'Cool down protocol',       sub: 'Log recovery metrics' },
      ]
    },
    {
      id: 2,
      rank: 'S',
      rankColor: 'var(--color-primary)',
      category: 'Mental Fortitude',
      title: 'Daily Focus Session',
      xp: 1200,
      intelligence: '+2 Skill Points',
      progress: 12,
      progressMax: 25,
      progressLabel: 'DEEP WORK PHASE',
      image: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=400&q=80',
      time: '25:00',
      successRate: '94%',
      objectives: [
        { id: 1, done: true,  label: 'Silence communications',      sub: 'Enable DND mode on all tactical devices' },
        { id: 2, done: false, label: 'Execution Phase: Pomodoro 1', sub: 'Complete the first 25-minute cycle without interruption', active: true },
        { id: 3, done: false, label: 'Debrief Protocol',            sub: 'Log 3 key learnings from the session' },
      ]
    },
    {
      id: 3,
      rank: 'B',
      rankColor: '#10b981',
      category: 'Knowledge Acquisition',
      title: 'Library Research Deep Dive',
      xp: 450,
      accessPerms: true,
      progress: 5,
      progressLabel: 'PROGRESS',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80',
      time: '60:00',
      successRate: '65%',
      objectives: [
        { id: 1, done: false, label: 'Select research topic', sub: 'Define scope and objectives' },
        { id: 2, done: false, label: 'Gather sources',        sub: 'Minimum 5 credible sources' },
        { id: 3, done: false, label: 'Compile findings',      sub: 'Write summary report' },
      ]
    },
  ],

  available: [
    {
      id: 10,
      rank: 'S', rankColor: 'var(--color-primary)',
      category: 'Combat Training',
      title: 'Advanced Combat Drills',
      xp: 2000, cr: 300,
      progress: 0, progressLabel: 'NOT STARTED',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
      time: '45:00', successRate: '61%',
      locked: false, req: null,
      objectives: [
        { id: 1, done: false, label: 'Warm-up sequence',   sub: 'Dynamic stretching protocol' },
        { id: 2, done: false, label: 'Sparring rounds x5', sub: 'Full contact simulation' },
        { id: 3, done: false, label: 'Recovery debrief',   sub: 'Log performance metrics' },
      ]
    },
    {
      id: 11,
      rank: 'A', rankColor: '#f59e0b',
      category: 'Mental Fortitude',
      title: 'Meditation Mastery Protocol',
      xp: 750, cr: 80,
      progress: 0, progressLabel: 'NOT STARTED',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
      time: '20:00', successRate: '85%',
      locked: false, req: null,
      objectives: [
        { id: 1, done: false, label: 'Breathing calibration',  sub: 'Box breathing 4x4' },
        { id: 2, done: false, label: 'Visualization phase',    sub: '10-minute mindscape session' },
        { id: 3, done: false, label: 'Journaling debrief',     sub: 'Record 3 mental patterns' },
      ]
    },
    {
      id: 12,
      rank: 'B', rankColor: '#10b981',
      category: 'Knowledge Acquisition',
      title: 'System Architecture Study',
      xp: 500, cr: 60,
      progress: 0, progressLabel: 'LOCKED',
      image: 'https://images.unsplash.com/photo-1518432031352-d6fc5734595a?w=400&q=80',
      time: '90:00', successRate: '72%',
      locked: true, req: 'Requires: Library Research Deep Dive',
      objectives: [
        { id: 1, done: false, label: 'Read chapters 1–3',  sub: 'System design fundamentals' },
        { id: 2, done: false, label: 'Diagram architecture', sub: 'Draw 2 system diagrams' },
        { id: 3, done: false, label: 'Quiz yourself',       sub: 'Pass with 80%+ score' },
      ]
    },
    {
      id: 13,
      rank: 'C', rankColor: '#64748b',
      category: 'Organization',
      title: 'Weekly Planning Sprint',
      xp: 300, cr: 40,
      progress: 0, progressLabel: 'NOT STARTED',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80',
      time: '15:00', successRate: '91%',
      locked: false, req: null,
      objectives: [
        { id: 1, done: false, label: 'Review last week',       sub: 'Identify blockers and wins' },
        { id: 2, done: false, label: 'Set top 3 priorities',   sub: 'Tag by urgency and impact' },
        { id: 3, done: false, label: 'Block time on calendar', sub: 'Minimum 2 deep work blocks' },
      ]
    },
  ],

  completed: [
    {
      id: 20,
      rank: 'B', rankColor: '#10b981',
      category: 'Physical Skill Protocol',
      title: 'Endurance Run — 5km',
      xp: 400, cr: 50,
      completedAt: '2 days ago',
      progress: 100, progressLabel: 'COMPLETED',
      image: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400&q=80',
      time: '28:42', successRate: '100%',
      objectives: [
        { id: 1, done: true, label: 'Warm-up 5 min',   sub: 'Light jog + dynamic stretch' },
        { id: 2, done: true, label: 'Run 5km',          sub: 'Target pace maintained' },
        { id: 3, done: true, label: 'Cool down',        sub: 'Stretching logged' },
      ]
    },
    {
      id: 21,
      rank: 'A', rankColor: '#f59e0b',
      category: 'Mental Fortitude',
      title: 'Deep Work Block — 4h',
      xp: 900, intelligence: '+3 Skill Points',
      completedAt: '3 days ago',
      progress: 100, progressLabel: 'COMPLETED',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
      time: '4:00:00', successRate: '100%',
      objectives: [
        { id: 1, done: true, label: 'Isolation protocol', sub: 'All notifications disabled' },
        { id: 2, done: true, label: '4 Pomodoro cycles',  sub: 'Zero interruptions' },
        { id: 3, done: true, label: 'Output logged',      sub: '3 deliverables completed' },
      ]
    },
    {
      id: 22,
      rank: 'C', rankColor: '#64748b',
      category: 'Organization',
      title: 'Inbox Zero Mission',
      xp: 200, cr: 25,
      completedAt: '5 days ago',
      progress: 100, progressLabel: 'COMPLETED',
      image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&q=80',
      time: '22:15', successRate: '100%',
      objectives: [
        { id: 1, done: true, label: 'Triage all emails', sub: 'Archive / act / delegate' },
        { id: 2, done: true, label: 'Unsubscribe x10',   sub: 'Reduce noise pipeline' },
        { id: 3, done: true, label: 'Set filters',       sub: 'Auto-label rules created' },
      ]
    },
  ],
}

const filterTags = [
  { id: 'Physical',     icon: 'fitness_center' },
  { id: 'Mental',       icon: 'psychology' },
  { id: 'Organization', icon: 'checklist' },
]

export default function Quests() {
  const [activeTab, setActiveTab]       = useState('inProgress')
  const [activeFilter, setActiveFilter] = useState('Rank S')
  const [selectedQuest, setSelectedQuest] = useState(null)
  const [search, setSearch]             = useState('')
  const [missionResult, setMissionResult] = useState({
  questTitle:    'Morning Workout Protocol',
  xpGained:      2500,
  creditsGained: 1250,
  skillPoints:   2,
  lootDrop:      { name: 'Neuro-Sync Module', rarity: 'rare' },
  rankedUp:      true,
  newLevel:      12,
  fromLevel:     11 
})

  const {t} = useTranslation()

  const tabs = [
    { id: 'inProgress', label: t.inProgress ,   count: questsData.inProgress.length },
    { id: 'available',  label: t.available  ,   count: null },
    { id: 'completed',  label: t.completed  ,   count: null },
  ]

  const currentQuests = questsData[activeTab] || []

  const handleQuestClick = (quest) => {
    if (selectedQuest?.id === quest.id) {
      setSelectedQuest(null)
    } else {
      setSelectedQuest(quest)
    }
  }

  return (
    <div className="qs-layout">
      <Sidebar />

      <div className="qs-main">
        <div className="qs-bg-grid"/>

        {/* TOP BAR */}
        <div className="qs-topbar">
          <div className="qs-topbar-left">
            <div className="qs-topbar-icon">
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '26px' }}>history_edu</span>
            </div>
            <h1 className="qs-topbar-title">{t.questCommandCenter}</h1>
          </div>
          <div className="qs-search-wrapper">
            <span className="material-symbols-outlined qs-search-icon">search</span>
            <input
              className="qs-search-input"
              type="text"
              placeholder= {t.searchQuest}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="qs-content">

          {/* CENTER PANEL */}
          <div className="qs-center">

            {/* TABS */}
            <div className="qs-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`qs-tab ${activeTab === tab.id ? 'qs-tab-active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSelectedQuest(null)
                    }}
                >
                  {tab.label}
                  {tab.count && <span className="qs-tab-badge">{tab.count}</span>}
                </button>
              ))}
            </div>

            {/* FILTER TAGS */}
            <div className="qs-filters">
              {filterTags.map(tag => (
                <button
                  key={tag.id}
                  className={`qs-filter-tag ${activeFilter === tag.id ? 'qs-filter-active' : ''}`}
                  onClick={() => setActiveFilter(tag.id)}
                >
                  <span className="material-symbols-outlined qs-filter-icon">{tag.icon}</span>
                  {tag.id}
                </button>
              ))}
            </div>

            {/* QUEST LIST */}
            <div className="qs-list">
              {currentQuests.map(quest => (
                <div
                  key={quest.id}
                  className={`qs-card ${selectedQuest?.id === quest.id ? 'qs-card-selected' : ''}`}
                  onClick={() => handleQuestClick(quest)}
                >
                  <div className="qs-card-image">
                    <img src={quest.image} alt={quest.title} />
                  </div>
                  <div className="qs-card-body">
                    <div className="qs-card-top">
                      <div className="qs-card-meta">
                        <span className="qs-rank-badge" style={{ background: quest.rankColor }}>RANK {quest.rank}</span>
                        <span className="qs-card-category">{quest.category}</span>
                      </div>
                      <div className="qs-card-actions">
                        {selectedQuest?.id === quest.id && (
                          <span className="qs-selected-badge">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>radio_button_checked</span>
                            SELECTED
                          </span>
                        )}
                        {selectedQuest?.id !== quest.id && (
                          <span className="material-symbols-outlined qs-more-icon">more_vert</span>
                        )}
                      </div>
                    </div>

                    <h3 className="qs-card-title">{quest.title}</h3>

                    <div className="qs-card-rewards">
                      <span className="qs-reward">
                        <span className="material-symbols-outlined qs-reward-icon">toll</span>
                        {quest.xp} XP
                      </span>
                      {quest.cr && (
                        <span className="qs-reward">
                          <span className="material-symbols-outlined qs-reward-icon">paid</span>
                          {quest.cr} Cr
                        </span>
                      )}
                      {quest.intelligence && (
                        <span className="qs-reward qs-reward-blue">
                          <span className="material-symbols-outlined qs-reward-icon">psychology</span>
                          {quest.intelligence}
                        </span>
                      )}
                      {quest.accessPerms && (
                        <span className="qs-reward">
                          <span className="material-symbols-outlined qs-reward-icon">key</span>
                          Access Perms
                        </span>
                      )}
                    </div>

                    <div className="qs-card-progress">
                      <div className="qs-progress-info">
                        <span className="qs-progress-label">{quest.progressLabel}</span>
                        <span className="qs-progress-value">
                          {quest.progressMax ? `${quest.progress} / ${quest.progressMax} MIN` : `${quest.progress}%`}
                        </span>
                      </div>
                      <div className="qs-progress-bar-bg">
                        <div
                          className="qs-progress-bar-fill"
                          style={{ width: `${quest.progressMax ? (quest.progress / quest.progressMax) * 100 : quest.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL — só aparece quando há quest selecionada */}
          {selectedQuest && (
  <div className="qs-right">
    <div className="qs-timer-box">
      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '36px', fontVariationSettings: "'FILL' 1" }}>
        {activeTab === 'completed' ? 'emoji_events' : selectedQuest.locked ? 'lock' : 'timer'}
      </span>
    </div>

    <h2 className="qs-detail-title">{selectedQuest.title}</h2>
    <p className="qs-detail-desc">
      {activeTab === 'completed'
        ? 'Missão concluída com sucesso. Recompensas creditadas na tua conta.'
        : activeTab === 'available'
          ? 'Missão disponível. Prepara-te para iniciar o protocolo.'
          : 'Missão em curso. Continua o teu progresso.'}
    </p>

    <div className="qs-stats-row">
      <div className="qs-stat-box">
        <span className="qs-stat-label">{t.estimatedTime}</span>
        <span className="qs-stat-value">{selectedQuest.time}</span>
      </div>
      <div className="qs-stat-box">
        <span className="qs-stat-label">{t.successRate}</span>
        <span className="qs-stat-value" style={{ color: activeTab === 'completed' ? '#10b981' : 'var(--color-primary)' }}>
          {selectedQuest.successRate}
        </span>
      </div>
    </div>

    {/* XP earned — só nas completed */}
    {activeTab === 'completed' && (
      <div className="qs-xp-earned">
        <div>
          <span className="qs-stat-label">XP EARNED</span>
          <span className="qs-xp-value">+{selectedQuest.xp} XP</span>
        </div>
        {selectedQuest.cr && (
          <div>
            <span className="qs-stat-label">CREDITS</span>
            <span className="qs-xp-value" style={{ color: 'var(--color-primary)' }}>+{selectedQuest.cr} Cr</span>
          </div>
        )}
      </div>
    )}

    {/* Pré-requisito — só nas locked */}
    {activeTab === 'available' && selectedQuest.locked && (
      <div className="qs-req-box">
        <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '20px' }}>warning</span>
        <div>
          <span className="qs-req-title">PRÉ-REQUISITO</span>
          <span className="qs-req-sub">{selectedQuest.req}</span>
        </div>
      </div>
    )}

    <div className="qs-objectives">
      <div className="qs-objectives-header">
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748b' }}>alt_route</span>
        <span className="qs-objectives-label">{t.missionObjectives}</span>
      </div>
      {selectedQuest.objectives.map(obj => (
        <div key={obj.id} className="qs-objective">
          <div className={`qs-obj-check ${obj.done ? 'qs-obj-done' : ''}`}>
            {obj.done && <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fff' }}>check</span>}
          </div>
          <div className="qs-obj-text">
            <span className={`qs-obj-label ${obj.done ? 'qs-obj-label-done' : ''}`}>{obj.label}</span>
            <span className="qs-obj-sub">{obj.sub}</span>
          </div>
        </div>
      ))}
    </div>
    {activeTab === 'inProgress' && (
    <button className="qs-btn-primary">
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
      {t.continueMission}
    </button>
  )}

  {activeTab === 'available' && (
    <button className="qs-btn-primary">
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
      {t.startMission ?? 'Start Mission'}
    </button>
  )}

  {activeTab === 'inProgress' && (
    <button className="qs-btn-secondary" onClick={() => setSelectedQuest(null)}>
      {t.abortProtocol}
    </button>
  )}
  </div>
  )}
        </div>
      </div>
      <MissionCompletePopup
  isOpen={!!missionResult}
  result={missionResult}
  onClose={() => setMissionResult(null)}
/>
    </div>
  )
}