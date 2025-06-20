import { cargarNavbar } from './navbar.js';

let progressBar;
let prevBtn;
let prevBtnContainer;
let currentStep = 0;
let categoriaSeleccionada = ''; 

document.addEventListener("DOMContentLoaded", () => {
  cargarNavbar();

  // MULTISTEP FORM
  const steps = document.querySelectorAll(".form-step");
  progressBar = document.getElementById("progressBar");
  prevBtn = document.getElementById("progressBarBtn");
  prevBtnContainer = document.querySelector(".progress-bar-btn-container");

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

    // Mostrar u ocultar botón "Volver"
    if (prevBtnContainer) {
      if (index === 0 || index === steps.length - 1) {
        prevBtnContainer.classList.add("hidden");
      } else {
        prevBtnContainer.classList.remove("hidden");
      }
    }

    // Ocultar la barra de progreso en el último paso
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

  // Date Picker
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
  
    const body = {
      categoria: categoriaSeleccionada,
      descripcion: formData.get('descripcion'),
      presupuesto: formData.get('presupuesto'),
      limite: formData.get('limite'),
      direccion_id: formData.get('direccion_entrega'),
      fecha_entrega: formData.get('fecha_entrega'),
      archivo_url: null
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

});