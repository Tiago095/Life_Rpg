import { useEffect, useRef } from 'react'
import { useUser, useTranslation } from '../context/UserContext'
import './MissionCompletePopup.css'

export default function MissionCompletePopup({ isOpen, onClose, onViewLogs, result, variant }) {
  const { user, updateUser } = useUser()
  const { t } = useTranslation()
  const overlayRef = useRef(null)

  const newXpTotal  = Number(user?.xp     || 0) + (result?.xpGained    || 0)
  const newCredits  = Number(user?.credits || 0) + (result?.creditsGained || 0)
  const xpProgress  = Math.min((newXpTotal / Number(user?.maxXp || 1000)) * 100, 100)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleConfirm = () => {
    updateUser({
      xp:      newXpTotal,
      credits: newCredits,
      ...(result?.rankedUp && { level: result.newLevel }),
    })
    onClose?.()
  }

  const rarityColor = {
    common: 'var(--color-primary)',
    rare:   '#f59e0b',
    epic:   '#a855f7',
  }

  if (!isOpen || !result) return null

  const isFailed = variant === 'failed'

  return (
  <div className="mcp-overlay" ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose?.()}>
    <div className={`mcp-popup ${isFailed ? 'mcp-popup-failed' : ''}`}>

      <div className={`mcp-scanline ${isFailed ? 'mcp-scanline-red' : ''}`} />

      {/* HEADER */}
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

      {/* BODY */}
      <div className="mcp-body">

        {isFailed ? (
          <>
            {/* SIGNAL LOST BOX */}
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

            {/* FAILED OBJECTIVES + PENALTIES */}
            <div className="mcp-fail-grid">
              <div className="mcp-fail-card">
                <div className="mcp-fail-card-label">▸ {t.failedObjectives ?? 'FAILED OBJECTIVES'}</div>
                {result.failedObjectives?.map((obj, i) => (
                  <div key={i} className="mcp-fail-item">
                    <span className="mcp-fail-dot" />
                    <span className="mcp-fail-text">{obj}</span>
                  </div>
                ))}
              </div>
              <div className="mcp-penalty-card">
                <div className="mcp-penalty-label">▸ {t.penalties ?? 'PENALTIES'}</div>
                {result.creditPenalty > 0 && (
                  <>
                    <div className="mcp-penalty-val">-{result.creditPenalty.toLocaleString()}</div>
                    <div className="mcp-penalty-sub">{t.creditsDeducted ?? 'CREDITS DEDUCTED'}</div>
                  </>
                )}
                {result.xpPenalty > 0 && (
                  <div className="mcp-penalty-sub" style={{ marginTop: '6px' }}>-{result.xpPenalty} XP</div>
                )}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mcp-btns">
              <button className="mcp-btn-danger" onClick={handleConfirm}>
                {t.returnToHub ?? 'RETURN TO HUB'}
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* === Drops === */}
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
              <span>{t.xpTotal ?? 'XP TOTAL'}: {newXpTotal.toLocaleString()}</span>
              <span>{t.nextGoal ?? 'NEXT GOAL'}: {Number(user?.maxXp || 1000).toLocaleString()}</span>
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
                <div className="mcp-reward-card mcp-reward-loot" style={{ '--loot-color': rarityColor[result.lootDrop.rarity] ?? 'var(--color-primary)' }}>
                  <span className="mcp-rarity-badge">{result.lootDrop.rarity.toUpperCase()}</span>
                  <span className="material-symbols-outlined mcp-r-icon" style={{ color: 'var(--loot-color)' }}>inventory_2</span>
                  <div className="mcp-r-val" style={{ fontSize: '13px' }}>{result.lootDrop.name}</div>
                  <div className="mcp-r-label">{t.lootDrop ?? 'LOOT DROP'}</div>
                </div>
              )}
            </div>
            <div className="mcp-btns">
              {onViewLogs && (
                <button className="mcp-btn-secondary" onClick={onViewLogs}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
                  {t.missionLogs ?? 'MISSION LOGS'}
                </button>
              )}
              <button className="mcp-btn-primary" onClick={handleConfirm}>
                {t.confirmExit ?? 'CONFIRM & EXIT'}
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
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