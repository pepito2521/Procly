let progressBar;
let prevBtn;

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
  prevBtn = document.getElementById("prevBtn");
  let currentStep = 0;

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
  }

  function updateProgress(step) {
    const percentage = (step + 1) * 20;
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    if (prevBtn) {
      prevBtn.style.display = step === 0 ? "none" : "inline-block";
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

  document.querySelectorAll(".prev-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Mostrar el primer paso
  showStep(currentStep);


  // STEP 1: CATEGORIA
  const categoriaCards = document.querySelectorAll(".categoria-card");

  categoriaCards.forEach(card => {
    card.addEventListener("click", () => {
      categoriaCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const categoriaSeleccionada = card.dataset.categoria;
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

});
