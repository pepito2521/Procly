// Smooth scrolling for navigation links
document.addEventListener("DOMContentLoaded", () => {
    // Handle navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]')
  
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()
  
        const targetId = this.getAttribute("href")
        const targetSection = document.querySelector(targetId)
  
        if (targetSection) {
          const headerHeight = document.querySelector(".header").offsetHeight
          const targetPosition = targetSection.offsetTop - headerHeight
  
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }
      })
    })
  
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById("mobile-menu-btn")
    const navDesktop = document.querySelector(".nav-desktop")
  
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", () => {
        // Toggle mobile menu (you can implement this based on your needs)
        console.log("Mobile menu clicked")
      })
    }

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
  
    // Header scroll effect
    let lastScrollTop = 0
    const header = document.querySelector(".header")
  
    window.addEventListener("scroll", () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        header.style.transform = "translateY(-100%)"
      } else {
        // Scrolling up
        header.style.transform = "translateY(0)"
      }
  
      lastScrollTop = scrollTop
    })
  
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
    const observerOptions = {
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
    }, observerOptions)
  
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(".feature-card, .testimonial-card, .pricing-card, .preview-row")
  
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
  