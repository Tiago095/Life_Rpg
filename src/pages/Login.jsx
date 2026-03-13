import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="page-wrapper">
      <div className="bg-grid" />

      <div className="main-container">

        {/* LEFT SIDE */}
        <div className="lo-left-side">
          <div className="left-overlay" />

          {/* Brand */}
          <div className="left-top">
            <div className="brand-row">
              <div className="brand-icon-box">
                <span className="material-symbols-outlined" style={{ color: '#0D59F2', fontSize: '28px' }}>terminal</span>
              </div>
              <span className="lo-brand-name">Life RPG</span>
            </div>
          </div>

          {/* Bottom text */}
          <div className="left-bottom">
            <h2 className="left-heading">THE WORLD IS YOUR <span className="left-heading-accent">BATTLEFIELD</span></h2>
            <p className="left-desc">Initialize your sequence and dominate the physical-digital frontier.</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-side">

          {/* Form Header */}
          <div className="form-header">
            <h1 className="form-title">
              Access Your <span className="form-title-accent">Operador</span> Profile
            </h1>
            <p className="form-subtitle">Enter your credentials to re-sync with the simulation.</p>
          </div>

          {/* Fields */}
          <div className="form-fields">

            {/* Email */}
            <div className="field-group">
              <div className="field-label">
                <span className="label-text">Neural Link Address</span>
                <span className="material-symbols-outlined label-icon-right">alternate_email</span>
              </div>
              <input
                className="field-input"
                type="email"
                placeholder="email@simulation.com"
              />
            </div>

            {/* Password */}
            <div className="field-group">
              <div className="field-label">
                <span className="label-text">Encryption Key</span>
                <span className="material-symbols-outlined label-icon-right">key</span>
              </div>
              <div className="password-wrapper">
                <input
                  className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

          {/* Forgot password */}
          <div className="forgot-row">
            <a className="forgot-link" href="#">Forgot your encryption key?</a>
          </div>

          {/* Submit */}
          <button className="lo-submit-btn">
            Sync & Enter
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>
          </button>

          {/* Footer */}
          <div className="ca-footer-links">
            <div className="footer-text-row">
              <span className="footer-text">New Operador?</span>
              <a className="ca-footer-link" onClick={() => navigate('/Create_Account')}>Create an account</a>
            </div>
            <div className="social-row">
              <span className="material-symbols-outlined social-icon">security</span>
              <span className="material-symbols-outlined social-icon">language</span>
              <span className="material-symbols-outlined social-icon">person</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}