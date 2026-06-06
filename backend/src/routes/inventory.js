import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getInventory,
  getEquipped,
  equipItem,
  unequipItem,
  consumeItem,
  getActiveConsumables,
  spendConsumableCharges
} from '../controllers/inventoryController.js'

const router = Router()

router.get('/', requireAuth ,getInventory)
router.get('/equipped', requireAuth , getEquipped)
router.post('/equip', requireAuth ,equipItem)
router.post('/unequip', requireAuth ,unequipItem)
router.post('/consume', requireAuth ,consumeItem)
router.get('/active-consumables',requireAuth, getActiveConsumables)
router.post('/spend-charges',requireAuth,  spendConsumableCharges)

export default router