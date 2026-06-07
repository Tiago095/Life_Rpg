import Sidebar from './Sidebar'
import './Coming_Soon.css'
import { useTranslation } from '../context/UserContext'

export default function ComingSoon({ pageName = 'This Module' }) {
  const { t } = useTranslation()

  return (
    <div className="cs-layout">
      <Sidebar />

      <div className="cs-main">

        <div className="cs-bg-grid" />
        <div className="cs-bg-glow" />

        <div className="cs-content">

          <div className="cs-badge">
            <span className="cs-badge-dot" />
            {t.systemInitializing}
          </div>

          <div className="cs-icon-wrapper">
            <div className="cs-icon-outer">
              <div className="cs-icon-inner">
                <div className="cs-icon-box">
                  <span className="material-symbols-outlined cs-icon">error</span>
                </div>
              </div>
            </div>
            <div className="cs-icon-ring cs-ring-1" />
            <div className="cs-icon-ring cs-ring-2" />
          </div>

          <h1 className="cs-title">{t.comingSoon}</h1>
          <p className="cs-desc">
            {t.comingSoonDesc}<span className="cs-desc-accent">{t.realityTransform}</span>.
          </p>
        </div>

        <div className="cs-footer">
          <span className="cs-footer-text">SYSTEM_VERSION_4.2.0 // NEON_GLITCH_OS</span>
          <div className="cs-footer-links">
            <span className="cs-footer-link">TERMINAL</span>
            <span className="cs-footer-link">ENCRYPTED_DATA</span>
            <span className="cs-footer-link">PROTOCOL</span>
          </div>
        </div>

      </div>
    </div>
  )
}