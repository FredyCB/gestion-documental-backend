import { Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// ======================
// GET - Listar todos los usuarios
// ======================
export const getUsuarios = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.idusuario,
        u.correo,
        u.estado,
        u.fechacreacion,
        p.idpersona,
        p.identidad,
        p.primernombre,
        p.segundonombre,
        p.primerapellido,
        p.segundoapellido,
        p.correo as correo_persona,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'idrol', r.idrol,
              'nombre', r.nombre
            )
          ) FILTER (WHERE r.idrol IS NOT NULL), '[]'
        ) as roles
      FROM usuarios u
      JOIN personas p ON u.idpersona = p.idpersona
      LEFT JOIN usuarioroles ur ON u.idusuario = ur.idusuario AND ur.activo = true
      LEFT JOIN roles r ON ur.idrol = r.idrol
      GROUP BY u.idusuario, p.idpersona
      ORDER BY u.fechacreacion DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// ======================
// GET - Obtener un usuario por ID
// ======================
export const getUsuarioById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        u.idusuario,
        u.correo,
        u.estado,
        u.fechacreacion,
        p.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'idrol', r.idrol,
              'nombre', r.nombre
            )
          ) FILTER (WHERE r.idrol IS NOT NULL), '[]'
        ) as roles
      FROM usuarios u
      JOIN personas p ON u.idpersona = p.idpersona
      LEFT JOIN usuarioroles ur ON u.idusuario = ur.idusuario AND ur.activo = true
      LEFT JOIN roles r ON ur.idrol = r.idrol
      WHERE u.idusuario = $1
      GROUP BY u.idusuario, p.idpersona
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// ======================
// POST - Crear usuario
// ======================
export const createUsuario = async (req: AuthRequest, res: Response) => {
  const {
    correo,
    password,
    identidad,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    telefono,
    roles = [] // array de idRol
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Crear teléfono (opcional)
    let idTelefono = null;
    if (telefono) {
      const telResult = await client.query(
        `INSERT INTO telefonos (telefono) VALUES ($1) RETURNING idtelefono`,
        [telefono]
      );
      idTelefono = telResult.rows[0].idtelefono;
    }

    // 2. Crear persona
    const personaResult = await client.query(
      `INSERT INTO personas 
        (identidad, primernombre, segundonombre, primerapellido, segundoapellido, correo, idtelefono)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING idpersona`,
      [identidad, primerNombre, segundoNombre || null, primerApellido, segundoApellido || null, correo, idTelefono]
    );

    const idPersona = personaResult.rows[0].idpersona;

    // 3. Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear usuario
    const usuarioResult = await client.query(
      `INSERT INTO usuarios (correo, password, estado, idpersona)
       VALUES ($1, $2, true, $3)
       RETURNING idusuario, correo, estado, fechacreacion`,
      [correo, hashedPassword, idPersona]
    );

    const usuario = usuarioResult.rows[0];

    // 5. Asignar roles
    if (roles.length > 0) {
      for (const idRol of roles) {
        await client.query(
          `INSERT INTO usuarioroles (idusuario, idrol, activo)
           VALUES ($1, $2, true)`,
          [usuario.idusuario, idRol]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Usuario creado correctamente',
      usuario: {
        ...usuario,
        idpersona: idPersona
      }
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(error);

    if (error.code === '23505') {
      return res.status(400).json({ message: 'El correo o la identidad ya existen' });
    }

    res.status(500).json({ message: 'Error al crear el usuario' });
  } finally {
    client.release();
  }
};

// ======================
// PUT - Actualizar usuario
// ======================
export const updateUsuario = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    correo,
    password,
    estado,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    roles
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verificar que el usuario existe
    const userCheck = await client.query(
      `SELECT idpersona FROM usuarios WHERE idusuario = $1`,
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const idPersona = userCheck.rows[0].idpersona;

    // Actualizar persona
    await client.query(
      `UPDATE personas SET
        primernombre = COALESCE($1, primernombre),
        segundonombre = COALESCE($2, segundonombre),
        primerapellido = COALESCE($3, primerapellido),
        segundoapellido = COALESCE($4, segundoapellido)
       WHERE idpersona = $5`,
      [primerNombre, segundoNombre, primerApellido, segundoApellido, idPersona]
    );

    // Actualizar usuario
    let query = `UPDATE usuarios SET correo = COALESCE($1, correo), estado = COALESCE($2, estado)`;
    const params: any[] = [correo, estado];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = $3`;
      params.push(hashedPassword);
      query += ` WHERE idusuario = $4`;
      params.push(id);
    } else {
      query += ` WHERE idusuario = $3`;
      params.push(id);
    }

    await client.query(query, params);

    // Actualizar roles (si se envían)
    if (Array.isArray(roles)) {
      // Desactivar roles actuales
      await client.query(
        `UPDATE usuarioroles SET activo = false WHERE idusuario = $1`,
        [id]
      );

      // Insertar nuevos roles
      for (const idRol of roles) {
        await client.query(
          `INSERT INTO usuarioroles (idusuario, idrol, activo)
           VALUES ($1, $2, true)
           ON CONFLICT (idusuario, idrol) 
           DO UPDATE SET activo = true`,
          [id, idRol]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(error);

    if (error.code === '23505') {
      return res.status(400).json({ message: 'El correo ya está en uso' });
    }

    res.status(500).json({ message: 'Error al actualizar el usuario' });
  } finally {
    client.release();
  }
};

// ======================
// DELETE - Eliminar (desactivar) usuario
// ======================
export const deleteUsuario = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE usuarios SET estado = false WHERE idusuario = $1 RETURNING idusuario`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // También desactivar sus roles
    await pool.query(
      `UPDATE usuarioroles SET activo = false WHERE idusuario = $1`,
      [id]
    );

    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};