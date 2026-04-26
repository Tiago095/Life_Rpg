import express from 'express'
import cors from 'cors'
import db from './src/db.js'
import regRoutes from './src/routes/reg.js'
import preferencesRoutes from './src/routes/preferences.js'
import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/user.js'
import meRoutes from './src/routes/me.js'
import missionsRouter from './src/routes/missions.js'
import skillsRouter from './src/routes/skills.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173'
  // credentials já não é necessário
}))
app.use(express.json())

app.use('/api/reg', regRoutes)
app.use('/api/preferences', preferencesRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/me', meRoutes)
app.use('/api/missions', missionsRouter)
app.use('/api/skills', skillsRouter)

app.listen(3000, () => console.log('Servidor em http://localhost:3000'))