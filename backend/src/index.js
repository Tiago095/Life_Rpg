import express from 'express'
import db from './db.js'

import cors from 'cors'
import authRoutes from './routes/auth.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' })) // porta do Vite
app.use(express.json())

app.use('/api/auth', authRoutes)

/*
app.get('/users', async (req, res) => {
  await db.read()
  res.json(db.data.users)
})*/

app.listen(3000, () => console.log('Servidor em http://localhost:3000'))