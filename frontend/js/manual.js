import { cargarLoader } from './components/loader.js';
import { cargarNavbar } from './components/navbar.js';



document.addEventListener("DOMContentLoaded", async () => {
    await cargarLoader();
    await cargarNavbar();

    document.body.classList.remove("oculto");
});
