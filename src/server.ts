import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { ErrorRequestHandler } from 'express';
import { ContactoSolicitud } from './app/core/models/contacto.model';
import { sendContactEmail } from './server/contact-mailer';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const contactRequests = new Map<string, { count: number; resetAt: number }>();
const allowedServices = new Set(['Obra gruesa', 'Remodelación', 'Ampliación', 'Terminaciones', 'Otro']);

app.use(express.json({ limit: '20kb' }));

app.post('/api/contacto', async (req, res) => {
  const now = Date.now();
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const limit = contactRequests.get(clientIp);
  if (!limit || limit.resetAt <= now) {
    contactRequests.set(clientIp, { count: 1, resetAt: now + 10 * 60 * 1000 });
  } else if (limit.count >= 5) {
    res.status(429).json({ message: 'Demasiadas solicitudes. Inténtelo nuevamente más tarde.' });
    return;
  } else {
    limit.count++;
  }

  if (contactRequests.size > 1000) {
    for (const [ip, entry] of contactRequests) {
      if (entry.resetAt <= now) contactRequests.delete(ip);
    }
  }

  const body: unknown = req.body;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ message: 'Revise los datos del formulario.' });
    return;
  }

  const input = body as Record<string, unknown>;
  const nombre = typeof input['nombre'] === 'string' ? input['nombre'].trim() : '';
  const correo = typeof input['correo'] === 'string' ? input['correo'].trim() : '';
  const telefono = typeof input['telefono'] === 'string' ? input['telefono'].trim() : '';
  const servicio = typeof input['servicio'] === 'string' ? input['servicio'].trim() : '';
  const ubicacion = typeof input['ubicacion'] === 'string' ? input['ubicacion'].trim() : '';
  const mensaje = typeof input['mensaje'] === 'string' ? input['mensaje'].trim() : '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    nombre.length < 2 || nombre.length > 100 ||
    correo.length > 254 || !emailPattern.test(correo) ||
    telefono.replace(/\D/g, '').length < 8 || telefono.length > 30 ||
    !allowedServices.has(servicio) ||
    ubicacion.length > 100 ||
    mensaje.length < 10 || mensaje.length > 5000
  ) {
    res.status(400).json({ message: 'Revise los datos del formulario e inténtelo nuevamente.' });
    return;
  }

  const solicitud: ContactoSolicitud = { nombre, correo, telefono, servicio, ubicacion, mensaje };
  try {
    await sendContactEmail(solicitud);
    res.status(201).json({ message: 'Solicitud enviada correctamente.' });
  } catch (error) {
    const mailError = error as { code?: unknown; responseCode?: unknown; command?: unknown };
    console.error('No se pudo enviar la solicitud de contacto:', {
      code: typeof mailError.code === 'string' ? mailError.code : 'UNKNOWN',
      responseCode: typeof mailError.responseCode === 'number' ? mailError.responseCode : undefined,
      command: typeof mailError.command === 'string' ? mailError.command : undefined
    });
    res.status(503).json({ message: 'No fue posible enviar la solicitud. Inténtelo nuevamente más tarde.' });
  }
});

app.all('/api/{*splat}', (_req, res) => {
  res.status(404).json({ message: 'Ruta API no encontrada.' });
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (req.path.startsWith('/api/')) {
    const status = (error as { status?: number }).status;
    const code = status === 413 ? 413 : status === 400 ? 400 : 500;
    res.status(code).json({ message: code === 413 ? 'La solicitud excede el tamaño permitido.' : 'No se pudo procesar la solicitud.' });
    return;
  }
  next(error);
};
app.use(errorHandler);

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
