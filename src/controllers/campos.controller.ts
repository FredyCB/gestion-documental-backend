import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCampos = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM campos ORDER BY nombre`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener campos' });
  }
};

export const getCampoById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM campos WHERE idcampo = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Campo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el campo' });
  }
};

export const createCampo = async (req: AuthRequest, res: Response) => {
  const { codigo, nombre, tipodato } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO campos (codigo, nombre, tipodato) VALUES ($1, $2, $3) RETURNING *`,
      [codigo, nombre, tipodato]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El código del campo ya existe' });
    }
    res.status(500).json({ message: 'Error al crear el campo' });
  }
};

export const updateCampo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { codigo, nombre, tipodato } = req.body;
  try {
    const result = await pool.query(
      `UPDATE campos SET
        codigo = COALESCE($1, codigo),
        nombre = COALESCE($2, nombre),
        tipodato = COALESCE($3, tipodato)
       WHERE idcampo = $4 RETURNING *`,
      [codigo, nombre, tipodato, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Campo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El código del campo ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar el campo' });
  }
};

export const deleteCampo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM campos WHERE idcampo = $1`, [id]);
    res.json({ message: 'Campo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el campo' });
  }
};