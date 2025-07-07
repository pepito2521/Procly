import { cargarLoader } from './loader.js';
import { cargarNavbarProclier } from './navbar.js';

await cargarLoader();

document.addEventListener("DOMContentLoaded", () => {
  cargarNavbarProclier();
});