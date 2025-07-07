export async function cargarLoader() {
    document.body.classList.add("oculto");
  
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

        setTimeout(() => {
          loader.classList.add("fade-out");
  
          setTimeout(() => {
            loader.style.display = "none";
            document.body.classList.remove("oculto");
          }, 500);
        }, 900);
      } else {
        document.body.classList.remove("oculto");
      }
    };
  
    if (document.readyState === "complete") {
      esperarYOcultar();
    } else {
      window.addEventListener("load", esperarYOcultar);
    }
  }
  
  