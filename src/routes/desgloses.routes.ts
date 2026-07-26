import { Router } from 'express';
import {
  getPlantillasDesglose,
  getPlantillasByTipoDocumento,
  createPlantillaDesglose,
  updatePlantillaDesglose,
  deletePlantillaDesglose,
  getDesglosesByDocumento,
  createDesgloseDocumento,
  updateDesgloseDocumento,
  deleteDesgloseDocumento
} from '../controllers/desglose.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createPlantillaDesgloseSchema,
  updatePlantillaDesgloseSchema,
  createDesgloseDocumentoSchema,
  updateDesgloseDocumentoSchema
} from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Desgloses
 *   description: Gestión de desgloses y plantillas de desglose
 */

/**
 * @swagger
 * /api/desgloses/plantillas:
 *   get:
 *     summary: Listar todas las plantillas de desglose
 *     tags: [Desgloses]
 *     responses:
 *       200:
 *         description: Lista de plantillas
 *   post:
 *     summary: Crear una plantilla de desglose
 *     tags: [Desgloses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombreseccion, idtipodocumento]
 *             properties:
 *               nombreseccion: { type: string }
 *               orden: { type: integer }
 *               idtipodocumento: { type: integer }
 *     responses:
 *       201:
 *         description: Plantilla creada
 */

/**
 * @swagger
 * /api/desgloses/plantillas/tipo/{idTipoDocumento}:
 *   get:
 *     summary: Obtener plantillas por tipo de documento
 *     tags: [Desgloses]
 *     parameters:
 *       - in: path
 *         name: idTipoDocumento
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de plantillas
 */

/**
 * @swagger
 * /api/desgloses/documento/{idDocumento}:
 *   get:
 *     summary: Obtener desgloses de un documento
 *     tags: [Desgloses]
 *     parameters:
 *       - in: path
 *         name: idDocumento
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de desgloses
 */

/**
 * @swagger
 * /api/desgloses/documento:
 *   post:
 *     summary: Crear un desglose en un documento
 *     tags: [Desgloses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contenido, iddocumento, idplantilla]
 *             properties:
 *               contenido: { type: string }
 *               iddocumento: { type: integer }
 *               idplantilla: { type: integer }
 *     responses:
 *       201:
 *         description: Desglose creado
 */

router.use(authenticate);

// Plantillas de Desglose
router.get('/plantillas', requirePermission('DOCUMENTO_VER'), getPlantillasDesglose);
router.get('/plantillas/tipo/:idTipoDocumento', requirePermission('DOCUMENTO_VER'), getPlantillasByTipoDocumento);

router.post(
  '/plantillas',
  requirePermission('ADMIN_SISTEMA'),
  validate(createPlantillaDesgloseSchema),
  createPlantillaDesglose
);

router.put(
  '/plantillas/:id',
  requirePermission('ADMIN_SISTEMA'),
  validate(updatePlantillaDesgloseSchema),
  updatePlantillaDesglose
);

router.delete('/plantillas/:id', requirePermission('ADMIN_SISTEMA'), deletePlantillaDesglose);

// Desgloses de Documento
router.get('/documento/:idDocumento', requirePermission('DOCUMENTO_VER'), getDesglosesByDocumento);

router.post(
  '/documento',
  requirePermission('DOCUMENTO_EDITAR'),
  validate(createDesgloseDocumentoSchema),
  createDesgloseDocumento
);

router.put(
  '/documento/:id',
  requirePermission('DOCUMENTO_EDITAR'),
  validate(updateDesgloseDocumentoSchema),
  updateDesgloseDocumento
);

router.delete('/documento/:id', requirePermission('DOCUMENTO_EDITAR'), deleteDesgloseDocumento);

export default router;