import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// ======================
// Enviar documento a otro paso / unidad
// ======================
export const enviarDocumento = async (req: AuthRequest, res: Response) => {
  const { idDocumento, idUnidadDestino, idPaso, observacion } = req.body;
  const idUsuario = req.user?.idUsuario;
  const correoUsuario = req.user?.correo;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener estado actual
    const movActual = await client.query(
      `SELECT * FROM movimientodocumento 
       WHERE iddocumento = $1 
       ORDER BY fecha DESC LIMIT 1`,
      [idDocumento]
    );

    const estadoAnterior = movActual.rows[0]?.estadoactual || 'Borrador';

    // 2. Actualizar / insertar movimiento actual
    const nuevoMov = await client.query(
      `INSERT INTO movimientodocumento 
        (tipomovimiento, observacion, responsable, iddocumento, idunidad, idpaso, estadoactual)
       VALUES ('Envio', $1, $2, $3, $4, $5, 'En Proceso')
       RETURNING *`,
      [observacion || 'Documento enviado', idUsuario, idDocumento, idUnidadDestino, idPaso]
    );

    // 3. Actualizar estado del documento
    await client.query(
      `UPDATE documentos SET 
        estado = 'En Proceso',
        fechaactualizacion = CURRENT_TIMESTAMP
       WHERE iddocumento = $1`,
      [idDocumento]
    );

    // 4. Guardar en historial
    await client.query(
      `INSERT INTO historial_movimientodocumento 
        (idmovimiento, tipomovimiento, usuarioresponsable, accion, observacion, iddocumento)
       VALUES ($1, 'Envio', $2, 'Documento enviado', $3, $4)`,
      [
        nuevoMov.rows[0].idmovimiento,
        correoUsuario,
        observacion || `Enviado a unidad ${idUnidadDestino}`,
        idDocumento
      ]
    );

    await client.query('COMMIT');
    res.json({ message: 'Documento enviado correctamente', movimiento: nuevoMov.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el documento' });
  } finally {
    client.release();
  }
};

// ======================
// Aprobar documento
// ======================
export const aprobarDocumento = async (req: AuthRequest, res: Response) => {
  const { idDocumento, observacion } = req.body;
  const idUsuario = req.user?.idUsuario;
  const correoUsuario = req.user?.correo;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Crear movimiento de aprobación
    const nuevoMov = await client.query(
      `INSERT INTO movimientodocumento 
        (tipomovimiento, observacion, responsable, iddocumento, estadoactual)
       VALUES ('Aprobacion', $1, $2, $3, 'Aprobado')
       RETURNING *`,
      [observacion || 'Documento aprobado', idUsuario, idDocumento]
    );

    // 2. Actualizar documento
    await client.query(
      `UPDATE documentos SET 
        estado = 'Aprobado',
        fechaactualizacion = CURRENT_TIMESTAMP
       WHERE iddocumento = $1`,
      [idDocumento]
    );

    // 3. Registrar firma de aprobación
    await client.query(
      `INSERT INTO firmaaprobaciones (orden, estado, fechafirma, observacion, iddocumento, idpersona)
       VALUES (
         (SELECT COALESCE(MAX(orden), 0) + 1 FROM firmaaprobaciones WHERE iddocumento = $1),
         'Aprobado',
         CURRENT_TIMESTAMP,
         $2,
         $1,
         (SELECT idpersona FROM usuarios WHERE idusuario = $3)
       )`,
      [idDocumento, observacion || 'Aprobado', idUsuario]
    );

    // 4. Historial
    await client.query(
      `INSERT INTO historial_movimientodocumento 
        (idmovimiento, tipomovimiento, usuarioresponsable, accion, observacion, iddocumento)
       VALUES ($1, 'Aprobacion', $2, 'Documento aprobado', $3, $4)`,
      [nuevoMov.rows[0].idmovimiento, correoUsuario, observacion || 'Aprobado', idDocumento]
    );

    await client.query('COMMIT');
    res.json({ message: 'Documento aprobado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al aprobar el documento' });
  } finally {
    client.release();
  }
};

// ======================
// Rechazar documento
// ======================
export const rechazarDocumento = async (req: AuthRequest, res: Response) => {
  const { idDocumento, observacion } = req.body;
  const idUsuario = req.user?.idUsuario;
  const correoUsuario = req.user?.correo;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const nuevoMov = await client.query(
      `INSERT INTO movimientodocumento 
        (tipomovimiento, observacion, responsable, iddocumento, estadoactual)
       VALUES ('Rechazo', $1, $2, $3, 'Rechazado')
       RETURNING *`,
      [observacion || 'Documento rechazado', idUsuario, idDocumento]
    );

    await client.query(
      `UPDATE documentos SET 
        estado = 'Rechazado',
        fechaactualizacion = CURRENT_TIMESTAMP
       WHERE iddocumento = $1`,
      [idDocumento]
    );

    await client.query(
      `INSERT INTO historial_movimientodocumento 
        (idmovimiento, tipomovimiento, usuarioresponsable, accion, observacion, iddocumento)
       VALUES ($1, 'Rechazo', $2, 'Documento rechazado', $3, $4)`,
      [nuevoMov.rows[0].idmovimiento, correoUsuario, observacion || 'Rechazado', idDocumento]
    );

    await client.query('COMMIT');
    res.json({ message: 'Documento rechazado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al rechazar el documento' });
  } finally {
    client.release();
  }
};

// ======================
// Obtener historial completo de un documento
// ======================
export const getHistorialCompleto = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        h.*,
        m.tipomovimiento as tipo_movimiento_original,
        m.estadoactual
       FROM historial_movimientodocumento h
       LEFT JOIN movimientodocumento m ON h.idmovimiento = m.idmovimiento
       WHERE h.iddocumento = $1
       ORDER BY h.fecha DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el historial' });
  }
};

// ======================
// Obtener movimiento actual de un documento
// ======================
export const getMovimientoActual = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM movimientodocumento 
       WHERE iddocumento = $1 
       ORDER BY fecha DESC LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró movimiento' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimiento actual' });
  }
};