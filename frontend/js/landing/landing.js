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
  
    // SECTION-BASED TRANSITIONS
    const sectionTransitionOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }

    const sectionTransitionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add entrance animation class
          entry.target.classList.add('section-visible')
          
          // Animate child elements with staggered delay
          const animatedChildren = entry.target.querySelectorAll('.animate-on-scroll')
          animatedChildren.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('element-visible')
            }, index * 150) // Staggered animation
          })
        }
      })
    }, sectionTransitionOptions)

    // Observe all sections for transitions
    const allSections = document.querySelectorAll('section')
    allSections.forEach(section => {
      section.classList.add('section-transition')
      sectionTransitionObserver.observe(section)
    })

    // Enhanced element animations
    const animationObserverOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('element-visible')
        }
      })
    }, animationObserverOptions)
  
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(".feature-card, .testimonial-card, .pricing-card, .preview-row, .tail-spend-content, .step-card, .partner-category, #perfil-usuario .preview-row")
  
    animatedElements.forEach((el) => {
      el.classList.add('animate-on-scroll')
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
    if (pricingCards && typeof pricingCards.forEach === 'function') {
      pricingCards.forEach((card) => {
        card.addEventListener("mouseenter", function () {
          this.style.transform = "translateY(-5px)"
        })
        card.addEventListener("mouseleave", function () {
          this.style.transform = "translateY(0)"
        })
      })
      pricingCards.forEach((card) => {
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease"
      })
    }

    // HOW IT WORKS ANIMATED STEPS
    (function() {
      const steps = document.querySelectorAll('.how-step');
      const contents = document.querySelectorAll('.how-content');
      const cta = document.querySelector('.how-it-works-cta');
      if (!steps.length || !contents.length) return;

      let lastScrollY = window.scrollY;
      let currentStep = 0;

      function activateStep(idx, scrollDirection = 'down') {
        // Si es el mismo step, no hacer nada
        if (idx === currentStep) return;
        
        // Obtener el step actual y el nuevo
        const currentContent = contents[currentStep];
        const newContent = contents[idx];
        const currentInner = currentContent?.querySelector('.how-content-inner');
        const newInner = newContent?.querySelector('.how-content-inner');
        
        if (currentInner && newInner) {
          // 1. El contenido actual se desliza hacia abajo y desaparece
          currentInner.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
          currentInner.style.transform = 'translateY(40px)';
          currentInner.style.opacity = '0';
          
          // 2. Después de que desaparece, cambiar el step activo
          setTimeout(() => {
            steps.forEach((s, i) => s.classList.toggle('active', i === idx));
            contents.forEach((c, i) => c.classList.toggle('active', i === idx));
            if (cta) cta.style.display = 'flex';
            
            // 3. Preparar el nuevo contenido para que aparezca desde abajo
            newInner.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            newInner.style.transform = 'translateY(40px)';
            newInner.style.opacity = '0';
            
            // 4. Forzar un reflow para que la transición funcione
            newInner.offsetHeight;
            
            // 5. Animar la entrada del nuevo contenido
            setTimeout(() => {
              newInner.style.transform = 'translateY(0)';
              newInner.style.opacity = '1';
            }, 50);
            
            // 6. Resetear el contenido anterior
            setTimeout(() => {
              if (currentInner) {
                currentInner.style.transition = '';
                currentInner.style.transform = '';
                currentInner.style.opacity = '';
              }
            }, 400);
            
          }, 400);
        } else {
          // Fallback si no hay elementos internos
          steps.forEach((s, i) => s.classList.toggle('active', i === idx));
          contents.forEach((c, i) => c.classList.toggle('active', i === idx));
          if (cta) cta.style.display = 'flex';
        }
        
        currentStep = idx;
      }

      steps.forEach((step, idx) => {
        step.addEventListener('click', () => activateStep(idx));
      });

      const section = document.getElementById('how-it-works');
      if (!section) return;
      
      window.addEventListener('scroll', () => {
        const sectionRect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const scrollY = window.scrollY;
        
        if (window.innerWidth <= 900) return;
        
        const rel = (scrollY + windowHeight/2 - sectionTop) / sectionHeight;
        let idx = 0;
        if (rel > 2/3) idx = 2;
        else if (rel > 1/3) idx = 1;
        
        // Determinar dirección del scroll
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        
        if (idx !== currentStep) {
          activateStep(idx, scrollDirection);
        }
        
        lastScrollY = scrollY;
      });
    })();

    // BOTON: CREAR MI PRIMER TICKET (HOW IT WORKS)
    const btnCrearTicketHowItWorks = document.querySelector('.how-it-works-cta .btn-hero-primary');
    if (btnCrearTicketHowItWorks) {
      btnCrearTicketHowItWorks.addEventListener('click', () => {
        console.log("Botón Crear mi primer ticket (how-it-works) clicked - redirecting to signup");
        window.location.href = "https://www.procly.net/app/auth/signup.html";
      });
    }
  
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
  