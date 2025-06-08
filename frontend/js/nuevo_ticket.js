let progressBar;
let prevBtn;
let prevBtnContainer;
let currentStep = 0;
let categoriaSeleccionada = ''; 

document.addEventListener("DOMContentLoaded", () => {
  // CARGAR NAVBAR
  fetch("../components/navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar-placeholder").innerHTML = data;

      const script = document.createElement("script");
      script.src = "../js/navbar.js";
      script.type = "module";
      script.onload = () => {
        inicializarDropdownNavbar();
        inicializarLogout();
      };
      document.body.appendChild(script);

      // RESALTAR NAVBAR-LINK ACTIVO
      const currentPage = window.location.pathname.split("/").pop();
      const links = document.querySelectorAll(".navbar-links a");

      links.forEach(link => {
        if (link.getAttribute("href").includes(currentPage)) {
          link.classList.add("active");
        }
      });
    });

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

    // ✅ OPCIÓN B: Mostrar u ocultar botón "Volver" con add/remove
    if (prevBtnContainer) {
      if (index === 0) {
        prevBtnContainer.classList.add("hidden");
      } else {
        prevBtnContainer.classList.remove("hidden");
      }
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

  async function cargarDirecciones() {
    try {
      const res = await fetch('http://localhost:3000/tickets/direcciones');
      const data = await res.json();
  
      if (res.ok) {
        const select = document.getElementById('direccion_entrega');
        data.direcciones.forEach(dir => {
          const option = document.createElement('option');
          option.value = dir.id;
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

  // Mostrar el primer paso
  showStep(currentStep);

  // Cargar direcciones desde el backend
  cargarDirecciones();


  document.getElementById('multiStepForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
  
    const body = {
      categoria: categoriaSeleccionada,
      descripcion: formData.get('descripcion'),
      presupuesto: formData.get('presupuesto'),
      limite: formData.get('limite'),
      direccion_id: formData.get('direccion_entrega'), // por ahora texto
      fecha_entrega: formData.get('fecha_entrega'),
      archivo_url: null // si implementás upload, podés cambiar esto
    };
  
    try {
      const res = await fetch('http://localhost:3000/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
  
      const data = await res.json();
  
      if (res.ok) {
        console.log('Ticket creado con éxito:', data);
        currentStep++;
        showStep(currentStep); // muestra step-5
      } else {
        alert('Error al crear el ticket: ' + data.error);
      }
    } catch (err) {
      console.error('Error al enviar el ticket:', err);
      alert('Error de red al crear el ticket');
    }
  });

});
