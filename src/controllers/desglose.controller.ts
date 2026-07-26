import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// ======================
// PLANTILLAS DESGLOSE
// ======================

export const getPlantillasDesglose = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        pd.*,
        td.nombre as tipo_documento
      FROM plantillasdesglose pd
      JOIN tipodocumentos td ON pd.idtipodocumento = td.idtipodocumento
      ORDER BY pd.idtipodocumento, pd.orden
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener plantillas de desglose' });
  }
};

export const getPlantillasByTipoDocumento = async (req: AuthRequest, res: Response) => {
  const { idTipoDocumento } = req.params;
  try {
    const result = await pool.query(`
      SELECT * FROM plantillasdesglose 
      WHERE idtipodocumento = $1 
      ORDER BY orden
    `, [idTipoDocumento]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener plantillas' });
  }
};

export const createPlantillaDesglose = async (req: AuthRequest, res: Response) => {
  const { nombreseccion, orden, idtipodocumento } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO plantillasdesglose (nombreseccion, orden, idtipodocumento)
       VALUES ($1, $2, $3) RETURNING *`,
      [nombreseccion, orden, idtipodocumento]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear plantilla de desglose' });
  }
};

export const updatePlantillaDesglose = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nombreseccion, orden, idtipodocumento } = req.body;
  try {
    const result = await pool.query(
      `UPDATE plantillasdesglose SET
        nombreseccion = COALESCE($1, nombreseccion),
        orden = COALESCE($2, orden),
        idtipodocumento = COALESCE($3, idtipodocumento)
       WHERE idplantilla = $4 RETURNING *`,
      [nombreseccion, orden, idtipodocumento, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la plantilla' });
  }
};

export const deletePlantillaDesglose = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM plantillasdesglose WHERE idplantilla = $1`, [id]);
    res.json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la plantilla' });
  }
};

// ======================
// DESGLOSES DE DOCUMENTO
// ======================

export const getDesglosesByDocumento = async (req: AuthRequest, res: Response) => {
  const { idDocumento } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        d.*,
        pd.nombreseccion,
        pd.orden
      FROM desglosesdocumento d
      JOIN plantillasdesglose pd ON d.idplantilla = pd.idplantilla
      WHERE d.iddocumento = $1
      ORDER BY pd.orden
    `, [idDocumento]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener desgloses del documento' });
  }
};

export const createDesgloseDocumento = async (req: AuthRequest, res: Response) => {
  const { contenido, iddocumento, idplantilla } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO desglosesdocumento (contenido, iddocumento, idplantilla)
       VALUES ($1, $2, $3) RETURNING *`,
      [contenido, iddocumento, idplantilla]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear desglose' });
  }
};

export const updateDesgloseDocumento = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { contenido } = req.body;
  try {
    const result = await pool.query(
      `UPDATE desglosesdocumento SET contenido = $1 
       WHERE iddesglose = $2 RETURNING *`,
      [contenido, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Desglose no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el desglose' });
  }
};

export const deleteDesgloseDocumento = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM desglosesdocumento WHERE iddesglose = $1`, [id]);
    res.json({ message: 'Desglose eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el desglose' });
  }
};