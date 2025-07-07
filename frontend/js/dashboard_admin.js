import { cargarLoader } from './loader.js';
import { cargarNavbarAdmin } from './navbar.js';

await cargarLoader();

document.addEventListener('DOMContentLoaded', async () => {
    cargarNavbarAdmin();
});