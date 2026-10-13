// Pestaña Datos: los CSV tal cual, marcando qué columnas usa el tablero.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { escapar } = Tablero.componentes;

  const estado = { tabla: "actividades", filtro: "todas", crudos: null, iniciado: false };

  function render(ctx) {
    if (!estado.iniciado) {
      estado.iniciado = true;
      estado.crudos = ctx.todo.crudos;
      estado.minutos = ctx.todo.minutos ?? {};
      estado.fechas = new Map(ctx.todo.actividades.map((a) => [a.id, a.fecha]));
      enlazar("datos-tabla", "tabla");
      enlazar("datos-filtro", "filtro");
    }
    dibujar();
  }

  function enlazar(id, clave) {
    document.getElementById(id).addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      estado[clave] = b.dataset[clave];
      dibujar();
    });
  }

  function dibujar() {
    for (const b of document.querySelectorAll("#datos-tabla button")) b.setAttribute("aria-pressed", String(b.dataset.tabla === estado.tabla));
    for (const b of document.querySelectorAll("#datos-filtro button")) b.setAttribute("aria-pressed", String(b.dataset.filtro === estado.filtro));

    const { columnas } = estado.crudos[estado.tabla];
    const filas = estado.crudos[estado.tabla].filas ?? filasMinutos(columnas);
    const enUso = columnas.filter((c) => c.en_uso).length;
    document.getElementById("datos-resumen").textContent =
      `${filas.length} filas · ${columnas.length} columnas: ${enUso} en uso y ${columnas.length - enUso} sin usar.`;

    const visibles = columnas
      .map((c, i) => ({ ...c, i }))
      .filter((c) => estado.filtro === "todas" || (estado.filtro === "en_uso") === c.en_uso);

    const marca = (c) => c.en_uso ? '<span class="marca en-uso">en uso</span>' : '<span class="marca sin-uso">sin usar</span>';

    document.getElementById("datos-catalogo").innerHTML = `
      <thead><tr><th>Columna</th><th>Estado</th><th>Dónde se usa</th></tr></thead>
      <tbody>${visibles.map((c) => `
        <tr><td><code>${escapar(c.nombre)}</code></td><td>${marca(c)}</td><td>${escapar(c.uso ?? "—")}</td></tr>`).join("")}
      </tbody>`;

    // Más recientes primero (todas las tablas tienen la fecha como texto ISO)
    const iFecha = columnas.findIndex((c) => c.nombre === "fecha");
    const ordenadas = iFecha >= 0 ? [...filas].sort((a, b) => b[iFecha].localeCompare(a[iFecha])) : filas;
    const clase = (c) => (c.en_uso ? "en-uso" : "sin-uso");

    document.getElementById("datos-crudos").innerHTML = `
      <thead><tr>${visibles.map((c) =>
        `<th class="${clase(c)}" title="${escapar(c.en_uso ? `En uso: ${c.uso}` : "Sin usar")}">${escapar(c.nombre)}</th>`).join("")}</tr></thead>
      <tbody>${ordenadas.map((f) => `<tr>${visibles.map((c) =>
        `<td class="${clase(c)}${f[c.i] === "" ? " vacia" : ""}">${escapar(f[c.i])}</td>`).join("")}</tr>`).join("")}
      </tbody>`;
  }

  /** minutos.csv no se duplica en datos.js: se arma acá a partir de minutos.js. */
  const CLAVES_MINUTOS = {
    segundos: "seg", distancia_m: "dist", ritmo_min_km: "ritmo", velocidad_ms: "vel", fc_media: "fc", fc_max: "fcmax",
    cadencia_ppm: "cad", potencia_w: "pot", altitud_m: "alt", zancada_m: "zancada", contacto_ms: "contacto", oscilacion_cm: "osc",
  };
  function filasMinutos(columnas) {
    const texto = (v) => (v == null ? "" : String(v));
    const ritmoTxt = (s) => (s == null ? "" : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`);
    const filas = [];
    for (const [id, m] of Object.entries(estado.minutos)) {
      const n = m.seg?.length ?? m.fc?.length ?? 0;
      for (let i = 0; i < n; i++) {
        if (m.seg?.[i] == null && m.fc?.[i] == null) continue;     // minuto que el reloj no grabó
        filas.push(columnas.map(({ nombre }) => {
          if (nombre === "id_actividad") return id;
          if (nombre === "fecha") return estado.fechas.get(id) ?? "";
          if (nombre === "minuto") return String(i);
          const v = m[CLAVES_MINUTOS[nombre]]?.[i];
          return nombre === "ritmo_min_km" ? ritmoTxt(v) : texto(v);
        }));
      }
    }
    return filas;
  }

  Tablero.secciones.datos = { render };
})();
