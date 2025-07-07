export async function cargarMenuLateral() {
    const contenedor = document.getElementById('menu-lateral-container');
    if (!contenedor) return;
  
    const response = await fetch('/components/menu_lateral.html');
    const html = await response.text();
    contenedor.innerHTML = html;
  
    const sidebar = document.getElementById('sidebar');
    const btnAbrir = document.getElementById('hamburgerBtn');
    const btnCerrar = document.getElementById('closeSidebarBtn');
    const btnLogout = document.getElementById('logoutBtn');
  
    if (btnAbrir) {
      btnAbrir.addEventListener('click', () => {
        sidebar?.classList.add('open');
      });
    }
  
    if (btnCerrar) {
      btnCerrar.addEventListener('click', () => {
        sidebar?.classList.remove('open');
      });
    }
  
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Cerrar sesión');
      });
    }
  }  