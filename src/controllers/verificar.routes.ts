import { Router, Request, Response } from "express";
import pool from "../config/database";

const router = Router();

/**
 * @swagger
 * /api/verificar/{codigo}:
 *   get:
 *     summary: Verificar autenticidad de un documento (público)
 *     tags: [Verificación]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Documento válido
 *       404:
 *         description: Código no encontrado
 */
router.get("/:codigo", async (req: Request, res: Response) => {
  try {
    const codigo = String(req.params.codigo);

    const docResult = await pool.query(
      `SELECT d.iddocumento, d.codigo, d.titulo, d.estado, d.fechacreacion,
              t.nombre AS tipo_nombre, u.nombre AS unidad_nombre
       FROM documentos d
       JOIN tipodocumentos t ON t.idtipodocumento = d.idtipodocumento
       JOIN unidades u ON u.idunidad = d.idunidad
       WHERE d.codigo = $1`,
      [codigo]
    );

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "desconocida";

    if (docResult.rows.length === 0) {
      return res.status(404).json({ valido: false, mensaje: "Código no encontrado" });
    }

    const doc = docResult.rows[0];

    await pool.query(
      `INSERT INTO verificacioneslog (codigo, resultado, ip, iddocumento)
       VALUES ($1, $2, $3, $4)`,
      [codigo, "Encontrado", ip, doc.iddocumento]
    );

    const firmasResult = await pool.query(
      `SELECT f.estado, f.fechafirma, p.primernombre, p.primerapellido
       FROM firmaaprobaciones f
       JOIN personas p ON p.idpersona = f.idpersona
       WHERE f.iddocumento = $1
       ORDER BY f.orden ASC`,
      [doc.iddocumento]
    );

    return res.json({
      valido: true,
      codigo: doc.codigo,
      titulo: doc.titulo,
      tipo: doc.tipo_nombre,
      unidad: doc.unidad_nombre,
      estado: doc.estado,
      fechacreacion: doc.fechacreacion,
      firmas: firmasResult.rows.map((f) => ({
        firmante: `${f.primernombre} ${f.primerapellido}`,
        estado: f.estado,
        fecha: f.fechafirma,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al verificar el documento" });
  }
});

export default router;