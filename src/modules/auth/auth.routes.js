import { Router } from 'express';
import { login, register } from './auth.controller.js';
import { authLimiter } from '../../middlewares/rate-limiter.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Login y registro de clientes móviles
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión (solo clientes)
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identificador:
 *                 type: string
 *                 description: "DPI, Correo o Teléfono"
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso con token JWT.
 *       401:
 *         description: Credenciales inválidas.
 *       403:
 *         description: No es un cliente (personal administrativo).
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo cliente
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               dpi:
 *                 type: string
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *               direccion:
 *                 type: object
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fotoDpiAdelanteUrl:
 *                 type: string
 *               fotoDpiAtrasUrl:
 *                 type: string
 *               fotoRostroUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente registrado exitosamente.
 *       400:
 *         description: Datos duplicados o faltantes.
 */
router.post('/register', authLimiter, register);

export default router;
