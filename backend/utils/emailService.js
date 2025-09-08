const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const emailConfig = require('../config/email');

// Validar configuración de email
const isEmailConfigured = emailConfig.validateConfig();

// Configuración del transportador de email
let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 587,
    secure: false,
    auth: {
      user: 'resend',
      pass: emailConfig.RESEND_API_KEY
    }
  });
}

// Función para leer plantillas de email
async function loadEmailTemplate(templateName) {
  try {
    const templatePath = path.join(__dirname, '../../frontend/components/emails', `${templateName}.html`);
    const template = await fs.readFile(templatePath, 'utf8');
    return template;
  } catch (error) {
    console.error(`Error cargando plantilla ${templateName}:`, error);
    throw error;
  }
}

// Función para reemplazar variables en la plantilla
function replaceTemplateVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{ ${key} }}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

// Enviar email de ticket creado
async function sendTicketCreatedEmail(userEmail, ticketData) {
  if (!isEmailConfigured || !transporter) {
    console.log('📧 Email no enviado - configuración incompleta');
    return null;
  }

  try {
    const template = await loadEmailTemplate('ticket_creado');
    const html = replaceTemplateVariables(template, {
      TicketID: ticketData.codigo_ticket,
      Categoria: ticketData.categoria,
      Descripcion: ticketData.descripcion,
      Presupuesto: ticketData.presupuesto || 'No especificado',
      FechaEntrega: ticketData.fecha_entrega,
      AppURL: emailConfig.APP_URL
    });

    const mailOptions = {
      from: emailConfig.EMAIL_FROM,
      to: userEmail,
      subject: `Ticket Creado - ${ticketData.codigo_ticket} | Procly`,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de ticket creado enviado:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error enviando email de ticket creado:', error);
    throw error;
  }
}

// Enviar email de cambio de estado
async function sendStatusChangeEmail(userEmail, ticketData, oldStatus, newStatus, comment = null) {
  if (!isEmailConfigured || !transporter) {
    console.log('📧 Email no enviado - configuración incompleta');
    return null;
  }

  try {
    const template = await loadEmailTemplate('cambio_estado');
    const html = replaceTemplateVariables(template, {
      TicketID: ticketData.codigo_ticket,
      EstadoAnterior: oldStatus,
      NuevoEstado: newStatus,
      Categoria: ticketData.categoria,
      Descripcion: ticketData.descripcion,
      Presupuesto: ticketData.presupuesto || 'No especificado',
      FechaEntrega: ticketData.fecha_entrega,
      Comentario: comment,
      AppURL: emailConfig.APP_URL
    });

    const mailOptions = {
      from: emailConfig.EMAIL_FROM,
      to: userEmail,
      subject: `Actualización de Ticket - ${ticketData.codigo_ticket} | Procly`,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de cambio de estado enviado:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error enviando email de cambio de estado:', error);
    throw error;
  }
}

// Enviar email de notificación al admin
async function sendAdminNotificationEmail(adminEmail, ticketData) {
  if (!isEmailConfigured || !transporter) {
    console.log('📧 Email no enviado - configuración incompleta');
    return null;
  }

  try {
    const html = `
      <h2>Nuevo Ticket Creado</h2>
      <p><strong>Ticket ID:</strong> ${ticketData.codigo_ticket}</p>
      <p><strong>Usuario:</strong> ${ticketData.nombre} ${ticketData.apellido}</p>
      <p><strong>Categoría:</strong> ${ticketData.categoria}</p>
      <p><strong>Descripción:</strong> ${ticketData.descripcion}</p>
      <p><strong>Presupuesto:</strong> $${ticketData.presupuesto || 'No especificado'}</p>
      <p><strong>Fecha de Entrega:</strong> ${ticketData.fecha_entrega}</p>
      <br>
      <a href="${emailConfig.APP_URL}/app/admin/administrador.html" 
         style="background-color: #508991; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
        Ver en Panel de Admin
      </a>
    `;

    const mailOptions = {
      from: emailConfig.EMAIL_FROM,
      to: adminEmail,
      subject: `Nuevo Ticket - ${ticketData.codigo_ticket} | Procly`,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de notificación al admin enviado:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error enviando email al admin:', error);
    throw error;
  }
}

// Enviar email de confirmación de partner recomendado
async function sendPartnerRecommendedEmail(userEmail, partnerData, userName) {
  if (!isEmailConfigured || !transporter) {
    console.log('📧 Email no enviado - configuración incompleta');
    return null;
  }

  try {
    const template = await loadEmailTemplate('recomendar_partner');
    const html = replaceTemplateVariables(template, {
      nombreUsuario: userName,
      empresa: partnerData.empresa,
      nombreContacto: partnerData.nombre_contacto,
      email: partnerData.email,
      telefono: partnerData.telefono || 'No especificado',
      web: partnerData.web || 'No especificado',
      categoria: partnerData.categoria_nombre || 'No especificado',
      observaciones: partnerData.observaciones ? 
        `<div class="info-row">
          <span class="info-label">Observaciones:</span>
          <span class="info-value">${partnerData.observaciones}</span>
        </div>` : '',
      appURL: emailConfig.APP_URL
    });

    const mailOptions = {
      from: emailConfig.EMAIL_FROM,
      to: userEmail,
      subject: `Partner Recomendado Exitosamente | Procly`,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de partner recomendado enviado:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error enviando email de partner recomendado:', error);
    throw error;
  }
}

module.exports = {
  sendTicketCreatedEmail,
  sendStatusChangeEmail,
  sendAdminNotificationEmail,
  sendPartnerRecommendedEmail,
  isEmailConfigured
}; 