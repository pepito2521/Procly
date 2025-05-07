document.addEventListener("DOMContentLoaded", () => {

    // INSERTAR NAVBAR EN LA PAGINA
  
    fetch("../components/navbar.html")
      .then(res => res.text())
      .then(data => {
        document.getElementById("navbar-placeholder").innerHTML = data;
      
    // RESALTAR NAVBAR-LINK ACTIVO
        const currentPage = window.location.pathname.split("/").pop();
        const links = document.querySelectorAll(".navbar-links a");
      
        links.forEach(link => {
          if (link.getAttribute("href").includes(currentPage)) {
            link.classList.add("active");
            }
          });
        });
    });