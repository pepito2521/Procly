import { supabase } from "/js/supabaseClient.js";

export function initRecomendar() {
  console.log('🚀 Inicializando sección Recomendar Partners...');
  
  // Inicializar funcionalidades básicas
  inicializarEventListeners();
  cargarCategorias();
}

function inicializarEventListeners() {
  console.log('🔧 Configurando event listeners...');
  
  // Formulario de recomendación
  const formRecomendarPartner = document.getElementById('formRecomendarPartner');
  if (formRecomendarPartner) {
    formRecomendarPartner.addEventListener('submit', manejarEnvioFormulario);
  }
  
  // Botón cancelar
  const btnCancelar = document.getElementById('btnCancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', limpiarFormulario);
  }
  
  // Validación en tiempo real
  const inputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => limpiarError(input));
  });
}

async function cargarCategorias() {
  console.log('📋 Cargando categorías...');
  
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre');
    
    if (error) {
      console.error('❌ Error al cargar categorías:', error);
      return;
    }
    
    const selectCategoria = document.getElementById('categoria');
    if (selectCategoria) {
      // Limpiar opciones existentes (excepto la primera)
      selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
      
      // Agregar categorías
      data.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        selectCategoria.appendChild(option);
      });
      
      console.log(`✅ ${data.length} categorías cargadas`);
    }
    
  } catch (error) {
    console.error('💥 Error inesperado al cargar categorías:', error);
  }
}

async function manejarEnvioFormulario(e) {
  e.preventDefault();
  console.log('📝 Enviando formulario de recomendación...');
  
  const form = e.target;
  const formData = new FormData(form);
  
  // Validar formulario
  if (!validarFormulario(form)) {
    console.log('❌ Formulario inválido');
    return;
  }
  
  // Mostrar estado de carga
  const btnRecomendar = document.getElementById('btnRecomendar');
  const estadoOriginal = btnRecomendar.innerHTML;
  btnRecomendar.disabled = true;
  btnRecomendar.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" style="animation: spin 1s linear infinite;">
      <path d="M232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
    </svg>
    Enviando...
  `;
  
  try {
    // Obtener token de autenticación
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }
    
    // Preparar datos para enviar
    const datosPartner = {
      empresa: formData.get('empresa'),
      nombre_contacto: formData.get('nombre_contacto'),
      telefono: formData.get('telefono') || null,
      email: formData.get('email'),
      web: formData.get('web') || null,
      categoria_id: parseInt(formData.get('categoria')),
      observaciones: formData.get('observaciones') || null
    };
    
    console.log('📤 Enviando datos:', datosPartner);
    
    // Enviar a la base de datos
    const { data, error } = await supabase
      .from('partners_recomendados')
      .insert([datosPartner])
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Partner recomendado exitosamente:', data);
    
    // Mostrar mensaje de éxito
    mostrarMensajeExito();
    
    // Limpiar formulario
    limpiarFormulario();
    
  } catch (error) {
    console.error('❌ Error al recomendar partner:', error);
    mostrarMensajeError(error.message);
  } finally {
    // Restaurar botón
    btnRecomendar.disabled = false;
    btnRecomendar.innerHTML = estadoOriginal;
  }
}

function validarFormulario(form) {
  let esValido = true;
  
  // Campos requeridos
  const camposRequeridos = ['empresa', 'nombre_contacto', 'email', 'categoria'];
  
  camposRequeridos.forEach(campo => {
    const input = form.querySelector(`[name="${campo}"]`);
    if (!input || !input.value.trim()) {
      mostrarError(input, 'Este campo es obligatorio');
      esValido = false;
    }
  });
  
  // Validar email
  const emailInput = form.querySelector('[name="email"]');
  if (emailInput && emailInput.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      mostrarError(emailInput, 'Ingresá un email válido');
      esValido = false;
    }
  }
  
  // Validar URL web (opcional)
  const webInput = form.querySelector('[name="web"]');
  if (webInput && webInput.value) {
    try {
      new URL(webInput.value);
    } catch {
      mostrarError(webInput, 'Ingresá una URL válida (ej: https://www.empresa.com)');
      esValido = false;
    }
  }
  
  return esValido;
}

function validarCampo(input) {
  const valor = input.value.trim();
  
  // Validaciones específicas por tipo de campo
  switch (input.name) {
    case 'email':
      if (valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        mostrarError(input, 'Ingresá un email válido');
        return false;
      }
      break;
    case 'web':
      if (valor) {
        try {
          new URL(valor);
        } catch {
          mostrarError(input, 'Ingresá una URL válida (ej: https://www.empresa.com)');
          return false;
        }
      }
      break;
  }
  
  return true;
}

function mostrarError(input, mensaje) {
  limpiarError(input);
  
  input.classList.add('error');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = mensaje;
  
  input.parentNode.appendChild(errorDiv);
}

function limpiarError(input) {
  input.classList.remove('error');
  
  const errorMessage = input.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

function limpiarFormulario() {
  const form = document.getElementById('formRecomendarPartner');
  if (form) {
    form.reset();
    
    // Limpiar errores
    const inputs = form.querySelectorAll('.form-input, .form-select, .form-textarea');
    inputs.forEach(input => limpiarError(input));
  }
}

function mostrarMensajeExito() {
  // Crear mensaje de éxito temporal
  const mensaje = document.createElement('div');
  mensaje.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  `;
  mensaje.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
        <path d="M229.66,74.34l-112,112a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L112,164.69,218.34,58.34a8,8,0,0,1,11.32,11.32Z"></path>
      </svg>
      Partner recomendado exitosamente
    </div>
  `;
  
  document.body.appendChild(mensaje);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    mensaje.remove();
  }, 3000);
}

function mostrarMensajeError(mensaje) {
  // Crear mensaje de error temporal
  const mensajeDiv = document.createElement('div');
  mensajeDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc2626;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  `;
  mensajeDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
      </svg>
      ${mensaje}
    </div>
  `;
  
  document.body.appendChild(mensajeDiv);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    mensajeDiv.remove();
  }, 5000);
}
