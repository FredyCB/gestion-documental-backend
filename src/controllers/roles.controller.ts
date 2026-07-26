import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// ======================
// ROLES
// ======================

export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'idpermiso', p.idpermiso,
              'codigo', p.codigo,
              'nombre', p.nombre,
              'modulo', p.modulo
            )
          ) FILTER (WHERE p.idpermiso IS NOT NULL), '[]'
        ) as permisos
      FROM roles r
      LEFT JOIN rolpermisos rp ON r.idrol = rp.idrol
      LEFT JOIN permisos p ON rp.idpermiso = p.idpermiso
      GROUP BY r.idrol
      ORDER BY r.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
};

export const getRolById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'idpermiso', p.idpermiso,
              'codigo', p.codigo,
              'nombre', p.nombre,
              'modulo', p.modulo
            )
          ) FILTER (WHERE p.idpermiso IS NOT NULL), '[]'
        ) as permisos
      FROM roles r
      LEFT JOIN rolpermisos rp ON r.idrol = rp.idrol
      LEFT JOIN permisos p ON rp.idpermiso = p.idpermiso
      WHERE r.idrol = $1
      GROUP BY r.idrol
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el rol' });
  }
};

export const createRol = async (req: AuthRequest, res: Response) => {
  const { nombre, descripcion, permisos = [] } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const rolResult = await client.query(
      `INSERT INTO roles (nombre, descripcion) VALUES ($1, $2) RETURNING *`,
      [nombre, descripcion]
    );
    const rol = rolResult.rows[0];

    // Asignar permisos
    for (const idPermiso of permisos) {
      await client.query(
        `INSERT INTO rolpermisos (idrol, idpermiso) VALUES ($1, $2)`,
        [rol.idrol, idPermiso]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(rol);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El nombre del rol ya existe' });
    }
    res.status(500).json({ message: 'Error al crear el rol' });
  } finally {
    client.release();
  }
};

export const updateRol = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nombre, descripcion, activo, permisos } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE roles SET 
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        activo = COALESCE($3, activo)
       WHERE idrol = $4`,
      [nombre, descripcion, activo, id]
    );

    // Actualizar permisos si se envían
    if (Array.isArray(permisos)) {
      await client.query(`DELETE FROM rolpermisos WHERE idrol = $1`, [id]);

      for (const idPermiso of permisos) {
        await client.query(
          `INSERT INTO rolpermisos (idrol, idpermiso) VALUES ($1, $2)`,
          [id, idPermiso]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Rol actualizado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al actualizar el rol' });
  } finally {
    client.release();
  }
};

export const deleteRol = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    // Soft delete
    await pool.query(`UPDATE roles SET activo = false WHERE idrol = $1`, [id]);
    res.json({ message: 'Rol desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el rol' });
  }
};

// ======================
// PERMISOS
// ======================

export const getPermisos = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM permisos ORDER BY modulo, nombre
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener permisos' });
  }
};

export const createPermiso = async (req: AuthRequest, res: Response) => {
  const { codigo, nombre, descripcion, modulo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO permisos (codigo, nombre, descripcion, modulo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [codigo, nombre, descripcion, modulo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El código del permiso ya existe' });
    }
    res.status(500).json({ message: 'Error al crear el permiso' });
  }
};

// ======================
// ASIGNAR / QUITAR ROLES A USUARIOS
// ======================

export const asignarRolUsuario = async (req: AuthRequest, res: Response) => {
  const { idUsuario, idRol } = req.body;
  try {
    await pool.query(
      `INSERT INTO usuarioroles (idusuario, idrol, activo)
       VALUES ($1, $2, true)
       ON CONFLICT (idusuario, idrol) 
       DO UPDATE SET activo = true`,
      [idUsuario, idRol]
    );
    res.json({ message: 'Rol asignado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar rol' });
  }
};

export const quitarRolUsuario = async (req: AuthRequest, res: Response) => {
  const { idUsuario, idRol } = req.body;
  try {
    await pool.query(
      `UPDATE usuarioroles SET activo = false 
       WHERE idusuario = $1 AND idrol = $2`,
      [idUsuario, idRol]
    );
    res.json({ message: 'Rol removido correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al quitar rol' });
  }
};