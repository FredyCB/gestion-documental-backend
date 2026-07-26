import { Router } from 'express';
import {
  getDocumentos,
  getDocumentoById,
  createDocumento,
  getHistorialDocumento,
  getTrazabilidad
} from '../controllers/documentos.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createDocumentoSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('DOCUMENTO_VER'), getDocumentos);
router.get('/:id', requirePermission('DOCUMENTO_VER'), getDocumentoById);
router.get('/:id/historial', requirePermission('DOCUMENTO_VER'), getHistorialDocumento);
router.get('/:id/trazabilidad', requirePermission('DOCUMENTO_VER'), getTrazabilidad);

router.post(
  '/',
  requirePermission('DOCUMENTO_CREAR'),
  validate(createDocumentoSchema),
  createDocumento
);

export default router;