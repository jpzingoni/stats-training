// Tabla de sesiones con detalle desplegable, compartida por todas las pestañas.
// Al tocar una fila se ven todas las métricas de esa sesión, el tiempo en cada zona
// de FC y sus vueltas/bloques. Es HTML y CSS (sin Chart.js) para que sea liviano.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { escapar } = Tablero.componentes;
  const { numero, ritmo, duracion, fechaLarga } = Tablero.formato;

  const velocidadKmh = (distancia, segundos) => (distancia && segundos ? (distancia / segundos) * 3.6 : null);
  const usaVelocidad = (a) => a.categoria === "Ciclismo";   // en bici se piensa en km/h, no en min/km

  /**
   * Dibuja la tabla.
   * columnas: [{ titulo, valor: (a) => html, num?: bool }]
   */
  function tabla(id, sesiones, columnas, { vacio = "Sin sesiones en este período" } = {}) {
    const t = document.getElementById(id);
    if (!sesiones.length) {
      t.innerHTML = `<tbody><tr><td class="vacio">${escapar(vacio)}</td></tr></tbody>`;
      t.onclick = t.onkeydown = null;
      return;
    }
    const ordenadas = [...sesiones].reverse();
    const clase = (c) => (c.num ? ' class="num"' : "");
    t.innerHTML = `
      <thead><tr>${columnas.map((c) => `<th${clase(c)}>${escapar(c.titulo)}</th>`).join("")}</tr></thead>
      <tbody>${ordenadas.map((a) => `
        <tr class="fila-sesion" tabindex="0" data-id="${escapar(a.id)}" aria-expanded="false">
          ${columnas.map((c) => `<td${clase(c)}>${c.valor(a)}</td>`).join("")}
        </tr>`).join("")}
      </tbody>`;

    const porId = new Map(sesiones.map((a) => [a.id, a]));
    const alternar = (fila) => {
      const abierta = fila.nextElementSibling?.classList.contains("detalle");
      if (abierta) { fila.nextElementSibling.remove(); fila.setAttribute("aria-expanded", "false"); return; }
      fila.setAttribute("aria-expanded", "true");
      fila.insertAdjacentHTML("afterend",
        `<tr class="detalle"><td colspan="${columnas.length}">${detalle(porId.get(fila.dataset.id))}</td></tr>`);
    };
    t.onclick = (e) => { const f = e.target.closest(".fila-sesion"); if (f) alternar(f); };
    t.onkeydown = (e) => {
      const f = e.target.closest(".fila-sesion");
      if (f && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); alternar(f); }
    };
  }

  // ─── Detalle de una sesión ─────────────────────────────────────────────────

  function detalle(a) {
    return `<div class="detalle-sesion">
      <div class="detalle-titulo">${escapar(a.categoria)}${a.subtipo ? ` · ${escapar(a.subtipo)}` : ""} ·
        ${fechaLarga(a.fecha)}${a.hora ? `, ${escapar(a.hora)} h` : ""}</div>
      ${metricas(a)}
      ${zonas(a)}
      ${vueltas(a)}
    </div>`;
  }

  function metricas(a) {
    const d = a.dinamica ?? {};
    const lista = [
      ["Tiempo en movimiento", duracion(a.duracion_s)],
      ["Tiempo total", a.tiempo_total_s != null ? duracion(a.tiempo_total_s) : null],
      ["Distancia", a.distancia_m ? `${numero(a.distancia_m / 1000, 2)} km` : null],
      usaVelocidad(a)
        ? ["Velocidad media", a.distancia_m ? `${numero(velocidadKmh(a.distancia_m, a.duracion_s), 1)} km/h` : null]
        : ["Ritmo medio", a.ritmo_s_km ? `${ritmo(a.ritmo_s_km)} /km` : null],
      ["Bloque principal", a.bloque_principal ? `${ritmo(a.bloque_principal.ritmo_s_km)} /km · ${a.bloque_principal.fc_media} ppm` : null],
      ["FC media / máx", a.fc_media != null ? `${a.fc_media} / ${a.fc_max ?? "—"} ppm` : null],
      ["Recuperación FC (1 min)", a.recuperacion_fc != null ? `−${a.recuperacion_fc} ppm` : null],
      ["Carga", a.carga != null ? `${a.carga} HRSS` : null],
      ["TRIMP", a.trimp != null ? numero(a.trimp, 1) : null],
      ["Intensidad", a.intensidad_pct != null ? `${numero(a.intensidad_pct)} %` : null],
      ["Calorías", a.calorias != null ? `${numero(a.calorias)} kcal` : null],
      ["Desnivel positivo", a.desnivel_m != null ? `${numero(a.desnivel_m)} m` : null],
      ["Cadencia", d.cadencia != null ? `${d.cadencia} ppm` : null],
      ["Zancada", d.zancada != null ? `${numero(d.zancada, 2)} m` : null],
      ["Contacto con el suelo", d.contacto != null ? `${d.contacto} ms` : null],
      ["Oscilación vertical", d.oscilacion != null ? `${numero(d.oscilacion, 1)} cm` : null],
    ].filter(([, v]) => v != null && v !== "—");
    return `<dl class="metricas">${lista.map(([k, v]) =>
      `<div><dt>${escapar(k)}</dt><dd>${escapar(v)}</dd></div>`).join("")}</dl>`;
  }

  function zonas(a) {
    const total = a.zonas_s.reduce((x, y) => x + y, 0);
    if (!total) return "";
    const segmentos = a.zonas_s.map((s, z) => (s ? `<span style="width:${(s / total) * 100}%;background:var(--rampa-${z + 1})"
      title="Z${z + 1}: ${duracion(s)} (${numero((s / total) * 100)}%)"></span>` : "")).join("");
    const leyenda = a.zonas_s.map((s, z) => `<span><i style="background:var(--rampa-${z + 1})"></i>Z${z + 1}
      <b>${duracion(s)}</b> ${numero((s / total) * 100)}%</span>`).join("");
    return `<h4>Tiempo en cada zona de FC</h4>
      <div class="zonas-barra" role="img" aria-label="Distribución del tiempo por zona de FC">${segmentos}</div>
      <div class="zonas-leyenda">${leyenda}</div>`;
  }

  function vueltas(a) {
    if (!a.bloques?.length) return "";
    const bici = usaVelocidad(a);
    const conCadencia = !bici && a.bloques.some((b) => b.cadencia != null);
    const conTipo = a.bloques.some((b) => b.tipo === "RECOVERY");   // si todo es "trabajo", la columna sobra
    const velocidades = a.bloques.map((b) => velocidadKmh(b.distancia_m, b.duracion_s) ?? 0);
    const maxVel = Math.max(...velocidades) || 1;
    const principal = a.bloque_principal?.nro;
    const filas = a.bloques.map((b, i) => `
      <tr${b.nro === principal ? ' class="principal"' : ""}>
        <td>${b.nro}${b.nro === principal ? " ★" : ""}</td>
        ${conTipo ? `<td>${b.tipo === "RECOVERY" ? "Recuperación" : "Trabajo"}</td>` : ""}
        <td class="num">${duracion(b.duracion_s)}</td>
        <td class="num">${b.distancia_m ? `${numero(b.distancia_m)} m` : "—"}</td>
        <td class="num">${bici ? numero(velocidadKmh(b.distancia_m, b.duracion_s), 1) : ritmo(b.ritmo_s_km)}</td>
        <td class="num">${b.fc_media ?? "—"} / ${b.fc_max ?? "—"}</td>
        ${conCadencia ? `<td class="num">${b.cadencia ?? "—"}</td>` : ""}
        <td class="col-barra"><span class="barra-vel" style="width:${(velocidades[i] / maxVel) * 100}%"></span></td>
      </tr>`).join("");
    return `<h4>${a.categoria === "Carrera" ? "Bloques" : "Vueltas"} (${a.bloques.length})</h4>
      <div class="tabla-contenedor"><table class="tabla sub">
        <thead><tr><th>Nro</th>${conTipo ? "<th>Tipo</th>" : ""}<th class="num">Tiempo</th><th class="num">Distancia</th>
          <th class="num">${bici ? "km/h" : "Ritmo /km"}</th><th class="num">FC media / máx</th>
          ${conCadencia ? '<th class="num">Cadencia</th>' : ""}<th>Velocidad relativa</th></tr></thead>
        <tbody>${filas}</tbody></table></div>`;
  }

  Tablero.sesiones = { tabla, detalle, velocidadKmh };
})();
