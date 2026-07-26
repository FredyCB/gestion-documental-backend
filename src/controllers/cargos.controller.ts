import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCargos = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM cargos ORDER BY nombre`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cargos' });
  }
};

export const getCargoById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM cargos WHERE idcargo = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cargo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el cargo' });
  }
};

export const createCargo = async (req: AuthRequest, res: Response) => {
  const { nombre, descripcion, activo = true } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO cargos (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING *`,
      [nombre, descripcion, activo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El nombre del cargo ya existe' });
    }
    res.status(500).json({ message: 'Error al crear el cargo' });
  }
};

export const updateCargo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nombre, descripcion, activo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cargos SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        activo = COALESCE($3, activo)
       WHERE idcargo = $4 RETURNING *`,
      [nombre, descripcion, activo, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cargo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El nombre del cargo ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar el cargo' });
  }
};

export const deleteCargo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE cargos SET activo = false WHERE idcargo = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cargo no encontrado' });
    }
    res.json({ message: 'Cargo desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el cargo' });
  }
};