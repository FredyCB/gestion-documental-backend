import { z } from 'zod';

// ======================
// AUTH
// ======================
export const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

// ======================
// USUARIOS
// ======================
export const createUsuarioSchema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  identidad: z.string().min(5, 'Identidad inválida'),
  primerNombre: z.string().min(2, 'Primer nombre requerido'),
  segundoNombre: z.string().optional().nullable(),
  primerApellido: z.string().min(2, 'Primer apellido requerido'),
  segundoApellido: z.string().optional().nullable(),
  telefono: z.string().min(7).max(20).optional().nullable(),
  roles: z.array(z.number().int().positive()).optional().default([])
});

export const updateUsuarioSchema = z.object({
  correo: z.string().email('Correo inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  estado: z.boolean().optional(),
  primerNombre: z.string().min(2).optional(),
  segundoNombre: z.string().optional().nullable(),
  primerApellido: z.string().min(2).optional(),
  segundoApellido: z.string().optional().nullable(),
  roles: z.array(z.number().int().positive()).optional()
});

// ======================
// DOCUMENTOS
// ======================
export const createDocumentoSchema = z.object({
  titulo: z.string().min(5, 'Título requerido').max(255),
  descripcion: z.string().optional().nullable(),
  idtipodocumento: z.number().int().positive('Tipo de documento inválido'),
  idunidad: z.number().int().positive('Unidad inválida'),
  campos: z.array(z.object({
    idcampo: z.number().int().positive(),
    valortexto: z.string().optional().nullable(),
    valorfecha: z.string().optional().nullable(),
    valornumerico: z.number().optional().nullable(),
    valorbooleano: z.boolean().optional().nullable()
  })).optional().default([])
});

// ======================
// MOVIMIENTOS
// ======================
export const enviarDocumentoSchema = z.object({
  idDocumento: z.number().int().positive('ID de documento inválido'),
  idUnidadDestino: z.number().int().positive('Unidad destino inválida'),
  idPaso: z.number().int().positive().optional().nullable(),
  observacion: z.string().max(500).optional().nullable()
});

export const aprobarRechazarSchema = z.object({
  idDocumento: z.number().int().positive('ID de documento inválido'),
  observacion: z.string().max(500).optional().nullable()
});

// ======================
// ROLES
// ======================
export const createRolSchema = z.object({
  nombre: z.string().min(3, 'Nombre del rol requerido').max(50),
  descripcion: z.string().max(255).optional().nullable(),
  permisos: z.array(z.number().int().positive()).optional().default([])
});

export const updateRolSchema = z.object({
  nombre: z.string().min(3).max(50).optional(),
  descripcion: z.string().max(255).optional().nullable(),
  activo: z.boolean().optional(),
  permisos: z.array(z.number().int().positive()).optional()
});

// ======================
// PERMISOS
// ======================
export const createPermisoSchema = z.object({
  codigo: z.string().min(3).max(100).toUpperCase(),
  nombre: z.string().min(3).max(150),
  descripcion: z.string().max(255).optional().nullable(),
  modulo: z.string().min(2).max(50)
});

// ======================
// UNIDADES
// ======================
export const createUnidadSchema = z.object({
  nombre: z.string().min(3, 'Nombre requerido').max(150),
  descripcion: z.string().max(255).optional().nullable(),
  activo: z.boolean().optional().default(true)
});

export const updateUnidadSchema = z.object({
  nombre: z.string().min(3).max(150).optional(),
  descripcion: z.string().max(255).optional().nullable(),
  activo: z.boolean().optional()
});

// ======================
// TIPOS DE DOCUMENTO
// ======================
export const createTipoDocumentoSchema = z.object({
  codigo: z.string().min(2).max(50).toUpperCase(),
  nombre: z.string().min(3).max(150),
  descripcion: z.string().max(255).optional().nullable()
});

export const updateTipoDocumentoSchema = z.object({
  codigo: z.string().min(2).max(50).toUpperCase().optional(),
  nombre: z.string().min(3).max(150).optional(),
  descripcion: z.string().max(255).optional().nullable()
});

// ======================
// CARGOS
// ======================
export const createCargoSchema = z.object({
  nombre: z.string().min(3).max(100),
  descripcion: z.string().max(255).optional().nullable(),
  activo: z.boolean().optional().default(true)
});

export const updateCargoSchema = z.object({
  nombre: z.string().min(3).max(100).optional(),
  descripcion: z.string().max(255).optional().nullable(),
  activo: z.boolean().optional()
});

// ======================
// CAMPOS
// ======================
export const createCampoSchema = z.object({
  codigo: z.string().min(2).max(50).toUpperCase(),
  nombre: z.string().min(2).max(100),
  tipodato: z.enum(['texto', 'numerico', 'fecha', 'booleano', 'lista'])
});

export const updateCampoSchema = z.object({
  codigo: z.string().min(2).max(50).toUpperCase().optional(),
  nombre: z.string().min(2).max(100).optional(),
  tipodato: z.enum(['texto', 'numerico', 'fecha', 'booleano', 'lista']).optional()
});

// ======================
// WORKFLOW
// ======================
const pasoSchema = z.object({
  orden: z.number().int().positive(),
  idcargo: z.number().int().positive()
});

export const createPlantillaWFSchema = z.object({
  nombre: z.string().min(3).max(150),
  idtipodocumento: z.number().int().positive(),
  pasos: z.array(pasoSchema).optional().default([])
});

export const updatePlantillaWFSchema = z.object({
  nombre: z.string().min(3).max(150).optional(),
  idtipodocumento: z.number().int().positive().optional(),
  pasos: z.array(pasoSchema).optional()
});

// ======================
// DESGLOSES
// ======================
export const createPlantillaDesgloseSchema = z.object({
  nombreseccion: z.string().min(3).max(150),
  orden: z.number().int().positive().optional(),
  idtipodocumento: z.number().int().positive()
});

export const updatePlantillaDesgloseSchema = z.object({
  nombreseccion: z.string().min(3).max(150).optional(),
  orden: z.number().int().positive().optional(),
  idtipodocumento: z.number().int().positive().optional()
});

export const createDesgloseDocumentoSchema = z.object({
  contenido: z.string().min(1),
  iddocumento: z.number().int().positive(),
  idplantilla: z.number().int().positive()
});

export const updateDesgloseDocumentoSchema = z.object({
  contenido: z.string().min(1)
});

// ======================
// FIRMAS Y VERIFICACIONES
// ======================
export const createFirmaSchema = z.object({
  orden: z.number().int().positive(),
  estado: z.enum(['Pendiente', 'Aprobado', 'Rechazado']).optional().default('Pendiente'),
  observacion: z.string().max(500).optional().nullable(),
  iddocumento: z.number().int().positive(),
  idpersona: z.number().int().positive()
});

export const updateFirmaSchema = z.object({
  estado: z.enum(['Pendiente', 'Aprobado', 'Rechazado']).optional(),
  observacion: z.string().max(500).optional().nullable()
});

export const createVerificacionSchema = z.object({
  codigo: z.string().min(1).max(100),
  resultado: z.string().min(1).max(50),
  ip: z.string().max(45).optional().nullable(),
  iddocumento: z.number().int().positive()
});