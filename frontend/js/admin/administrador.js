import { cargarLoader } from '../components/loader.js';

document.addEventListener("DOMContentLoaded", async () => {
    await cargarLoader();
    document.body.classList.remove("oculto");
    new Dashboard();
});

class Dashboard {
    constructor() {
      this.sidebarOpen = true
      this.activeSection = "dashboard"
      this.menuItems = {
        dashboard: {
          title: "Dashboard",
          description: "Visualiza la actividad de tu empresa en tiempo real.",
          action: "Ir al Dashboard",
          icon: "monitor",
        },
        activity: {
          title: "Registro de Actividad",
          description: "Consulta las acciones recientes realizadas por los usuarios de tu empresa.",
          action: "Ver Actividad",
          icon: "clock",
        },
        users: {
          title: "Gestionar Usuarios",
          description: "Controla el acceso y los permisos de tu equipo.",
          action: "Gestionar Usuarios",
          icon: "users",
        },
        addresses: {
          title: "Gestionar Direcciones",
          description: "Controla las direcciones de entrega habilitadas para tu empresa.",
          action: "Gestionar Direcciones",
          icon: "map-pin",
        },
      }
  
      this.init()
    }
  
    init() {
      this.bindEvents()
      this.updateContent()
    }
  
    bindEvents() {
      // Toggle sidebar
      const sidebarToggle = document.getElementById("sidebarToggle")
      sidebarToggle.addEventListener("click", () => this.toggleSidebar())
  
      // Navigation items
      const navItems = document.querySelectorAll(".nav-item")
      navItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          const section = e.currentTarget.getAttribute("data-section")
          this.setActiveSection(section)
        })
      })
  
      // Action button
      const actionButton = document.getElementById("actionButton")
      actionButton.addEventListener("click", () => {
        const currentItem = this.menuItems[this.activeSection]
        alert(`Ejecutando: ${currentItem.action}`)
      })
    }
  
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById("sidebar");
        const toggleIcon = document.getElementById("toggleIcon");
      
        if (this.sidebarOpen) {
          sidebar.classList.remove("collapsed");
          toggleIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          `;
        } else {
          sidebar.classList.add("collapsed");
          toggleIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          `;
        }
    }      
  
    setActiveSection(section) {

      const navItems = document.querySelectorAll(".nav-item")
      navItems.forEach((item) => item.classList.remove("active"))
  
      const activeItem = document.querySelector(`[data-section="${section}"]`)
      if (activeItem) {
        activeItem.classList.add("active")
      }
  
      this.activeSection = section
      this.updateContent()
    }
  
    updateContent() {
        const currentItem = this.menuItems[this.activeSection];
        if (!currentItem) return;
      
        const pageTitle = document.getElementById("pageTitle");
        pageTitle.textContent = currentItem.title;
    
        this.loadContent(this.activeSection);
      }

      async loadContent(section) {
        const container = document.getElementById("dynamicContent");
        try {
          const res = await fetch(`partials/${section}.html`);
          const html = await res.text();
          container.innerHTML = html;

          if (section === "dashboard") {
            const monthNames = [
              "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
      
            const today = new Date();
            const currentMonthIndex = today.getMonth();
            const currentMonthName = monthNames[currentMonthIndex];
            const currentMonthNumber = currentMonthIndex + 1;
      
            const mesNombreEl = document.getElementById("mesNombre");
            const mesNumeroEl = document.getElementById("mesNumero");
      
            if (mesNombreEl && mesNumeroEl) {
              mesNombreEl.textContent = currentMonthName;
              mesNumeroEl.textContent = `Mes ${currentMonthNumber} de 12`;
            }
          }

        } catch (err) {
          container.innerHTML = `<p>Error al cargar el contenido de ${section}.</p>`;
        }
      }
}