import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "../config/database";

async function main() {
  const passwordPlano = "123456";
  const hash = await bcrypt.hash(passwordPlano, 10);

  const correos = [
    "juan.perez@empresa.com",
    "maria.rodriguez@empresa.com",
    "carlos.gomez@empresa.com",
    "admin@sistema.com"
  ];

  for (const correo of correos) {
    const resultado = await pool.query(
      `UPDATE usuarios SET password = $1 WHERE correo = $2`,
      [hash, correo]
    );
    console.log(`${correo}: ${resultado.rowCount} registro(s) actualizado(s)`);
  }

  console.log(`\nListo. Password para todos: ${passwordPlano}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});