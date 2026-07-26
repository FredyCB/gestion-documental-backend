import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Routes
import authRoutes from './routes/auth.routes';
import usuariosRoutes from './routes/usuarios.routes';
import rolesRoutes from './routes/roles.routes';
import documentosRoutes from './routes/documentos.routes';
import movimientosRoutes from './routes/movimientos.routes';
import archivosRoutes from './routes/archivos.routes';
import unidadesRoutes from './routes/unidades.routes';
import tipodocumentosRoutes from './routes/tipodocumentos.routes';
import cargosRoutes from './routes/cargos.routes';
import camposRoutes from './routes/campos.routes';
import workflowRoutes from './routes/workflow.routes';
import desglosesRoutes from './routes/desgloses.routes';
import firmasRoutes from './routes/firmas.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import verificarRoutes from './routes/verificar.routes';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/archivos', archivosRoutes);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/tipodocumentos', tipodocumentosRoutes);
app.use('/api/cargos', cargosRoutes);
app.use('/api/campos', camposRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/desgloses', desglosesRoutes);
app.use('/api/firmas', firmasRoutes);
app.use('/api/verificar', verificarRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API Gestión Documental funcionando correctamente',
    version: '1.0.0',
    endpoints: '/api/...'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;