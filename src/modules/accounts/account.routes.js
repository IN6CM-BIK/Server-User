import { Router } from 'express';
import { getUserAccounts, getUserCards, getDashboard, toggleFavorite, getAccountTransactions, validateDestinationAccount, updateAccountAlias, freezeOwnAccount, updateOwnTransferLimit } from './account.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isClient } from '../../middlewares/validate-client.js';

const router = Router();

router.use(validateJWT);
router.use(isClient);

router.get('/dashboard', getDashboard);
router.get('/', getUserAccounts);
router.get('/cards', getUserCards);
router.get('/validate/:numeroCuenta', validateDestinationAccount);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/alias', updateAccountAlias);
router.patch('/:id/freeze', freezeOwnAccount);
router.patch('/:id/limits', updateOwnTransferLimit);
router.get('/:id/transactions', getAccountTransactions);

export default router;
