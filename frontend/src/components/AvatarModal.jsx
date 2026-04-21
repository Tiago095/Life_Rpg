import { useState } from 'react'
import { useUser } from '../context/UserContext'
import './AvatarModal.css'

import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'
import avatar4 from '../assets/avatars/avatar4.png'
import avatar5 from '../assets/avatars/avatar5.png'

const avatars = [
  { name: 'avatar1', src: avatar1 },
  { name: 'avatar2', src: avatar2 },
  { name: 'avatar3', src: avatar3 },
  { name: 'avatar4', src: avatar4 },
  { name: 'avatar5', src: avatar5 },
]

export default function AvatarModal({ currentAvatar, onConfirm, onClose }) {
  const { user } = useUser() 
  const [selected, setSelected] = useState(currentAvatar)

  const handleConfirm = async () => {
    if (!selected || selected === currentAvatar) {
      onClose()
      return
    }

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`http://localhost:3000/api/user/${user.id}`, {  // ← user.id do contexto
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // ← adiciona
        },
        body: JSON.stringify({ avatar: selected })
      })

      const data = await response.json()

      if (response.ok) {
        const avatarObj = avatars.find(a => a.name === selected)
        onConfirm(selected, avatarObj?.src)
      }
    } catch (err) {
      console.error('Erro ao guardar avatar:', err)
    }

    onClose()
  }

  return (
    <div className="av-overlay" onClick={onClose}>
      <div className="av-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="av-header">
          <div>
            <p className="av-header-sub">SYNC_SEQUENCE_09</p>
            <h2 className="av-header-title">SYNCHRONIZE AVATAR MASK</h2>
          </div>
          <button className="av-close" onClick={onClose}>✕</button>
        </div>

        {/* Grid */}
        <div className="av-grid">
          {avatars.map((avatar) => (
            <div
              key={avatar.name}
              className={`av-item ${selected === avatar.name ? 'av-item-selected' : ''}`}
              onClick={() => setSelected(avatar.name)}
            >
              <img src={avatar.src} alt={avatar.name} />
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="av-footer-info">
          <div className="av-status">
            <span className="av-status-dot" />
            BIO_METRIC_STATUS: SECURE
          </div>
          <span className="av-encryption">ENCRYPTION: AES-256</span>
        </div>

        {/* Buttons */}
        <button className="av-confirm" onClick={handleConfirm}>
          CONFIRM SELECTION
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sync</span>
        </button>
        <button className="av-cancel" onClick={onClose}>CANCEL_OPERATION</button>

      </div>
    </div>
  )
}