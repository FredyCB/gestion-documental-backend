import { Router } from 'express';
import {
  getUnidades,
  getUnidadById,
  createUnidad,
  updateUnidad,
  deleteUnidad
} from '../controllers/unidades.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createUnidadSchema, updateUnidadSchema } from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Unidades
 *   description: Gestión de unidades organizacionales
 */

/**
 * @swagger
 * /api/unidades:
 *   get:
 *     summary: Listar todas las unidades
 *     tags: [Unidades]
 *     responses:
 *       200:
 *         description: Lista de unidades
 *   post:
 *     summary: Crear una nueva unidad
 *     tags: [Unidades]
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
 *               activo: { type: boolean }
 *     responses:
 *       201:
 *         description: Unidad creada
 */

/**
 * @swagger
 * /api/unidades/{id}:
 *   get:
 *     summary: Obtener una unidad por ID
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos de la unidad
 *   put:
 *     summary: Actualizar una unidad
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Unidad actualizada
 *   delete:
 *     summary: Desactivar una unidad
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Unidad desactivada
 */

router.use(authenticate);

router.get('/', requirePermission('DOCUMENTO_VER'), getUnidades);
router.get('/:id', requirePermission('DOCUMENTO_VER'), getUnidadById);

router.post(
  '/',
  requirePermission('ADMIN_SISTEMA'),
  validate(createUnidadSchema),
  createUnidad
);

router.put(
  '/:id',
  requirePermission('ADMIN_SISTEMA'),
  validate(updateUnidadSchema),
  updateUnidad
);

router.delete('/:id', requirePermission('ADMIN_SISTEMA'), deleteUnidad);

export default router;