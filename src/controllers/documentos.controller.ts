import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generarCodigoDocumento } from '../utils/codigo';

// ======================
// Listar documentos
// ======================
export const getDocumentos = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.*,
        td.nombre as tipo_documento,
        td.codigo as tipo_codigo,
        u.nombre as unidad
      FROM documentos d
      JOIN tipodocumentos td ON d.idtipodocumento = td.idtipodocumento
      JOIN unidades u ON d.idunidad = u.idunidad
      ORDER BY d.fechacreacion DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener documentos' });
  }
};

// ======================
// Obtener un documento completo
// ======================
export const getDocumentoById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const docResult = await pool.query(`
      SELECT 
        d.*,
        td.nombre as tipo_documento,
        td.codigo as tipo_codigo,
        u.nombre as unidad
      FROM documentos d
      JOIN tipodocumentos td ON d.idtipodocumento = td.idtipodocumento
      JOIN unidades u ON d.idunidad = u.idunidad
      WHERE d.iddocumento = $1
    `, [id]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const doc = docResult.rows[0];

    const [archivos, campos, firmas, movimientos] = await Promise.all([
      pool.query(`SELECT * FROM archivos WHERE iddocumento = $1`, [id]),
      pool.query(`
        SELECT dc.*, c.nombre AS campo_nombre, c.codigo AS campo_codigo, c.tipodato
        FROM documentocampos dc
        JOIN campos c ON c.idcampo = dc.idcampo
        WHERE dc.iddocumento = $1
      `, [id]),
      pool.query(`
        SELECT f.*, p.primernombre, p.primerapellido
        FROM firmaaprobaciones f
        JOIN personas p ON p.idpersona = f.idpersona
        WHERE f.iddocumento = $1
        ORDER BY f.orden ASC
      `, [id]),
      pool.query(`
        SELECT * FROM movimientodocumento 
        WHERE iddocumento = $1 
        ORDER BY fecha ASC
      `, [id])
    ]);

    res.json({
      ...doc,
      archivos: archivos.rows,
      campos: campos.rows,
      firmas: firmas.rows,
      movimientos: movimientos.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el documento' });
  }
};

// ======================
// Crear documento
// ======================
export const createDocumento = async (req: AuthRequest, res: Response) => {
  const { titulo, descripcion, idtipodocumento, idunidad, campos = [] } = req.body;
  const idUsuario = req.user?.idUsuario;
  const correoUsuario = req.user?.correo;

  const client = await pool.connect();

  try {
    // Obtener código del tipo de documento
    const tipoResult = await client.query(
      `SELECT codigo FROM tipodocumentos WHERE idtipodocumento = $1`,
      [idtipodocumento]
    );

    if (tipoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tipo de documento no existe' });
    }

    const codigoTipo = tipoResult.rows[0].codigo;
    const codigo = await generarCodigoDocumento(codigoTipo);

    await client.query('BEGIN');

    // 1. Crear documento
    const docResult = await client.query(
      `INSERT INTO documentos (codigo, titulo, descripcion, idtipodocumento, idunidad, estado)
       VALUES ($1, $2, $3, $4, $5, 'Borrador')
       RETURNING *`,
      [codigo, titulo, descripcion || null, idtipodocumento, idunidad]
    );

    const documento = docResult.rows[0];

    // 2. Insertar campos dinámicos (si vienen)
    if (Array.isArray(campos) && campos.length > 0) {
      for (const c of campos) {
        await client.query(
          `INSERT INTO documentocampos (iddocumento, idcampo, valortexto, valorfecha, valornumerico, valorbooleano)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            documento.iddocumento,
            c.idcampo,
            c.valortexto ?? null,
            c.valorfecha ?? null,
            c.valornumerico ?? null,
            c.valorbooleano ?? null
          ]
        );
      }
    }

    // 3. Registrar movimiento
    const movResult = await client.query(
      `INSERT INTO movimientodocumento (tipomovimiento, observacion, responsable, iddocumento, estadoactual)
       VALUES ('Creacion', 'Documento creado', $1, $2, 'Borrador')
       RETURNING idmovimiento`,
      [idUsuario, documento.iddocumento]
    );

    // 4. Guardar en historial
    await client.query(
      `INSERT INTO historial_movimientodocumento 
        (idmovimiento, tipomovimiento, usuarioresponsable, accion, observacion, iddocumento)
       VALUES ($1, 'Creacion', $2, 'Creación del documento', 'Documento creado en el sistema', $3)`,
      [movResult.rows[0].idmovimiento, correoUsuario, documento.iddocumento]
    );

    await client.query('COMMIT');

    res.status(201).json(documento);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al crear el documento' });
  } finally {
    client.release();
  }
};

// ======================
// Trazabilidad completa
// ======================
export const getTrazabilidad = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const docResult = await pool.query(
      `SELECT iddocumento, codigo, estado FROM documentos WHERE iddocumento = $1`,
      [id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const [movimientos, historial, firmas] = await Promise.all([
      pool.query(
        `SELECT * FROM movimientodocumento WHERE iddocumento = $1 ORDER BY fecha ASC`,
        [id]
      ),
      pool.query(
        `SELECT * FROM historial_movimientodocumento WHERE iddocumento = $1 ORDER BY fecha ASC`,
        [id]
      ),
      pool.query(`
        SELECT f.*, p.primernombre, p.primerapellido
        FROM firmaaprobaciones f
        JOIN personas p ON p.idpersona = f.idpersona
        WHERE f.iddocumento = $1
        ORDER BY f.orden ASC
      `, [id])
    ]);

    res.json({
      documento: docResult.rows[0],
      movimientos: movimientos.rows,
      historial: historial.rows,
      firmas: firmas.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la trazabilidad' });
  }
};

// ======================
// Historial simple
// ======================
export const getHistorialDocumento = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM historial_movimientodocumento 
       WHERE iddocumento = $1 
       ORDER BY fecha DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};