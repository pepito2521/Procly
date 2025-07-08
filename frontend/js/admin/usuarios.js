import { supabase } from "/js/supabaseClient.js";

export async function inicializar() {
  try {
    // Obtener usuario autenticado y su empresa_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil, error: errorPerfil } = await supabase
      .from("profiles")
      .select("empresa_id")
      .eq("id", user.id)
      .single();

    if (errorPerfil || !perfil) {
      console.error("No se pudo obtener el perfil del usuario", errorPerfil);
      return;
    }

    const empresaId = perfil.empresa_id;

    // Obtener todos los usuarios de la empresa
    const { data: usuarios, error } = await supabase
      .from("profiles")
      .select("profile_id, nombre, apellido, email, limite, is_active")
      .eq("empresa_id", empresaId);

    if (error) {
      console.error("Error cargando usuarios:", error);
      return;
    }

    // Obtener tickets para calcular gasto mensual por usuario
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data: tickets, error: errorTickets } = await supabase
      .from("tickets")
      .select("user_id, precio_seleccionado")
      .eq("empresa_id", empresaId)
      .gte("created_at", firstDay)
      .lte("created_at", lastDay);

    if (errorTickets) {
      console.error("Error cargando tickets:", errorTickets);
      return;
    }

    // Calcular métricas
    const gastoPorUsuario = {};
    tickets.forEach(t => {
      if (!gastoPorUsuario[t.user_id]) gastoPorUsuario[t.user_id] = 0;
      gastoPorUsuario[t.user_id] += t.precio_seleccionado || 0;
    });

    // Renderizar resumen
    document.querySelector(".summary-value:nth-child(1)").textContent = usuarios.length;
    const activos = usuarios.filter(u => u.is_active).length;
    document.querySelector(".summary-value:nth-child(2)").textContent = activos;
    const totalGasto = Object.values(gastoPorUsuario).reduce((a, b) => a + b, 0);
    const promedioGasto = usuarios.length > 0 ? totalGasto / usuarios.length : 0;
    document.querySelector(".summary-value:nth-child(3)").textContent = `$${promedioGasto.toLocaleString()}`;

    // Renderizar tabla
    const tabla = document.getElementById("tablaUsuarios");
    tabla.innerHTML = "";

    usuarios.forEach((u, i) => {
      const gasto = gastoPorUsuario[u.profile_id] || 0;
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${i + 1}</td>
        <td>${u.nombre ?? ""} ${u.apellido ?? ""}</td>
        <td>$${gasto.toLocaleString()}</td>
        <td>${u.limite ? "Sí" : "-"}</td>
        <td><span class="badge ${u.is_active ? "badge-success" : "badge-gray"}">${u.is_active ? "Activo" : "Inactivo"}</span></td>
        <td>
          <button class="btn btn-sm btn-outline">Limitar</button>
          <button class="btn btn-sm btn-danger">Bloquear</button>
        </td>
      `;
      tabla.appendChild(fila);
    });

    // Filtro de búsqueda
    document.getElementById("buscadorUsuarios").addEventListener("input", (e) => {
      const filtro = e.target.value.toLowerCase();
      const filas = tabla.querySelectorAll("tr");
      filas.forEach(fila => {
        const texto = fila.children[1].textContent.toLowerCase();
        fila.style.display = texto.includes(filtro) ? "" : "none";
      });
    });
  } catch (err) {
    console.error("Error en inicializar usuarios.js:", err);
  }
}
