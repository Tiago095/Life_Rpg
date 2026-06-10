import { useEffect, useRef } from 'react'
import { useUser, useTranslation } from '../context/UserContext'
import './MissionCompletePopup.css'

const XP_LEVELS = [
  { level: 1, xp_required: 0    },
  { level: 2, xp_required: 100  },
  { level: 3, xp_required: 250  },
  { level: 4, xp_required: 500  },
  { level: 5, xp_required: 900  },
  { level: 6, xp_required: 1400 },
]

export default function MissionCompletePopup({ isOpen, onClose, result, variant }) {
  const { user, updateUser } = useUser()
  const { t } = useTranslation()
  const overlayRef = useRef(null)

  const displayLevel = result?.rankedUp ? result.newLevel : (user?.level ?? 1)
  const newXpTotal   = Number(user?.xp || 0) + (result?.xpGained || 0)

  const currentLevelData = XP_LEVELS.find(l => l.level === displayLevel)
  const nextLevelData    = XP_LEVELS.find(l => l.level === displayLevel + 1)

  const xpProgress = currentLevelData && nextLevelData
    ? Math.min(100, ((newXpTotal - currentLevelData.xp_required) / (nextLevelData.xp_required - currentLevelData.xp_required)) * 100)
    : 100

  const xpParaProximoNivel = nextLevelData?.xp_required ?? null

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

const handleConfirm = () => {
  if (result?.rankedUp) {
    updateUser({ level: result.newLevel })
  }
  onClose?.()
}

  const rarityColor = {
  common:    '#64748b',
  uncommon:  '#22c55e',
  rare:      '#f59e0b',
  epic:      '#a855f7',
  legendary: '#f97316',
  }

  if (!isOpen || !result) return null

  const isFailed = variant === 'failed'

  return (
  <div className="mcp-overlay" ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose?.()}>
    <div className={`mcp-popup ${isFailed ? 'mcp-popup-failed' : ''}`}>

      <div className={`mcp-scanline ${isFailed ? 'mcp-scanline-red' : ''}`} />

      <div className="mcp-header">
        <div className="mcp-status-line">
          <span className={`mcp-dot ${isFailed ? 'mcp-dot-red mcp-dot-blink' : ''}`} />
          {isFailed ? (t.statusCriticalFailure ?? 'STATUS: CRITICAL FAILURE') : (t.statusCompleted ?? 'STATUS: COMPLETED')}
          <span className={`mcp-dot ${isFailed ? 'mcp-dot-red mcp-dot-blink' : ''}`} />
        </div>
        {isFailed && (
          <div className="mcp-fail-subtitle">
            {t.signalDropping ?? '// SIGNAL DROPPING BELOW THRESHOLD //'}
          </div>
        )}
        <div className={`mcp-title ${isFailed ? 'mcp-title-red' : ''}`}>
          {isFailed ? (t.missionFailed ?? 'MISSION FAILED') : (t.missionSuccessful ?? 'MISSION SUCCESSFUL')}
        </div>
      </div>

      <div className="mcp-body">

        {isFailed ? (
          <>
            <div className="mcp-signal-box">
              <div>
                <div className="mcp-signal-label">{t.neuralLinkInterrupted ?? 'NEURAL LINK INTERRUPTED'}</div>
                <div className="mcp-signal-val">{t.signalLost ?? 'SIGNAL LOST'}</div>
                <div className="mcp-signal-sub">LINK STABILITY: 0%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mcp-signal-label">{t.errorCode ?? 'ERROR CODE'}</div>
                <div className="mcp-error-code">#{result.errorCode ?? 'x8694F20C'}</div>
                <div className="mcp-signal-sub">SEVERITY: {result.severity ?? 'HIGH'}</div>
              </div>
            </div>

            <div className="mcp-fail-grid" style={{ justifyContent: 'center' }}>
              <div className="mcp-fail-card" >
                <div className="mcp-fail-card-label">▸ {t.failedObjectives ?? 'FAILED OBJECTIVES'}</div>
                {result.failedObjectives?.map((obj, i) => (
                  <div key={i} className="mcp-fail-item">
                    <span className="mcp-fail-dot" />
                    <span className="mcp-fail-text">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mcp-btns">
              <button className="mcp-btn-danger" onClick={handleConfirm}>
                {t.returnToHub ?? 'RETURN TO HUB'}
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mcp-lvl-row">
              <div>
                <div className="mcp-lvl-label">{t.neuralProgression ?? 'NEURAL PROGRESSION'}</div>
                <div className="mcp-lvl-inner">
                  <span className="mcp-lvl-val">LVL {user?.level ?? 1}</span>
                  {result.rankedUp && (
                    <span className="mcp-rankup-badge">{t.rankUp ?? 'RANK UP!'}</span>
                  )}
                </div>
              </div>
              {result.rankedUp && (
                <div className="mcp-from">
                  <div className="mcp-from-label">{t.fromLevel ?? 'FROM LEVEL'} {result.fromLevel}</div>
                  <div className="mcp-from-val">+{result.xpGained?.toLocaleString()} XP</div>
                </div>
              )}
            </div>
            <div className="mcp-xp-bar-bg">
              <div className="mcp-xp-bar-fill" style={{ '--xp-target': `${xpProgress}%` }} />
            </div>
            <div className="mcp-xp-vals">
              <span>{t.xpTotal ?? 'XP TOTAL'}: {Math.floor(newXpTotal).toLocaleString()}</span>
              <span>{t.nextGoal ?? 'NEXT GOAL'}: {xpParaProximoNivel?.toLocaleString() ?? '—'} XP</span>
            </div>
            <div className="mcp-rewards">
              {result.creditsGained > 0 && (
                <div className="mcp-reward-card">
                  <span className="material-symbols-outlined mcp-r-icon">paid</span>
                  <div className="mcp-r-val">{result.creditsGained.toLocaleString()}</div>
                  <div className="mcp-r-label">{t.credits ?? 'CREDITS'}</div>
                </div>
              )}
              {result.skillPoints > 0 && (
                <div className="mcp-reward-card">
                  <span className="material-symbols-outlined mcp-r-icon">psychology</span>
                  <div className="mcp-r-val">+{result.skillPoints}</div>
                  <div className="mcp-r-label">{t.skillPoints ?? 'SKILL POINTS'}</div>
                </div>
              )}
              {result.lootDrop && (
                <div className="mcp-reward-card mcp-reward-loot"
                    style={{ '--loot-color': rarityColor[result.lootDrop.rarity] ?? 'var(--color-primary)' }}>
                  <span className="mcp-rarity-badge">{result.lootDrop.rarity.toUpperCase()}</span>
                  <span className="material-symbols-outlined mcp-r-icon"
                        style={{ color: 'var(--loot-color)' }}>
                    {result.lootDrop.icon ?? 'inventory_2'}          
                  </span>
                  <div className="mcp-r-val" style={{ fontSize: '13px' }}>{result.lootDrop.name}</div>
                  
                  <div className="mcp-r-label">{t.lootDrop ?? 'LOOT DROP'}</div>
                </div>
              )}
            </div>
            <div className="mcp-btns">
              <button className="mcp-btn-primary" onClick={handleConfirm}>
                {t.confirmExit ?? 'CONFIRM & EXIT'}
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mcp-footer">
        {isFailed ? (
          <>
            <div className="mcp-foot-item">
              <span className="mcp-foot-dot" style={{ background: '#e24b4a' }} />
              NEURAL LINK: CRITICAL
            </div>
            <div className="mcp-foot-item">
              <span className="mcp-foot-dot" style={{ background: '#7f2020' }} />
              REBOOT REQUIRED
            </div>
          </>
        ) : (
          <>
            <div className="mcp-foot-item">
              <span className="mcp-foot-dot mcp-dot-green" />
              {t.neuralLink ?? 'NEURAL LINK'}: STABLE
            </div>
            <div className="mcp-foot-item">
              <span className="mcp-foot-dot mcp-dot-primary" />
              DATA SYNC: 100%
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)
}