import { Router } from 'express';
import {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
  getPermisos,
  createPermiso,
  asignarRolUsuario,
  quitarRolUsuario
} from '../controllers/roles.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createRolSchema, updateRolSchema, createPermisoSchema } from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles y permisos
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Listar todos los roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Lista de roles
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *               permisos: { type: array, items: { type: integer } }
 *     responses:
 *       201:
 *         description: Rol creado
 */

router.use(authenticate);

// Roles
router.get('/', requirePermission('ADMIN_SISTEMA'), getRoles);
router.get('/:id', requirePermission('ADMIN_SISTEMA'), getRolById);

router.post(
  '/',
  requirePermission('ADMIN_SISTEMA'),
  validate(createRolSchema),
  createRol
);

router.put(
  '/:id',
  requirePermission('ADMIN_SISTEMA'),
  validate(updateRolSchema),
  updateRol
);

router.delete('/:id', requirePermission('ADMIN_SISTEMA'), deleteRol);

// Permisos
router.get('/permisos/todos', requirePermission('ADMIN_SISTEMA'), getPermisos);

router.post(
  '/permisos',
  requirePermission('ADMIN_SISTEMA'),
  validate(createPermisoSchema),
  createPermiso
);

// Asignación de roles
router.post('/asignar', requirePermission('ADMIN_SISTEMA'), asignarRolUsuario);
router.post('/quitar', requirePermission('ADMIN_SISTEMA'), quitarRolUsuario);

export default router;