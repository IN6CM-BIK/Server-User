import { Router } from 'express';
import { enrollInsurance, updateInsurance, getUserInsurances } from './insurance.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isClient } from '../../middlewares/validate-client.js';

const router = Router();

router.use(validateJWT);
router.use(isClient);

router.get('/', getUserInsurances);
router.post('/enroll', enrollInsurance);
router.patch('/:id', updateInsurance);

export default router;
