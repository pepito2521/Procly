import { cargarLoader } from './loader.js';
import { cargarNavbarAdmin } from './navbar.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarLoader();
    await cargarNavbarAdmin();

    document.body.classList.remove("oculto");
});