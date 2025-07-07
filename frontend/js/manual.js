import { cargarLoader } from './loader.js';
import { cargarNavbar } from './navbar.js';

await cargarLoader();

document.addEventListener("DOMContentLoaded", async () => {
  await cargarNavbar();
  cargarLoader();

  document.body.classList.remove("oculto");
});
