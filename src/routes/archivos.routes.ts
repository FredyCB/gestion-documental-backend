import { Router } from 'express';
import {
  uploadArchivo,
  getArchivosByDocumento,
  downloadArchivo,
  deleteArchivo
} from '../controllers/archivos.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Archivos
 *   description: Gestión de archivos adjuntos
 */

/**
 * @swagger
 * /api/archivos/upload:
 *   post:
 *     summary: Subir un archivo
 *     tags: [Archivos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [archivo, idDocumento]
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *               idDocumento:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Archivo subido
 */

/**
 * @swagger
 * /api/archivos/documento/{idDocumento}:
 *   get:
 *     summary: Listar archivos de un documento
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: idDocumento
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de archivos
 */

/**
 * @swagger
 * /api/archivos/download/{id}:
 *   get:
 *     summary: Descargar un archivo
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Archivo descargado
 */

/**
 * @swagger
 * /api/archivos/{id}:
 *   delete:
 *     summary: Eliminar un archivo
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Archivo eliminado
 */

router.use(authenticate);

router.post(
  '/upload',
  requirePermission('DOCUMENTO_EDITAR'),
  upload.single('archivo'),
  uploadArchivo
);

router.get(
  '/documento/:idDocumento',
  requirePermission('DOCUMENTO_VER'),
  getArchivosByDocumento
);

router.get(
  '/download/:id',
  requirePermission('DOCUMENTO_VER'),
  downloadArchivo
);

router.delete(
  '/:id',
  requirePermission('DOCUMENTO_EDITAR'),
  deleteArchivo
);

export default router;