import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Create_Account.css'

export default function Create_Account() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="page-wrapper">
      <div className="bg-grid" />

      <div className="main-container">

        {/* LEFT SIDE */}
        <div className="ca-left-side">
          <div className="left-overlay" />

          <div className="left-corner-icon">
            <div className="icon-box">
              <span className="material-symbols-outlined" style={{ color: '#0D59F2', fontSize: '28px' }}>qr_code_2</span>
            </div>
          </div>

          {/* Brand */}
          <div className="left-top">
            <div className="brand-row">
              <span className="material-symbols-outlined" style={{ color: '#0D59F2', fontSize: '28px' }}>terminal</span>
              <span className="brand-name">Life RPG</span>
            </div>
          </div>

          {/* Bottom text */}
          <div className="left-bottom">
            <h2 className="left-heading">THE WORLD IS YOUR <span className="left-heading-accent">BATTLEFIELD.</span></h2>
            <p className="left-desc">Level up your real-life skills, complete daily missions, and unlock legendary rewards. Your evolution begins here.</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-side">

          {/* Form Header */}
          <div className="form-header">
            <h1 className="form-title">
              Create Your <span className="form-title-accent">Operador</span> Profile
            </h1>
            <p className="form-subtitle">Initialize your neural link to begin the simulation.</p>
          </div>

          {/* Fields */}
          <div className="form-fields">

            {/* Username */}
            <div className="field-group">
              <div className="field-label">
                <span className="material-symbols-outlined label-icon">emergency</span>
                <span className="label-text">Operador Alias</span>
              </div>
              <input
                className="field-input"
                type="text"
                placeholder="Enter unique identifier"
              />
            </div>

            {/* Email */}
            <div className="field-group">
              <div className="field-label">
                <span className="material-symbols-outlined label-icon">alternate_email</span>
                <span className="label-text">Neural Link Address</span>
              </div>
              <input
                className="field-input"
                type="email"
                placeholder="name@network.com"
              />
            </div>

            {/* Password */}
            <div className="field-group">
              <div className="field-label">
                <span className="material-symbols-outlined label-icon">key</span>
                <span className="label-text">Encryption Key</span>
              </div>
              <div className="password-wrapper">
                <input
                  className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Secure access sequence"
                />
                <button
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined" style={{ color: '#64748B', fontSize: '22px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* Submit */}
          <button className="ca-submit-btn" onClick={() => navigate('/Preferences')}>
            Begin Your Journey
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>
          </button>

          {/* Footer */}
          <div className="ca-footer-links">
            <div className="footer-text-row">
              <span className="footer-text">Already registered in the system?</span>
              <a className="ca-footer-link" onClick={() => navigate('/Login')}>Login to Station</a>
            </div>
            <div className="social-row">
              <span className="material-symbols-outlined social-icon">security</span>
              <span className="material-symbols-outlined social-icon">language</span>
              <span className="material-symbols-outlined social-icon">headset_mic</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}