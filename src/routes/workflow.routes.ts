import { Router } from 'express';
import {
  getPlantillasWF,
  getPlantillaWFById,
  createPlantillaWF,
  updatePlantillaWF,
  deletePlantillaWF,
  getPasosByPlantilla
} from '../controllers/workflow.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPlantillaWFSchema, updatePlantillaWFSchema } from '../schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Workflow
 *   description: Gestión de plantillas de workflow
 */

/**
 * @swagger
 * /api/workflow:
 *   get:
 *     summary: Listar todas las plantillas de workflow
 *     tags: [Workflow]
 *     responses:
 *       200:
 *         description: Lista de plantillas
 *   post:
 *     summary: Crear una nueva plantilla de workflow
 *     tags: [Workflow]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, idtipodocumento]
 *             properties:
 *               nombre: { type: string }
 *               idtipodocumento: { type: integer }
 *               pasos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     orden: { type: integer }
 *                     idcargo: { type: integer }
 *     responses:
 *       201:
 *         description: Plantilla creada
 */

/**
 * @swagger
 * /api/workflow/{id}:
 *   get:
 *     summary: Obtener una plantilla por ID
 *     tags: [Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos de la plantilla
 *   put:
 *     summary: Actualizar una plantilla
 *     tags: [Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plantilla actualizada
 *   delete:
 *     summary: Eliminar una plantilla
 *     tags: [Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plantilla eliminada
 */

/**
 * @swagger
 * /api/workflow/{id}/pasos:
 *   get:
 *     summary: Obtener los pasos de una plantilla
 *     tags: [Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de pasos
 */

router.use(authenticate);

router.get('/', requirePermission('WORKFLOW_ADMIN'), getPlantillasWF);
router.get('/:id', requirePermission('WORKFLOW_ADMIN'), getPlantillaWFById);
router.get('/:id/pasos', requirePermission('WORKFLOW_ADMIN'), getPasosByPlantilla);

router.post(
  '/',
  requirePermission('WORKFLOW_ADMIN'),
  validate(createPlantillaWFSchema),
  createPlantillaWF
);

router.put(
  '/:id',
  requirePermission('WORKFLOW_ADMIN'),
  validate(updatePlantillaWFSchema),
  updatePlantillaWF
);

router.delete('/:id', requirePermission('WORKFLOW_ADMIN'), deletePlantillaWF);

export default router;