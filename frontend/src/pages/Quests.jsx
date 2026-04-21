import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import './Quests.css'
import { useTranslation } from '../context/UserContext'

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
  available: [],
  completed: [],
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
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '36px', fontVariationSettings: "'FILL' 1" }}>timer</span>
              </div>

              <h2 className="qs-detail-title">{selectedQuest.title}</h2>
              <p className="qs-detail-desc">Enter a deep state of concentration to enhance neural pathways and productivity output.</p>

              {selectedQuest.time && (
                <div className="qs-stats-row">
                  <div className="qs-stat-box">
                    <span className="qs-stat-label">{t.estimatedTime}</span>
                    <span className="qs-stat-value">{selectedQuest.time}</span>
                  </div>
                  <div className="qs-stat-box">
                    <span className="qs-stat-label">{t.successRate}</span>
                    <span className="qs-stat-value">{selectedQuest.successRate}</span>
                  </div>
                </div>
              )}

              <div className="qs-objectives">
                <div className="qs-objectives-header">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748b' }}>alt_route</span>
                  <span className="qs-objectives-label">{t.missionObjectives}</span>
                </div>
                {selectedQuest.objectives.map(obj => (
                  <div key={obj.id} className={`qs-objective ${obj.active ? 'qs-objective-active' : ''}`}>
                    <div className={`qs-obj-check ${obj.done ? 'qs-obj-done' : obj.active ? 'qs-obj-progress' : ''}`}>
                      {obj.done && <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fff' }}>check</span>}
                      {obj.active && !obj.done && <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-primary)' }}>radio_button_checked</span>}
                    </div>
                    <div className="qs-obj-text">
                      <span className={`qs-obj-label ${obj.done ? 'qs-obj-label-done' : ''}`}>{obj.label}</span>
                      <span className="qs-obj-sub">{obj.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="qs-btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                {t.continueMission}
              </button>
              <button className="qs-btn-secondary" onClick={() => setSelectedQuest(null)}>
                {t.abortProtocol}
              </button>

              <div className="qs-assets-box">
                <div className="qs-assets-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#64748b' }}>attach_file</span>
                </div>
                <div className="qs-assets-text">
                  <span className="qs-assets-title"> Assets</span>
                  <span className="qs-assets-sub">2 FILES ATTACHED</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}