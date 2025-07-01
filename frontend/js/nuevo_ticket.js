import { cargarNavbar } from './navbar.js';
import { supabase } from './supabaseClient.js';

let progressBar;
let prevBtn;
let currentStep = 0;
let categoriaSeleccionada = ''; 

document.addEventListener("DOMContentLoaded", () => {
  cargarNavbar();

  // MULTISTEP FORM
  const steps = document.querySelectorAll(".form-step");
  progressBar = document.getElementById("progressBar");
  prevBtn = document.getElementById("progressBarBtn");

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

    // MOSTRAR/OCULTAR BOTON VOLVER
    const hidePrevOnSteps = [0, steps.length - 1];

    if (prevBtn) {
      if (hidePrevOnSteps.includes(index)) {
        prevBtn.classList.add("hidden");
      } else {
        prevBtn.classList.remove("hidden");
      }
    }
    


    // OCULTAR PROGRESSBAR EN EL ULTIMO PASO
    const progressBarContainer = document.querySelector(".progress-bar-container");
    if (index === steps.length - 1) {
      progressBarContainer.style.display = "none";
    } else {
      progressBarContainer.style.display = "flex";
    }

  }

  function updateProgress(step) {
    const percentage = (step / (steps.length - 1)) * 100;
    console.log("Avanzaste al step", step, "- % barra:", percentage);
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }
  

  document.querySelectorAll(".next-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

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
      console.log("Seleccionaste:", categoriaSeleccionada);

      if (currentStep === 0) {
        setTimeout(() => {
          currentStep++;
          showStep(currentStep);
        }, 500);
      }
    });
  });

  // STEP 3: PRESUPUESTO
  const radiosLimite = document.querySelectorAll('input[name="limite"]');
  const presupuestoInputGroup = document.getElementById("presupuestoInputGroup");

  radiosLimite.forEach(radio => {
    radio.addEventListener("change", () => {
      document.querySelectorAll('.opcion-card').forEach(card => card.classList.remove('selected'));
      const card = radio.closest('.opcion-card');
      if (card) card.classList.add('selected');

      if (radio.value === "si" && radio.checked) {
        presupuestoInputGroup.style.display = "block";
      } else if (radio.value === "no" && radio.checked) {
        presupuestoInputGroup.style.display = "none";
      }
    });
  });

  showStep(currentStep);

  // STEP 4: DIRECCION DE ENTREGA Y FECHA

  // Direccion de entrega segun usuario

  async function cargarDirecciones() {
    const token = localStorage.getItem('supabaseToken');
  
    if (!token) {
      console.error('Token no encontrado. El usuario no está autenticado.');
      return;
    }
  
    try {
      const res = await fetch('https://procly.onrender.com/tickets/direcciones', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const data = await res.json();
  
      if (res.ok) {
        const select = document.getElementById('direccion_entrega');
        data.forEach(dir => {
          const option = document.createElement('option');
          option.value = dir.direccion_id;
          option.textContent = dir.direccion;
          select.appendChild(option);
        });
      } else {
        console.error('Error al traer direcciones:', data.error);
      }
    } catch (err) {
      console.error('Error al cargar direcciones:', err);
    }
  }
  cargarDirecciones();

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
    
    const archivo = formData.get('adjunto');
    let archivoUrl = null;
  
    if (archivo && archivo.size > 0) {
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
  
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
    
    const body = {
      categoria: categoriaSeleccionada,
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      presupuesto: formData.get('presupuesto'),
      limite: formData.get('limite'),
      direccion_id: formData.get('direccion_entrega'),
      fecha_entrega: formData.get('fecha_entrega'),
      archivo_url: archivoUrl
    };
  
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      alert('Token de autenticación no encontrado');
      return;
    }
  
    try {
      const res = await fetch('https://procly.onrender.com/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
  
      const data = await res.json();
  
      if (res.ok) {
        console.log('✅ Ticket creado con éxito:', data);
        currentStep++;
        showStep(currentStep);
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

});