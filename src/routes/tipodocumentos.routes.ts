import { Router } from 'express';
import {
  getTipoDocumentos,
  getTipoDocumentoById,
  createTipoDocumento,
  updateTipoDocumento,
  deleteTipoDocumento
} from '../controllers/tipodocumentos.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTipoDocumentoSchema, updateTipoDocumentoSchema } from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TiposDocumento
 *   description: Gestión de tipos de documento
 */

/**
 * @swagger
 * /api/tipodocumentos:
 *   get:
 *     summary: Listar todos los tipos de documento
 *     tags: [TiposDocumento]
 *     responses:
 *       200:
 *         description: Lista de tipos de documento
 *   post:
 *     summary: Crear un nuevo tipo de documento
 *     tags: [TiposDocumento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, nombre]
 *             properties:
 *               codigo: { type: string }
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *     responses:
 *       201:
 *         description: Tipo de documento creado
 */

/**
 * @swagger
 * /api/tipodocumentos/{id}:
 *   get:
 *     summary: Obtener un tipo de documento por ID
 *     tags: [TiposDocumento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos del tipo de documento
 *   put:
 *     summary: Actualizar un tipo de documento
 *     tags: [TiposDocumento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tipo de documento actualizado
 *   delete:
 *     summary: Eliminar un tipo de documento
 *     tags: [TiposDocumento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tipo de documento eliminado
 */

router.use(authenticate);

router.get('/', requirePermission('DOCUMENTO_VER'), getTipoDocumentos);
router.get('/:id', requirePermission('DOCUMENTO_VER'), getTipoDocumentoById);

router.post(
  '/',
  requirePermission('ADMIN_SISTEMA'),
  validate(createTipoDocumentoSchema),
  createTipoDocumento
);

router.put(
  '/:id',
  requirePermission('ADMIN_SISTEMA'),
  validate(updateTipoDocumentoSchema),
  updateTipoDocumento
);

router.delete('/:id', requirePermission('ADMIN_SISTEMA'), deleteTipoDocumento);

export default router;