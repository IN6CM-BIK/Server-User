import { Router } from 'express';
import { processQrPayment } from './qr.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isClient } from '../../middlewares/validate-client.js';

const router = Router();

router.use(validateJWT);
router.use(isClient);

router.post('/pay', processQrPayment);

export default router;
