import express from 'express'
import cors from 'cors'
import session from 'express-session'

import db from './src/db.js'
import authRoutes from './src/routes/auth.js'
import preferencesRoutes from './src/routes/preferences.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true  // necessário para enviar cookies de sessão
}))
app.use(express.json())
app.use(session({
  secret: 'liferpg-secret-key',  // muda para algo mais seguro em produção
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7  // 7 dias
  }
}))

app.use('/api/auth', authRoutes)
app.use('/api/preferences', preferencesRoutes)

app.listen(3000, () => console.log('Servidor em http://localhost:3000'))