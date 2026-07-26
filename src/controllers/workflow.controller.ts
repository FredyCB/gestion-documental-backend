import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// ======================
// PLANTILLAS WF
// ======================

export const getPlantillasWF = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        pw.*,
        td.nombre as tipo_documento,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'idpaso', p.idpaso,
              'orden', p.orden,
              'idcargo', p.idcargo,
              'cargo', c.nombre
            ) ORDER BY p.orden
          ) FILTER (WHERE p.idpaso IS NOT NULL), '[]'
        ) as pasos
      FROM plantillaswf pw
      JOIN tipodocumentos td ON pw.idtipodocumento = td.idtipodocumento
      LEFT JOIN pasoswf p ON pw.idworkflow = p.idworkflow
      LEFT JOIN cargos c ON p.idcargo = c.idcargo
      GROUP BY pw.idworkflow, td.nombre
      ORDER BY pw.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener plantillas de workflow' });
  }
};

export const getPlantillaWFById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        pw.*,
        td.nombre as tipo_documento,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'idpaso', p.idpaso,
              'orden', p.orden,
              'idcargo', p.idcargo,
              'cargo', c.nombre
            ) ORDER BY p.orden
          ) FILTER (WHERE p.idpaso IS NOT NULL), '[]'
        ) as pasos
      FROM plantillaswf pw
      JOIN tipodocumentos td ON pw.idtipodocumento = td.idtipodocumento
      LEFT JOIN pasoswf p ON pw.idworkflow = p.idworkflow
      LEFT JOIN cargos c ON p.idcargo = c.idcargo
      WHERE pw.idworkflow = $1
      GROUP BY pw.idworkflow, td.nombre
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plantilla de workflow no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la plantilla' });
  }
};

export const createPlantillaWF = async (req: AuthRequest, res: Response) => {
  const { nombre, idtipodocumento, pasos = [] } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const plantillaResult = await client.query(
      `INSERT INTO plantillaswf (nombre, idtipodocumento)
       VALUES ($1, $2) RETURNING *`,
      [nombre, idtipodocumento]
    );
    const plantilla = plantillaResult.rows[0];

    // Insertar pasos
    for (const paso of pasos) {
      await client.query(
        `INSERT INTO pasoswf (idworkflow, orden, idcargo)
         VALUES ($1, $2, $3)`,
        [plantilla.idworkflow, paso.orden, paso.idcargo]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(plantilla);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al crear la plantilla de workflow' });
  } finally {
    client.release();
  }
};

export const updatePlantillaWF = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nombre, idtipodocumento, pasos } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE plantillaswf SET
        nombre = COALESCE($1, nombre),
        idtipodocumento = COALESCE($2, idtipodocumento)
       WHERE idworkflow = $3`,
      [nombre, idtipodocumento, id]
    );

    // Si se envían pasos, reemplazarlos
    if (Array.isArray(pasos)) {
      await client.query(`DELETE FROM pasoswf WHERE idworkflow = $1`, [id]);

      for (const paso of pasos) {
        await client.query(
          `INSERT INTO pasoswf (idworkflow, orden, idcargo)
           VALUES ($1, $2, $3)`,
          [id, paso.orden, paso.idcargo]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Plantilla actualizada correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al actualizar la plantilla' });
  } finally {
    client.release();
  }
};

export const deletePlantillaWF = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM pasoswf WHERE idworkflow = $1`, [id]);
    await client.query(`DELETE FROM plantillaswf WHERE idworkflow = $1`, [id]);
    await client.query('COMMIT');
    res.json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al eliminar la plantilla' });
  } finally {
    client.release();
  }
};

// ======================
// PASOS WF (individuales)
// ======================

export const getPasosByPlantilla = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre as cargo
      FROM pasoswf p
      JOIN cargos c ON p.idcargo = c.idcargo
      WHERE p.idworkflow = $1
      ORDER BY p.orden
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pasos' });
  }
};