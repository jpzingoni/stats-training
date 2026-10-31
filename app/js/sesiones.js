// Tabla de sesiones con detalle desplegable, compartida por todas las pestañas.
// Al tocar una fila se ven todas las métricas de esa sesión, el tiempo en cada zona
// de FC y sus vueltas/bloques. Es HTML y CSS (sin Chart.js) para que sea liviano.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { escapar } = Tablero.componentes;
  const { numero, ritmo, duracion, fechaLarga } = Tablero.formato;

  const AJUSTES = { exacta: "", aproximada: " (aproximada)", incompleta: " (incompleta)" };

  /** Nombre corto de una sesión: "Carrera · 25 MIN CO", "Pádel", "Caminata"… */
  function nombreSesion(a) {
    const detalle = a.plantilla ?? a.subtipo;
    return detalle ? `${a.categoria} · ${detalle}` : a.categoria;
  }

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
    // num: alineada a la derecha con cifras tabulares · fuerte: columna protagonista (peso 600)
    const clase = (c) => {
      const cl = [c.num && "num", c.fuerte && "fuerte"].filter(Boolean).join(" ");
      return cl ? ` class="${cl}"` : "";
    };
    t.innerHTML = `
      <thead><tr><th class="col-abrir"><span class="sr-only">Detalle</span></th>${columnas.map((c) => `<th${clase(c)}>${escapar(c.titulo)}</th>`).join("")}</tr></thead>
      <tbody>${ordenadas.map((a) => `
        <tr class="fila-sesion" tabindex="0" data-id="${escapar(a.id)}" aria-expanded="false">
          <td class="col-abrir"><span class="icono-abrir" aria-hidden="true"></span></td>
          ${columnas.map((c) => `<td${clase(c)}>${c.valor(a)}</td>`).join("")}
        </tr>`).join("")}
      </tbody>`;

    const porId = new Map(sesiones.map((a) => [a.id, a]));
    const alternar = (fila) => {
      const abierta = fila.nextElementSibling?.classList.contains("detalle");
      if (abierta) { fila.nextElementSibling.remove(); fila.setAttribute("aria-expanded", "false"); return; }
      fila.setAttribute("aria-expanded", "true");
      fila.insertAdjacentHTML("afterend",
        `<tr class="detalle"><td colspan="${columnas.length + 1}">${detalle(porId.get(fila.dataset.id), { graficos: false })}</td></tr>`);
    };
    t.onclick = (e) => { const f = e.target.closest(".fila-sesion"); if (f) alternar(f); };
    t.onkeydown = (e) => {
      const f = e.target.closest(".fila-sesion");
      if (f && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); alternar(f); }
    };
  }

  // ─── Detalle de una sesión ─────────────────────────────────────────────────

  // graficos: false en las tablas de Resumen (la vista Gráficos ya muestra la evolución por minuto)
  function detalle(a, { graficos = true } = {}) {
    return `<div class="detalle-sesion">
      <div class="detalle-titulo">${escapar(nombreSesion(a))}${escapar(AJUSTES[a.ajuste_plantilla] ?? "")} ·
        ${fechaLarga(a.fecha)}${a.hora ? `, ${escapar(a.hora)} h` : ""}</div>
      ${a.plantilla === "Libre" ? '<p class="texto-sec">No coincide con ninguna plantilla del catálogo (scripts/plantillas.csv).</p>' : ""}
      ${metricas(a)}
      ${graficos && window.MINUTOS_TABLERO?.[a.id]?.fc ? `<h4>Minuto a minuto</h4>
        <div class="detalle-graficos" data-minutos="${escapar(a.id)}">
          <div><h5>FC (ppm)</h5><div class="lienzo detalle"><canvas id="g-det-${escapar(a.id)}-fc"></canvas></div></div>
          ${window.MINUTOS_TABLERO[a.id].ritmo ? `<div><h5>${usaVelocidad(a) ? "Velocidad (km/h)" : "Ritmo (/km)"}</h5>
            <div class="lienzo detalle"><canvas id="g-det-${escapar(a.id)}-ritmo"></canvas></div></div>` : ""}
        </div>` : ""}
      ${zonas(a)}
      ${vueltas(a)}
    </div>`;
  }

  // Íconos de las tarjetas (trazo 1,75 · 18 px · currentColor, DESIGN.md §4), por nombre de tarjeta
  const TRAZOS = {
    cronometro: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    ruta: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    velocimetro: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    corazon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    pulso: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.2 12h6.3l.5-1 2 4.5 2-7 1.5 3.5h5.3"/>',
    rayo: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    baja: '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    actividad: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    barras: '<path d="M3 3v18h18"/><path d="M8 17v-4M13 17V9M18 17v-7"/>',
    porcentaje: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    llama: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    montana: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    ciclo: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    pisadas: '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4M4 13h4"/>',
    suelo: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
    vertical: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
    capas: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  };
  const ICONO_DE = {
    "Tiempo en movimiento": "cronometro", "Tiempo": "cronometro", "Tiempo total": "reloj", "Distancia": "ruta",
    "Ritmo medio": "velocimetro", "Ritmo": "velocimetro", "Velocidad media": "velocimetro",
    "FC media / máx": "pulso", "FC media": "corazon", "Potencia media": "rayo", "Potencia": "rayo",
    "Recuperación FC (1 min)": "baja", "Carga": "actividad", "TRIMP": "barras", "Intensidad": "porcentaje",
    "Calorías": "llama", "Desnivel positivo": "montana", "Cadencia": "ciclo", "Zancada": "pisadas",
    "Contacto con el suelo": "suelo", "Oscilación vertical": "vertical", "Bloques": "capas",
  };
  const icono = (nombre) => (TRAZOS[ICONO_DE[nombre]]
    ? `<svg class="metrica-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TRAZOS[ICONO_DE[nombre]]}</svg>`
    : "");

  // Con plantilla, las tarjetas van en dos grupos: los bloques de Entrenamiento por un lado
  // y la sesión completa por el otro. Sin plantilla, un solo grupo con todo.
  function metricas(a) {
    const d = a.dinamica ?? {};
    const e = a.entrenamiento;
    const tarjetas = (lista) => `<dl class="metricas">${lista.filter(([, v]) => v != null && v !== "—").map(([k, v]) =>
      `<div>${icono(k)}<dt>${escapar(k)}</dt><dd>${escapar(v)}</dd></div>`).join("")}</dl>`;
    const sesion = [
      ["Tiempo en movimiento", duracion(a.duracion_s)],
      ["Tiempo total", a.tiempo_total_s != null ? duracion(a.tiempo_total_s) : null],
      ["Distancia", a.distancia_m ? `${numero(a.distancia_m / 1000, 2)} km` : null],
      usaVelocidad(a)
        ? ["Velocidad media", a.distancia_m ? `${numero(velocidadKmh(a.distancia_m, a.duracion_s), 1)} km/h` : null]
        : ["Ritmo medio", a.ritmo_s_km ? `${ritmo(a.ritmo_s_km)} /km` : null],
      ["FC media / máx", a.fc_media != null ? `${a.fc_media} / ${a.fc_max ?? "—"} ppm` : null],
      ["Potencia media", a.potencia_w != null ? `${a.potencia_w} W` : null],
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
    ];
    if (!e) return tarjetas(sesion);
    const entrenamiento = [
      ["Tiempo", duracion(e.duracion_s)],
      ["Distancia", e.distancia_m ? `${numero(e.distancia_m / 1000, 2)} km` : null],
      ["Ritmo", e.ritmo_s_km ? `${ritmo(e.ritmo_s_km)} /km` : null],
      ["FC media", e.fc_media != null ? `${e.fc_media} ppm` : null],
      ["Potencia", e.potencia_w != null ? `${e.potencia_w} W` : null],
      ["Bloques", e.bloques > 1 ? numero(e.bloques) : null],
    ];
    return `<div class="metricas-grupos">
      <section class="grupo-entrenamiento"><h4>Entrenamiento</h4>${tarjetas(entrenamiento)}</section>
      <section><h4>Sesión completa</h4>${tarjetas(sesion)}</section>
    </div>`;
  }

  function zonas(a) {
    const total = a.zonas_s.reduce((x, y) => x + y, 0);
    if (!total) return "";
    const segmentos = a.zonas_s.map((s, z) => (s ? `<span style="width:${(s / total) * 100}%;background:var(--zona-${z + 1})"
      title="Z${z + 1}: ${duracion(s)} (${numero((s / total) * 100)}%)"></span>` : "")).join("");
    const leyenda = a.zonas_s.map((s, z) => `<span><i style="background:var(--zona-${z + 1})"></i>Z${z + 1}
      <b>${duracion(s)}</b> ${numero((s / total) * 100)}%</span>`).join("");
    return `<h4>Tiempo en cada zona de FC</h4>
      <div class="zonas-barra" role="img" aria-label="Distribución del tiempo por zona de FC">${segmentos}</div>
      <div class="zonas-leyenda">${leyenda}</div>`;
  }

  function vueltas(a) {
    if (!a.bloques?.length) return "";
    const bici = usaVelocidad(a);
    const conCadencia = !bici && a.bloques.some((b) => b.cadencia != null);
    const conFase = a.bloques.some((b) => b.fase);                     // la sesión coincide con una plantilla
    const conTipo = !conFase && a.bloques.some((b) => b.tipo === "RECOVERY");   // si todo es "trabajo", sobra
    const velocidades = a.bloques.map((b) => velocidadKmh(b.distancia_m, b.duracion_s) ?? 0);
    const maxVel = Math.max(...velocidades) || 1;
    // Con plantilla se resaltan los bloques de Entrenamiento; sin plantilla, el bloque principal
    const destacado = (b) => (conFase ? b.fase === "Entrenamiento" : b.nro === a.bloque_principal?.nro);
    const filas = a.bloques.map((b, i) => `
      <tr${destacado(b) ? ' class="principal"' : ""}>
        <td>${b.nro}${!conFase && destacado(b) ? " ★" : ""}</td>
        ${conFase ? `<td>${b.fase ? `<span class="fase fase-${b.fase.toLowerCase()}">${escapar(b.fase)}</span>` : "—"}</td>` : ""}
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
        <thead><tr><th>Nro</th>${conFase ? "<th>Fase</th>" : ""}${conTipo ? "<th>Tipo</th>" : ""}<th class="num">Tiempo</th><th class="num">Distancia</th>
          <th class="num">${bici ? "km/h" : "Ritmo /km"}</th><th class="num">FC media / máx</th>
          ${conCadencia ? '<th class="num">Cadencia</th>' : ""}<th>Velocidad relativa</th></tr></thead>
        <tbody>${filas}</tbody></table></div>`;
  }

  /** Dibuja los gráficos chicos de minuto a minuto de un detalle ya insertado en la página. */
  function montarMinutos(raiz, a) {
    const m = window.MINUTOS_TABLERO?.[a.id];
    if (!m?.fc || !raiz?.querySelector(`[data-minutos]`)) return;
    const { grafico, colores, ejeY } = Tablero.graficos;
    const c = colores();
    const xs = m.fc.map((_, i) => i + (m.seg?.[i] ?? 60) / 120);
    const linea = (id, valores, formato, invertir = false) => {
      const data = valores.map((y, i) => ({ x: xs[i], y })).filter((p) => (m.seg?.[Math.floor(p.x)] ?? 60) >= 20);
      const vals = data.map((p) => p.y).filter((v) => v != null).sort((p, q) => p - q);
      const q = (f) => vals[Math.round(f * (vals.length - 1))];
      const margen = vals.length ? (q(0.97) - q(0.03)) * 0.15 || 1 : 0;
      grafico(id, {
        type: "line",
        data: { datasets: [{ data, borderColor: c.serie[0], borderWidth: 1.5, pointRadius: 0, pointHitRadius: 6, spanGaps: false }] },
        options: {
          interaction: { mode: "nearest", intersect: false, axis: "x" },
          scales: {
            x: { type: "linear", min: 0, max: Math.ceil(xs.at(-1)), grid: { display: false }, ticks: { maxTicksLimit: 6, callback: (v) => `${v}′` } },
            y: ejeY({ reverse: invertir, min: vals.length > 9 ? q(0.03) - margen : undefined, max: vals.length > 9 ? q(0.97) + margen : undefined,
                      ticks: { maxTicksLimit: 4, callback: (v, i, t) => (i === 0 || i === t.length - 1 ? "" : formato(v)) } }),
          },
          plugins: { legend: { display: false },
            tooltip: { callbacks: { title: (i) => `Minuto ${Math.floor(i[0].parsed.x) + 1}`, label: (i) => ` ${formato(i.parsed.y)}` } } },
        },
      });
    };
    linea(`g-det-${a.id}-fc`, m.fc, (v) => `${Math.round(v)} ppm`);
    if (m.ritmo) {
      if (usaVelocidad(a)) linea(`g-det-${a.id}-ritmo`, m.vel.map((v) => (v == null ? null : v * 3.6)), (v) => `${numero(v, 1)} km/h`);
      else linea(`g-det-${a.id}-ritmo`, m.ritmo, (v) => `${ritmo(v)} /km`, true);
    }
  }

  Tablero.sesiones = { tabla, detalle, montarMinutos, velocidadKmh, nombreSesion };
})();
