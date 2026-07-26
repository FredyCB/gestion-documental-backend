import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// ======================
// FIRMAS DE APROBACIÓN
// ======================

export const getFirmasByDocumento = async (req: AuthRequest, res: Response) => {
  const { idDocumento } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        f.*,
        p.primernombre,
        p.primerapellido,
        p.identidad
      FROM firmaaprobaciones f
      JOIN personas p ON f.idpersona = p.idpersona
      WHERE f.iddocumento = $1
      ORDER BY f.orden
    `, [idDocumento]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener firmas' });
  }
};

export const createFirma = async (req: AuthRequest, res: Response) => {
  const { orden, estado = 'Pendiente', observacion, iddocumento, idpersona } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO firmaaprobaciones 
        (orden, estado, observacion, iddocumento, idpersona)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orden, estado, observacion, iddocumento, idpersona]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear firma' });
  }
};

export const updateFirma = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { estado, observacion } = req.body;
  try {
    const result = await pool.query(
      `UPDATE firmaaprobaciones SET
        estado = COALESCE($1, estado),
        observacion = COALESCE($2, observacion),
        fechafirma = CASE WHEN $1 IN ('Aprobado', 'Rechazado') THEN CURRENT_TIMESTAMP ELSE fechafirma END
       WHERE idfirma = $3
       RETURNING *`,
      [estado, observacion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Firma no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la firma' });
  }
};

// ======================
// VERIFICACIONES LOG
// ======================

export const getVerificacionesByDocumento = async (req: AuthRequest, res: Response) => {
  const { idDocumento } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM verificacioneslog 
       WHERE iddocumento = $1 
       ORDER BY fecha DESC`,
      [idDocumento]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener verificaciones' });
  }
};

export const createVerificacion = async (req: AuthRequest, res: Response) => {
  const { codigo, resultado, ip, iddocumento } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO verificacioneslog (codigo, resultado, ip, iddocumento)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [codigo, resultado, ip, iddocumento]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar verificación' });
  }
};