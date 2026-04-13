import { Router } from 'express'
import { register } from '../controllers/regController.js'

const router = Router()

router.post('/register', register)

export default router