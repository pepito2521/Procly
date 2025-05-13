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