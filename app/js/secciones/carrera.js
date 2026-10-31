// Pestaña Carrera: tabla de sesiones de una plantilla y su curva a lo largo de la sesión.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeY } = Tablero.graficos;
  const { escapar } = Tablero.componentes;
  const { numero, ritmo, duracion, fechaLarga, suma } = Tablero.formato;

  function render(ctx) {
    const corridas = ctx.actividades.filter((a) => a.categoria === "Carrera");

    renderComparacion(corridas, ctx.meta, ctx.todo.minutos ?? {});
  }

  // ─── Comparar sesiones de una misma plantilla ──────────────────────────────

  const MAX_SESIONES = 8;   // la paleta tiene 8 colores distinguibles; más líneas no se leen
  const comp = { plantillas: null, elegidas: null, metrica: "ritmo", etapa: "todas", zonas: false, enlazado: false, corridas: [], minutos: {} };
  // Cada métrica: su columna en minutos.js, su valor por bloque (si no hay minutos) y su formato
  const METRICAS_COMP = {
    ritmo: { nombre: "Ritmo", clave: "ritmo", valor: (b) => b.ritmo_s_km, formato: (v) => `${ritmo(v)} /km`, invertir: true },
    fc: { nombre: "FC", clave: "fc", valor: (b) => b.fc_media, formato: (v) => `${numero(v)} ppm` },
    potencia: { nombre: "Potencia", clave: "pot", valor: (b) => b.potencia_w, formato: (v) => `${numero(v)} W` },
    cadencia: { nombre: "Cadencia", clave: "cad", valor: (b) => b.cadencia, formato: (v) => `${numero(v)} ppm` },
    zancada: { nombre: "Zancada", clave: "zancada", valor: () => null, formato: (v) => `${numero(v, 2)} m` },
  };

  function guardarComp() {
    try {
      localStorage.setItem("carrera-comparar", JSON.stringify({ plantillas: [...comp.plantillas], metrica: comp.metrica, etapa: comp.etapa, zonas: comp.zonas }));
    } catch { /* solo esta visita */ }
  }

  function enlazarComp() {
    comp.enlazado = true;
    try {
      const g = JSON.parse(localStorage.getItem("carrera-comparar") ?? "null");
      if (Array.isArray(g?.plantillas)) comp.plantillas = new Set(g.plantillas);
      else if (g?.plantilla) comp.plantillas = new Set([g.plantilla]);   // formato anterior (una sola)
      if (METRICAS_COMP[g?.metrica]) comp.metrica = g.metrica;
      if (g?.etapa) comp.etapa = g.etapa;
      comp.zonas = g?.zonas === true;
    } catch { /* valores por defecto */ }

    // Al cambiar las plantillas se eligen de nuevo las sesiones (las más recientes)
    const alCambiarPlantillas = () => { comp.elegidas = null; guardarComp(); renderComparacion(comp.corridas); };
    document.getElementById("carrera-plantillas-lista").addEventListener("change", (e) => {
      if (e.target.checked) comp.plantillas.add(e.target.value); else comp.plantillas.delete(e.target.value);
      alCambiarPlantillas();
    });
    document.querySelector("#carrera-plantillas .desplegable-acciones").addEventListener("click", (e) => {
      const accion = e.target.dataset.accion;
      if (!accion) return;
      comp.plantillas = new Set(accion === "todas" ? [...document.querySelectorAll("#carrera-plantillas-lista input")].map((i) => i.value) : []);
      alCambiarPlantillas();
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
    document.getElementById("carrera-etapa").addEventListener("change", (e) => {
      comp.etapa = e.target.value;
      guardarComp();
      renderComparacion(comp.corridas);
    });
    document.getElementById("carrera-metrica").addEventListener("click", (e) => {
      const b = e.target.closest("[data-metrica]");
      if (!b) return;
      comp.metrica = b.dataset.metrica;
      guardarComp();
      renderComparacion(comp.corridas);
    });
    document.getElementById("carrera-zonas").addEventListener("click", () => {
      comp.zonas = !comp.zonas;
      guardarComp();
      renderComparacion(comp.corridas);
    });
    // Los desplegables se cierran al tocar afuera
    document.addEventListener("click", (e) => {
      for (const id of ["carrera-sesiones", "carrera-plantillas"]) {
        const d = document.getElementById(id);
        if (d.open && !d.contains(e.target)) d.open = false;
      }
    });
  }

  const sesionesDePlantilla = () => comp.corridas.filter((a) => comp.plantillas.has(a.plantilla ?? "Libre"));
  const ORDEN_FASES = ["Calentamiento", "Entrenamiento", "Relajado", "Restaurar"];
  /** Nombres de las plantillas elegidas, para los textos ("25 MIN CO", "25 MIN CO y 28 MIN CO", "3 plantillas"). */
  const nombrePlantillas = () => {
    const n = [...comp.plantillas];
    return n.length <= 2 ? n.join(" y ") : `${n.length} plantillas`;
  };

  function renderComparacion(corridas, meta = comp.meta, minutos = comp.minutos) {
    comp.corridas = corridas;
    comp.meta = meta;
    comp.minutos = minutos;
    if (!comp.enlazado) enlazarComp();
    const c = colores();

    // Plantillas disponibles, de la más usada a la menos usada ("Libre" al final)
    const cuenta = new Map();
    for (const a of corridas) cuenta.set(a.plantilla ?? "Libre", (cuenta.get(a.plantilla ?? "Libre") ?? 0) + 1);
    const plantillas = [...cuenta.keys()].sort((x, y) =>
      (x === "Libre") - (y === "Libre") || cuenta.get(y) - cuenta.get(x) || x.localeCompare(y));
    // Por defecto, la más usada; se descartan las que ya no existen
    if (!comp.plantillas) comp.plantillas = new Set([plantillas[0]]);
    for (const n of [...comp.plantillas]) if (!plantillas.includes(n)) comp.plantillas.delete(n);
    document.getElementById("carrera-plantillas-lista").innerHTML = plantillas.map((n) => `
      <label class="check"><input type="checkbox" value="${escapar(n)}"${comp.plantillas.has(n) ? " checked" : ""}>
        <span>${escapar(n)} (${cuenta.get(n)})</span></label>`).join("");
    document.getElementById("carrera-plantillas-resumen").textContent =
      comp.plantillas.size === 0 ? "Ninguna" : comp.plantillas.size === 1 ? [...comp.plantillas][0]
        : comp.plantillas.size === plantillas.length ? "Todas" : `${comp.plantillas.size} plantillas`;

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

    // Gráfico: la curva minuto a minuto de cada sesión
    const met = METRICAS_COMP[comp.metrica];
    document.getElementById("carrera-comp-titulo").textContent = `${met.nombre} a lo largo de la sesión`;
    for (const b of document.querySelectorAll("#carrera-metrica button")) {
      b.setAttribute("aria-pressed", String(b.dataset.metrica === comp.metrica));
    }
    // Etapas: las fases que tiene la plantilla, en orden ("Libre" no tiene fases)
    // Fases de las plantillas elegidas ("Libre" no tiene), en el orden natural de una sesión
    const fasesElegidas = new Set([...comp.plantillas].flatMap((n) => (comp.meta?.plantillas?.[n] ?? []).map((p) => p.fase)));
    const fases = ORDEN_FASES.filter((f) => fasesElegidas.has(f));
    if (comp.etapa !== "todas" && !fases.includes(comp.etapa)) comp.etapa = "todas";
    const selEtapa = document.getElementById("carrera-etapa");
    selEtapa.disabled = !fases.length;
    selEtapa.innerHTML = `<option value="todas">${fases.length ? "Toda la sesión" : "Toda la sesión (sin etapas)"}</option>` +
      fases.map((f) => `<option value="${escapar(f)}"${f === comp.etapa ? " selected" : ""}>${escapar(f)}</option>`).join("");
    renderTabla(elegidas, colorDe);

    // Con plantilla, el eje X sigue los bloques de la plantilla: todas las sesiones comparten
    // los mismos tramos y lo que cambia es la altura de cada escalón. Sin plantilla ("Libre"),
    // el eje es el tiempo real desde el inicio de cada sesión.
    // La alineación por bloques solo es posible con una única plantilla elegida
    const pasos = comp.plantillas.size === 1 ? comp.meta?.plantillas?.[[...comp.plantillas][0]] : null;
    const eje = pasos ? ejePlantilla(pasos, sesiones) : null;
    // Zonas de FC: con el botón, una franja por sesión bajo el gráfico
    const limites = comp.meta?.zonas_fc_carrera ?? [];
    const zonaDe = (fc) => { const z = limites.findIndex((l) => fc <= l); return z === -1 ? limites.length - 1 : z; };
    const conZonas = comp.zonas && limites.length > 0;
    document.getElementById("carrera-zonas").setAttribute("aria-pressed", String(conZonas));
    const leyenda = document.getElementById("carrera-zonas-leyenda");
    leyenda.hidden = !conZonas || !elegidas.length;
    leyenda.innerHTML = limites.map((l, z) => `<span><i style="background:var(--zona-${z + 1})"></i>Z${z + 1}
      <b>${z === 0 ? `≤ ${l}` : z === limites.length - 1 ? `> ${limites[z - 1]}` : `${limites[z - 1] + 1}–${l}`}</b> ppm</span>`).join("");
    if (!elegidas.length) return sinDatos("g-carrera-comparar", "Elegí al menos una sesión");
    const franjas = conZonas
      ? elegidas.map((a) => ({ color: colorDe.get(a.id),
          puntos: puntosSesion(a, METRICAS_COMP.fc, eje).map((p) => ({ x: p.x, z: p.y == null ? null : zonaDe(p.y) })) }))
      : [];
    const FRANJA = 7, SEP = 3;   // alto de cada franja y separación, en px
    const espacioFranjas = franjas.length ? 4 + franjas.length * (FRANJA + SEP) : 0;

    const datasets = elegidas.map((a) => ({
      label: fechaLarga(a.fecha), data: puntosSesion(a, met, eje),
      borderColor: colorDe.get(a.id), backgroundColor: colorDe.get(a.id),
      borderWidth: 1.75, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 8, spanGaps: false,
    }));
    if (!datasets.some((d) => d.data.some((pt) => pt.y != null))) {
      return sinDatos("g-carrera-comparar", `Sin datos de ${met.nombre.toLowerCase()} para estas sesiones`);
    }
    const rango = rangoRobusto(datasets.flatMap((d) => d.data.map((pt) => pt.y)));
    const promedios = lineasPromedio(elegidas, datasets, met, eje, colorDe);
    grafico("g-carrera-comparar", {
      type: "line",
      data: { datasets },
      plugins: [LINEAS_BLOQUES, Tablero.graficos.FRANJAS_ZONAS, Tablero.graficos.BANDAS_ZONAS, LINEAS_PROMEDIO],
      options: {
        interaction: { mode: "nearest", intersect: false, axis: "x" },
        elements: { line: { tension: 0 } },
        layout: { padding: { top: eje ? 16 : 0 } },
        scales: {
          x: { type: "linear", min: 0, max: eje ? eje.total / 60 : undefined, grid: { display: false }, border: { color: c.eje },
               title: { display: true, text: eje ? `minutos según la plantilla ${nombrePlantillas()}` : "minutos desde el inicio" },
               // Con zonas, el espacio entre el eje y los números aloja las franjas
               ticks: { padding: 3 + espacioFranjas, callback: (v) => (Number.isInteger(v) ? `${v}′` : "") },   // sin el último valor con decimales
               // Chart.js suma el padding también debajo de los números: se descuenta
               afterFit: (escala) => { escala.height -= espacioFranjas; } },
          // Rango del 3 % al 97 % de los valores: un minuto con pausa no aplasta toda la curva
          y: ejeY({ reverse: met.invertir, min: rango?.min, max: rango?.max,
                    ticks: { maxTicksLimit: 8, callback: (v, i, t) => (rango && (i === 0 || i === t.length - 1) ? "" : met.formato(v)) } }),
        },
        plugins: {
          // Con plantilla, la leyenda va abajo: arriba están los nombres de las fases
          legend: { display: datasets.length > 1, position: eje ? "bottom" : "top" },
          lineasPromedio: { lineas: promedios, rotulos: elegidas.length === 1, fondo: c.superficie },
          franjasZonas: franjas.length ? { franjas, colores: c.zonas, alto: FRANJA, sep: SEP, fondo: comp.metrica !== "fc" } : null,
          // En FC, las zonas siempre van de fondo (como en Pádel)
          bandasZonas: comp.metrica === "fc" && limites.length ? { limites, colores: c.zonas } : null,
          lineasBloques: eje ? { limites: eje.inicios.slice(1).map((v) => v / 60), tramos: eje.tramos, linea: c.muted, texto: c.textoSec } : null,
          tooltip: {
            filter: (i) => i.parsed.y != null,
            callbacks: {
              title: (items) => items.length ? `${items[0].dataset.label}` : "",
              label: (i) => {
                const pt = i.raw;
                const donde = pt.b ? `bloque ${pt.b.nro}${pt.b.fase ? ` · ${pt.b.fase}` : ""}` : "";
                const fc = comp.minutos[elegidas[i.datasetIndex]?.id]?.fc?.[pt.minuto];
                const zona = (conZonas || comp.metrica === "fc") && fc != null ? ` · Z${zonaDe(fc) + 1}` : "";
                return ` Min ${pt.minuto + 1}${donde ? ` (${donde})` : ""}: ${met.formato(i.parsed.y)}${zona}`;
              },
            },
          },
        },
      },
    });
  }

  /**
   * Puntos minuto a minuto de una sesión. Con plantilla, cada minuto se ubica en el tramo de
   * su bloque según la parte del bloque transcurrida (el bloque se estira o se comprime al
   * ancho de la plantilla). Un null corta la línea donde se saltean minutos (otra etapa).
   * Si la sesión no tiene minutos, cae a un escalón por bloque.
   */
  function puntosSesion(a, met, eje) {
    const m = comp.minutos[a.id];
    const serie = m?.[met.clave];
    const conFase = a.bloques.filter((b) => b.fase);
    const indiceFase = new Map(conFase.map((b, k) => [b.nro, k]));
    const porNro = new Map(a.bloques.map((b) => [b.nro, b]));
    if (!serie) {
      // Sin minutos: un escalón por bloque (como antes)
      const bloques = eje ? conFase : a.bloques.filter((b) => (b.duracion_s ?? 0) >= 10);
      return bloques.flatMap((b, k) => {
        if (comp.etapa !== "todas" && b.fase !== comp.etapa) return [];
        const x0 = eje ? eje.inicios[k] : b.inicio_s ?? 0, ancho = eje ? eje.anchos[k] : b.duracion_s;
        return [{ x: x0 / 60, y: met.valor(b) ?? null, b, minuto: 0 }, { x: (x0 + ancho) / 60, y: met.valor(b) ?? null, b, minuto: 0 },
          { x: (x0 + ancho) / 60, y: null }];
      });
    }
    const puntos = [];
    let anterior = null;
    serie.forEach((valor, i) => {
      if ((m.seg?.[i] ?? 60) < 20) return;                  // último minuto casi vacío
      const b = porNro.get(m.bloque?.[i]);
      if (comp.etapa !== "todas" && b?.fase !== comp.etapa) return;
      const medio = i * 60 + (m.seg?.[i] ?? 60) / 2;
      let x = medio / 60;
      if (eje) {
        const k = indiceFase.get(b?.nro);
        if (k === undefined) return;                         // corte de 1 s sin fase
        const frac = Math.min(Math.max((medio - b.inicio_s) / b.duracion_s, 0), 1);
        x = (eje.inicios[k] + frac * eje.anchos[k]) / 60;
      }
      if (anterior !== null && i !== anterior + 1) puntos.push({ x, y: null });
      puntos.push({ x, y: valor, b, minuto: i });
      anterior = i;
    });
    return puntos;
  }

  /** Mínimo y máximo del eje: percentiles 3 y 97 con un margen (si hay suficientes valores). */
  function rangoRobusto(valores) {
    const v = valores.filter((x) => x != null).sort((a, b) => a - b);
    if (v.length < 10) return null;
    const p = (q) => v[Math.min(v.length - 1, Math.max(0, Math.round(q * (v.length - 1))))];
    const bajo = p(0.03), alto = p(0.97);
    const margen = (alto - bajo) * 0.12 || Math.abs(alto) * 0.05 || 1;
    return { min: bajo - margen, max: alto + margen };
  }

  // ─── Deriva cardíaca y eficiencia entre sesiones ───────────────────────────

  /** Promedio de una columna de los bloques, ponderado por la duración de cada uno. */
  function ponderado(bloques, clave) {
    const con = bloques.filter((b) => b[clave] != null);
    return con.length ? suma(con, (b) => b[clave] * b.duracion_s) / suma(con, (b) => b.duracion_s) : null;
  }

  /** Plugin: línea horizontal de referencia (p. ej., 5 % de deriva). */
  const LINEA_REFERENCIA = {
    id: "lineaReferencia",
    afterDatasetsDraw(chart) {
      const op = chart.options.plugins.lineaReferencia;
      if (!op) return;
      const { ctx, chartArea: area, scales: { y } } = chart;
      const py = Math.round(y.getPixelForValue(op.valor)) + 0.5;
      if (py < area.top || py > area.bottom) return;
      ctx.save();
      ctx.strokeStyle = op.color; ctx.setLineDash([5, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(area.left, py); ctx.lineTo(area.right, py); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = op.color; ctx.font = Tablero.graficos.tipografia().chico.canvas;
      ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(op.texto, area.right - 2, py - 2);
      ctx.restore();
    },
  };

  /** Bloques de la etapa elegida (o todos) de una sesión. */
  const bloquesDeEtapa = (a) => a.bloques.filter((b) =>
    (b.duracion_s ?? 0) >= 10 && (comp.etapa === "todas" || b.fase === comp.etapa));

  /**
   * Eje común de una plantilla: dónde empieza y cuánto ocupa cada paso (en segundos).
   * Los pasos por tiempo ocupan su objetivo; los de distancia, la duración promedio que tuvo
   * ese paso en todas las sesiones de la plantilla (si no hay ninguna, se estima a 6 min/km).
   */
  function ejePlantilla(pasos, sesiones) {
    const anchos = pasos.map((p, k) => {
      if (p.tipo === "tiempo") return p.valor;
      const reales = sesiones.map((a) => a.bloques.filter((b) => b.fase)[k]?.duracion_s).filter((d) => d != null);
      return reales.length ? reales.reduce((x, y) => x + y, 0) / reales.length : p.valor * 0.36;
    });
    const inicios = [];
    anchos.reduce((acum, ancho) => { inicios.push(acum); return acum + ancho; }, 0);
    const objetivo = (p) => (p.tipo === "tiempo"
      ? (p.valor % 60 ? `${Math.floor(p.valor / 60)}′${String(p.valor % 60).padStart(2, "0")}″` : `${p.valor / 60}′`)
      : (p.valor >= 1000 ? `${numero(p.valor / 1000, p.valor % 1000 ? 1 : 0)} km` : `${p.valor} m`));
    const tramos = pasos.map((p, k) => ({
      desde: inicios[k] / 60, hasta: (inicios[k] + anchos[k]) / 60,
      texto: p.fase.toUpperCase(), completo: `${p.fase} · ${objetivo(p)}`.toUpperCase(),
    }));
    return { anchos, inicios, tramos, total: inicios.at(-1) + anchos.at(-1) };
  }

  /**
   * Promedio de la métrica en cada tramo de la plantilla (o en toda la sesión, sin plantilla),
   * por sesión. El ritmo sale de tiempo y distancia de los bloques (como en la tabla); el resto,
   * del promedio de sus minutos.
   */
  function lineasPromedio(elegidas, datasets, met, eje, colorDe) {
    const lineas = [];
    elegidas.forEach((a, k) => {
      const puntos = datasets[k].data.filter((p) => p.y != null && p.b);
      const grupos = eje
        ? a.bloques.filter((b) => b.fase).map((b, n) => ({ bloques: [b], desde: eje.tramos[n]?.desde, hasta: eje.tramos[n]?.hasta }))
        : [{ bloques: a.bloques.filter((b) => (b.duracion_s ?? 0) >= 10), desde: null, hasta: null }];
      for (const g of grupos) {
        const nros = new Set(g.bloques.map((b) => b.nro));
        const suyos = puntos.filter((p) => nros.has(p.b.nro));
        if (!suyos.length || g.desde === undefined) continue;   // tramo fuera de la etapa elegida
        let valor;
        if (met.clave === "ritmo") {
          const dur = suma(g.bloques, (b) => b.duracion_s), dist = suma(g.bloques, (b) => b.distancia_m);
          valor = dist ? (dur / dist) * 1000 : null;
        } else {
          valor = suyos.reduce((x, p) => x + p.y, 0) / suyos.length;
        }
        if (valor == null) continue;
        lineas.push({ desde: g.desde ?? suyos[0].x, hasta: g.hasta ?? suyos.at(-1).x, valor, color: colorDe.get(a.id),
                      texto: `Prom. ${met.formato(valor)}` });
      }
    });
    return lineas;
  }

  /** Plugin: líneas punteadas con el promedio de cada tramo (y su valor, si hay una sola sesión). */
  const LINEAS_PROMEDIO = {
    id: "lineasPromedio",
    afterDatasetsDraw(chart) {
      const op = chart.options.plugins.lineasPromedio;
      if (!op?.lineas.length) return;
      const { ctx, chartArea: area, scales: { x, y } } = chart;
      ctx.save();
      ctx.lineWidth = 1.25; ctx.setLineDash([5, 4]);
      ctx.font = Tablero.graficos.tipografia().chico.canvas;
      ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      for (const l of op.lineas) {
        const py = Math.round(y.getPixelForValue(l.valor)) + 0.5;
        if (py < area.top || py > area.bottom) continue;
        const x0 = Math.max(x.getPixelForValue(l.desde), area.left) + 3, x1 = Math.min(x.getPixelForValue(l.hasta), area.right) - 3;
        if (x1 <= x0) continue;
        ctx.strokeStyle = l.color;
        ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x1, py); ctx.stroke();
        if (op.rotulos && ctx.measureText(l.texto).width + 8 < x1 - x0) {
          // Con fondo, para que se lea aunque la curva pase por detrás
          const ancho = ctx.measureText(l.texto).width;
          ctx.fillStyle = op.fondo;
          ctx.fillRect(x1 - ancho - 4, py - 16, ancho + 4, 14);
          ctx.fillStyle = l.color;
          ctx.fillText(l.texto, x1 - 2, py - 3);
        }
      }
      ctx.restore();
    },
  };

  /** Plugin de Chart.js: líneas punteadas en cada cambio de bloque y el nombre de la fase arriba. */
  const LINEAS_BLOQUES = {
    id: "lineasBloques",
    afterDatasetsDraw(chart) {
      const op = chart.options.plugins.lineasBloques;
      if (!op) return;
      const { ctx, chartArea: area, scales: { x } } = chart;
      ctx.save();
      ctx.strokeStyle = op.linea;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (const m of op.limites) {
        const px = Math.round(x.getPixelForValue(m)) + 0.5;
        ctx.beginPath(); ctx.moveTo(px, area.top - 14); ctx.lineTo(px, area.bottom); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = op.texto;
      // Nombres de bloque en --t-etiqueta: mayúsculas con espaciado .06em
      const et = Tablero.graficos.tipografia().etiqueta;
      ctx.font = et.canvas;
      ctx.letterSpacing = `${(et.size * 0.06).toFixed(2)}px`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      for (const t of op.tramos) {
        const a = x.getPixelForValue(t.desde), b = x.getPixelForValue(t.hasta);
        // En tramos angostos (ciclos de CACO) se usa la inicial; si ni eso entra, no se rotula
        const entra = (txt) => ctx.measureText(txt).width + 8 < b - a;
        const texto = entra(t.completo) ? t.completo : entra(t.texto) ? t.texto : (b - a > 14 ? t.texto[0] : "");
        if (texto) ctx.fillText(texto, (a + b) / 2, area.top - 2);
      }
      ctx.restore();
    },
  };

  /**
   * Tabla de las sesiones elegidas (plantilla + sesiones). Con una etapa elegida, el ritmo y la
   * FC de la etapa reemplazan a los de la parte de entrenamiento.
   */
  function renderTabla(elegidas, colorDe) {
    const conEtapa = comp.etapa !== "todas";
    // Totales de la etapa elegida en una sesión (con "Toda la sesión", de todos sus bloques)
    const enEtapa = (a) => {
      const bl = bloquesDeEtapa(a);
      const dur = suma(bl, (b) => b.duracion_s), dist = suma(bl, (b) => b.distancia_m);
      return { dur, dist, ritmo: dist ? (dur / dist) * 1000 : null, fc: ponderado(bl, "fc_media"), pot: ponderado(bl, "potencia_w") };
    };
    const etapa = comp.etapa.toLowerCase();
    document.getElementById("carrera-tabla-nota").textContent =
      `${elegidas.length} ${elegidas.length === 1 ? "sesión" : "sesiones"} de ${nombrePlantillas() || "ninguna plantilla"}` +
      (conEtapa ? ` · solo ${etapa} (la carga es de la sesión completa)` : "") + ". Tocá una fila para ver el detalle y sus bloques.";

    const fecha = { titulo: "Fecha", valor: (a) => `<span class="punto" style="background:${colorDe.get(a.id)}"></span>${fechaLarga(a.fecha)}` };
    const plantilla = { titulo: "Plantilla", valor: (a) => escapar(a.plantilla ?? "—") +
      (a.ajuste_plantilla && a.ajuste_plantilla !== "exacta" ? ` <span class="marca-chica">${a.ajuste_plantilla}</span>` : "") };
    const columnas = conEtapa
      ? [
        fecha, plantilla,
        { titulo: "Km", num: true, valor: (a) => (enEtapa(a).dist ? numero(enEtapa(a).dist / 1000, 2) : "—") },
        { titulo: "Tiempo", num: true, valor: (a) => (enEtapa(a).dur ? duracion(enEtapa(a).dur) : "—") },
        { titulo: "Ritmo", num: true, fuerte: true, valor: (a) => ritmo(enEtapa(a).ritmo) },
        { titulo: "FC media", num: true, valor: (a) => numero(enEtapa(a).fc) },
        { titulo: "Potencia", num: true, valor: (a) => (enEtapa(a).pot != null ? `${numero(enEtapa(a).pot)} W` : "—") },
        { titulo: "Carga (sesión)", num: true, valor: (a) => a.carga ?? "—" },
      ]
      : [
        fecha, plantilla,
        { titulo: "Km", num: true, valor: (a) => numero(a.distancia_m / 1000, 2) },
        { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
        { titulo: "Ritmo entren.", num: true, fuerte: true, valor: (a) => (a.entrenamiento?.ritmo_s_km ? ritmo(a.entrenamiento.ritmo_s_km) : "—") },
        { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
        { titulo: "Potencia", num: true, valor: (a) => (a.potencia_w != null ? `${numero(a.potencia_w)} W` : "—") },
        { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
      ];
    Tablero.sesiones.tabla("tabla-carreras", elegidas, columnas, { vacio: "Elegí al menos una sesión" });
  }

  Tablero.secciones.carrera = { render };
})();
