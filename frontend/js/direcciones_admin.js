import { cargarLoader } from './loader.js';
import { cargarNavbar } from './navbar.js';



document.addEventListener('DOMContentLoaded', async () => {
    await cargarLoader();
    await cargarNavbar();

    document.body.classList.remove("oculto");
});