export async function cargarLoader() {
    try {
      const res = await fetch('/components/loader.html');
      const html = await res.text();
      document.getElementById('loader-placeholder').innerHTML = html;
    } catch (error) {
      console.error('Error al cargar el loader:', error);
    }
  
    const esperarYOcultar = () => {
      const loader = document.getElementById("loader");
      if (loader) {
        loader.classList.add("fade-out");
        setTimeout(() => {
          loader.style.display = "none";
        }, 500);
      }
    };
  
    if (document.readyState === "complete") {
      esperarYOcultar();
    } else {
      window.addEventListener("load", esperarYOcultar);
    }
  }
  