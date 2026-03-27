import express from 'express'
import cors from 'cors'
import authRoutes from './src/routes/auth.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.listen(3000, () => {
  console.log('Servidor a correr na porta 3000')
})