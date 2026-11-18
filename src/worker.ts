import type { ContactoSolicitud } from './app/core/models/contacto.model';
import { sendContactEmail } from './server/contact-mailer';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  CONTACT_EMAIL?: string;
}

const allowedServices = new Set(['Obra gruesa', 'Remodelación', 'Ampliación', 'Terminaciones', 'Otro']);
const contactRequests = new Map<string, { count: number; resetAt: number }>();
const MAX_BODY_BYTES = 20 * 1024;

function json(message: string, status: number): Response {
  return Response.json({ message }, { status });
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return json('Método no permitido.', 405);
  }

  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const limit = contactRequests.get(clientIp);
  if (!limit || limit.resetAt <= now) {
    contactRequests.set(clientIp, { count: 1, resetAt: now + 10 * 60 * 1000 });
  } else if (limit.count >= 5) {
    return json('Demasiadas solicitudes. Inténtelo nuevamente más tarde.', 429);
  } else {
    limit.count++;
  }
  if (contactRequests.size > 1000) {
    for (const [ip, entry] of contactRequests) {
      if (entry.resetAt <= now) contactRequests.delete(ip);
    }
  }

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json('La solicitud excede el tamaño permitido.', 413);
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json('La solicitud excede el tamaño permitido.', 413);
    }
    body = JSON.parse(rawBody);
  } catch {
    return json('Revise los datos del formulario.', 400);
  }

  if (!body || typeof body !== 'object') {
    return json('Revise los datos del formulario.', 400);
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
    return json('Revise los datos del formulario e inténtelo nuevamente.', 400);
  }

  const solicitud: ContactoSolicitud = { nombre, correo, telefono, servicio, ubicacion, mensaje };
  try {
    await sendContactEmail(solicitud, {
      smtpHost: env.SMTP_HOST,
      smtpPort: env.SMTP_PORT,
      smtpUser: env.SMTP_USER,
      smtpPass: env.SMTP_PASS,
      smtpFrom: env.SMTP_FROM,
      contactEmail: env.CONTACT_EMAIL
    });
    return json('Solicitud enviada correctamente.', 201);
  } catch (error) {
    const mailError = error as { code?: unknown; responseCode?: unknown; command?: unknown };
    console.error('No se pudo enviar la solicitud de contacto:', {
      code: typeof mailError.code === 'string' ? mailError.code : 'UNKNOWN',
      responseCode: typeof mailError.responseCode === 'number' ? mailError.responseCode : undefined,
      command: typeof mailError.command === 'string' ? mailError.command : undefined
    });
    return json('No fue posible enviar la solicitud. Inténtelo nuevamente más tarde.', 503);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contacto') {
      return handleContact(request, env);
    }
    if (url.pathname.startsWith('/api/')) {
      return json('Ruta API no encontrada.', 404);
    }
    return env.ASSETS.fetch(request);
  }
};

