import nodemailer, { Transporter } from 'nodemailer';
import { ContactoSolicitud } from '../app/core/models/contacto.model';

let transporter: Transporter | undefined;

function createTransporter(): Transporter {
  const host = process.env['SMTP_HOST'];
  const port = Number(process.env['SMTP_PORT'] ?? 587);
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];

  if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP configuration is incomplete.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]!);
}

export async function sendContactEmail(solicitud: ContactoSolicitud): Promise<void> {
  const recipient = process.env['CONTACT_EMAIL'];
  if (!recipient) {
    throw new Error('CONTACT_EMAIL is not configured.');
  }

  transporter ??= createTransporter();
  const sender = process.env['SMTP_FROM'] || process.env['SMTP_USER'];
  const location = solicitud.ubicacion?.trim() || 'No indicada';
  const text = [
    'Nueva solicitud de cotización',
    '',
    `Nombre: ${solicitud.nombre}`,
    `Correo: ${solicitud.correo}`,
    `Teléfono: ${solicitud.telefono}`,
    `Tipo de trabajo: ${solicitud.servicio}`,
    `Comuna: ${location}`,
    '',
    'Detalle del proyecto:',
    solicitud.mensaje
  ].join('\n');
  const html = `<h2>Nueva solicitud de cotización</h2><dl><dt><strong>Nombre</strong></dt><dd>${escapeHtml(solicitud.nombre)}</dd><dt><strong>Correo</strong></dt><dd>${escapeHtml(solicitud.correo)}</dd><dt><strong>Teléfono</strong></dt><dd>${escapeHtml(solicitud.telefono)}</dd><dt><strong>Tipo de trabajo</strong></dt><dd>${escapeHtml(solicitud.servicio)}</dd><dt><strong>Comuna</strong></dt><dd>${escapeHtml(location)}</dd></dl><h3>Detalle del proyecto</h3><p>${escapeHtml(solicitud.mensaje).replace(/\r?\n/g, '<br>')}</p>`;

  await transporter.sendMail({
    from: sender,
    to: recipient,
    replyTo: solicitud.correo,
    subject: `Solicitud de cotización: ${solicitud.servicio}`,
    text,
    html
  });
}
