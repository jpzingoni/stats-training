// Pestaña Ciclismo: volumen, velocidad, esfuerzo y detalle de cada salida.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeFechas, ejeY, tituloFecha, estiloBarra } = Tablero.graficos;
  const { numero, duracion, ts, fechaCorta, fechaLarga, suma } = Tablero.formato;
  const { velocidadKmh } = Tablero.sesiones;

  const esBici = (a) => a.categoria === "Ciclismo";

  function render(ctx) {
    const salidas = ctx.actividades.filter(esBici);
    const c = colores();

    if (!salidas.length) {
      ["g-bici-km", "g-bici-velocidad", "g-bici-fc", "g-bici-zonas"].forEach((id) =>
        sinDatos(id, "Sin salidas en bici en este período"));
    } else {
      renderKm(ctx, c);
      const linea = (id, etiqueta, valor, formato) => {
        const puntos = salidas.filter((a) => valor(a) != null).map((a) => ({ x: ts(a.fecha), y: valor(a) }));
        grafico(id, {
          type: "line",
          data: { datasets: [{ label: etiqueta, data: puntos, borderColor: c.categoria.Ciclismo, backgroundColor: c.categoria.Ciclismo, pointRadius: 4 }] },
          options: {
            interaction: { mode: "nearest", intersect: false },
            scales: { x: ejeFechas(ctx.desde, ctx.hasta), y: ejeY({ grace: "10%", ticks: { maxTicksLimit: 5, callback: formato } }) },
            plugins: { legend: { display: false }, tooltip: { callbacks: { title: tituloFecha, label: (i) => ` ${etiqueta}: ${formato(i.parsed.y)}` } } },
          },
        });
      };
      linea("g-bici-velocidad", "Velocidad media", (a) => velocidadKmh(a.distancia_m, a.duracion_s), (v) => `${numero(v, 1)} km/h`);
      linea("g-bici-fc", "FC media", (a) => a.fc_media, (v) => `${numero(v)} ppm`);
      renderZonas(salidas, c);
      renderEvolucion(ctx, salidas);
    }

    Tablero.sesiones.tabla("tabla-bici", salidas, [
      { titulo: "Fecha", valor: (a) => fechaLarga(a.fecha) },
      { titulo: "Km", num: true, valor: (a) => numero(a.distancia_m / 1000, 1) },
      { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
      { titulo: "km/h", num: true, valor: (a) => numero(velocidadKmh(a.distancia_m, a.duracion_s), 1) },
      { titulo: "Desnivel (m)", num: true, valor: (a) => a.desnivel_m ?? "—" },
      { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
      { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
    ], { vacio: "Sin salidas en bici en este período" });
  }

  function renderKm(ctx, c) {
    grafico("g-bici-km", {
      type: "bar",
      data: {
        labels: ctx.semanas.map((s) => fechaCorta(s.inicio)),
        datasets: [{ label: "Km", data: ctx.semanas.map((s) => (s.por_categoria.Ciclismo?.distancia_m ?? 0) / 1000), ...estiloBarra(c.categoria.Ciclismo) }],
      },
      options: {
        scales: { x: { grid: { display: false }, ticks: { maxRotation: 0 } }, y: ejeY({ beginAtZero: true, title: { display: true, text: "km" } }) },
        plugins: {
          legend: { display: false },
          tooltip: { filter: (i) => i.parsed.y > 0, callbacks: { title: (i) => `Semana del ${i[0].label}`, label: (i) => ` ${numero(i.parsed.y, 1)} km` } },
        },
      },
    });
  }

  function renderZonas(salidas, c) {
    const zonas = [0, 1, 2, 3, 4, 5, 6].map((z) => suma(salidas, (a) => a.zonas_s[z]) / 60);
    const total = zonas.reduce((a, b) => a + b, 0) || 1;
    grafico("g-bici-zonas", {
      type: "bar",
      data: {
        labels: zonas.map((_, z) => `Z${z + 1}`),
        datasets: [{ label: "Minutos", data: zonas, backgroundColor: c.zonas, borderRadius: { topRight: 4, bottomRight: 4 }, borderSkipped: "left", maxBarThickness: 22 }],
      },
      options: {
        indexAxis: "y",
        scales: { x: ejeY({ beginAtZero: true, title: { display: true, text: "minutos" } }), y: { grid: { display: false }, border: { display: false } } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (i) => ` ${numero(i.parsed.x)} min · ${numero((i.parsed.x / total) * 100)}% del tiempo` } },
        },
      },
    });
  }

  // ─── Evolución dentro de la salida (minuto a minuto) ──────────────────────

  const MAX_SALIDAS = 8;   // la paleta tiene 8 colores distinguibles
  const evol = { metrica: "velocidad", zonas: false, elegidas: null, enlazado: false, ctx: null, salidas: [] };
  const METRICAS = {
    velocidad: { titulo: "Velocidad a lo largo de la salida", unidad: "km/h", valor: (m, i) => (m.vel?.[i] != null ? m.vel[i] * 3.6 : null),
                 formato: (v) => `${numero(v, 1)} km/h`, eje: (v) => numero(v, 0) },
    fc: { titulo: "FC a lo largo de la salida", unidad: "ppm", valor: (m, i) => m.fc?.[i] ?? null, formato: (v) => `${numero(v)} ppm`, eje: (v) => numero(v) },
    altitud: { titulo: "Altitud a lo largo de la salida", unidad: "m", valor: (m, i) => m.alt?.[i] ?? null, formato: (v) => `${numero(v)} m`, eje: (v) => numero(v) },
  };

  function enlazarEvolucion() {
    evol.enlazado = true;
    try {
      const g = localStorage.getItem("bici-metrica"); if (METRICAS[g]) evol.metrica = g;
      evol.zonas = localStorage.getItem("bici-zonas") === "si";
    } catch { /* por defecto */ }
    document.getElementById("bici-zonas").addEventListener("click", () => {
      evol.zonas = !evol.zonas;
      try { localStorage.setItem("bici-zonas", evol.zonas ? "si" : "no"); } catch { /* solo esta visita */ }
      renderEvolucion(evol.ctx, evol.salidas);
    });
    document.getElementById("bici-metrica").addEventListener("click", (e) => {
      const b = e.target.closest("[data-metrica]");
      if (!b) return;
      evol.metrica = b.dataset.metrica;
      try { localStorage.setItem("bici-metrica", evol.metrica); } catch { /* solo esta visita */ }
      renderEvolucion(evol.ctx, evol.salidas);
    });
    document.getElementById("bici-salidas-lista").addEventListener("change", (e) => {
      if (e.target.checked) evol.elegidas.add(e.target.value); else evol.elegidas.delete(e.target.value);
      renderEvolucion(evol.ctx, evol.salidas);
    });
    document.querySelector("#bici-salidas .desplegable-acciones").addEventListener("click", (e) => {
      const accion = e.target.dataset.accion;
      if (!accion) return;
      evol.elegidas = new Set(accion === "todas" ? evol.salidas.slice(-MAX_SALIDAS).map((a) => a.id) : []);
      renderEvolucion(evol.ctx, evol.salidas);
    });
    document.addEventListener("click", (e) => {
      const d = document.getElementById("bici-salidas");
      if (d.open && !d.contains(e.target)) d.open = false;
    });
  }

  function renderEvolucion(ctx, salidas) {
    evol.ctx = ctx;
    const conMinutos = salidas.filter((a) => ctx.todo.minutos?.[a.id]);
    evol.salidas = conMinutos;
    if (!evol.enlazado) enlazarEvolucion();
    const c = colores();
    // Por defecto, las más recientes; se descartan las que ya no están
    if (!evol.elegidas) evol.elegidas = new Set(conMinutos.slice(-MAX_SALIDAS).map((a) => a.id));
    for (const id of [...evol.elegidas]) if (!conMinutos.some((a) => a.id === id)) evol.elegidas.delete(id);
    const elegidas = conMinutos.filter((a) => evol.elegidas.has(a.id));
    const colorDe = new Map(elegidas.map((a, i) => [a.id, c.serie[i]]));
    const lleno = elegidas.length >= MAX_SALIDAS;
    document.getElementById("bici-salidas-lista").innerHTML = [...conMinutos].reverse().map((a) => {
      const marcada = evol.elegidas.has(a.id);
      return `<label class="check">
        <input type="checkbox" value="${a.id}"${marcada ? " checked" : ""}${!marcada && lleno ? " disabled" : ""}>
        <span class="muestra" style="background:${marcada ? colorDe.get(a.id) : "transparent"}"></span>
        <span>${fechaLarga(a.fecha)} · ${numero((a.distancia_m ?? 0) / 1000, 1)} km</span>
      </label>`;
    }).join("");
    document.getElementById("bici-salidas-resumen").textContent =
      `${elegidas.length} de ${conMinutos.length} ${conMinutos.length === 1 ? "salida" : "salidas"}`;

    const met = METRICAS[evol.metrica];
    document.getElementById("bici-evol-titulo").textContent = met.titulo;
    for (const b of document.querySelectorAll("#bici-metrica button")) b.setAttribute("aria-pressed", String(b.dataset.metrica === evol.metrica));
    // Zonas de FC: con el botón, una franja por salida bajo el gráfico (y con una sola, el fondo)
    const limites = ctx.meta.zonas_fc_carrera ?? [];
    const zonaDe = (fc) => { const z = limites.findIndex((l) => fc <= l); return z === -1 ? limites.length - 1 : z; };
    const conZonas = evol.zonas && limites.length > 0;
    document.getElementById("bici-zonas").setAttribute("aria-pressed", String(conZonas));
    const leyenda = document.getElementById("bici-zonas-leyenda");
    leyenda.hidden = !conZonas || !elegidas.length;
    leyenda.innerHTML = limites.map((l, z) => `<span><i style="background:var(--zona-${z + 1})"></i>Z${z + 1}
      <b>${z === 0 ? `≤ ${l}` : z === limites.length - 1 ? `> ${limites[z - 1]}` : `${limites[z - 1] + 1}–${l}`}</b> ppm</span>`).join("");
    if (!elegidas.length) return sinDatos("g-bici-evolucion", conMinutos.length ? "Elegí al menos una salida" : "Sin salidas con datos por minuto");

    const datasets = elegidas.map((a) => {
      const m = ctx.todo.minutos[a.id];
      const data = [];
      for (let i = 0; i < (m.seg?.length ?? 0); i++) {
        if ((m.seg[i] ?? 0) < 20) { data.push({ x: i + 0.5, y: null }); continue; }   // minuto casi vacío o sin grabar
        data.push({ x: i + m.seg[i] / 120, y: met.valor(m, i) });
      }
      return { label: fechaLarga(a.fecha), data, borderColor: colorDe.get(a.id), backgroundColor: colorDe.get(a.id),
               borderWidth: 1.75, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 8, spanGaps: false, tension: 0 };
    });
    // Rango completo: en bici las paradas (velocidad 0) y los picos son parte de la salida.
    // La velocidad arranca en 0; FC y altitud se ajustan a sus valores con un margen.
    const rango = evol.metrica === "velocidad" ? { beginAtZero: true, grace: "5%" } : { grace: "5%" };
    const franjas = conZonas
      ? elegidas.map((a, k) => {
          const m = ctx.todo.minutos[a.id];
          return { color: colorDe.get(a.id),
                   puntos: datasets[k].data.map((p, i) => ({ x: p.x, z: m.fc?.[i] != null && p.y !== undefined && (m.seg?.[i] ?? 0) >= 20 ? zonaDe(m.fc[i]) : null })) };
        })
      : [];
    const FRANJA = 7, SEP = 3;   // alto de cada franja y separación, en px
    const espacioFranjas = franjas.length ? 4 + franjas.length * (FRANJA + SEP) : 0;
    grafico("g-bici-evolucion", {
      type: "line",
      data: { datasets },
      plugins: [Tablero.graficos.FRANJAS_ZONAS, Tablero.graficos.BANDAS_ZONAS],
      options: {
        interaction: { mode: "nearest", intersect: false, axis: "x" },
        scales: {
          x: { type: "linear", min: 0, max: Math.ceil(Math.max(...datasets.map((d) => d.data.at(-1)?.x ?? 0))),
               grid: { display: false }, title: { display: true, text: "minutos desde el inicio" },
               ticks: { padding: 3 + espacioFranjas, callback: (x) => (Number.isInteger(x) ? `${x}′` : "") },
               // Chart.js suma el padding también debajo de los números: se descuenta
               afterFit: (escala) => { escala.height -= espacioFranjas; } },
          y: ejeY({ ...rango, title: { display: true, text: met.unidad }, ticks: { maxTicksLimit: 6, callback: (y) => met.eje(y) } }),
        },
        plugins: {
          legend: { display: datasets.length > 1, position: "bottom" },
          // En FC, las zonas van de fondo (como en Pádel)
          franjasZonas: franjas.length ? { franjas, colores: c.zonas, alto: FRANJA, sep: SEP, fondo: evol.metrica !== "fc" } : null,
          bandasZonas: evol.metrica === "fc" && limites.length ? { limites, colores: c.zonas } : null,
          tooltip: {
            filter: (i) => i.parsed.y != null,
            callbacks: {
              title: (items) => (items.length ? `${items[0].dataset.label} · minuto ${Math.floor(items[0].parsed.x) + 1}` : ""),
              label: (i) => {
                const fc = ctx.todo.minutos[elegidas[i.datasetIndex]?.id]?.fc?.[i.dataIndex];
                const zona = (conZonas || evol.metrica === "fc") && fc != null ? ` · Z${zonaDe(fc) + 1}` : "";
                return ` ${met.formato(i.parsed.y)}${zona}`;
              },
            },
          },
        },
      },
    });
  }

  Tablero.secciones.ciclismo = { render };
})();
