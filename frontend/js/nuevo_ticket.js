let progressBar;
let prevBtn;

document.addEventListener("DOMContentLoaded", () => {
  // Cargar el navbar
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

      // ✅ RESALTAR NAVBAR-LINK ACTIVO
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

  // ✅ Selección de categoría: activar y avanzar a paso 2 con delay
  const categoriaCards = document.querySelectorAll(".categoria-card");

  categoriaCards.forEach(card => {
    card.addEventListener("click", () => {
      // Remover clases activas anteriores
      categoriaCards.forEach(c => c.classList.remove("selected"));

      // Marcar actual como seleccionada
      card.classList.add("selected");

      // Guardar la categoría si querés
      const categoriaSeleccionada = card.dataset.categoria;
      console.log("Seleccionaste:", categoriaSeleccionada);

      // Avanzar automáticamente al paso 2 con 1 segundo de delay
      if (currentStep === 0) {
        setTimeout(() => {
          currentStep++;
          showStep(currentStep);
        }, 500);
      }
    });
    });

      // ✅ Selección de límite de presupuesto (step 3)
  const radiosLimite = document.querySelectorAll('input[name="limite"]');

  radiosLimite.forEach(radio => {
    radio.addEventListener("change", () => {
      // Sacar la clase 'selected' de todas las tarjetas
      document.querySelectorAll('.opcion-card').forEach(card => card.classList.remove('selected'));

      // Agregar la clase 'selected' a la tarjeta activa
      radio.closest('.opcion-card').classList.add('selected');
    });
  });

});
