// Vista "Este mes": la portada. Resume el mes (pasos, sueño, FC en reposo y actividades)
// y muestra un calendario chico con los días en que hubo actividad.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { kpis, escapar } = Tablero.componentes;
  const { GRUPOS, VAR_GRUPO, grupoDe, grafico, sinDatos, colores, ejeY, estiloBarra } = Tablero.graficos;
  const { numero, duracion, suma, promedio, sumarDias, lunesDe, fechaLarga,
    MESES_LARGOS, hoyLocal, sumarMes, ultimoDiaMes, nombreMes } = Tablero.formato;

  const estado = { mes: null, ctx: null, enlazado: false, metrica: null };
  const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

  function render(ctx) {
    estado.ctx = ctx;
    estado.limites = { min: ctx.meta.desde.slice(0, 7), max: hoyLocal().slice(0, 7) };
    if (!estado.mes) estado.mes = estado.limites.max;           // abre en el mes actual
    if (!estado.enlazado) {
      estado.enlazado = true;
      estado.metrica = leerMetrica();
      document.getElementById("inicio-metrica").addEventListener("click", (e) => {
        const b = e.target.closest("[data-metrica]");
        if (!b) return;
        estado.metrica = b.dataset.metrica;
        try { localStorage.setItem("inicio-metrica", estado.metrica); } catch { /* solo esta visita */ }
        renderDiario(estado.ctx, resumenMes(estado.ctx, estado.mes));
      });
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

  /** Números del mes: totales y promedios de bienestar (solo sobre los días con dato). */
  function resumenMes(ctx, mes) {
    const r = rangoMes(mes, ctx.meta.hasta);
    const enMes = (f) => f >= r.desde && f <= r.hasta;
    const dias = ctx.todo.bienestar.filter((d) => enMes(d.fecha));
    const conDato = (clave) => dias.filter((d) => d[clave] != null);
    const transcurridos = Math.round((Date.parse(r.hasta) - Date.parse(r.desde)) / 86400000) + 1;
    return {
      ...r, transcurridos,
      pasosTotal: suma(dias, (d) => d.pasos),
      pasosDias: conDato("pasos").length,
      pasosProm: promedio(dias, (d) => d.pasos),
      suenoProm: promedio(dias, (d) => d.sueno_horas),
      suenoDias: conDato("sueno_horas").length,
      fcProm: promedio(dias, (d) => d.fc_reposo),
      fcDias: conDato("fc_reposo").length,
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
    document.getElementById("inicio-rango").textContent = m.hasta < m.desde
      ? "Todavía no hay datos de este mes"
      : `Del ${fechaLarga(m.desde)} al ${fechaLarga(m.hasta)} · ${m.transcurridos} ${m.transcurridos === 1 ? "día" : "días"}`;
    document.getElementById("inicio-anterior").disabled = mes <= limites.min;
    document.getElementById("inicio-siguiente").disabled = mes >= limites.max;

    // Comparación con el mes anterior y cuántos días del mes tienen dato (hay días sin reloj)
    const pie = (dias, actual, anterior, formato) => {
      const cobertura = `${dias} de ${m.transcurridos} días con dato`;
      if (actual == null || anterior == null) return cobertura;
      const d = actual - anterior;
      const signo = d > 0 ? "+" : d < 0 ? "−" : "±";
      return `${cobertura} · ${signo}${formato(Math.abs(d))} vs. ${nombreAnt}`;
    };
    kpis("inicio-kpis", [
      { etiqueta: "Pasos del mes", valor: numero(m.pasosTotal), delta: `${m.pasosDias} de ${m.transcurridos} días con dato` },
      { etiqueta: "Pasos por día", valor: numero(m.pasosProm), unidad: "promedio",
        delta: pie(m.pasosDias, m.pasosProm, p?.pasosProm, (x) => numero(x)) },
      { etiqueta: "Sueño", valor: m.suenoProm != null ? horasMin(m.suenoProm) : "—", unidad: "promedio",
        delta: pie(m.suenoDias, m.suenoProm, p?.suenoProm, (x) => `${numero(x * 60)} min`) },
      { etiqueta: "FC en reposo", valor: numero(m.fcProm), unidad: "ppm promedio",
        delta: pie(m.fcDias, m.fcProm, p?.fcProm, (x) => `${numero(x, 1)} ppm`) },
    ]);

    renderActividades(m, p, nombreAnt);
    renderMiniCalendario(m);
    renderDiario(ctx, m);
  }

  /** 7.47 → "7 h 28 min" */
  function horasMin(h) {
    const min = Math.round(h * 60);
    return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
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

  function renderMiniCalendario(m) {
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
      const clases = ["mini-dia", acts.length && "activo", futuro && "futuro", f === hoy && "hoy"].filter(Boolean).join(" ");
      const detalle = acts.map((a) => `${a.categoria}${a.subtipo ? ` · ${a.subtipo}` : ""} (${duracion(a.duracion_s)})`).join(", ");
      const titulo = `${fechaLarga(f)}: ${futuro ? "sin datos todavía" : detalle || "sin actividad"}`;
      // Un punto por tipo de actividad del día, con su color
      const puntos = [...new Set(acts.map(grupoDe))].map((g) => `<i style="background:${VAR_GRUPO[g]}"></i>`).join("");
      celdas.push(`<span class="${clases}" title="${escapar(titulo)}" aria-label="${escapar(titulo)}">
        <b>${Number(f.slice(8, 10))}</b>${puntos ? `<span class="mini-puntos">${puntos}</span>` : ""}</span>`);
    }
    const cal = document.getElementById("inicio-mini-cal");
    cal.innerHTML = celdas.join("");
    // La fila de nombres + una fila por semana, repartiéndose el alto de la tarjeta
    const semanas = Math.ceil((celdas.length - DIAS.length) / 7);
    cal.style.gridTemplateRows = `auto repeat(${semanas}, minmax(0, 1fr))`;
  }

  /** Qué se puede ver en el gráfico diario (el selector Pasos / Sueño). */
  const METRICAS = {
    pasos: {
      titulo: "Pasos por día", etiqueta: "Pasos", clave: "pasos", promedio: (m) => m.pasosProm,
      eje: (v) => (v >= 1000 ? `${numero(v / 1000)} mil` : v),
      valor: (v) => `${numero(v)} pasos`,
    },
    sueno: {
      titulo: "Horas de sueño por día", etiqueta: "Sueño", clave: "sueno_horas", promedio: (m) => m.suenoProm,
      eje: (v) => `${v} h`,
      valor: (v) => horasMin(v),
    },
  };

  function leerMetrica() {
    try { return METRICAS[localStorage.getItem("inicio-metrica")] ? localStorage.getItem("inicio-metrica") : "pasos"; }
    catch { return "pasos"; }
  }

  /** Barras verticales: un día por barra. Los días sin dato quedan vacíos. */
  function renderDiario(ctx, m) {
    const met = METRICAS[estado.metrica];
    document.getElementById("inicio-grafico-titulo").textContent = met.titulo;
    for (const b of document.querySelectorAll("#inicio-metrica button")) {
      b.setAttribute("aria-pressed", String(b.dataset.metrica === estado.metrica));
    }
    const porDia = new Map(ctx.todo.bienestar.map((d) => [d.fecha, d[met.clave]]));
    const dias = [];
    for (let f = m.desde; f <= m.fin; f = sumarDias(f, 1)) dias.push(f);
    const valores = dias.map((f) => (f <= m.hasta ? porDia.get(f) ?? null : null));
    if (!valores.some((v) => v != null)) {
      return sinDatos("g-inicio-pasos", `Sin datos de ${met.etiqueta.toLowerCase()} este mes`);
    }
    const c = colores();
    grafico("g-inicio-pasos", {
      type: "bar",
      data: {
        labels: dias.map((f) => Number(f.slice(8, 10))),
        datasets: [
          { type: "bar", label: met.etiqueta, data: valores, ...estiloBarra(c.serie[0]), order: 1 },
          // Promedio de los días con dato, como referencia
          { type: "line", label: "Promedio", data: dias.map((f) => (f <= m.hasta ? met.promedio(m) : null)),
            borderColor: c.textoSec, borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, order: 0 },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 6 } },
          y: ejeY({ beginAtZero: true, ticks: { maxTicksLimit: 4, callback: met.eje } }),
        },
        plugins: {
          legend: { position: "top" },
          tooltip: {
            filter: (i) => i.parsed.y != null,
            callbacks: {
              title: (i) => fechaLarga(dias[i[0].dataIndex]),
              label: (i) => ` ${i.dataset.label}: ${met.valor(i.parsed.y)}`,
            },
          },
        },
      },
    });
  }

  Tablero.secciones.inicio = { render };
})();
