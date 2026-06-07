import { useNavigate } from 'react-router-dom'
import "./Initial_Page.css";

export default function LifeRPG() {

  const navigate = useNavigate()  
  return (
    <div className="wrapper cyber-grid">
      <div className="bg-overlay" />

      <div className="deco-blobs">
        <div className="deco-top" />
        <div className="deco-bottom" />
      </div>

        <header className="header">
          <div className="logo">
            <span className="material-symbols-outlined logo-icon">filter_tilt_shift</span>
            <h2 className="logo-text">LifeRPG</h2>
          </div>
          <div className="header-meta">
            <a className="header-status" href="#">System Status: Online</a>
            <div className="header-divider" />
            <span className="header-version">v4.0.2-BETA</span>
          </div>
        </header>

        <main className="main">
          <div className="hero-container">
            <div className="badge">
              <span className="ping-wrapper">
                <span className="ping-outer" />
                <span className="ping-inner" />
              </span>
              Neural Link Established
            </div>

            <div className="hero-text">
              <h1 className="hero-title">
                TRANSFORM <br />
                <span className="hero-gradient">YOUR REALITY</span>
              </h1>
              <p className="hero-subtitle">
                Interface with the next generation of neural computing. Secure, decentralized, and boundless potential at your fingertips.
              </p>
            </div>

            <div className="btn-group">
              <button className="btn btn-primary glow-effect"
                onClick={() => navigate('/Login')}>
                <span className="material-symbols-outlined btn-icon">login</span>
                Initialize Session
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/Create_Account')}
              >
                <span className="material-symbols-outlined btn-icon">person_add</span>
                Enlist Operator
              </button>
            </div>
          </div>
        </main>

        <footer className="footer">
          <div className="footer-links">
            <a className="footer-link" href="#">Security Protocol</a>
            <a className="footer-link" href="#">Node Network</a>
            <a className="footer-link" href="#">Terms of Uplink</a>
          </div>
          <div className="footer-copy">
            © 2026 LifeRPG SYSTEMS INTERFACE. ALL RIGHTS RESERVED.
          </div>
        </footer>
    </div>
  );
}