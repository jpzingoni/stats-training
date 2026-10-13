// Pestaña Carrera: progreso, volumen, intensidad y técnica.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeFechas, ejeY, tituloFecha, estiloBarra } = Tablero.graficos;
  const { kpis, escapar } = Tablero.componentes;
  const { numero, ritmo, duracion, ts, fechaCorta, fechaLarga, suma, promedio } = Tablero.formato;

  const SUBTIPOS = ["Bloques", "Series", "Libre"];

  function render(ctx) {
    const corridas = ctx.actividades.filter((a) => a.categoria === "Carrera");

    renderComparacion(corridas, ctx.meta, ctx.todo.minutos ?? {});
    renderEficiencia(ctx, corridas);
    renderKm(ctx);
    renderZonas(ctx);
    renderDinamica(ctx, corridas);
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
  const comp = { plantilla: null, elegidas: null, metrica: "ritmo", etapa: "todas", ef: "m", enlazado: false, corridas: [], minutos: {} };
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
      localStorage.setItem("carrera-comparar", JSON.stringify({ plantilla: comp.plantilla, metrica: comp.metrica, etapa: comp.etapa, ef: comp.ef }));
    } catch { /* solo esta visita */ }
  }

  function enlazarComp() {
    comp.enlazado = true;
    try {
      const g = JSON.parse(localStorage.getItem("carrera-comparar") ?? "null");
      if (g?.plantilla) comp.plantilla = g.plantilla;
      if (METRICAS_COMP[g?.metrica]) comp.metrica = g.metrica;
      if (g?.ef === "m" || g?.ef === "w") comp.ef = g.ef;
      if (g?.etapa) comp.etapa = g.etapa;
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
    document.getElementById("carrera-ef-metrica").addEventListener("click", (e) => {
      const b = e.target.closest("[data-ef]");
      if (!b) return;
      comp.ef = b.dataset.ef;
      guardarComp();
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
    // El desplegable se cierra al tocar afuera
    document.addEventListener("click", (e) => {
      const d = document.getElementById("carrera-sesiones");
      if (d.open && !d.contains(e.target)) d.open = false;
    });
  }

  const sesionesDePlantilla = () => comp.corridas.filter((a) => (a.plantilla ?? "Libre") === comp.plantilla);

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

    // Gráfico: la curva minuto a minuto de cada sesión
    const met = METRICAS_COMP[comp.metrica];
    document.getElementById("carrera-comp-titulo").textContent = `${met.nombre} a lo largo de la sesión`;
    for (const b of document.querySelectorAll("#carrera-metrica button")) {
      b.setAttribute("aria-pressed", String(b.dataset.metrica === comp.metrica));
    }
    // Etapas: las fases que tiene la plantilla, en orden ("Libre" no tiene fases)
    const pasosPlantilla = comp.meta?.plantillas?.[comp.plantilla];
    const fases = pasosPlantilla ? [...new Set(pasosPlantilla.map((p) => p.fase))] : [];
    if (comp.etapa !== "todas" && !fases.includes(comp.etapa)) comp.etapa = "todas";
    const selEtapa = document.getElementById("carrera-etapa");
    selEtapa.disabled = !fases.length;
    selEtapa.innerHTML = `<option value="todas">${fases.length ? "Toda la sesión" : "Toda la sesión (sin etapas)"}</option>` +
      fases.map((f) => `<option value="${escapar(f)}"${f === comp.etapa ? " selected" : ""}>${escapar(f)}</option>`).join("");
    renderKpisComparacion(elegidas);
    renderTabla(elegidas, colorDe);

    // Con plantilla, el eje X sigue los bloques de la plantilla: todas las sesiones comparten
    // los mismos tramos y lo que cambia es la altura de cada escalón. Sin plantilla ("Libre"),
    // el eje es el tiempo real desde el inicio de cada sesión.
    const pasos = comp.meta?.plantillas?.[comp.plantilla];
    const eje = pasos ? ejePlantilla(pasos, sesiones) : null;
    const hayDistancia = pasos?.some((p) => p.tipo === "distancia");
    document.getElementById("carrera-comp-nota").textContent =
      "Curva minuto a minuto de cada sesión. " +
      (eje && comp.etapa !== "todas" ? `Se muestran solo los minutos de ${comp.etapa}. ` : "") +
      (eje
        ? "El eje sigue los bloques de la plantilla: cada bloque se estira o se comprime a su tramo, así todas las sesiones quedan alineadas." +
          (hayDistancia ? " Los bloques por distancia toman su duración promedio." : "")
        : "El eje es el tiempo desde el inicio de la sesión.") +
      (comp.metrica === "ritmo" ? " Más arriba = más rápido; los minutos con pausas quedan contra el borde." : "") +
      (sesiones.length > MAX_SESIONES ? ` Se pueden comparar hasta ${MAX_SESIONES} sesiones a la vez.` : "");
    renderDeriva(elegidas, colorDe, pasos);
    renderEficienciaPlantilla(elegidas, colorDe);
    renderDispersion(elegidas, colorDe);
    if (!elegidas.length) return sinDatos("g-carrera-comparar", "Elegí al menos una sesión");

    const datasets = elegidas.map((a) => ({
      label: fechaLarga(a.fecha), data: puntosSesion(a, met, eje),
      borderColor: colorDe.get(a.id), backgroundColor: colorDe.get(a.id),
      borderWidth: 1.75, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 8, spanGaps: false,
    }));
    if (!datasets.some((d) => d.data.some((pt) => pt.y != null))) {
      return sinDatos("g-carrera-comparar", `Sin datos de ${met.nombre.toLowerCase()} para estas sesiones`);
    }
    const rango = rangoRobusto(datasets.flatMap((d) => d.data.map((pt) => pt.y)));
    grafico("g-carrera-comparar", {
      type: "line",
      data: { datasets },
      plugins: [LINEAS_BLOQUES],
      options: {
        interaction: { mode: "nearest", intersect: false, axis: "x" },
        elements: { line: { tension: 0 } },
        layout: { padding: { top: eje ? 16 : 0 } },
        scales: {
          x: { type: "linear", min: 0, max: eje ? eje.total / 60 : undefined, grid: { display: false }, border: { color: c.eje },
               title: { display: true, text: eje ? `minutos según la plantilla ${comp.plantilla}` : "minutos desde el inicio" },
               ticks: { callback: (v) => (Number.isInteger(v) ? `${v}′` : "") } },   // sin el último valor con decimales
          // Rango del 3 % al 97 % de los valores: un minuto con pausa no aplasta toda la curva
          y: ejeY({ reverse: met.invertir, min: rango?.min, max: rango?.max,
                    ticks: { maxTicksLimit: 8, callback: (v, i, t) => (rango && (i === 0 || i === t.length - 1) ? "" : met.formato(v)) } }),
        },
        plugins: {
          // Con plantilla, la leyenda va abajo: arriba están los nombres de las fases
          legend: { display: datasets.length > 1, position: eje ? "bottom" : "top" },
          lineasBloques: eje ? { limites: eje.inicios.slice(1).map((v) => v / 60), tramos: eje.tramos, linea: c.muted, texto: c.textoSec } : null,
          tooltip: {
            filter: (i) => i.parsed.y != null,
            callbacks: {
              title: (items) => items.length ? `${items[0].dataset.label}` : "",
              label: (i) => {
                const pt = i.raw;
                const donde = pt.b ? `bloque ${pt.b.nro}${pt.b.fase ? ` · ${pt.b.fase}` : ""}` : "";
                return ` Min ${pt.minuto + 1}${donde ? ` (${donde})` : ""}: ${met.formato(i.parsed.y)}`;
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

  /**
   * Deriva cardíaca de una sesión: cuánto cae la eficiencia (velocidad ÷ FC) de la primera a
   * la segunda mitad del bloque de entrenamiento continuo. Se saltean sus 2 primeros minutos
   * (la FC tarda en estabilizarse) y los minutos muy incompletos.
   */
  function deriva(a) {
    const m = comp.minutos[a.id];
    const entrenamiento = a.bloques.filter((b) => b.fase === "Entrenamiento");
    if (!m?.vel || !m?.fc || entrenamiento.length !== 1 || entrenamiento[0].duracion_s < 600) return null;
    const nro = entrenamiento[0].nro;
    const usados = m.bloque.map((n, i) => i)
      .filter((i) => m.bloque[i] === nro && (m.seg[i] ?? 0) >= 50 && m.vel[i] != null && m.fc[i] != null)
      .slice(2);
    if (usados.length < 6) return null;
    const mitad = Math.floor(usados.length / 2);
    const ef = (ix) => promedio(ix, (i) => m.vel[i]) / promedio(ix, (i) => m.fc[i]);
    const ef1 = ef(usados.slice(0, mitad)), ef2 = ef(usados.slice(-mitad));
    return {
      valor: ((ef1 - ef2) / ef1) * 100, minutos: usados.length,
      fc1: promedio(usados.slice(0, mitad), (i) => m.fc[i]), fc2: promedio(usados.slice(-mitad), (i) => m.fc[i]),
      v1: promedio(usados.slice(0, mitad), (i) => m.vel[i]), v2: promedio(usados.slice(-mitad), (i) => m.vel[i]),
    };
  }

  function renderDeriva(elegidas, colorDe, pasos) {
    const c = colores();
    const titulo = document.getElementById("carrera-deriva-titulo");
    const nota = document.getElementById("carrera-deriva-nota");
    const bloquesEntrenamiento = pasos ? pasos.filter((p) => p.fase === "Entrenamiento").length : 0;
    if (!pasos) {
      titulo.textContent = "Deriva cardíaca";
      nota.textContent = "Se calcula sobre el bloque de entrenamiento de una plantilla; las sesiones libres no lo tienen.";
      return sinDatos("g-carrera-deriva", "Elegí una plantilla");
    }
    if (bloquesEntrenamiento > 1) {
      // Plantillas por ciclos (CACO, Aumento de ritmo): FC de cada bloque de entrenamiento
      titulo.textContent = "FC en cada bloque de entrenamiento";
      nota.textContent = "En las plantillas por ciclos, la deriva se ve en cómo sube la FC de un ciclo al siguiente.";
      const datasets = elegidas.map((a) => ({
        label: fechaLarga(a.fecha),
        data: a.bloques.filter((b) => b.fase === "Entrenamiento").map((b, k) => ({ x: k + 1, y: b.fc_media })),
        borderColor: colorDe.get(a.id), backgroundColor: colorDe.get(a.id), pointRadius: 3,
      }));
      if (!datasets.length) return sinDatos("g-carrera-deriva", "Elegí al menos una sesión");
      return grafico("g-carrera-deriva", {
        type: "line", data: { datasets },
        options: {
          scales: { x: { type: "linear", min: 1, max: bloquesEntrenamiento, grid: { display: false },
                         ticks: { stepSize: 1, callback: (v) => `${v}` }, title: { display: true, text: "bloque de entrenamiento" } },
                    y: ejeY({ grace: "10%", ticks: { callback: (v) => `${v} ppm` } }) },
          plugins: { legend: { display: datasets.length > 1, position: "bottom" },
                     tooltip: { callbacks: { title: (i) => `Bloque ${i[0].parsed.x}`, label: (i) => ` ${i.dataset.label}: ${i.parsed.y} ppm` } } },
        },
      });
    }
    titulo.textContent = "Deriva cardíaca";
    nota.textContent = "Cuánto cae la eficiencia (velocidad ÷ FC) de la primera a la segunda mitad del bloque de entrenamiento. " +
      "Por debajo de 5 %, ritmo y FC se mantuvieron acoplados (referencia que usan Intervals y TrainingPeaks).";
    const filas = elegidas.map((a) => ({ a, d: deriva(a) })).filter((x) => x.d);
    if (!filas.length) return sinDatos("g-carrera-deriva", "Sin minutos suficientes para calcularla");
    grafico("g-carrera-deriva", {
      type: "bar",
      data: {
        labels: filas.map((x) => fechaCorta(x.a.fecha)),
        datasets: [{ label: "Deriva", data: filas.map((x) => x.d.valor),
          backgroundColor: filas.map((x) => colorDe.get(x.a.id)), borderRadius: 4, maxBarThickness: 48 }],
      },
      plugins: [LINEA_REFERENCIA],
      options: {
        scales: { x: { grid: { display: false } }, y: ejeY({ suggestedMin: 0, suggestedMax: 8, ticks: { callback: (v) => `${v} %` } }) },
        plugins: {
          legend: { display: false },
          lineaReferencia: { valor: 5, texto: "5 %", color: c.muted },
          tooltip: { callbacks: {
            title: (i) => fechaLarga(filas[i[0].dataIndex].a.fecha),
            label: (i) => {
              const d = filas[i.dataIndex].d;
              return [` Deriva: ${numero(d.valor, 1)} %`,
                ` 1.ª mitad: ${ritmo(1000 / d.v1)} /km a ${numero(d.fc1)} ppm`,
                ` 2.ª mitad: ${ritmo(1000 / d.v2)} /km a ${numero(d.fc2)} ppm`];
            },
          } },
        },
      },
    });
  }

  /** Eficiencia de cada sesión elegida en la etapa elegida: m por latido o W por latido. */
  function renderEficienciaPlantilla(elegidas, colorDe) {
    const c = colores();
    for (const b of document.querySelectorAll("#carrera-ef-metrica button")) {
      b.setAttribute("aria-pressed", String(b.dataset.ef === comp.ef));
    }
    const puntos = elegidas.map((a) => {
      const bl = bloquesDeEtapa(a);
      const dur = suma(bl, (b) => b.duracion_s), dist = suma(bl, (b) => b.distancia_m);
      const fc = ponderado(bl, "fc_media"), pot = ponderado(bl, "potencia_w");
      const valor = comp.ef === "m" ? (dist && fc ? (dist / dur) * 60 / fc : null) : (pot && fc ? pot / fc : null);
      return { a, valor };
    }).filter((x) => x.valor != null);
    if (!puntos.length) return sinDatos("g-carrera-ef-plantilla", "Sin datos para estas sesiones");
    const unidad = comp.ef === "m" ? "m/latido" : "W/latido";
    grafico("g-carrera-ef-plantilla", {
      type: "line",
      data: {
        labels: puntos.map((x) => fechaCorta(x.a.fecha)),
        datasets: [{ label: unidad, data: puntos.map((x) => x.valor), borderColor: c.muted,
          pointBackgroundColor: puntos.map((x) => colorDe.get(x.a.id)), pointBorderColor: c.superficie,
          pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8 }],
      },
      options: {
        scales: { x: { grid: { display: false } }, y: ejeY({ grace: "20%", ticks: { callback: (v) => numero(v, 2) } }) },
        plugins: { legend: { display: false },
          tooltip: { callbacks: { title: (i) => fechaLarga(puntos[i[0].dataIndex].a.fecha), label: (i) => ` ${numero(i.parsed.y, 3)} ${unidad}` } } },
      },
    });
  }

  /**
   * Dispersión ritmo–FC: cada punto es un minuto completo de la etapa elegida. Con el tiempo,
   * si los puntos se corren hacia "más rápido con la misma FC", la forma mejora.
   * Máximo 3 sesiones (las más recientes de las elegidas): con más colores los puntos no se distinguen.
   */
  const MAX_DISPERSION = 3;
  function renderDispersion(elegidas, colorDe) {
    const nota = document.getElementById("carrera-disp-nota");
    const usadas = elegidas.slice(-MAX_DISPERSION);
    const datasets = usadas.map((a) => {
      const m = comp.minutos[a.id];
      const porNro = new Map(a.bloques.map((b) => [b.nro, b]));
      const data = (m?.ritmo ?? []).map((r, i) => ({ x: m.fc?.[i], y: r, b: porNro.get(m.bloque?.[i]), minuto: i, seg: m.seg?.[i] }))
        .filter((p) => p.x != null && p.y != null && (p.seg ?? 0) >= 50 && (comp.etapa === "todas" || p.b?.fase === comp.etapa));
      return { label: fechaLarga(a.fecha), data, backgroundColor: colorDe.get(a.id), borderColor: colores().superficie,
        borderWidth: 1, pointRadius: 4, pointHoverRadius: 6 };
    });
    const etapa = comp.etapa === "todas" ? "toda la sesión" : comp.etapa.toLowerCase();
    nota.textContent = `Cada punto es un minuto completo (${etapa}). Más arriba = más rápido, más a la izquierda = menos pulsaciones: ` +
      "arriba a la izquierda es mejor." + (elegidas.length > MAX_DISPERSION ? ` Se muestran las ${MAX_DISPERSION} sesiones elegidas más recientes.` : "");
    if (!datasets.some((d) => d.data.length)) return sinDatos("g-carrera-dispersion", "Sin minutos para estas sesiones");
    const rangoY = rangoRobusto(datasets.flatMap((d) => d.data.map((p) => p.y)));
    grafico("g-carrera-dispersion", {
      type: "scatter",
      data: { datasets },
      options: {
        scales: {
          x: { grid: { color: colores().grilla }, border: { display: false }, title: { display: true, text: "FC (ppm)" } },
          y: ejeY({ reverse: true, min: rangoY?.min, max: rangoY?.max,
                    ticks: { maxTicksLimit: 7, callback: (v, i, t) => (rangoY && (i === 0 || i === t.length - 1) ? "" : `${ritmo(v)} /km`) } }),
        },
        plugins: {
          legend: { display: datasets.length > 1, position: "top" },
          tooltip: { callbacks: { label: (i) => ` ${i.dataset.label}, min ${i.raw.minuto + 1}: ${ritmo(i.raw.y)} /km a ${i.raw.x} ppm` } },
        },
      },
    });
  }

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
      ctx.setLineDash([]); ctx.fillStyle = op.color; ctx.font = `11px ${Chart.defaults.font.family}`;
      ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(op.texto, area.right - 2, py - 2);
      ctx.restore();
    },
  };

  /** Bloques de la etapa elegida (o todos) de una sesión. */
  const bloquesDeEtapa = (a) => a.bloques.filter((b) =>
    (b.duracion_s ?? 0) >= 10 && (comp.etapa === "todas" || b.fase === comp.etapa));

  /**
   * Tarjetas: ritmo, FC, potencia y distancia de las sesiones elegidas, en la etapa elegida.
   * El ritmo sale de distancia y tiempo totales (no del promedio de ritmos) y la FC se
   * pondera por el tiempo de cada bloque.
   */
  function renderKpisComparacion(elegidas) {
    const bloques = elegidas.flatMap(bloquesDeEtapa);
    const dur = suma(bloques, (b) => b.duracion_s);
    const dist = suma(bloques, (b) => b.distancia_m);
    const conFc = bloques.filter((b) => b.fc_media != null);
    const fc = conFc.length ? suma(conFc, (b) => b.fc_media * b.duracion_s) / suma(conFc, (b) => b.duracion_s) : null;
    const etapa = comp.etapa === "todas" ? "toda la sesión" : comp.etapa.toLowerCase();
    const alcance = `${elegidas.length} ${elegidas.length === 1 ? "sesión" : "sesiones"} · ${etapa}`;
    // Última sesión elegida, para ver cómo viene respecto del promedio
    const ultima = elegidas.at(-1);
    const bu = ultima ? bloquesDeEtapa(ultima) : [];
    const durU = suma(bu, (b) => b.duracion_s), distU = suma(bu, (b) => b.distancia_m);
    const fcU = bu.some((b) => b.fc_media != null)
      ? suma(bu.filter((b) => b.fc_media != null), (b) => b.fc_media * b.duracion_s) / suma(bu.filter((b) => b.fc_media != null), (b) => b.duracion_s)
      : null;
    const pot = ponderado(bloques, "potencia_w");
    const potU = ponderado(bu, "potencia_w");
    const ultimaTxt = (v) => (elegidas.length > 1 && v ? ` · última: ${v}` : "");
    kpis("carrera-kpis", [
      { etiqueta: "Ritmo medio", valor: dist ? ritmo((dur / dist) * 1000) : "—", unidad: "/km",
        delta: alcance + ultimaTxt(distU ? `${ritmo((durU / distU) * 1000)} /km` : "") },
      { etiqueta: "FC media", valor: numero(fc), unidad: "ppm", delta: alcance + ultimaTxt(fcU ? `${numero(fcU)} ppm` : "") },
      { etiqueta: "Potencia media", valor: numero(pot), unidad: "W", delta: alcance + ultimaTxt(potU ? `${numero(potU)} W` : "") },
      { etiqueta: "Distancia", valor: numero(dist / 1000, 1), unidad: "km", delta: alcance },
    ]);
  }

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
      desde: inicios[k] / 60, hasta: (inicios[k] + anchos[k]) / 60, texto: p.fase, completo: `${p.fase} · ${objetivo(p)}`,
    }));
    return { anchos, inicios, tramos, total: inicios.at(-1) + anchos.at(-1) };
  }

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
      ctx.font = `11px ${Chart.defaults.font.family}`;
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

  /**
   * Tabla de las sesiones elegidas (plantilla + sesiones). Con una etapa elegida, el ritmo y la
   * FC de la etapa reemplazan a los de la parte de entrenamiento.
   */
  function renderTabla(elegidas, colorDe) {
    const conEtapa = comp.etapa !== "todas";
    const enEtapa = (a) => {
      const bl = bloquesDeEtapa(a);
      const dur = suma(bl, (b) => b.duracion_s), dist = suma(bl, (b) => b.distancia_m);
      return { ritmo: dist ? (dur / dist) * 1000 : null, fc: ponderado(bl, "fc_media") };
    };
    document.getElementById("carrera-tabla-nota").textContent =
      `${elegidas.length} ${elegidas.length === 1 ? "sesión" : "sesiones"} de ${comp.plantilla}` +
      (conEtapa ? ` · ritmo y FC de ${comp.etapa.toLowerCase()}` : "") + ". Tocá una fila para ver el detalle y sus bloques.";
    Tablero.sesiones.tabla("tabla-carreras", elegidas, [
      { titulo: "Fecha", valor: (a) => `<span class="punto" style="background:${colorDe.get(a.id)}"></span>${fechaLarga(a.fecha)}` },
      { titulo: "Plantilla", valor: (a) => escapar(a.plantilla ?? "—") + (a.ajuste_plantilla && a.ajuste_plantilla !== "exacta" ? ` <small class="texto-sec">(${a.ajuste_plantilla})</small>` : "") },
      { titulo: "Km", num: true, valor: (a) => numero(a.distancia_m / 1000, 2) },
      { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
      { titulo: "Ritmo prom.", num: true, valor: (a) => ritmo(a.ritmo_s_km) },
      conEtapa
        ? { titulo: `Ritmo ${comp.etapa.toLowerCase()}`, num: true, valor: (a) => ritmo(enEtapa(a).ritmo) }
        : { titulo: "Ritmo entren.", num: true, valor: (a) => (a.entrenamiento?.ritmo_s_km ? ritmo(a.entrenamiento.ritmo_s_km) : "—") },
      conEtapa
        ? { titulo: `FC ${comp.etapa.toLowerCase()}`, num: true, valor: (a) => numero(enEtapa(a).fc) }
        : { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
      { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
    ], { vacio: "Elegí al menos una sesión" });
  }

  Tablero.secciones.carrera = { render };
})();
