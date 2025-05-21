function inicializarDropdownNavbar() {
    const dotsIcon = document.querySelector('.navbar-user img[alt="Icono tres puntos"]');
    const dropdown = document.getElementById('dropdown-menu');
  
    if (!dotsIcon || !dropdown) return;
  
    // MOSTRAR/OCULTAR EL DROPDOWN
    dotsIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // OCULTAR DROPDOWN AL HACER CLIC FUERA
    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });
  }

  function inicializarLogout() {
    const logoutBtn = document.getElementById("logout-btn");
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
  
        try {
          const res = await fetch("https://procly.onrender.com/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (res.ok) {
            window.location.href = "/index.html";
          } else {
            const data = await res.json();
            alert("Error al cerrar sesión: " + data.error);
          }
        } catch (error) {
          console.error("Error de red:", error);
          alert("No se pudo cerrar sesión.");
        }
      });
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    inicializarDropdownNavbar();
    inicializarLogout();
  });