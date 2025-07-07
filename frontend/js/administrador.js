import { cargarLoader } from './loader.js';

document.addEventListener("DOMContentLoaded", async () => {
    await cargarLoader();

    document.body.classList.remove("oculto");
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
      // Inicializar iconos de Lucide
      const lucide = window.lucide // Declare the variable before using it
      if (typeof lucide !== "undefined") {
        lucide.createIcons()
      }
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
  
      // Responsive behavior
      this.handleResize()
      window.addEventListener("resize", () => this.handleResize())
    }
  
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      const sidebar = document.getElementById("sidebar")
      const toggleIcon = document.getElementById("toggleIcon")
  
      if (this.sidebarOpen) {
        sidebar.classList.remove("collapsed")
        toggleIcon.setAttribute("data-lucide", "x")
      } else {
        sidebar.classList.add("collapsed")
        toggleIcon.setAttribute("data-lucide", "menu")
      }
  
      // Recrear iconos después del cambio
      const lucide = window.lucide // Declare the variable before using it
      if (typeof lucide !== "undefined") {
        lucide.createIcons()
      }
    }
  
    setActiveSection(section) {
      // Remover clase active de todos los items
      const navItems = document.querySelectorAll(".nav-item")
      navItems.forEach((item) => item.classList.remove("active"))
  
      // Agregar clase active al item seleccionado
      const activeItem = document.querySelector(`[data-section="${section}"]`)
      if (activeItem) {
        activeItem.classList.add("active")
      }
  
      this.activeSection = section
      this.updateContent()
    }
  
    updateContent() {
      const currentItem = this.menuItems[this.activeSection]
      if (!currentItem) return
  
      // Actualizar título de la página
      const pageTitle = document.getElementById("pageTitle")
      pageTitle.textContent = currentItem.title
  
      // Actualizar contenido de la card
      const cardTitle = document.getElementById("cardTitle")
      const cardDescription = document.getElementById("cardDescription")
      const actionButton = document.getElementById("actionButton")
      const cardIcon = document.getElementById("cardIcon")
  
      cardTitle.textContent = currentItem.title
      cardDescription.textContent = currentItem.description
      actionButton.textContent = currentItem.action
      cardIcon.setAttribute("data-lucide", currentItem.icon)
  
      // Recrear iconos
      const lucide = window.lucide // Declare the variable before using it
      if (typeof lucide !== "undefined") {
        lucide.createIcons()
      }
    }
  
    handleResize() {
      const isMobile = window.innerWidth <= 768
      const sidebar = document.getElementById("sidebar")
  
      if (isMobile) {
        // En móvil, el sidebar se comporta como overlay
        sidebar.classList.remove("collapsed")
        if (this.sidebarOpen) {
          sidebar.classList.add("open")
        } else {
          sidebar.classList.remove("open")
        }
      } else {
        // En desktop, comportamiento normal
        sidebar.classList.remove("open")
        if (!this.sidebarOpen) {
          sidebar.classList.add("collapsed")
        }
      }
    }
  }
  
  // Inicializar la aplicación cuando el DOM esté listo
  document.addEventListener("DOMContentLoaded", () => {
    new Dashboard()
  })
  
  // Manejar clics fuera del sidebar en móvil
  document.addEventListener("click", (e) => {
    const sidebar = document.getElementById("sidebar")
    const sidebarToggle = document.getElementById("sidebarToggle")
    const isMobile = window.innerWidth <= 768
  
    if (isMobile && sidebar.classList.contains("open")) {
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove("open")
      }
    }
  })
  