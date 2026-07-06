import { Router } from 'express';
import { getUserCards, toggleFreeze, updateCardConfig } from './card.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isClient } from '../../middlewares/validate-client.js';

const router = Router();

router.use(validateJWT);
router.use(isClient);

router.get('/', getUserCards);
router.patch('/:id/freeze', toggleFreeze);
router.patch('/:id/config', updateCardConfig);

export default router;
