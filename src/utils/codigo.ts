import pool from "../config/database";

export async function generarCodigoDocumento(codigoTipo: string): Promise<string> {
  const anio = new Date().getFullYear();
  const prefijo = `${codigoTipo}-${anio}-`;

  const resultado = await pool.query(
    `SELECT codigo FROM documentos
     WHERE codigo LIKE $1
     ORDER BY codigo DESC
     LIMIT 1`,
    [`${prefijo}%`]
  );

  let consecutivo = 1;
  if (resultado.rows.length > 0) {
    const partes = resultado.rows[0].codigo.split("-");
    const numero = parseInt(partes[partes.length - 1], 10);
    if (!isNaN(numero)) consecutivo = numero + 1;
  }

  return `${prefijo}${String(consecutivo).padStart(4, "0")}`;
}