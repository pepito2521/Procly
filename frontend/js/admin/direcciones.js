import { supabase } from "../supabaseClient.js";

export async function inicializar() {
  try {
    // Obtener usuario autenticado y su empresa_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfil) {
      console.error("No se pudo obtener el perfil del usuario", perfilError);
      return;
    }

    const empresaId = perfil.empresa_id;

    // Obtener direcciones asociadas a esa empresa
    const { data: direcciones, error } = await supabase
      .from('direcciones_entrega')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error cargando direcciones:", error);
      return;
    }

    // Mostrar KPI
    document.getElementById("totalDirecciones").textContent = direcciones.length;

    // Renderizar tabla
    const tabla = document.getElementById("tablaDirecciones");
    tabla.innerHTML = ""; // limpiar

    direcciones.forEach(dir => {
      const fila = document.createElement("tr");

      // Estado visual (verde = activo, gris = inactivo)
      const estado = dir.is_active
        ? `<span class="badge badge-success">Activa</span>`
        : `<span class="badge badge-gray">Inactiva</span>`;

      fila.innerHTML = `
        <td>${dir.nombre}</td>
        <td>${dir.direccion}</td>
        <td>${dir.ciudad ?? ""}, ${dir.provincia ?? ""}</td>
        <td>${dir.codigo_postal ?? "-"}</td>
        <td>${estado}</td>
        <td>
          <button class="btn btn-sm btn-outline">Editar</button>
          <button class="btn btn-sm btn-danger">Eliminar</button>
        </td>
      `;

      tabla.appendChild(fila);
    });

  } catch (error) {
    console.error("Error en inicializar direcciones.js:", error);
  }
}
