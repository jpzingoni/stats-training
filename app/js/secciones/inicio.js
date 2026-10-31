// Vista "Este mes": la portada. Calendario chico con los días en que hubo actividad, las
// actividades del mes, el avance de los objetivos mensuales y el gráfico de pasos por día.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { escapar } = Tablero.componentes;
  const { GRUPOS, VAR_GRUPO, grupoDe, grafico, sinDatos, colores, ejeY, estiloBarra, tipografia, conAlfa } = Tablero.graficos;
  const { numero, duracion, suma, promedio, sumarDias, lunesDe, fechaLarga,
    MESES_LARGOS, hoyLocal, sumarMes, ultimoDiaMes, nombreMes } = Tablero.formato;

  const estado = { mes: null, ctx: null, enlazado: false };
  const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

  /** Objetivos mensuales: cada uno dice cómo se mide en el mes, su meta y su color. */
  const kmDe = (m, grupo) => suma(m.actividades.filter((a) => grupoDe(a) === grupo), (a) => a.distancia_m) / 1000;
  const OBJETIVOS = [
    { nombre: "Correr", meta: 50, unidad: "km", decimales: 1, color: VAR_GRUPO.Carrera, valor: (m) => kmDe(m, "Carrera") },
    { nombre: "Ciclismo", meta: 100, unidad: "km", decimales: 1, color: VAR_GRUPO.Ciclismo, valor: (m) => kmDe(m, "Ciclismo") },
    { nombre: "Pasos", meta: 300000, unidad: "pasos", decimales: 0, color: "var(--serie-diaria)", valor: (m) => m.pasosTotal ?? 0 },
    { nombre: "Pádel", meta: 2, unidad: "sesiones", decimales: 0, color: VAR_GRUPO["Pádel"],
      valor: (m) => m.actividades.filter((a) => grupoDe(a) === "Pádel").length },
  ];

  function render(ctx) {
    estado.ctx = ctx;
    estado.limites = { min: ctx.meta.desde.slice(0, 7), max: hoyLocal().slice(0, 7) };
    if (!estado.mes) estado.mes = estado.limites.max;           // abre en el mes actual
    if (!estado.enlazado) {
      estado.enlazado = true;
      document.getElementById("inicio-anterior").onclick = () => { estado.mes = sumarMes(estado.mes, -1); dibujar(); };
      document.getElementById("inicio-siguiente").onclick = () => { estado.mes = sumarMes(estado.mes, 1); dibujar(); };
    }
    dibujar();
  }

  /** Días del mes con datos descargados: el mes actual corta en el último día bajado
   *  (normalmente ayer, porque el workflow trae hasta el día anterior). */
  function rangoMes(mes, ultimoDato) {
    const desde = `${mes}-01`;
    const fin = ultimoDiaMes(mes);
    return { desde, hasta: fin < ultimoDato ? fin : ultimoDato, fin };
  }

  /** Números del mes: pasos (total y promedio, solo sobre los días con dato) y actividades. */
  function resumenMes(ctx, mes) {
    const r = rangoMes(mes, ctx.meta.hasta);
    const enMes = (f) => f >= r.desde && f <= r.hasta;
    const dias = ctx.todo.bienestar.filter((d) => enMes(d.fecha));
    const transcurridos = Math.round((Date.parse(r.hasta) - Date.parse(r.desde)) / 86400000) + 1;
    return {
      ...r, transcurridos,
      pasosTotal: suma(dias, (d) => d.pasos),
      pasosProm: promedio(dias, (d) => d.pasos),
      actividades: ctx.todo.actividades.filter((a) => enMes(a.fecha) && ctx.visible(a)),
    };
  }

  function dibujar() {
    const ctx = estado.ctx;
    const { mes, limites } = estado;
    const m = resumenMes(ctx, mes);
    const mesAnt = sumarMes(mes, -1);
    const p = mesAnt >= limites.min ? resumenMes(ctx, mesAnt) : null;
    const nombreAnt = MESES_LARGOS[Number(mesAnt.slice(5, 7)) - 1].toLowerCase();

    document.getElementById("inicio-mes").textContent = nombreMes(mes);
    document.getElementById("inicio-cal-titulo").textContent = MESES_LARGOS[Number(mes.slice(5, 7)) - 1];
    document.getElementById("inicio-rango").textContent = m.hasta < m.desde
      ? "Todavía no hay datos de este mes"
      : `Del ${fechaLarga(m.desde)} al ${fechaLarga(m.hasta)} · ${m.transcurridos} ${m.transcurridos === 1 ? "día" : "días"}`;
    document.getElementById("inicio-anterior").disabled = mes <= limites.min;
    document.getElementById("inicio-siguiente").disabled = mes >= limites.max;

    renderActividades(m, p, nombreAnt);
    renderObjetivos(m);
    renderMiniCalendario(ctx, m);
    renderDiario(ctx, m);
  }

  function renderActividades(m, p, nombreAnt) {
    const acts = m.actividades;
    const porGrupo = GRUPOS.map((g) => {
      const lista = acts.filter((a) => grupoDe(a) === g);
      return { g, n: lista.length, s: suma(lista, (a) => a.duracion_s), km: suma(lista, (a) => a.distancia_m) / 1000 };
    }).filter((x) => x.n);
    const diasActivos = new Set(acts.map((a) => a.fecha)).size;
    const comparacion = p ? ` · ${p.actividades.length} en ${nombreAnt}` : "";

    document.getElementById("inicio-actividades").innerHTML = `
      <div class="act-total">
        <div><span class="act-total-num">${acts.length}</span> ${acts.length === 1 ? "actividad" : "actividades"}</div>
        <div class="texto-sec">${duracion(suma(acts, (a) => a.duracion_s))} en total · ${diasActivos} ${diasActivos === 1 ? "día activo" : "días activos"}${comparacion}</div>
      </div>
      ${porGrupo.length ? `<ul class="act-lista">${porGrupo.map((x) => `
        <li>
          <span class="muestra" style="background:${VAR_GRUPO[x.g]}"></span>
          <span class="act-lista-nombre">${escapar(x.g)}</span>
          <span class="act-lista-det">${duracion(x.s)}${x.km >= 0.1 ? ` · ${numero(x.km, 1)} km` : ""}</span>
          <span class="act-lista-n">${x.n}</span>
        </li>`).join("")}</ul>` : '<p class="texto-sec">Todavía no hay actividades este mes.</p>'}`;
  }

  /** Una barra por objetivo que se llena con lo hecho en el mes; al cumplirlo pasa al verde
   *  de "día ganado". El porcentaje puede pasar de 100 %, la barra no. */
  function renderObjetivos(m) {
    document.getElementById("inicio-objetivos").innerHTML = OBJETIVOS.map((o) => {
      const hecho = o.valor(m);
      const pct = Math.round((hecho / o.meta) * 100);
      const cumplido = hecho >= o.meta;
      return `
        <li class="objetivo${cumplido ? " cumplido" : ""}">
          <div class="objetivo-cab">
            <span class="objetivo-nombre"><i style="background:${o.color}"></i>${escapar(o.nombre)}</span>
            <span class="objetivo-det num">${numero(hecho, hecho % 1 ? o.decimales : 0)} de ${numero(o.meta)} ${o.unidad}</span>
            <span class="objetivo-pct num">${cumplido ? "✓ " : ""}${pct} %</span>
          </div>
          <div class="objetivo-barra" role="progressbar" aria-label="${escapar(o.nombre)}" aria-valuemin="0"
               aria-valuemax="${o.meta}" aria-valuenow="${Math.round(hecho)}">
            <span style="width:${Math.min(pct, 100)}%;background:${cumplido ? "var(--dia-ganado)" : o.color}"></span>
          </div>
        </li>`;
    }).join("");
  }

  function renderMiniCalendario(ctx, m) {
    const actPorDia = new Map();
    for (const a of m.actividades) {
      if (!actPorDia.has(a.fecha)) actPorDia.set(a.fecha, []);
      actPorDia.get(a.fecha).push(a);
    }
    const hoy = hoyLocal();
    const celdas = DIAS.map((d) => `<span class="mini-nombre">${d}</span>`);
    for (let f = lunesDe(m.desde); f <= m.fin; f = sumarDias(f, 1)) {
      if (f < m.desde) { celdas.push('<span class="mini-dia fuera"></span>'); continue; }
      const acts = actPorDia.get(f) ?? [];
      const futuro = f > m.hasta;
      // Días con actividad: un solo color, sin importar la carga
      const activo = !futuro && acts.length > 0;
      const clases = ["mini-dia", activo && "activo", futuro && "futuro", f === hoy && "hoy"].filter(Boolean).join(" ");
      const detalle = acts.map((a) => `${a.categoria}${a.subtipo ? ` · ${a.subtipo}` : ""} (${duracion(a.duracion_s)})`).join(", ");
      const titulo = `${fechaLarga(f)}: ${futuro ? "sin datos todavía" : detalle || "sin actividad"}`;
      // Un punto por tipo de actividad del día, con su color
      const puntos = [...new Set(acts.map(grupoDe))].map((g) => `<i style="background:${VAR_GRUPO[g]}"></i>`).join("");
      celdas.push(`<span class="${clases}" title="${escapar(titulo)}" aria-label="${escapar(titulo)}">
        <b>${Number(f.slice(8, 10))}</b>${puntos ? `<span class="mini-puntos">${puntos}</span>` : ""}</span>`);
    }
    // Leyenda: los deportes que aparecen en el mes, con su color
    const deportes = GRUPOS.filter((g) => m.actividades.some((a) => grupoDe(a) === g));
    document.getElementById("inicio-mini-leyenda").innerHTML = deportes
      .map((g) => `<span><i style="background:${VAR_GRUPO[g]}"></i>${escapar(g)}</span>`).join("");
    const cal = document.getElementById("inicio-mini-cal");
    cal.innerHTML = celdas.join("");
    // La fila de nombres + una fila por semana, repartiéndose el alto de la tarjeta
    const semanas = Math.ceil((celdas.length - DIAS.length) / 7);
    cal.style.gridTemplateRows = `auto repeat(${semanas}, minmax(0, 1fr))`;
  }

  /** Cómo se muestran los pasos en el gráfico diario. */
  const PASOS = {
    etiqueta: "Pasos", clave: "pasos", promedio: (m) => m.pasosProm,
    eje: (v) => (v >= 1000 ? `${numero(v / 1000)} mil` : v),
    valor: (v) => `${numero(v)} pasos`,
    prom: (v) => numero(v),
  };

  /** Barras verticales: un día por barra. Los días sin dato quedan vacíos. */
  function renderDiario(ctx, m) {
    const met = PASOS;
    const porDia = new Map(ctx.todo.bienestar.map((d) => [d.fecha, d[met.clave]]));
    const dias = [];
    for (let f = m.desde; f <= m.fin; f = sumarDias(f, 1)) dias.push(f);
    const valores = dias.map((f) => (f <= m.hasta ? porDia.get(f) ?? null : null));
    if (!valores.some((v) => v != null)) {
      return sinDatos("g-inicio-pasos", `Sin datos de ${met.etiqueta.toLowerCase()} este mes`);
    }
    const c = colores();
    // El último día con dato va en color pleno; el resto, al 60 % (DESIGN.md §4 Barras)
    const ultimo = valores.reduce((u, v, i) => (v != null ? i : u), -1);
    const colorBarras = valores.map((_, i) => (i === ultimo ? c.diario : conAlfa(c.diario, 0.6)));
    grafico("g-inicio-pasos", {
      type: "bar",
      data: {
        labels: dias.map((f) => Number(f.slice(8, 10))),
        datasets: [
          { type: "bar", label: met.etiqueta, data: valores, ...estiloBarra(colorBarras), order: 1 },
          // Promedio de los días con dato: referencia punteada con etiqueta directa
          { type: "line", label: "Promedio", data: dias.map((f) => (f <= m.hasta ? met.promedio(m) : null)),
            borderColor: c.muted, borderWidth: 1, borderDash: [4, 4], pointRadius: 0, pointHitRadius: 0, order: 0 },
        ],
      },
      plugins: [ETIQUETA_PROMEDIO],
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 6 } },
          y: ejeY({ beginAtZero: true, ticks: { maxTicksLimit: 4, callback: met.eje } }),
        },
        plugins: {
          legend: { display: false },
          etiquetaPromedio: { texto: `prom. ${met.prom(met.promedio(m))}`, color: c.muted },
          tooltip: {
            filter: (i) => i.parsed.y != null && i.datasetIndex === 0,
            callbacks: {
              title: (i) => fechaLarga(dias[i[0].dataIndex]),
              label: (i) => ` ${i.dataset.label}: ${met.valor(i.parsed.y)}`,
            },
          },
        },
      },
    });
  }

  /** Plugin: etiqueta directa al final de la línea de promedio ("prom. 11.872"). */
  const ETIQUETA_PROMEDIO = {
    id: "etiquetaPromedio",
    afterDatasetsDraw(chart) {
      const op = chart.options.plugins.etiquetaPromedio;
      const meta = chart.getDatasetMeta(1);
      if (!op || !meta?.data.length) return;
      const pts = meta.data.filter((p, i) => chart.data.datasets[1].data[i] != null);
      const fin = pts.at(-1);
      if (!fin) return;
      const t = tipografia();
      const { ctx } = chart;
      ctx.save();
      ctx.font = t.chico.canvas;
      ctx.fillStyle = op.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(op.texto, Math.min(fin.x + 6, chart.chartArea.right - ctx.measureText(op.texto).width), fin.y - 3);
      ctx.restore();
    },
  };

  Tablero.secciones.inicio = { render };
})();
