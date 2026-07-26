import { Router } from 'express';
import {
  enviarDocumento,
  aprobarDocumento,
  rechazarDocumento,
  getHistorialCompleto,
  getMovimientoActual
} from '../controllers/movimientos.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { enviarDocumentoSchema, aprobarRechazarSchema } from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Movimientos
 *   description: Movimientos y flujo de documentos
 */

/**
 * @swagger
 * /api/movimientos/enviar:
 *   post:
 *     summary: Enviar documento a otra unidad/paso
 *     tags: [Movimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idDocumento, idUnidadDestino]
 *             properties:
 *               idDocumento: { type: integer }
 *               idUnidadDestino: { type: integer }
 *               idPaso: { type: integer }
 *               observacion: { type: string }
 *     responses:
 *       200:
 *         description: Documento enviado
 */

/**
 * @swagger
 * /api/movimientos/aprobar:
 *   post:
 *     summary: Aprobar un documento
 *     tags: [Movimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idDocumento]
 *             properties:
 *               idDocumento: { type: integer }
 *               observacion: { type: string }
 *     responses:
 *       200:
 *         description: Documento aprobado
 */

/**
 * @swagger
 * /api/movimientos/rechazar:
 *   post:
 *     summary: Rechazar un documento
 *     tags: [Movimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idDocumento]
 *             properties:
 *               idDocumento: { type: integer }
 *               observacion: { type: string }
 *     responses:
 *       200:
 *         description: Documento rechazado
 */

router.use(authenticate);

router.post(
  '/enviar',
  requirePermission('DOCUMENTO_EDITAR'),
  validate(enviarDocumentoSchema),
  enviarDocumento
);

router.post(
  '/aprobar',
  requirePermission('DOCUMENTO_APROBAR'),
  validate(aprobarRechazarSchema),
  aprobarDocumento
);

router.post(
  '/rechazar',
  requirePermission('DOCUMENTO_APROBAR'),
  validate(aprobarRechazarSchema),
  rechazarDocumento
);

router.get('/historial/:id', requirePermission('DOCUMENTO_VER'), getHistorialCompleto);
router.get('/actual/:id', requirePermission('DOCUMENTO_VER'), getMovimientoActual);

export default router;