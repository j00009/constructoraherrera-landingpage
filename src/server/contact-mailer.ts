import nodemailer from 'nodemailer';
import type { ContactoSolicitud } from '../app/core/models/contacto.model';

export interface ContactMailConfig {
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  contactEmail?: string;
}

export async function sendContactEmail(solicitud: ContactoSolicitud, config: ContactMailConfig): Promise<void> {
  const host = config.smtpHost;
  const port = Number(config.smtpPort ?? 587);
  const user = config.smtpUser;
  const pass = config.smtpPass;
  const recipient = config.contactEmail;

  if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP configuration is incomplete.');
  }
  if (!recipient) {
    throw new Error('CONTACT_EMAIL is not configured.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000
  });

  const sender = config.smtpFrom || user;
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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]!);
}
