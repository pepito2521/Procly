import { cargarLoader } from './loader.js';
import { cargarNavbarProclier } from './navbar.js';

document.addEventListener("DOMContentLoaded", async () => {
  await cargarLoader();
  await cargarNavbarProclier();
  
  document.body.classList.remove("oculto");
});