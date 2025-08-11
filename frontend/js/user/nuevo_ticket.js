import { supabase, setSupabaseAuthToken } from '../supabaseClient.js';

export function initNuevoTicket() {
  // MULTISTEP FORM
  let progressBar;
  let prevBtn;
  let currentStep = 0;
  let categoriaSeleccionada = '';
  let step4Fijo = false;

  const steps = document.querySelectorAll(".form-step");
  progressBar = document.getElementById("progressBar");
  prevBtn = document.getElementById("progressBarBtn");
  const progressBarContainer = document.querySelector(".progress-bar-container");


  //PROGRESS BAR
  function showStep(index) {
    if (step4Fijo && index !== steps.length - 1) {
      return;
    }
    steps.forEach((step, i) => {
      step.style.display = i === index ? "block" : "none";
      step.classList.remove("slide-in");
      if (i === index) {
        void step.offsetWidth;
        step.classList.add("slide-in");
      }
    });

    updateProgress(index);
    currentStep = index;

    const hidePrevOnSteps = [0, steps.length - 1];

    if (prevBtn) {
      if (hidePrevOnSteps.includes(index)) {
        prevBtn.classList.add("hidden");
      } else {
        prevBtn.classList.remove("hidden");
      }
    }
  
    if (index === steps.length - 1) {
      progressBarContainer.style.setProperty('display', 'none', 'important');
    } else {
      progressBarContainer.style.display = "flex";
    }

    // Cargar direcciones cuando se muestre el step 3 (presupuesto y datos de entrega)
    if (index === 2) {
      cargarDirecciones();
      // Configurar los event listeners para los selects
      setTimeout(() => {
        setupSelectListeners();
      }, 100);
    }

  }

  function updateProgress(step) {
    // Ahora tenemos 4 steps: 0, 1, 2, 3 (confirmación)
    const percentage = (step / 3) * 100;
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }
  
  // Event listeners para botones de navegación
  document.querySelectorAll(".next-btn, .btn2").forEach(btn => {
    btn.addEventListener("click", () => {
      // Validación específica para step 2
      if (currentStep === 1) {
        if (!validarStep2()) {
          return; // No avanzar si la validación falla
        }
      }
      
      // Validación específica para step 3
      if (currentStep === 2) {
        if (!validarStep3()) {
          return; // No avanzar si la validación falla
        }
      }
      
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  // Función para validar step 2
  function validarStep2() {
    const nombreInput = document.querySelector('input[name="nombre"]');
    const descripcionInput = document.querySelector('textarea[name="descripcion"]');
    
    let isValid = true;
    
    // Validar nombre
    if (!nombreInput || !nombreInput.value.trim()) {
      mostrarError(nombreInput, 'El nombre del ticket es obligatorio');
      isValid = false;
    } else {
      removerError(nombreInput);
    }
    
    // Validar descripción
    if (!descripcionInput || !descripcionInput.value.trim()) {
      mostrarError(descripcionInput, 'La descripción es obligatoria');
      isValid = false;
    } else {
      removerError(descripcionInput);
    }
    
    return isValid;
  }

  // Función para validar step 3
  function validarStep3() {
    const limiteSelect = document.querySelector('select[name="limite"]');
    const presupuestoInput = document.querySelector('input[name="presupuesto"]');
    const direccionSelect = document.querySelector('select[name="direccion_entrega"]');
    const fechaInput = document.querySelector('input[name="fecha_entrega"]');
    
    let isValid = true;
    
    // Validar que se haya seleccionado un límite
    if (!limiteSelect || !limiteSelect.value || limiteSelect.value === '') {
      mostrarError(limiteSelect, 'Debés seleccionar si querés establecer un límite');
      isValid = false;
    } else {
      removerError(limiteSelect);
    }
    
    // Validar presupuesto solo si límite = "Sí"
    if (limiteSelect && limiteSelect.value === 'si') {
      if (!presupuestoInput || !presupuestoInput.value.trim()) {
        mostrarError(presupuestoInput, 'El presupuesto es obligatorio cuando seleccionás "Sí"');
        isValid = false;
      } else {
        removerError(presupuestoInput);
      }
    } else {
      // Si límite = "No", limpiar cualquier error del presupuesto
      if (presupuestoInput) {
        removerError(presupuestoInput);
      }
    }
    
    // Validar dirección de entrega
    if (!direccionSelect || !direccionSelect.value || direccionSelect.value === '') {
      mostrarError(direccionSelect, 'La dirección de entrega es obligatoria');
      isValid = false;
    } else {
      removerError(direccionSelect);
    }
    
    // Validar fecha de entrega
    if (!fechaInput || !fechaInput.value.trim()) {
      mostrarError(fechaInput, 'La fecha de entrega es obligatoria');
      isValid = false;
    } else {
      removerError(fechaInput);
    }
    
    return isValid;
  }

  // Función para mostrar error
  function mostrarError(input, mensaje) {
    if (!input) return;
    
    // Remover error previo si existe
    removerError(input);
    
    // Agregar clase de error
    input.classList.add('error');
    
    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = mensaje;
    errorDiv.style.color = '#d32f2f';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    errorDiv.style.textAlign = 'left';
    
    // Insertar después del input
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
  }

  // Función para remover error
  function removerError(input) {
    if (!input) return;
    
    input.classList.remove('error');
    
    // Remover mensaje de error si existe
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  document.querySelectorAll(".progress-bar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // STEP 1: CATEGORÍA
  const categoriaCards = document.querySelectorAll(".categoria-card");

  categoriaCards.forEach(card => {
    card.addEventListener("click", () => {
      categoriaCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      categoriaSeleccionada = card.dataset.categoria;

      if (currentStep === 0) {
        setTimeout(() => {
          currentStep++;
          showStep(currentStep);
        }, 500);
      }
    });
  });

  // STEP 3: PRESUPUESTO Y DATOS DE ENTREGA
  const limiteSelect = document.querySelector('select[name="limite"]');
  const presupuestoInputGroup = document.getElementById("presupuestoInputGroup");

  if (limiteSelect) {
    limiteSelect.addEventListener("change", () => {
      if (limiteSelect.value === "si") {
        presupuestoInputGroup.style.display = "block";
      } else if (limiteSelect.value === "no") {
        presupuestoInputGroup.style.display = "none";
      }
    });
  }

  const presupuestoInput = document.querySelector('input[name="presupuesto"]');
  if (presupuestoInput) {
    presupuestoInput.addEventListener('input', (e) => {
      const input = e.target;
      const raw = input.value;
      const cursorStart = input.selectionStart;
    
      const numeric = raw.replace(/\D/g, '');
      if (numeric === '') {
        input.value = '';
        return;
      }
    
      const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
      const countDotsBefore = (str, pos) => (str.slice(0, pos).match(/\./g) || []).length;
    
      const oldDots = countDotsBefore(raw, cursorStart);
      const newDots = countDotsBefore(formatted, cursorStart + (formatted.length - raw.length));
    
      const cursorPos = cursorStart + (newDots - oldDots);
    
      input.value = formatted;
      input.setSelectionRange(cursorPos, cursorPos);
    });
    
  }
  showStep(currentStep);

  // Event listeners para limpiar errores cuando el usuario escriba
  document.querySelectorAll('input[name="nombre"], textarea[name="descripcion"]').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        removerError(input);
      }
    });
  });

  // Event listeners para limpiar errores en step 3
  document.querySelectorAll('input[name="presupuesto"], select[name="direccion_entrega"], select[name="limite"], input[name="fecha_entrega"]').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        removerError(input);
      }
    });
    
    // Para select también escuchar el evento change
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => {
        if (input.value && input.value !== '') {
          removerError(input);
        }
      });
    }
  });

  // Event listener para select de límite (validación)
  const limiteSelectValidation = document.querySelector('select[name="limite"]');
  if (limiteSelectValidation) {
    limiteSelectValidation.addEventListener("change", () => {
      // Limpiar error del select
      removerError(limiteSelectValidation);
      
      // Si selecciona "No", limpiar error del presupuesto
      if (limiteSelectValidation.value === 'no') {
        const presupuestoInput = document.querySelector('input[name="presupuesto"]');
        if (presupuestoInput) {
          removerError(presupuestoInput);
        }
      }
    });
  }

  // CARGAR DIRECCIONES PARA EL STEP 3


  async function cargarDirecciones() {
    const token = localStorage.getItem('supabaseToken');
  
    if (!token) {
      console.error('Token no encontrado. El usuario no está autenticado.');
      return;
    }
  
    try {
      const res = await fetch('https://www.procly.net/tickets/direcciones', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const data = await res.json();
  
      if (res.ok) {
        const select = document.getElementById('direccion_entrega');
  
        select.innerHTML = '<option value="" disabled selected>Seleccioná la Dirección de Entrega</option>';
  
        data.forEach((dir, index) => {
          const option = document.createElement('option');
          option.value = dir.direccion_id;
          option.textContent = `${dir.nombre} – ${dir.direccion}`;
          select.appendChild(option);
        });

        // Agregar event listener para el select de direcciones
        select.addEventListener('change', function() {
          if (this.value && this.value !== '') {
            this.setAttribute('data-selected', 'true');
          } else {
            this.removeAttribute('data-selected');
          }
        });
      } else {
        console.error('Error al traer direcciones:', data.error);
      }
    } catch (err) {
      console.error('Error al cargar direcciones:', err);
    }
  }

  // Agregar event listeners para los selects cuando se carga el step 3
  function setupSelectListeners() {
    console.log('🔧 Configurando event listeners para selects...');
    const limiteSelect = document.getElementById('limite');
    const direccionSelect = document.getElementById('direccion_entrega');
    
    console.log('📋 Select límite encontrado:', limiteSelect);
    console.log('📋 Select dirección encontrado:', direccionSelect);
    
    if (limiteSelect) {
      // Verificar estado inicial
      if (limiteSelect.value && limiteSelect.value !== '') {
        limiteSelect.setAttribute('data-selected', 'true');
      }
      
      limiteSelect.addEventListener('change', function() {
        console.log('🔍 Select límite cambió:', this.value);
        if (this.value && this.value !== '') {
          this.setAttribute('data-selected', 'true');
          // Forzar que se muestre el texto seleccionado
          const selectedOption = this.options[this.selectedIndex];
          if (selectedOption) {
            this.textContent = selectedOption.textContent;
          }
          console.log('✅ Atributo data-selected agregado');
        } else {
          this.removeAttribute('data-selected');
          console.log('❌ Atributo data-selected removido');
        }
      });
    }
    
    if (direccionSelect) {
      // Verificar estado inicial
      if (direccionSelect.value && direccionSelect.value !== '') {
        direccionSelect.setAttribute('data-selected', 'true');
      }
      
      direccionSelect.addEventListener('change', function() {
        console.log('🔍 Select dirección cambió:', this.value);
        if (this.value && this.value !== '') {
          this.setAttribute('data-selected', 'true');
          // Forzar que se muestre el texto seleccionado
          const selectedOption = this.options[this.selectedIndex];
          if (selectedOption) {
            this.textContent = selectedOption.textContent;
          }
          console.log('✅ Atributo data-selected agregado');
        } else {
          this.removeAttribute('data-selected');
          console.log('❌ Atributo data-selected removido');
        }
      });
    }
  }

  // DATE PICKER
  flatpickr("#fecha_entrega", {
    dateFormat: "Y-m-d",
    minDate: "today",
    locale: "es"
  });


  // STEP FINAL: CREAR TICKET
  document.getElementById('multiStepForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
  
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      alert('Token de autenticación no encontrado');
      return;
    }
  
    await setSupabaseAuthToken(token);
  
    const archivo = formData.get('adjunto');
    let archivoUrl = null;
  
    if (archivo && archivo.size > 0) {
      const nombreLimpio = archivo.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '');
      const nombreArchivo = `${Date.now()}_${nombreLimpio}`;
  
      const { data, error } = await supabase.storage
        .from('adjuntos-ticket')
        .upload(nombreArchivo, archivo);
  
      if (error) {
        console.error('❌ Error al subir archivo:', error);
        alert('Error al subir el archivo adjunto.');
        return;
      }
  
      archivoUrl = data.path;
    }
  
    const presupuestoRaw = formData.get('presupuesto');
    const presupuestoNumerico = presupuestoRaw ? Number(presupuestoRaw.replace(/\./g, '')) : null;
  
    const body = {
      categoria: categoriaSeleccionada,
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      presupuesto: presupuestoNumerico,
      limite: formData.get('limite'),
      direccion_id: formData.get('direccion_entrega'),
      fecha_entrega: formData.get('fecha_entrega'),
      archivo_url: archivoUrl
    };
  
    try {
      const res = await fetch('https://www.procly.net/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
  
      const data = await res.json();
  

      if (res.ok) {
        step4Fijo = true;
        currentStep++;
        showStep(currentStep);
        mostrarConfirmacion(data.codigo_ticket);
      } else {
        alert('❌ Error al crear el ticket: ' + data.error);
      }
    } catch (err) {
      console.error('⚠️ Error al enviar el ticket:', err);
      alert('Error de red al crear el ticket');
    }
  });
  

  const adjuntoInput = document.getElementById('adjunto');
  const labelAdjunto = document.querySelector('.custom-file-upload label');
  
  const svgClip = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#4B5563" viewBox="0 0 256 256" style="vertical-align: middle; margin-right: 8px;">
    <path d="M209.66,122.34a8,8,0,0,1,0,11.32l-82.05,82a56,56,0,0,1-79.2-79.21L147.67,35.73a40,40,0,1,1,56.61,56.55L105,193A24,24,0,1,1,71,159L154.3,74.38A8,8,0,1,1,165.7,85.6L82.39,170.31a8,8,0,1,0,11.27,11.36L192.93,81A24,24,0,1,0,159,47L59.76,147.68a40,40,0,1,0,56.53,56.62l82.06-82A8,8,0,0,1,209.66,122.34Z"></path>
  </svg>`;
  
  const svgCheck = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#4B5563" viewBox="0 0 256 256" style="vertical-align: middle; margin-right: 8px;">
    <path d="M149.61,85.71l-89.6,88a8,8,0,0,1-11.22,0L10.39,136a8,8,0,1,1,11.22-11.41L54.4,156.79l84-82.5a8,8,0,1,1,11.22,11.42Zm96.1-11.32a8,8,0,0,0-11.32-.1l-84,82.5-18.83-18.5a8,8,0,0,0-11.21,11.42l24.43,24a8,8,0,0,0,11.22,0l89.6-88A8,8,0,0,0,245.71,74.39Z"></path>
  </svg>`;
  
  adjuntoInput.addEventListener('change', () => {
    if (adjuntoInput.files.length > 0) {
      labelAdjunto.innerHTML = `${svgCheck} Archivo seleccionado`;
      labelAdjunto.classList.add('filled');
    } else {
      labelAdjunto.innerHTML = `${svgClip} Adjuntar archivo`;
      labelAdjunto.classList.remove('filled');
    }
  });

  // MENSAJE CONDIFRMACION: CODIGO TICKET
  function mostrarConfirmacion(codigoTicket) {

    const textoCodigo = document.getElementById("codigoTicketTexto");
    textoCodigo.textContent = codigoTicket;

    const copiarIcono = document.getElementById("copiarIcono");
    copiarIcono.dataset.codigo = codigoTicket;
    copiarIcono.classList.remove("copiado");

    lottie.loadAnimation({
      container: document.getElementById('success-animation'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/assets/lottie/success-check.json'
    });    
  }

  // Al final, delega el click para "Ver mis tickets"
  document.getElementById('verMisTicketsBtn')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-section="mis_tickets"]')?.click();
  });

  // Si necesitas exponer copiar código:
  window.copiarCodigoTicket = function () {
    const icono = document.getElementById("copiarIcono");
    const codigo = icono.dataset.codigo;

    if (icono.classList.contains("copiado")) return;

    navigator.clipboard.writeText(codigo).then(() => {
      icono.innerHTML = `
        <!-- Icono copiado -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#3E8914" viewBox="0 0 256 256">
          <path d="M149.61,85.71l-89.6,88a8,8,0,0,1-11.22,0L10.39,136a8,8,0,1,1,11.22-11.41L54.4,156.79l84-82.5a8,8,0,1,1,11.22,11.42Zm96.1-11.32a8,8,0,0,0-11.32-.1l-84,82.5-18.83-18.5a8,8,0,0,0-11.21,11.42l24.43,24a8,8,0,0,0,11.22,0l89.6-88A8,8,0,0,0,245.71,74.39Z"></path>
        </svg>
      `;
      icono.classList.add("copiado");
      icono.style.pointerEvents = "none";
    }).catch(err => {
      console.error("Error al copiar:", err);
    });
  };

  document.querySelectorAll('.info-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.stopPropagation();
      // Cierra otros tooltips
      document.querySelectorAll('.categoria-card').forEach(card => card.classList.remove('show-tooltip'));
      // Abre el de esta card
      const card = this.closest('.categoria-card');
      card.classList.add('show-tooltip');
      // Si no existe el tooltip, lo crea
      if (!card.querySelector('.info-tooltip')) {
        const tooltip = document.createElement('div');
        tooltip.className = 'info-tooltip';
        tooltip.textContent = this.dataset.info;
        card.appendChild(tooltip);
      }
    });
  });

  // Cierra el tooltip al hacer click fuera
  document.addEventListener('click', () => {
    document.querySelectorAll('.categoria-card').forEach(card => card.classList.remove('show-tooltip'));
  });

  const form = document.getElementById('multiStepForm');
  form.addEventListener('reset', () => {
    console.log("⚠️ Formulario reseteado");
  });

  document.addEventListener('input', (e) => {
    console.log("Evento input global:", e.target);
  });
  document.addEventListener('change', (e) => {
    console.log("Evento change global:", e.target);
  });

  document.addEventListener('visibilitychange', () => {
    console.log("⚠️ Cambió la visibilidad del documento:", document.visibilityState);
  });
}
