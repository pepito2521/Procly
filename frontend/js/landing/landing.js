// Smooth scrolling for navigation links
document.addEventListener("DOMContentLoaded", () => {
    // Handle navigation links with enhanced UX
    const navLinks = document.querySelectorAll('a[href^="#"]')
    const header = document.querySelector(".header")
    const headerHeight = header ? header.offsetHeight : 0
  
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()
  
        const targetId = this.getAttribute("href")
        const targetSection = document.querySelector(targetId)
  
        if (targetSection) {
          // Add active state to clicked link
          navLinks.forEach(l => l.classList.remove('active'))
          this.classList.add('active')
  
          const targetPosition = targetSection.offsetTop - headerHeight - 20 // Extra padding
  
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }
      })
    })

    // Intersection Observer for active navigation highlighting
    const sections = document.querySelectorAll('section[id]')
    const navItems = document.querySelectorAll('.nav-link, .mobile-nav-link')
    
    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0.1
    }
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id')
          
          // Update active state in navigation
          navItems.forEach(item => {
            item.classList.remove('active')
            if (item.getAttribute('href') === `#${currentId}`) {
              item.classList.add('active')
            }
          })
        }
      })
    }, observerOptions)
    
    sections.forEach(section => {
      sectionObserver.observe(section)
    })

    // Smooth scroll to top button
    const scrollToTopBtn = document.createElement('button')
    scrollToTopBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H128v40a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h40V80a8,8,0,0,1,16,0v40h24A8,8,0,0,1,176,128Z"></path>
      </svg>
    `
    scrollToTopBtn.className = 'scroll-to-top-btn'
    document.body.appendChild(scrollToTopBtn)

    // Show/hide scroll to top button
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scrollToTopBtn.classList.add('show')
        } else {
          scrollToTopBtn.classList.remove('show')
        }
      })
    }, { threshold: 0.1 })

    // Observe hero section for scroll to top button
    const heroSection = document.querySelector('.hero')
    if (heroSection) {
      scrollObserver.observe(heroSection)
    }

    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    })

    // Enhanced header behavior
    let lastScrollY = window.scrollY
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > 100) {
        header.classList.add('scrolled')
      } else {
        header.classList.remove('scrolled')
      }
      
      // Hide/show header on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.classList.add('header-hidden')
      } else {
        header.classList.remove('header-hidden')
      }
      
      lastScrollY = currentScrollY
    })
  
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById("mobile-menu-btn")
    const mobileMenu = document.getElementById("mobile-menu")
    const mobileMenuClose = document.getElementById("mobile-menu-close")
    const navDesktop = document.querySelector(".nav-desktop")

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.add("active")
        document.body.style.overflow = "hidden" // Prevenir scroll
      })
    }

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", () => {
        mobileMenu.classList.remove("active")
        document.body.style.overflow = "" // Restaurar scroll
      })
    }

    // Cerrar menú al hacer clic en un enlace
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")
    mobileNavLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active")
        document.body.style.overflow = ""
      })
    })

    // Cerrar menú al hacer clic fuera
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove("active")
        document.body.style.overflow = ""
      }
    })

    // BOTON: SIGN IN
    const btnSignIn = document.getElementById("btn-signin")
    if (btnSignIn) {
      btnSignIn.addEventListener("click", () => {
        console.log("Botón Sign In clicked - redirecting to app")
        window.location.href = "/app/index.html"
      })
    }

    // BOTON: SIGN UP
    const btnSignUp = document.getElementById("btn-signup")
    if (btnSignUp) {
      btnSignUp.addEventListener("click", () => {
        console.log("Botón Sign Up clicked - redirecting to signup")
        window.location.href = "/app/auth/signup.html"
      })
    }

    // BOTONES MÓVILES: SIGN IN Y SIGN UP
    const btnSignInMobile = document.getElementById("btn-signin-mobile")
    if (btnSignInMobile) {
      btnSignInMobile.addEventListener("click", () => {
        console.log("Botón Sign In móvil clicked - redirecting to app")
        window.location.href = "/app/index.html"
      })
    }

    const btnSignUpMobile = document.getElementById("btn-signup-mobile")
    if (btnSignUpMobile) {
      btnSignUpMobile.addEventListener("click", () => {
        console.log("Botón Sign Up móvil clicked - redirecting to signup")
        window.location.href = "/app/auth/signup.html"
      })
    }

    // BOTON: CREAR MI PRIMER TICKET
    const btnCrearTicket = document.querySelector('.btn-large')
    if (btnCrearTicket) {
      btnCrearTicket.addEventListener("click", () => {
        console.log("Botón Crear mi primer ticket clicked - redirecting to signup")
        window.location.href = "/app/auth/signup.html"
      })
    }

    // BOTON: SER PARTNER
    const btnSerPartner = document.querySelector('.partners .btn-large')
    if (btnSerPartner) {
      btnSerPartner.addEventListener("click", () => {
        console.log("Botón Ser Partner clicked - redirecting to contact")
        // Aquí puedes redirigir a una página de contacto para partners
        window.location.href = "mailto:partners@procly.com?subject=Interés en ser Partner"
      })
    }

    // BOTÓN: AGENDAR REUNIÓN
    const btnAgendarReunion = document.getElementById("btn-agendar-reunion");
    if (btnAgendarReunion) {
      btnAgendarReunion.addEventListener("click", () => {
        window.open("https://calendar.app.google/4pULoKgKVGCSPRTUA", "_blank");
      });
    }
  
    // Header scroll effect (using existing header variable)
    let lastScrollTop = 0
  
    // Add transition to header
    header.style.transition = "transform 0.3s ease-in-out"
  
    // Button click handlers
    const buttons = document.querySelectorAll("button")
  
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const buttonText = this.textContent.trim()
  
        // Handle different button actions
        switch (buttonText) {
          case "Comenzar Gratis":
          case "Comenzar Gratis Ahora":
            console.log("Redirecting to signup...")
            // window.location.href = '/signup';
            break
  
          case "Ver Demo":
          case "Agendar Demo":
            console.log("Opening demo modal...")
            // Open demo modal or redirect
            break
  
          case "Iniciar Sesión":
            console.log("Redirecting to login...")
            // window.location.href = '/login';
            break
  
          case "Contactar Ventas":
            console.log("Opening contact form...")
            // Open contact form or redirect
            break
  
          default:
            console.log(`Button clicked: ${buttonText}`)
        }
      })
    })
  
    // Intersection Observer for animations
    const animationObserverOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }
      })
    }, animationObserverOptions)
  
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(".feature-card, .testimonial-card, .pricing-card, .preview-row, .tail-spend-content")
  
    animatedElements.forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(20px)"
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
      observer.observe(el)
    })
  
    // Form validation (if you add forms later)
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    }
  
    // Utility function for smooth animations
    function animateValue(element, start, end, duration) {
      let startTimestamp = null
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        const value = Math.floor(progress * (end - start) + start)
        element.textContent = value
        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }
      window.requestAnimationFrame(step)
    }
  
    // Add loading states to buttons
    function addLoadingState(button) {
      const originalText = button.textContent
      button.textContent = "Cargando..."
      button.disabled = true
  
      // Simulate loading
      setTimeout(() => {
        button.textContent = originalText
        button.disabled = false
      }, 2000)
    }
  
    // Handle pricing card hover effects
    const pricingCards = document.querySelectorAll(".pricing-card")
  
    pricingCards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-5px)"
      })
  
      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
      })
    })
  
    // Add transition to pricing cards
    pricingCards.forEach((card) => {
      card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease"
    })
  
    console.log("Procly landing page loaded successfully!")
  })
  
  // Utility functions
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
  
  function toggleMobileMenu() {
    const nav = document.querySelector(".nav-desktop")
    // Implementation for mobile menu toggle
    console.log("Toggle mobile menu")
  }
  
  // Export functions if needed
  window.ProclyLanding = {
    scrollToTop,
    toggleMobileMenu,
  }
  