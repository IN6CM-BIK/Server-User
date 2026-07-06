import { Router } from 'express';
import { createRequest, getUserRequests } from './request.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isClient } from '../../middlewares/validate-client.js';

const router = Router();

router.use(validateJWT);
router.use(isClient);

router.post('/', createRequest);
router.get('/', getUserRequests);

export default router;
