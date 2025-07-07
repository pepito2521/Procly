import { cargarLoader } from './loader.js';
import { cargarNavbar } from './navbar.js';

await cargarLoader();

document.addEventListener('DOMContentLoaded', async () => {
    cargarNavbar();
});