import { Response, NextFunction } from 'express';
import pool from '../config/database';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware para verificar si el usuario tiene un permiso específico
 * Uso: requirePermission('DOCUMENTO_APROBAR')
 */
export const requirePermission = (permisoRequerido: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const idUsuario = req.user?.idUsuario;

      if (!idUsuario) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      // Consultar si el usuario tiene el permiso a través de sus roles
      const result = await pool.query(
        `
        SELECT 1
        FROM usuarioroles ur
        JOIN rolpermisos rp ON ur.idrol = rp.idrol
        JOIN permisos p ON rp.idpermiso = p.idpermiso
        WHERE ur.idusuario = $1
          AND ur.activo = true
          AND p.codigo = $2
        LIMIT 1
        `,
        [idUsuario, permisoRequerido]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          message: `No tienes permiso para realizar esta acción (${permisoRequerido})`
        });
      }

      next();
    } catch (error) {
      console.error('Error en requirePermission:', error);
      res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};

/**
 * Versión que permite varios permisos (OR)
 * Uso: requireAnyPermission(['DOCUMENTO_APROBAR', 'DOCUMENTO_EDITAR'])
 */
export const requireAnyPermission = (permisos: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const idUsuario = req.user?.idUsuario;

      if (!idUsuario) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const result = await pool.query(
        `
        SELECT 1
        FROM usuarioroles ur
        JOIN rolpermisos rp ON ur.idrol = rp.idrol
        JOIN permisos p ON rp.idpermiso = p.idpermiso
        WHERE ur.idusuario = $1
          AND ur.activo = true
          AND p.codigo = ANY($2)
        LIMIT 1
        `,
        [idUsuario, permisos]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          message: `No tienes ninguno de los permisos requeridos: ${permisos.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};