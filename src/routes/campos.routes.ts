import { Router } from 'express';
import {
  getCampos,
  getCampoById,
  createCampo,
  updateCampo,
  deleteCampo
} from '../controllers/campos.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCampoSchema, updateCampoSchema } from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Campos
 *   description: Gestión de campos dinámicos
 */

/**
 * @swagger
 * /api/campos:
 *   get:
 *     summary: Listar todos los campos
 *     tags: [Campos]
 *     responses:
 *       200:
 *         description: Lista de campos
 *   post:
 *     summary: Crear un nuevo campo
 *     tags: [Campos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, nombre, tipodato]
 *             properties:
 *               codigo: { type: string }
 *               nombre: { type: string }
 *               tipodato: { type: string, enum: [texto, numerico, fecha, booleano, lista] }
 *     responses:
 *       201:
 *         description: Campo creado
 */

/**
 * @swagger
 * /api/campos/{id}:
 *   get:
 *     summary: Obtener un campo por ID
 *     tags: [Campos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos del campo
 *   put:
 *     summary: Actualizar un campo
 *     tags: [Campos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Campo actualizado
 *   delete:
 *     summary: Eliminar un campo
 *     tags: [Campos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Campo eliminado
 */

router.use(authenticate);

router.get('/', requirePermission('DOCUMENTO_VER'), getCampos);
router.get('/:id', requirePermission('DOCUMENTO_VER'), getCampoById);
router.post('/', requirePermission('ADMIN_SISTEMA'), validate(createCampoSchema), createCampo);
router.put('/:id', requirePermission('ADMIN_SISTEMA'), validate(updateCampoSchema), updateCampo);
router.delete('/:id', requirePermission('ADMIN_SISTEMA'), deleteCampo);

export default router;