import express from 'express'
import db from './db.js'

const app = express()
app.use(express.json())

app.get('/users', async (req, res) => {
  await db.read()
  res.json(db.data.users)
})

app.listen(3000, () => console.log('Servidor em http://localhost:3000'))