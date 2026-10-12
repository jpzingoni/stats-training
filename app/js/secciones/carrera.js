// Pestaña Carrera: progreso, volumen, intensidad y técnica.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeFechas, ejeY, tituloFecha, estiloBarra } = Tablero.graficos;
  const { kpis, delta, escapar } = Tablero.componentes;
  const { numero, ritmo, duracion, ts, fechaCorta, fechaLarga, suma, promedio } = Tablero.formato;

  const SUBTIPOS = ["Bloques", "Series", "Libre"];

  function render(ctx) {
    const corridas = ctx.actividades.filter((a) => a.categoria === "Carrera");
    const anteriores = ctx.actividadesAnteriores?.filter((a) => a.categoria === "Carrera");
    const conBloque = corridas.filter((a) => a.bloque_principal);

    renderKpis(ctx, corridas, anteriores, conBloque);
    renderComparacion(corridas);
    renderEficiencia(ctx, corridas);
    renderKm(ctx);
    renderZonas(ctx);
    renderDinamica(ctx, corridas);
    renderTabla(corridas);
  }

  function renderKpis(ctx, corridas, anteriores, conBloque) {
    const per = ctx.etiquetaPeriodo;
    const kmAct = suma(corridas, (a) => a.distancia_m) / 1000;
    const kmAnt = anteriores ? suma(anteriores, (a) => a.distancia_m) / 1000 : null;
    const efAct = promedio(corridas, (a) => a.eficiencia);
    const efAnt = anteriores ? promedio(anteriores, (a) => a.eficiencia) : null;

    let bloque = { etiqueta: "Último bloque principal", valor: "—", unidad: "/km" };
    if (conBloque.length) {
      const ultimo = conBloque.at(-1).bloque_principal;
      const primero = conBloque[0].bloque_principal;
      const dif = ultimo.ritmo_s_km - primero.ritmo_s_km;
      bloque = {
        ...bloque,
        valor: ritmo(ultimo.ritmo_s_km),
        delta: conBloque.length > 1
          ? `${dif < 0 ? "−" : dif > 0 ? "+" : "±"}${ritmo(Math.abs(dif))} vs. el primero`
          : "",
      };
    }

    kpis("carrera-kpis", [
      { etiqueta: "Corridas", valor: numero(corridas.length), delta: delta(corridas.length, anteriores?.length, per) },
      { etiqueta: "Distancia", valor: numero(kmAct, 1), unidad: "km", delta: delta(kmAct, kmAnt, per, (x) => `${numero(x, 1)} km`) },
      bloque,
      { etiqueta: "Eficiencia media", valor: numero(efAct, 2), unidad: "m/latido", delta: delta(efAct, efAnt, per, (x) => numero(x, 2)) },
    ]);
  }

  function lineaTiempo(id, ctx, puntos, { color, etiqueta, formato, invertir = false, minimo = 2 }) {
    if (puntos.length < minimo) {
      return sinDatos(id, puntos.length ? "Hace falta más de una sesión para ver la tendencia" : "Sin datos en este período");
    }
    grafico(id, {
      type: "line",
      data: { datasets: [{ label: etiqueta, data: puntos, borderColor: color, backgroundColor: color, pointRadius: 4 }] },
      options: {
        interaction: { mode: "nearest", intersect: false },
        scales: {
          x: ejeFechas(ctx.desde, ctx.hasta),
          y: ejeY({ reverse: invertir, grace: "10%", ticks: { maxTicksLimit: 5, callback: formato } }),
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { title: tituloFecha, label: (i) => ` ${etiqueta}: ${formato(i.parsed.y)}` } },
        },
      },
    });
  }

  // ─── Comparar sesiones de una misma plantilla ──────────────────────────────

  const MAX_SESIONES = 8;   // la paleta tiene 8 colores distinguibles; más líneas no se leen
  const comp = { plantilla: null, elegidas: null, metrica: "ritmo", enlazado: false, corridas: [] };
  const METRICAS_COMP = {
    ritmo: { titulo: "Ritmo a lo largo de la sesión", valor: (b) => b.ritmo_s_km, formato: (v) => `${ritmo(v)} /km`, invertir: true, paso: 60 },
    fc: { titulo: "FC a lo largo de la sesión", valor: (b) => b.fc_media, formato: (v) => `${numero(v)} ppm`, invertir: false },
  };

  function guardarComp() {
    try {
      localStorage.setItem("carrera-comparar", JSON.stringify({ plantilla: comp.plantilla, metrica: comp.metrica }));
    } catch { /* solo esta visita */ }
  }

  function enlazarComp() {
    comp.enlazado = true;
    try {
      const g = JSON.parse(localStorage.getItem("carrera-comparar") ?? "null");
      if (g?.plantilla) comp.plantilla = g.plantilla;
      if (METRICAS_COMP[g?.metrica]) comp.metrica = g.metrica;
    } catch { /* valores por defecto */ }

    document.getElementById("carrera-plantilla").addEventListener("change", (e) => {
      comp.plantilla = e.target.value;
      comp.elegidas = null;   // al cambiar de plantilla se eligen de nuevo sus sesiones
      guardarComp();
      renderComparacion(comp.corridas);
    });
    const lista = document.getElementById("carrera-sesiones-lista");
    lista.addEventListener("change", (e) => {
      if (e.target.checked) comp.elegidas.add(e.target.value); else comp.elegidas.delete(e.target.value);
      renderComparacion(comp.corridas);
    });
    document.querySelector("#carrera-sesiones .desplegable-acciones").addEventListener("click", (e) => {
      const accion = e.target.dataset.accion;
      if (!accion) return;
      const ids = sesionesDePlantilla().map((a) => a.id);
      comp.elegidas = new Set(accion === "todas" ? ids.slice(-MAX_SESIONES) : []);
      renderComparacion(comp.corridas);
    });
    document.getElementById("carrera-metrica").addEventListener("click", (e) => {
      const b = e.target.closest("[data-metrica]");
      if (!b) return;
      comp.metrica = b.dataset.metrica;
      guardarComp();
      renderComparacion(comp.corridas);
    });
    // El desplegable se cierra al tocar afuera
    document.addEventListener("click", (e) => {
      const d = document.getElementById("carrera-sesiones");
      if (d.open && !d.contains(e.target)) d.open = false;
    });
  }

  const sesionesDePlantilla = () => comp.corridas.filter((a) => (a.plantilla ?? "Libre") === comp.plantilla);

  function renderComparacion(corridas) {
    comp.corridas = corridas;
    if (!comp.enlazado) enlazarComp();
    const c = colores();

    // Plantillas disponibles, de la más usada a la menos usada ("Libre" al final)
    const cuenta = new Map();
    for (const a of corridas) cuenta.set(a.plantilla ?? "Libre", (cuenta.get(a.plantilla ?? "Libre") ?? 0) + 1);
    const plantillas = [...cuenta.keys()].sort((x, y) =>
      (x === "Libre") - (y === "Libre") || cuenta.get(y) - cuenta.get(x) || x.localeCompare(y));
    if (!plantillas.includes(comp.plantilla)) { comp.plantilla = plantillas[0]; comp.elegidas = null; }
    document.getElementById("carrera-plantilla").innerHTML = plantillas.map((n) =>
      `<option value="${escapar(n)}"${n === comp.plantilla ? " selected" : ""}>${escapar(n)} (${cuenta.get(n)})</option>`).join("");

    // Sesiones de esa plantilla (por defecto, las más recientes hasta el máximo)
    const sesiones = sesionesDePlantilla();
    if (!comp.elegidas) comp.elegidas = new Set(sesiones.slice(-MAX_SESIONES).map((a) => a.id));
    const elegidas = sesiones.filter((a) => comp.elegidas.has(a.id));
    const colorDe = new Map(elegidas.map((a, i) => [a.id, c.serie[i]]));   // color fijo por orden cronológico
    const lleno = elegidas.length >= MAX_SESIONES;
    document.getElementById("carrera-sesiones-lista").innerHTML = [...sesiones].reverse().map((a) => {
      const marcada = comp.elegidas.has(a.id);
      const extra = a.ajuste_plantilla && a.ajuste_plantilla !== "exacta" ? ` (${a.ajuste_plantilla})` : "";
      return `<label class="check">
        <input type="checkbox" value="${escapar(a.id)}"${marcada ? " checked" : ""}${!marcada && lleno ? " disabled" : ""}>
        <span class="muestra" style="background:${marcada ? colorDe.get(a.id) : "transparent"}"></span>
        <span>${fechaLarga(a.fecha)} · ${duracion(a.duracion_s)}${escapar(extra)}</span>
      </label>`;
    }).join("");
    document.getElementById("carrera-sesiones-resumen").textContent =
      `${elegidas.length} de ${sesiones.length} ${sesiones.length === 1 ? "sesión" : "sesiones"}`;

    // Gráfico: una línea escalonada por sesión, un escalón por bloque
    const met = METRICAS_COMP[comp.metrica];
    document.getElementById("carrera-comp-titulo").textContent = met.titulo;
    for (const b of document.querySelectorAll("#carrera-metrica button")) {
      b.setAttribute("aria-pressed", String(b.dataset.metrica === comp.metrica));
    }
    document.getElementById("carrera-comp-nota").textContent =
      "Cada escalón es el promedio de un bloque (no hay datos segundo a segundo). El eje horizontal es el tiempo desde el inicio de la sesión." +
      (met.invertir ? " Más arriba = más rápido." : "") +
      (sesiones.length > MAX_SESIONES ? ` Se pueden comparar hasta ${MAX_SESIONES} sesiones a la vez.` : "");
    if (!elegidas.length) return sinDatos("g-carrera-comparar", "Elegí al menos una sesión");

    const datasets = elegidas.map((a) => {
      const bloques = a.bloques.filter((b) => (b.duracion_s ?? 0) >= 10);
      const puntos = bloques.map((b) => ({ x: (b.inicio_s ?? 0) / 60, y: met.valor(b) ?? null, b }));
      const ultimo = bloques.at(-1);
      if (ultimo) puntos.push({ x: ((ultimo.inicio_s ?? 0) + ultimo.duracion_s) / 60, y: met.valor(ultimo) ?? null, b: ultimo, fin: true });
      return {
        // "before" en Chart.js: cada tramo conserva el valor del punto donde empieza el bloque
        label: fechaLarga(a.fecha), data: puntos, stepped: "before",
        borderColor: colorDe.get(a.id), backgroundColor: colorDe.get(a.id),
        pointRadius: 0, pointHoverRadius: 5, pointHitRadius: 10, spanGaps: false,
      };
    });
    grafico("g-carrera-comparar", {
      type: "line",
      data: { datasets },
      options: {
        interaction: { mode: "nearest", intersect: false, axis: "x" },
        scales: {
          x: { type: "linear", min: 0, grid: { display: false }, border: { color: c.eje },
               title: { display: true, text: "minutos desde el inicio" }, ticks: { callback: (v) => `${v}′` } },
          y: ejeY({ reverse: met.invertir, grace: "8%", ticks: { maxTicksLimit: 10, stepSize: met.paso, callback: met.formato } }),
        },
        plugins: {
          legend: { display: datasets.length > 1, position: "top" },
          tooltip: {
            filter: (i) => !i.raw.fin && i.parsed.y != null,
            callbacks: {
              title: (items) => items.length ? `${items[0].dataset.label}` : "",
              label: (i) => {
                const b = i.raw.b;
                return ` Bloque ${b.nro}${b.fase ? ` · ${b.fase}` : ""}: ${met.formato(i.parsed.y)} · ${duracion(b.duracion_s)}`;
              },
            },
          },
        },
      },
    });
  }

  function renderEficiencia(ctx, corridas) {
    const c = colores();
    const conDato = corridas.filter((a) => a.eficiencia != null);
    if (!conDato.length) return sinDatos("g-eficiencia");
    const subtipos = SUBTIPOS.filter((s) => conDato.some((a) => a.subtipo === s));
    grafico("g-eficiencia", {
      type: "line",
      data: {
        datasets: subtipos.map((s) => ({
          label: s,
          data: conDato.filter((a) => a.subtipo === s).map((a) => ({ x: ts(a.fecha), y: a.eficiencia, a })),
          borderColor: c.subtipo[s], backgroundColor: c.subtipo[s],
          showLine: false, pointRadius: 5, pointHoverRadius: 7,
          pointBorderColor: c.superficie, pointBorderWidth: 2,
        })),
      },
      options: {
        interaction: { mode: "nearest", intersect: false },
        scales: { x: ejeFechas(ctx.desde, ctx.hasta), y: ejeY({ grace: "5%", title: { display: true, text: "m/latido" } }) },
        plugins: {
          tooltip: {
            callbacks: {
              title: tituloFecha,
              label: (i) => {
                const a = i.raw.a;
                return [` ${i.dataset.label}: ${numero(i.parsed.y, 2)} m/latido`,
                  ` ${numero(a.distancia_m / 1000, 2)} km a ${ritmo(a.ritmo_s_km)} /km, ${a.fc_media} ppm`];
              },
            },
          },
        },
      },
    });
  }

  function renderKm(ctx) {
    const c = colores();
    const semanas = ctx.semanas;
    if (!semanas.length) return sinDatos("g-km");
    const subtipos = SUBTIPOS.filter((s) => semanas.some((w) => w.por_categoria.Carrera?.distancia_m_por_subtipo?.[s]));
    grafico("g-km", {
      type: "bar",
      data: {
        labels: semanas.map((s) => fechaCorta(s.inicio)),
        datasets: subtipos.map((s) => ({
          label: s,
          data: semanas.map((w) => (w.por_categoria.Carrera?.distancia_m_por_subtipo?.[s] ?? 0) / 1000),
          ...estiloBarra(c.subtipo[s], true),
        })),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0 } },
          y: ejeY({ stacked: true, title: { display: true, text: "km" } }),
        },
        plugins: {
          tooltip: {
            filter: (i) => i.parsed.y > 0,
            callbacks: {
              title: (i) => `Semana del ${i[0].label}`,
              label: (i) => ` ${i.dataset.label}: ${numero(i.parsed.y, 1)} km`,
              footer: (items) => `Total: ${numero(items.reduce((t, i) => t + i.parsed.y, 0), 1)} km`,
            },
          },
        },
      },
    });
  }

  function renderZonas(ctx) {
    const c = colores();
    const semanas = ctx.semanas.filter((s) => s.por_categoria.Carrera);
    if (!semanas.length) return sinDatos("g-zonas");
    const limites = ctx.meta.zonas_fc_carrera;
    const nombreZona = (z) => `Z${z + 1} (${z === 0 ? "<" : `${limites[z - 1] + 1}–`}${limites[z]})`;
    const pct = semanas.map((s) => {
      const zonas = s.por_categoria.Carrera.zonas_s;
      const total = zonas.reduce((a, b) => a + b, 0) || 1;
      return zonas.map((z) => (z / total) * 100);
    });
    grafico("g-zonas", {
      type: "bar",
      data: {
        labels: semanas.map((s) => fechaCorta(s.inicio)),
        datasets: limites.map((_, z) => ({
          label: `Z${z + 1}`,
          data: pct.map((p) => p[z]),
          segundos: semanas.map((s) => s.por_categoria.Carrera.zonas_s[z]),
          ...estiloBarra(c.rampa[z], true),
          borderRadius: 0,
        })),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0 } },
          y: ejeY({ stacked: true, max: 100, ticks: { callback: (v) => `${v}%`, stepSize: 25 } }),
        },
        plugins: {
          tooltip: {
            itemSort: (a, b) => b.datasetIndex - a.datasetIndex,
            callbacks: {
              title: (i) => `Semana del ${i[0].label}`,
              label: (i) => ` ${nombreZona(i.datasetIndex)}: ${numero(i.parsed.y)}% · ${duracion(i.dataset.segundos[i.dataIndex])}`,
            },
          },
        },
      },
    });
  }

  function renderDinamica(ctx, corridas) {
    const c = colores();
    const metricas = [
      ["g-cadencia", "cadencia", "Cadencia", (v) => `${numero(v)} ppm`],
      ["g-zancada", "zancada", "Zancada", (v) => `${numero(v, 2)} m`],
      ["g-contacto", "contacto", "Contacto", (v) => `${numero(v)} ms`],
      ["g-oscilacion", "oscilacion", "Oscilación", (v) => `${numero(v, 1)} cm`],
    ];
    for (const [id, clave, etiqueta, formato] of metricas) {
      const puntos = corridas.filter((a) => a.dinamica[clave] != null).map((a) => ({ x: ts(a.fecha), y: a.dinamica[clave] }));
      lineaTiempo(id, ctx, puntos, { color: c.categoria.Carrera, etiqueta, formato });
      const g = Chart.getChart(id);
      if (g) {
        g.options.elements.point.radius = 2;
        g.options.scales.x.ticks.maxTicksLimit = 4;
        g.options.scales.y.ticks.maxTicksLimit = 4;
        g.update("none");
      }
    }
  }

  function renderTabla(corridas) {
    Tablero.sesiones.tabla("tabla-carreras", corridas, [
      { titulo: "Fecha", valor: (a) => fechaLarga(a.fecha) },
      { titulo: "Plantilla", valor: (a) => escapar(a.plantilla ?? "—") + (a.ajuste_plantilla && a.ajuste_plantilla !== "exacta" ? ` <small class="texto-sec">(${a.ajuste_plantilla})</small>` : "") },
      { titulo: "Km", num: true, valor: (a) => numero(a.distancia_m / 1000, 2) },
      { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
      { titulo: "Ritmo prom.", num: true, valor: (a) => ritmo(a.ritmo_s_km) },
      { titulo: "Ritmo entren.", num: true, valor: (a) => (a.entrenamiento?.ritmo_s_km ? ritmo(a.entrenamiento.ritmo_s_km) : "—") },
      { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
      { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
    ], { vacio: "Sin corridas en este período" });
  }

  Tablero.secciones.carrera = { render };
})();
