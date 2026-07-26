import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import path from 'path';
import fs from 'fs';

// ======================
// Subir archivo
// ======================
export const uploadArchivo = async (req: AuthRequest, res: Response) => {
  const { idDocumento } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }

  if (!idDocumento) {
    // Eliminar archivo temporal si no hay documento
    fs.unlinkSync(file.path);
    return res.status(400).json({ message: 'idDocumento es requerido' });
  }

  try {
    // Verificar que el documento existe
    const docCheck = await pool.query(
      `SELECT iddocumento FROM documentos WHERE iddocumento = $1`,
      [idDocumento]
    );

    if (docCheck.rows.length === 0) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
    const nombreServidor = `${Date.now()}_${file.originalname}`;

    // Mover archivo a carpeta definitiva
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const rutaFinal = path.join(uploadDir, nombreServidor);
    fs.renameSync(file.path, rutaFinal);

    // Guardar en base de datos
    const result = await pool.query(
      `INSERT INTO archivos 
        (nombre, nombreservidor, extension, size, ruta, iddocumento)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        file.originalname,
        nombreServidor,
        extension,
        file.size,
        `/uploads/${nombreServidor}`,
        idDocumento
      ]
    );

    res.status(201).json({
      message: 'Archivo subido correctamente',
      archivo: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    // Limpiar archivo si falla
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ message: 'Error al subir el archivo' });
  }
};

// ======================
// Listar archivos de un documento
// ======================
export const getArchivosByDocumento = async (req: AuthRequest, res: Response) => {
  const { idDocumento } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM archivos 
       WHERE iddocumento = $1 
       ORDER BY fechasubida DESC`,
      [idDocumento]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener archivos' });
  }
};

// ======================
// Descargar archivo
// ======================
export const downloadArchivo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM archivos WHERE idarchivo = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const archivo = result.rows[0];
    const filePath = path.join(__dirname, '../../uploads', archivo.nombreservidor);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'El archivo físico no existe' });
    }

    res.download(filePath, archivo.nombre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al descargar el archivo' });
  }
};

// ======================
// Eliminar archivo
// ======================
export const deleteArchivo = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM archivos WHERE idarchivo = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const archivo = result.rows[0];
    const filePath = path.join(__dirname, '../../uploads', archivo.nombreservidor);

    // Eliminar de la base de datos
    await pool.query(`DELETE FROM archivos WHERE idarchivo = $1`, [id]);

    // Eliminar archivo físico
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el archivo' });
  }
};