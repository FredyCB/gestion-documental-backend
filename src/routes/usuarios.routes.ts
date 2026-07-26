import { Router } from 'express';
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
} from '../controllers/usuarios.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createUsuarioSchema, updateUsuarioSchema } from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, password, identidad, primerNombre, primerApellido]
 *             properties:
 *               correo: { type: string }
 *               password: { type: string }
 *               identidad: { type: string }
 *               primerNombre: { type: string }
 *               segundoNombre: { type: string }
 *               primerApellido: { type: string }
 *               segundoApellido: { type: string }
 *               telefono: { type: string }
 *               roles: { type: array, items: { type: number } }
 *     responses:
 *       201:
 *         description: Usuario creado
 */

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos del usuario
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *   delete:
 *     summary: Desactivar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario desactivado
 */


router.use(authenticate);

router.get('/', requirePermission('USUARIO_VER'), getUsuarios);
router.get('/:id', requirePermission('USUARIO_VER'), getUsuarioById);

router.post(
  '/',
  requirePermission('USUARIO_CREAR'),
  validate(createUsuarioSchema),
  createUsuario
);

router.put(
  '/:id',
  requirePermission('USUARIO_EDITAR'),
  validate(updateUsuarioSchema),
  updateUsuario
);

router.delete('/:id', requirePermission('USUARIO_EDITAR'), deleteUsuario);

export default router;