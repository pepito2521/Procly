import { cargarLoader } from './components/loader.js';
import { cargarNavbarProclier } from './components/navbar.js';

document.addEventListener("DOMContentLoaded", async () => {
  await cargarLoader();
  await cargarNavbarProclier();

  document.body.classList.remove("oculto");
});