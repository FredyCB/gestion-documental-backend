import { Router } from 'express';
import {
  getCargos,
  getCargoById,
  createCargo,
  updateCargo,
  deleteCargo
} from '../controllers/cargos.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCargoSchema, updateCargoSchema } from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cargos
 *   description: Gestión de cargos
 */

/**
 * @swagger
 * /api/cargos:
 *   get:
 *     summary: Listar todos los cargos
 *     tags: [Cargos]
 *     responses:
 *       200:
 *         description: Lista de cargos
 *   post:
 *     summary: Crear un nuevo cargo
 *     tags: [Cargos]
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
 *         description: Cargo creado
 */

/**
 * @swagger
 * /api/cargos/{id}:
 *   get:
 *     summary: Obtener un cargo por ID
 *     tags: [Cargos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos del cargo
 *   put:
 *     summary: Actualizar un cargo
 *     tags: [Cargos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cargo actualizado
 *   delete:
 *     summary: Desactivar un cargo
 *     tags: [Cargos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cargo desactivado
 */

router.use(authenticate);

router.get('/', requirePermission('DOCUMENTO_VER'), getCargos);
router.get('/:id', requirePermission('DOCUMENTO_VER'), getCargoById);
router.post('/', requirePermission('ADMIN_SISTEMA'), validate(createCargoSchema), createCargo);
router.put('/:id', requirePermission('ADMIN_SISTEMA'), validate(updateCargoSchema), updateCargo);
router.delete('/:id', requirePermission('ADMIN_SISTEMA'), deleteCargo);

export default router;