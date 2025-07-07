import { cargarLoader } from './loader.js';
import { cargarMenuLateral } from './menu_lateral.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarLoader();
    await cargarMenuLateral();

    document.body.classList.remove("oculto");
});