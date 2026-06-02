import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getInventory,
  getEquipped,
  equipItem,
  unequipItem,
  consumeItem,
} from '../controllers/inventoryController.js'

const router = Router()

router.get('/', requireAuth ,getInventory)
router.get('/equipped', requireAuth , getEquipped)
router.post('/equip', requireAuth ,equipItem)
router.post('/unequip', requireAuth ,unequipItem)
router.post('/consume', requireAuth ,consumeItem)

export default router