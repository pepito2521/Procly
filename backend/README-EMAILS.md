# 📧 Sistema de Emails Automáticos - Procly

## 🏗️ Arquitectura del Sistema

### **Nodemailer vs Resend - ¿Por qué ambos?**

#### **Nodemailer:**
- 🛠️ **Qué es:** Biblioteca de Node.js para enviar emails
- 🎯 **Función:** Proporciona la interfaz para enviar emails desde tu aplicación
- 📤 **Hace:** Conecta tu app con servidores SMTP
- 🔧 **Configuración:** Necesitas configurar servidor SMTP, credenciales, etc.

#### **Resend:**
- 📧 **Qué es:** Servicio de email transaccional (como SendGrid, Mailgun)
- 🎯 **Función:** Proporciona la infraestructura SMTP para enviar emails
- 📤 **Hace:** Recibe emails de tu app y los entrega a los destinatarios
- 🔧 **Configuración:** Solo necesitas API Key, manejan el resto

### **Flujo de Email:**
```
Tu App → Nodemailer → Resend SMTP → Destinatario
```

- **Nodemailer:** El "mensajero" que lleva el email
- **Resend:** El "servicio postal" que lo entrega

## 🚀 Configuración

### 1. Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```bash
# Resend SMTP Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Application Configuration (opcional)
APP_URL=https://procly.net
ADMIN_EMAIL=admin@procly.net
```

### 2. Configuración de Resend

1. Ve a [Resend.com](https://resend.com) y crea una cuenta
2. Genera una API Key
3. Verifica tu dominio `procly.net` en Resend
4. Configura el remitente `notificaciones@procly.net`

### 3. Instalación de Dependencias

```bash
npm install nodemailer
```

## 📁 Estructura de Archivos

```
backend/
├── controllers/
│   ├── ticketsController.js    # Lógica de tickets
│   └── emailController.js      # Lógica de emails (NUEVO)
├── routes/
│   ├── tickets.js             # Rutas de tickets
│   └── emails.js              # Rutas de emails (NUEVO)
├── utils/
│   └── emailService.js        # Servicio de email (Nodemailer + Resend)
├── config/
│   └── email.js               # Configuración de email
└── test-email.js              # Script de prueba

frontend/
└── components/
    └── emails/                # Plantillas de email (NUEVA UBICACIÓN)
        ├── ticket_creado.html
        └── cambio_estado.html
```

## 📨 Tipos de Emails

### 1. Ticket Creado
- **Cuándo:** Cuando un usuario crea un nuevo ticket
- **Destinatario:** Usuario que creó el ticket
- **Contenido:** Confirmación, detalles del ticket, link para seguimiento

### 2. Cambio de Estado
- **Cuándo:** Cuando el admin cambia el estado de un ticket
- **Destinatario:** Usuario propietario del ticket
- **Contenido:** Estado anterior → nuevo estado, comentarios, link para ver detalles

### 3. Notificación al Admin
- **Cuándo:** Cuando se crea un nuevo ticket
- **Destinatario:** Email del admin configurado
- **Contenido:** Resumen del ticket, link al panel de admin

## 🧪 Testing

### Test Manual
```bash
node test-email.js
```

### Test via API (solo en desarrollo)
```bash
curl -X POST http://localhost:3000/emails/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"email": "tu-email@ejemplo.com"}'
```

## 🔧 Uso en el Código

### Crear Ticket (automático)
```javascript
// Se envía automáticamente cuando se crea un ticket
const ticket = await crearTicket(ticketData);
// ✅ Email enviado al usuario
// ✅ Email enviado al admin
```

### Actualizar Estado (automático)
```javascript
// Se envía automáticamente cuando cambia el estado
await actualizarEstadoTicket({
  ticket_id: 123,
  nuevo_estado: 'En Proceso',
  comentario: 'Tu ticket está siendo revisado'
});
// ✅ Email enviado al usuario
```

## 📋 Plantillas de Email

Las plantillas están en `frontend/components/emails/`:

- `ticket_creado.html` - Email cuando se crea un ticket
- `cambio_estado.html` - Email cuando cambia el estado

### Variables Disponibles

```html
{{ .TicketID }}        - Código del ticket
{{ .Categoria }}       - Categoría del ticket
{{ .Descripcion }}     - Descripción del ticket
{{ .Presupuesto }}     - Presupuesto del ticket
{{ .FechaEntrega }}    - Fecha de entrega
{{ .EstadoAnterior }}  - Estado anterior (solo cambio de estado)
{{ .NuevoEstado }}     - Nuevo estado (solo cambio de estado)
{{ .Comentario }}      - Comentario del admin (opcional)
{{ .AppURL }}          - URL de la aplicación
```

## 🛠️ Troubleshooting

### Error: "Email no enviado - configuración incompleta"
- Verifica que `RESEND_API_KEY` esté configurada
- Revisa que el dominio esté verificado en Resend

### Error: "Authentication failed"
- Verifica que la API Key de Resend sea correcta
- Asegúrate de que el dominio esté verificado

### Error: "Template not found"
- Verifica que las plantillas estén en `frontend/components/emails/`
- Revisa los nombres de archivo

## 📊 Monitoreo

Los logs muestran:
- ✅ Email enviado exitosamente
- ❌ Error enviando email
- 📧 Email no enviado - configuración incompleta

## 🔒 Seguridad

- Los emails se envían en segundo plano
- Los errores de email no fallan la operación principal
- Las plantillas están sanitizadas
- Solo emails verificados pueden enviar

## 🎯 Ventajas de la Nueva Estructura

### **Separación de Responsabilidades:**
- ✅ `ticketsController.js` - Solo lógica de tickets
- ✅ `emailController.js` - Solo lógica de emails
- ✅ `emailService.js` - Solo configuración de Nodemailer/Resend

### **Mantenibilidad:**
- ✅ Plantillas en frontend (más fácil de editar)
- ✅ Controladores separados (más fácil de debuggear)
- ✅ Rutas específicas para emails (más fácil de testear)

### **Escalabilidad:**
- ✅ Fácil agregar nuevos tipos de email
- ✅ Fácil cambiar proveedor de email
- ✅ Fácil agregar logs y estadísticas 