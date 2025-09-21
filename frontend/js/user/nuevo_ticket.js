import { supabase, setSupabaseAuthToken } from '../supabaseClient.js';
import { mostrarLoader, ocultarLoader } from '/js/components/loader.js';

export function initNuevoTicket() {
  // MULTISTEP FORM
  let progressBar;
  let prevBtn;
  let currentStep = 0;
  let categoriaSeleccionada = '';

  const steps = document.querySelectorAll(".form-step");
  progressBar = document.getElementById("progressBar");
  prevBtn = document.getElementById("progressBarBtn");
  const progressBarContainer = document.querySelector(".progress-bar-container");

  // ===== FUNCIONALIDAD PARA CATEGORÍAS DINÁMICAS =====
  // Datos de categorías cargados desde Supabase
  let categoriasData = [];

  // Función para cargar categorías desde Supabase
  async function cargarCategorias() {
    try {
      console.log('🔄 Cargando categorías desde Supabase...');
      
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nombre, descripcion, imagen, icon')
        .order('nombre');
      
      if (error) {
        console.error('❌ Error al cargar categorías:', error);
        return;
      }
      
      categoriasData = data;
      console.log(`✅ ${categoriasData.length} categorías cargadas desde Supabase:`, categoriasData);
      
      // Renderizar las categorías en el grid
      renderizarCategorias();
      
    } catch (error) {
      console.error('💥 Error inesperado al cargar categorías:', error);
    }
  }

  // Función para renderizar las categorías en el grid
  function renderizarCategorias() {
    const categoriaGrid = document.querySelector('.categoria-grid');
    if (!categoriaGrid) {
      console.error('❌ No se encontró el elemento .categoria-grid');
      return;
    }
    
    // Limpiar el grid
    categoriaGrid.innerHTML = '';
    
    // Crear tarjetas para cada categoría
    categoriasData.forEach(categoria => {
      const categoriaCard = crearTarjetaCategoria(categoria);
      categoriaGrid.appendChild(categoriaCard);
    });
    
    console.log('✅ Categorías renderizadas en el grid');
    
    // Después de renderizar, configurar los event listeners
    configurarEventListenersCategorias();
  }

  // Función para crear una tarjeta de categoría
  function crearTarjetaCategoria(categoria) {
    const card = document.createElement('div');
    card.className = 'categoria-card';
    card.setAttribute('data-categoria', categoria.nombre);
    
    // Imagen de fondo desde Supabase Storage
    let imagenHTML = '';
    if (categoria.imagen && categoria.imagen.includes('/storage/')) {
      // Es una imagen de Supabase Storage
      const correctedPath = categoria.imagen.replace('/images/', '/imagen/');
      const supabaseUrl = supabase.supabaseUrl;
      const fullUrl = `${supabaseUrl}${correctedPath}`;
      
      imagenHTML = `
        <picture>
          <source srcset="${fullUrl.replace('.jpg', '.webp')}" type="image/webp">
          <img src="${fullUrl}" 
               alt="${categoria.nombre}" 
               loading="lazy" />
        </picture>
      `;
    } else if (categoria.imagen && categoria.imagen.startsWith('http')) {
      // Es una URL completa
      imagenHTML = `
        <picture>
          <source srcset="${categoria.imagen.replace('.jpg', '.webp')}" type="image/webp">
          <img src="${categoria.imagen}" 
               alt="${categoria.nombre}" 
               loading="lazy" />
        </picture>
      `;
    } else {
      // Fallback a imagen local (mantener compatibilidad)
      const nombreCategoria = categoria.nombre.toLowerCase();
      imagenHTML = `
        <picture>
          <source srcset="/assets/img/categorias/webp/${nombreCategoria}.webp" type="image/webp">
          <img src="/assets/img/categorias/${nombreCategoria}.jpg" 
               alt="${categoria.nombre}" 
               loading="lazy" />
        </picture>
      `;
    }
    
    // Icono personalizado desde Supabase Storage
    let iconoHTML = '';
    if (categoria.icon && categoria.icon.includes('/storage/')) {
      // Es un icono de Supabase Storage
      const correctedIconPath = categoria.icon.replace('/images/', '/icon/');
      const supabaseUrl = supabase.supabaseUrl;
      const fullIconUrl = `${supabaseUrl}${correctedIconPath}`;
      
      iconoHTML = `<img src="${fullIconUrl}" alt="Icono ${categoria.nombre}" width="18" height="18">`;
    } else if (categoria.icon && categoria.icon.startsWith('http')) {
      // Es una URL completa
      iconoHTML = `<img src="${categoria.icon}" alt="Icono ${categoria.nombre}" width="18" height="18">`;
    } else {
      // Fallback al SVG genérico
      iconoHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
      </svg>`;
    }
    
    // Crear el HTML de la tarjeta
    card.innerHTML = `
      ${imagenHTML}
      <span class="info-icon" data-info="${categoria.descripcion || 'Sin descripción disponible.'}">
        ${iconoHTML}
      </span>
      <h3>${categoria.nombre}</h3>
    `;
    
    return card;
  }

  // Función para configurar event listeners de las categorías (después de renderizar)
  function configurarEventListenersCategorias() {
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
    
    // Configurar tooltips para las categorías
    configurarTooltipsCategorias();
  }

  // Función para configurar tooltips de las categorías
  function configurarTooltipsCategorias() {
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
  }

  // Cargar categorías desde Supabase al inicializar
  cargarCategorias();

  //PROGRESS BAR
  function showStep(index) {
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

    const hidePrevOnSteps = [0]; // Solo ocultar en el primer paso

    if (prevBtn) {
      if (hidePrevOnSteps.includes(index)) {
        prevBtn.classList.add("hidden");
      } else {
        prevBtn.classList.remove("hidden");
      }
    }

    // Cargar direcciones cuando se muestre el step 3 (presupuesto y datos de entrega)
    if (index === 2) {
      cargarDirecciones();
      // Configurar los event listeners para los selects
      setTimeout(() => {
        setupSelectListeners();
        // Actualizar mensaje de fecha mínima
        actualizarMensajeFechaMinima();
      }, 100);
    }
  }

  function updateProgress(step) {
    // Ahora tenemos 3 steps: 0, 1, 2 (sin confirmación)
    const percentage = (step / 2) * 100;
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
      
      if (currentStep < 2) { // Solo 3 steps: 0, 1, 2
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
      // Validar que la fecha cumple con el mínimo de 5 días hábiles
      if (!validarFechaMinima(fechaInput.value)) {
        const fechaMinima = calcularFechaMinima();
        const fechaMinimaFormateada = new Date(fechaMinima).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        mostrarError(fechaInput, `La fecha debe ser al menos 5 días hábiles desde hoy (${fechaMinimaFormateada})`);
      isValid = false;
    } else {
      removerError(fechaInput);
      }
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
          console.log('✅ Atributo data-selected agregado');
        } else {
          this.removeAttribute('data-selected');
          console.log('❌ Atributo data-selected removido');
        }
      });
    }
  }

  // DATE PICKER
  // Función para calcular la fecha mínima (5 días hábiles desde hoy)
  function calcularFechaMinima() {
    const hoy = new Date();
    let fechaMinima = new Date(hoy);
    let diasHabiles = 0;
    
    // Avanzar hasta encontrar 5 días hábiles
    while (diasHabiles < 5) {
      fechaMinima.setDate(fechaMinima.getDate() + 1); // Avanzar un día
      
      // Verificar si es día hábil (no sábado ni domingo)
      const diaSemana = fechaMinima.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) { // 0 = domingo, 6 = sábado
        diasHabiles++;
      }
    }
    
    // Formatear la fecha para flatpickr (YYYY-MM-DD)
    const year = fechaMinima.getFullYear();
    const month = String(fechaMinima.getMonth() + 1).padStart(2, '0');
    const day = String(fechaMinima.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // Función para validar que la fecha seleccionada cumple con el mínimo de días hábiles
  function validarFechaMinima(fechaSeleccionada) {
    const fechaMinima = new Date(calcularFechaMinima());
    const fechaSelec = new Date(fechaSeleccionada);
    
    return fechaSelec >= fechaMinima;
  }

  // Configurar flatpickr con fecha mínima de 5 días hábiles
  flatpickr("#fecha_entrega", {
    dateFormat: "Y-m-d",
    minDate: calcularFechaMinima(),
    locale: "es",
    // Agregar mensaje personalizado para explicar la restricción
    onChange: function(selectedDates, dateStr, instance) {
      // Opcional: mostrar mensaje informativo
      console.log(`📅 Fecha seleccionada: ${dateStr}`);
      console.log(`⏰ Mínimo 5 días hábiles requeridos para propuestas`);
    }
  });

  // Actualizar mensaje informativo con la fecha mínima calculada
  function actualizarMensajeFechaMinima() {
    const fechaMinima = calcularFechaMinima();
    const fechaMinimaFormateada = new Date(fechaMinima).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const mensajeElement = document.querySelector('.fecha-info');
    if (mensajeElement) {
      mensajeElement.innerHTML = `⏰ Mínimo 5 días hábiles requeridos para conseguir propuestas<br><strong>Fecha mínima: ${fechaMinimaFormateada}</strong>`;
    }
  }

  // Llamar a la función cuando se carga el step 3
  // Esto se ejecutará en showStep cuando index === 2

  // STEP FINAL: CREAR TICKET
  document.getElementById('multiStepForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
    const crearTicketBtn = document.getElementById('crearTicketBtn');
  
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      alert('Token de autenticación no encontrado');
      return;
    }
  
    // Mostrar loader en lugar de cambiar el botón
    await mostrarLoader();
  
    try {
    await setSupabaseAuthToken(token);
  
      // Get file from the new file upload system
      const archivo = window.selectedFile;
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
          ocultarLoader();
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
        // ✅ TICKET CREADO EXITOSAMENTE
        console.log('✅ Ticket creado exitosamente:', data);
        
        // Mostrar mensaje de éxito temporal
        mostrarMensajeExito();
        
        // Clear file selection on successful submission
        clearFileSelection();
        
        // Ocultar loader
        ocultarLoader();
        
        // Mostrar pop-up de confirmación
        await mostrarPopUpConfirmacion(data.codigo_ticket);
        
        // Reset del formulario
        resetearFormulario();
        
      } else {
        console.error('❌ Error al crear el ticket:', data.error);
        alert('❌ Error al crear el ticket: ' + data.error);
        ocultarLoader();
      }
    } catch (err) {
      console.error('⚠️ Error al enviar el ticket:', err);
      alert('Error de red al crear el ticket');
      ocultarLoader();
    }
  });
  
  // FILE UPLOAD AREA - Funcionalidad moderna replicada de partners.html
  const fileUploadArea = document.getElementById('fileUploadArea');
  const adjuntoInput = document.getElementById('adjunto');
  
  // Click para seleccionar archivo
  fileUploadArea.addEventListener('click', () => {
    adjuntoInput.click();
  });
  
  // Drag & Drop functionality
  fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('drag-over');
  });
  
  fileUploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('drag-over');
  });
  
  fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  });

  // File selection handling
  adjuntoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });

  // Remove file event
  fileRemove.addEventListener('click', removeFile);

  function handleFileSelection(file) {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no válido. Solo se permiten: PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG y GIF');
      return;
    }

    // Validate file size (25MB max)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Tamaño máximo: 25MB');
      return;
    }

    // Update the form data for submission
    window.selectedFile = file;
    
    // Show selected file
    showSelectedFile(file);
  }

  function showSelectedFile(file) {
    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    
    // Update UI
    fileUploadArea.style.display = 'none';
    fileSelected.style.display = 'block';
    fileSelected.querySelector('.file-name').textContent = `${fileName} (${fileSize})`;
  }

  function removeFile() {
    window.selectedFile = null;
    adjuntoInput.value = '';
    fileUploadArea.style.display = 'block';
    fileSelected.style.display = 'none';
    fileUploadArea.classList.remove('drag-over');
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Function to clear file selection
  function clearFileSelection() {
    window.selectedFile = null;
    adjuntoInput.value = '';
    fileUploadArea.style.display = 'block';
    fileSelected.style.display = 'none';
    fileUploadArea.classList.remove('drag-over');
  }

  // Función para mostrar mensaje de éxito temporal
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
        ¡Ticket creado exitosamente!
      </div>
    `;
    
    document.body.appendChild(mensaje);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      mensaje.remove();
    }, 3000);
  }

  // POP-UP DE CONFIRMACIÓN
  async function mostrarPopUpConfirmacion(codigoTicket) {
    // Cargar el pop-up dinámicamente
    const response = await fetch('/components/pop-up-confirmacion-ticket.html');
    const popupHTML = await response.text();
    
    // Crear un contenedor temporal para el pop-up
    let popupContainer = document.getElementById('popup-confirmacion-container');
    if (!popupContainer) {
      popupContainer = document.createElement('div');
      popupContainer.id = 'popup-confirmacion-container';
      document.body.appendChild(popupContainer);
    }
    
    popupContainer.innerHTML = popupHTML;
    
    const popup = document.getElementById('pop-up-confirmacion-ticket');
    const codigoElement = document.getElementById('popup-codigo-ticket');
    const copiarBtn = document.getElementById('popup-copiar-codigo');
    
    // Mostrar el pop-up
    popup.style.display = 'flex';
    
    // Configurar el código del ticket
    codigoElement.textContent = codigoTicket;
    copiarBtn.dataset.codigo = codigoTicket;
    copiarBtn.classList.remove('copiado');
    
    // Configurar event listeners
    configurarPopUpConfirmacion();
  }

  function configurarPopUpConfirmacion() {
    const popup = document.getElementById('pop-up-confirmacion-ticket');
    const cerrarBtn = document.getElementById('cerrar-confirmacion');
    const verTicketsBtn = document.getElementById('ver-mis-tickets');
    const copiarBtn = document.getElementById('popup-copiar-codigo');
    
    // Cerrar pop-up
    cerrarBtn.addEventListener('click', () => {
      popup.style.display = 'none';
      // Limpiar el contenedor del pop-up
      const popupContainer = document.getElementById('popup-confirmacion-container');
      if (popupContainer) {
        popupContainer.remove();
      }
    });
    
    // Ver mis tickets
    verTicketsBtn.addEventListener('click', () => {
      popup.style.display = 'none';
      // Limpiar el contenedor del pop-up
      const popupContainer = document.getElementById('popup-confirmacion-container');
      if (popupContainer) {
        popupContainer.remove();
      }
      document.querySelector('.nav-item[data-section="mis_tickets"]')?.click();
    });

    // Copiar código
    copiarBtn.addEventListener('click', () => {
      const codigo = copiarBtn.dataset.codigo;
      if (copiarBtn.classList.contains('copiado')) return;

    navigator.clipboard.writeText(codigo).then(() => {
        copiarBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M149.61,85.71l-89.6,88a8,8,0,0,1-11.22,0L10.39,136a8,8,0,1,1,11.22-11.41L54.4,156.79l84-82.5a8,8,0,1,1,11.22,11.42Zm96.1-11.32a8,8,0,0,0-11.32-.1l-84,82.5-18.83-18.5a8,8,0,0,0-11.21,11.42l24.43,24a8,8,0,0,0,11.22,0l89.6-88A8,8,0,0,0,245.71,74.39Z"></path>
        </svg>
      `;
        copiarBtn.classList.add('copiado');
        copiarBtn.style.pointerEvents = 'none';
    }).catch(err => {
        console.error('Error al copiar:', err);
      });
    });
    
    // Cerrar con click fuera del pop-up
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.style.display = 'none';
        // Limpiar el contenedor del pop-up
        const popupContainer = document.getElementById('popup-confirmacion-container');
        if (popupContainer) {
          popupContainer.remove();
        }
      }
    });
  }

  // RESET DEL FORMULARIO
  function resetearFormulario() {
    // Reset del formulario
    document.getElementById('multiStepForm').reset();
    
    // Reset de variables
    categoriaSeleccionada = '';
    currentStep = 0;
    
    // Reset de la UI
    document.querySelectorAll('.categoria-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Reset del progress bar
    updateProgress(0);
    
    // Volver al primer step
    showStep(0);
    
    // Reset del file upload
    clearFileSelection();
  }


}
