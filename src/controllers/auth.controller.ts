import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  const { correo, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT u.*, p.primernombre, p.primerapellido 
       FROM usuarios u
       JOIN personas p ON u.idpersona = p.idpersona
       WHERE u.correo = $1 AND u.estado = true`,
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Obtener roles del usuario
    const rolesResult = await pool.query(
      `SELECT r.nombre 
       FROM usuarioroles ur
       JOIN roles r ON ur.idrol = r.idrol
       WHERE ur.idusuario = $1 AND ur.activo = true`,
      [user.idusuario]
    );

    const roles = rolesResult.rows.map((r) => r.nombre);

    const token = generateToken({
      idUsuario: user.idusuario,
      correo: user.correo,
      nombre: `${user.primernombre} ${user.primerapellido}`,
      roles,
    });

    res.json({
      token,
      user: {
        idUsuario: user.idusuario,
        correo: user.correo,
        nombre: `${user.primernombre} ${user.primerapellido}`,
        roles,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};