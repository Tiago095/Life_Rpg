import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import './Quests.css'
import { useTranslation } from '../context/UserContext'
import MissionCompletePopup from '../components/MissionCompletePopup'
import { useQuests } from '../hooks/useQuests'
import { useUser } from '../context/UserContext'
import { useLocation } from 'react-router-dom'

const filterTags = {
  'Exercise':     { icon: 'fitness_center'},
  'Studies':      { icon: 'auto_stories'},
  'Organization': { icon: 'calendar_month'},
  'Social':       { icon: 'groups'},
  'Mindfulness':  { icon: 'self_improvement'},
  'Creativity':   { icon: 'palette'},
  'Finance':      { icon: 'savings'},
  'Health':       { icon: 'favorite'},
  'Technical':    { icon: 'code'},
}

export default function Quests() {
  const location = useLocation()
  const { user } = useUser()
  const [activeTab, setActiveTab]       = useState(location.state?.tab || 'inProgress')
  const [activeFilter, setActiveFilter] = useState(null)
  const [selectedQuestId, setSelectedQuestId] = useState(null)
  const [search, setSearch]             = useState('')
  const { quests: questsData, loading, acceptMission, toggleObjective } = useQuests()
  const [missionResult, setMissionResult] = useState(null)

  const selectedQuest = questsData[activeTab]?.find(q => q.id === selectedQuestId) ?? null

  const {t} = useTranslation()

  const tabs = [
    { id: 'inProgress', label: t.inProgress ,   count: questsData.inProgress.length || null },
    { id: 'available',  label: t.available  ,   count: null },
    { id: 'completed',  label: t.completed  ,   count: null },
  ]

  const currentQuests = questsData[activeTab] || []

  // Get available skills from current quests
  const availableSkillsInQuests = new Set(currentQuests.map(q => q.category))

  // Filter tags apenas das skills que existem nas quests atuais
  const activeFilterTags = Object.entries(filterTags).filter(([skillName]) =>
    availableSkillsInQuests.has(skillName)
  ).reduce((acc, [key, val]) => {
    acc[key] = val
    return acc
  }, {})

  // Filtrar quests pela skill selecionada
  const filteredQuests = activeFilter
    ? currentQuests.filter(quest => quest.category === activeFilter)
    : currentQuests

  const handleQuestClick = (quest) => {
    if (selectedQuestId === quest.id) {
      setSelectedQuestId(null)
    } else {
      setSelectedQuestId(quest.id)
    }
  }

  if (loading)
    return <div className="qs-layout"><Sidebar /><p>Loading...</p></div>
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
                    setSelectedQuestId(null)
                    setActiveFilter(null)
                    }}
                >
                  {tab.label}
                  {tab.count && <span className="qs-tab-badge">{tab.count}</span>}
                </button>
              ))}
            </div>

            {/* FILTER TAGS */}
            <div className="qs-filters">
              <button
                className={`qs-filter-tag ${activeFilter === null ? 'qs-filter-active' : ''}`}
                onClick={() => setActiveFilter(null)}
              >
                <span className="material-symbols-outlined qs-filter-icon">apps</span>
                All
              </button>
              {Object.entries(activeFilterTags).map(([skillName, data]) => (
                <button
                  key={skillName}
                  className={`qs-filter-tag ${activeFilter === skillName ? 'qs-filter-active' : ''}`}
                  onClick={() => setActiveFilter(skillName)}
                >
                  <span className="material-symbols-outlined qs-filter-icon">{data.icon}</span>
                  {skillName}
                </button>
              ))}
            </div>

            {/* QUEST LIST */}
            <div className="qs-list">
              {filteredQuests.map(quest => (
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
        ? t.questDescCompleted
        : activeTab === 'available'
          ? t.questDescAvailable
          : t.questDescInProgress}
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
  <div
    key={obj.id}
    className="qs-objective"
    style={{ cursor: activeTab === 'inProgress' ? 'pointer' : 'default' }}
onClick={async () => {
  if (activeTab === 'inProgress') {
    const result = await toggleObjective(selectedQuest.id, obj.id)
    if (result?.completed) {
      setMissionResult({
        questTitle:   selectedQuest.title,
        xpGained:     selectedQuest.xp,
        skillPoints:  1,                        // ← backend dá sempre +1 SP por missão
        lootDrop:     result.itemAwarded ?? null,
      })
    }
  }
}}
  >
    <div className={`qs-obj-check ${obj.done ? 'qs-obj-done' : ''}`}>
      {obj.done && (
        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fff' }}>
          check
        </span>
      )}
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
  <button
    className="qs-btn-primary"
    onClick={async () => {
      const success = await acceptMission(selectedQuest.mission_id)
      if (success) {
        setSelectedQuestId(null)  // fecha o painel lateral
        setActiveTab('inProgress')  // vai para a tab de ativas
      }
    }}
  >
    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
    {t.startMission ?? 'Start Mission'}
  </button>
)}

  {activeTab === 'inProgress' && (
    <button className="qs-btn-secondary" onClick={() => setSelectedQuestId(null)}>
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