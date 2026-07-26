import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTipoDocumentos = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tipodocumentos ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener tipos de documento' });
  }
};

export const getTipoDocumentoById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM tipodocumentos WHERE idtipodocumento = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tipo de documento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el tipo de documento' });
  }
};

export const createTipoDocumento = async (req: AuthRequest, res: Response) => {
  const { codigo, nombre, descripcion } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tipodocumentos (codigo, nombre, descripcion)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [codigo, nombre, descripcion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El código del tipo de documento ya existe' });
    }
    res.status(500).json({ message: 'Error al crear el tipo de documento' });
  }
};

export const updateTipoDocumento = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { codigo, nombre, descripcion } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tipodocumentos SET
        codigo = COALESCE($1, codigo),
        nombre = COALESCE($2, nombre),
        descripcion = COALESCE($3, descripcion)
       WHERE idtipodocumento = $4
       RETURNING *`,
      [codigo, nombre, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tipo de documento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El código ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar el tipo de documento' });
  }
};

export const deleteTipoDocumento = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    // Verificamos si hay documentos usando este tipo
    const check = await pool.query(
      `SELECT COUNT(*) FROM documentos WHERE idtipodocumento = $1`,
      [id]
    );

    if (Number(check.rows[0].count) > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar. Existen documentos asociados a este tipo.'
      });
    }

    await pool.query(`DELETE FROM tipodocumentos WHERE idtipodocumento = $1`, [id]);
    res.json({ message: 'Tipo de documento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el tipo de documento' });
  }
};