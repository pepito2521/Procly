import { cargarLoader } from './components/loader.js';
import { cargarNavbar } from './components/navbar.js';

document.addEventListener("DOMContentLoaded", async () => {
  await cargarLoader({ forzar: true });
  await cargarNavbar();

  document.body.classList.remove("oculto");

});

