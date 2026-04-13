import express from 'express'
import cors from 'cors'
import db from './src/db.js'
import regRoutes from './src/routes/reg.js'
import preferencesRoutes from './src/routes/preferences.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173'
  // credentials já não é necessário
}))
app.use(express.json())

app.use('/api/reg', regRoutes)
app.use('/api/preferences', preferencesRoutes)

app.listen(3000, () => console.log('Servidor em http://localhost:3000'))