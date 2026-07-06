import { Router } from 'express';
import { getUserTransactions, transferInternal, transferACH, transferInternational, transferMobile } from './transaction.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isClient } from '../../middlewares/validate-client.js';
import { financialLimiter } from '../../middlewares/rate-limiter.js';

const router = Router();

router.use(validateJWT);
router.use(isClient);

router.get('/history', getUserTransactions);
router.post('/transfer', financialLimiter, transferInternal);
router.post('/transfer-ach', financialLimiter, transferACH);
router.post('/transfer-international', financialLimiter, transferInternational);
router.post('/transfer-mobile', financialLimiter, transferMobile);

export default router;
