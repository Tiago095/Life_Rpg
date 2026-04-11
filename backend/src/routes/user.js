import express from 'express'
import { updateProfile, deleteAccount, getUser } from '../controllers/userController.js'

const router = express.Router()

router.get('/:id', getUser)
router.put('/:id', updateProfile)
router.delete('/:id', deleteAccount)

export default router
