document.addEventListener("DOMContentLoaded", () => {

  // INSERTAR NAVBAR EN LA PAGINA

  fetch("../components/navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar-placeholder").innerHTML = data;

    const script = document.createElement("script");
    script.src = "../js/navbar.js";
    script.onload = () => {
      inicializarDropdownNavbar();
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

  // MULTI-STEP FORM
  const steps = document.querySelectorAll('.form-step');
  let currentStep = 0;

  function updateProgressBar(step) {
    const steps = document.querySelectorAll('.progressbar-step');
    const lines = document.querySelectorAll('.progressbar-line');
    steps.forEach((el, idx) => {
      el.classList.remove('active', 'completed');
      if (idx < step) {
        el.classList.add('completed');
      } else if (idx === step) {
        el.classList.add('active');
      }
    });
    // Resalta solo las líneas anteriores al paso actual
    lines.forEach((line, idx) => {
      if (idx < step) {
        line.classList.add('completed');
      } else {
        line.classList.remove('completed');
      }
    });
  }

  function showStep(index) {
    steps.forEach((step, i) => {
      step.style.display = i === index ? 'block' : 'none';
    });
    updateProgressBar(index);

    const stepTitles = document.querySelectorAll('.step-title-container');
    stepTitles.forEach((el, idx) => {
      if (idx === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Inicializa el primer paso
  showStep(currentStep);
});


// FUNCIONALIDAD DE MOSTRAR / OCULTAR BLOQUES AL CLIC EN LAS FLECHAS DEL TÍTULO DE PASO

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("chevron-down")) {
    const stepContainer = e.target.closest(".step-title-container");
    const formStep = stepContainer.nextElementSibling;
    formStep.style.display = "none";
    stepContainer.classList.remove("active");
  }

  if (e.target.classList.contains("chevron-right")) {
    const stepContainer = e.target.closest(".step-title-container");
    const formStep = stepContainer.nextElementSibling;
    formStep.style.display = "block";
    stepContainer.classList.add("active");

    // Scroll suave al paso activado
    formStep.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
});
