import { Router } from 'express';
import {
  getFirmasByDocumento,
  createFirma,
  updateFirma,
  getVerificacionesByDocumento,
  createVerificacion
} from '../controllers/firmas.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createFirmaSchema,
  updateFirmaSchema,
  createVerificacionSchema
} from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Firmas
 *   description: Gestión de firmas de aprobación y verificaciones
 */

/**
 * @swagger
 * /api/firmas/documento/{idDocumento}:
 *   get:
 *     summary: Listar firmas de un documento
 *     tags: [Firmas]
 *     parameters:
 *       - in: path
 *         name: idDocumento
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de firmas
 */

/**
 * @swagger
 * /api/firmas:
 *   post:
 *     summary: Crear una firma de aprobación
 *     tags: [Firmas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orden, iddocumento, idpersona]
 *             properties:
 *               orden: { type: integer }
 *               estado: { type: string, enum: [Pendiente, Aprobado, Rechazado] }
 *               observacion: { type: string }
 *               iddocumento: { type: integer }
 *               idpersona: { type: integer }
 *     responses:
 *       201:
 *         description: Firma creada
 */

/**
 * @swagger
 * /api/firmas/{id}:
 *   put:
 *     summary: Actualizar estado de una firma
 *     tags: [Firmas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado: { type: string, enum: [Pendiente, Aprobado, Rechazado] }
 *               observacion: { type: string }
 *     responses:
 *       200:
 *         description: Firma actualizada
 */

/**
 * @swagger
 * /api/firmas/verificaciones/documento/{idDocumento}:
 *   get:
 *     summary: Listar verificaciones de un documento
 *     tags: [Firmas]
 *     parameters:
 *       - in: path
 *         name: idDocumento
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de verificaciones
 */

/**
 * @swagger
 * /api/firmas/verificaciones:
 *   post:
 *     summary: Registrar una verificación
 *     tags: [Firmas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, resultado, iddocumento]
 *             properties:
 *               codigo: { type: string }
 *               resultado: { type: string }
 *               ip: { type: string }
 *               iddocumento: { type: integer }
 *     responses:
 *       201:
 *         description: Verificación registrada
 */

router.use(authenticate);

// Firmas
router.get(
  '/documento/:idDocumento',
  requirePermission('DOCUMENTO_VER'),
  getFirmasByDocumento
);

router.post(
  '/',
  requirePermission('DOCUMENTO_APROBAR'),
  validate(createFirmaSchema),
  createFirma
);

router.put(
  '/:id',
  requirePermission('DOCUMENTO_APROBAR'),
  validate(updateFirmaSchema),
  updateFirma
);

// Verificaciones
router.get(
  '/verificaciones/documento/:idDocumento',
  requirePermission('DOCUMENTO_VER'),
  getVerificacionesByDocumento
);

router.post(
  '/verificaciones',
  requirePermission('DOCUMENTO_EDITAR'),
  validate(createVerificacionSchema),
  createVerificacion
);

export default router;