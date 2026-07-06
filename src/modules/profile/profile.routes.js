import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from './profile.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isClient } from '../../middlewares/validate-client.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Perfil
 *     description: Gestión del perfil del cliente autenticado
 */

router.use(validateJWT);
router.use(isClient);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil.
 */
router.get('/', getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Actualizar datos del perfil
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil actualizado.
 */
router.put('/', updateProfile);

/**
 * @swagger
 * /api/profile/change-password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contraseña actualizada.
 */
router.put('/change-password', changePassword);

export default router;
