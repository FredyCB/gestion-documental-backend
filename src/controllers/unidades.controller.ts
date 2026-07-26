import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUnidades = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM unidades ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener unidades' });
  }
};

export const getUnidadById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM unidades WHERE idunidad = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Unidad no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la unidad' });
  }
};

export const createUnidad = async (req: AuthRequest, res: Response) => {
  const { nombre, descripcion, activo = true } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO unidades (nombre, descripcion, activo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion, activo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El nombre de la unidad ya existe' });
    }
    res.status(500).json({ message: 'Error al crear la unidad' });
  }
};

export const updateUnidad = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nombre, descripcion, activo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE unidades SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        activo = COALESCE($3, activo)
       WHERE idunidad = $4
       RETURNING *`,
      [nombre, descripcion, activo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Unidad no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El nombre de la unidad ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar la unidad' });
  }
};

export const deleteUnidad = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    // Soft delete
    const result = await pool.query(
      `UPDATE unidades SET activo = false WHERE idunidad = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Unidad no encontrada' });
    }

    res.json({ message: 'Unidad desactivada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la unidad' });
  }
};