// Pestaña Resumen: visión general del período.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeFechas, ejeY, tituloFecha, estiloBarra } = Tablero.graficos;
  const { kpis, delta, escapar, mostrarTooltip, ocultarTooltip } = Tablero.componentes;
  const { numero, duracion, ts, fechaCorta, fechaLarga, lunesDe, sumarDias, suma, mesCorto } = Tablero.formato;

  const CATEGORIAS = ["Carrera", "Pádel", "Caminata", "Ciclismo", "Otras"];
  const categoria = (a) => (CATEGORIAS.includes(a.categoria) ? a.categoria : "Otras");
  const UMBRALES_CARGA = [1, 30, 60, 90, 120];   // HRSS: inicio de cada nivel del calendario

  function render(ctx) {
    renderKpis(ctx);
    renderForma(ctx);
    renderCalendario(ctx);
    renderVolumen(ctx);
    renderUltimas(ctx);
  }

  function totales(lista) {
    return {
      sesiones: lista.length,
      horas: suma(lista, (a) => a.duracion_s) / 3600,
      km: suma(lista.filter((a) => a.categoria === "Carrera"), (a) => a.distancia_m) / 1000,
      carga: suma(lista, (a) => a.carga),
    };
  }

  function renderKpis(ctx) {
    const t = totales(ctx.actividades);
    const p = ctx.actividadesAnteriores ? totales(ctx.actividadesAnteriores) : {};
    const per = ctx.etiquetaPeriodo;
    kpis("resumen-kpis", [
      { etiqueta: "Sesiones", valor: numero(t.sesiones), delta: delta(t.sesiones, p.sesiones, per) },
      { etiqueta: "Tiempo total", valor: numero(t.horas, 1), unidad: "h", delta: delta(t.horas, p.horas, per, (x) => `${numero(x, 1)} h`) },
      { etiqueta: "Km corridos", valor: numero(t.km, 1), unidad: "km", delta: delta(t.km, p.km, per, (x) => `${numero(x, 1)} km`) },
      { etiqueta: "Carga total", valor: numero(t.carga), unidad: "HRSS", delta: delta(t.carga, p.carga, per, (x) => numero(x)) },
    ]);
  }

  function renderForma(ctx) {
    const c = colores();
    const serie = (clave) => ctx.bienestar.filter((d) => d[clave] != null).map((d) => ({ x: ts(d.fecha), y: d[clave] }));
    const linea = (label, clave, color, extra = {}) =>
      ({ label, data: serie(clave), borderColor: color, backgroundColor: color, pointRadius: 0, ...extra });
    grafico("g-forma", {
      type: "line",
      data: {
        datasets: [
          linea("Fitness (CTL)", "ctl", c.serie[0]),
          linea("Fatiga (ATL)", "atl", c.serie[1]),
          linea("Forma", "forma", c.serie[2]),
        ],
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: { x: ejeFechas(ctx.desde, ctx.hasta), y: ejeY() },
        plugins: {
          tooltip: { callbacks: { title: tituloFecha, label: (i) => ` ${i.dataset.label}: ${numero(i.parsed.y, 1)}` } },
        },
      },
    });
  }

  function nivelCarga(carga) {
    if (!carga) return 0;
    let n = 0;
    UMBRALES_CARGA.forEach((u, i) => { if (carga >= u) n = i + 1; });
    return n;   // 0 = sin carga, 1…5
  }
  const colorNivel = (n) => (n === 0 ? "var(--rampa-vacio)" : `var(--rampa-${n + 1})`);

  function renderCalendario(ctx) {
    const cont = document.getElementById("calendario");
    const cargaPorDia = new Map(ctx.todo.bienestar.map((d) => [d.fecha, d.carga_dia]));
    const actPorDia = new Map();
    for (const a of ctx.actividades) {
      if (!actPorDia.has(a.fecha)) actPorDia.set(a.fecha, []);
      actPorDia.get(a.fecha).push(a);
    }

    const columnas = ['<div class="cal-dias"><span></span>' +
      ["L", "M", "X", "J", "V", "S", "D"].map((d, i) => `<span>${i % 2 === 0 ? d : ""}</span>`).join("") + "</div>"];
    let mesAnterior = null;
    for (let lunes = lunesDe(ctx.desde); lunes <= ctx.hasta; lunes = sumarDias(lunes, 7)) {
      const mes = mesCorto(sumarDias(lunes, 6));
      const etiqueta = mes !== mesAnterior ? mes : "";
      mesAnterior = mes;
      let celdas = "";
      for (let i = 0; i < 7; i++) {
        const f = sumarDias(lunes, i);
        if (f < ctx.desde || f > ctx.hasta) { celdas += '<div class="cal-celda fuera"></div>'; continue; }
        const carga = cargaPorDia.get(f) ?? 0;
        celdas += `<div class="cal-celda" tabindex="0" data-fecha="${f}" style="background:${colorNivel(nivelCarga(carga))}"
          aria-label="${fechaLarga(f)}: carga ${carga}"></div>`;
      }
      columnas.push(`<div class="cal-semana"><span class="cal-mes">${etiqueta}</span>${celdas}</div>`);
    }

    const leyenda = ["Sin carga", ...UMBRALES_CARGA.map((u, i) =>
      i < UMBRALES_CARGA.length - 1 ? `${u}–${UMBRALES_CARGA[i + 1] - 1}` : `${u}+`)]
      .map((txt, n) => `<span class="cal-celda" style="background:${colorNivel(n)}"></span><span class="txt">${txt}</span>`).join("");

    cont.innerHTML = columnas.join("");
    cont.nextElementSibling?.classList.contains("cal-leyenda") && cont.nextElementSibling.remove();
    cont.insertAdjacentHTML("afterend", `<div class="cal-leyenda">HRSS: ${leyenda}</div>`);

    const mostrar = (celda, x, y) => {
      const f = celda.dataset.fecha;
      if (!f) return;
      const acts = actPorDia.get(f) ?? [];
      const detalle = acts.length
        ? acts.map((a) => `${escapar(a.categoria)}${a.subtipo ? ` (${escapar(a.subtipo)})` : ""} · ${duracion(a.duracion_s)}`).join("<br>")
        : "Descanso";
      mostrarTooltip(`<strong>${fechaLarga(f)}</strong>Carga: ${numero(cargaPorDia.get(f) ?? 0)} HRSS<br>${detalle}`, x, y);
    };
    cont.onmouseover = (e) => mostrar(e.target, e.clientX, e.clientY);
    cont.onmouseout = ocultarTooltip;
    cont.onfocusin = (e) => { const r = e.target.getBoundingClientRect(); mostrar(e.target, r.right, r.top); };
    cont.onfocusout = ocultarTooltip;
  }

  function renderVolumen(ctx) {
    if (!ctx.semanas.length) return sinDatos("g-volumen");
    const c = colores();
    grafico("g-volumen", {
      type: "bar",
      data: {
        labels: ctx.semanas.map((s) => fechaCorta(s.inicio)),
        datasets: CATEGORIAS.filter((cat) => ctx.gruposVisibles.has(cat) && ctx.semanas.some((s) => s.por_categoria[cat])).map((cat) => ({
          label: cat,
          data: ctx.semanas.map((s) => (s.por_categoria[cat]?.duracion_s ?? 0) / 3600),
          ...estiloBarra(c.categoria[cat], true),
        })),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
          y: ejeY({ stacked: true, title: { display: true, text: "horas" } }),
        },
        plugins: {
          tooltip: {
            filter: (i) => i.parsed.y > 0,
            callbacks: {
              title: (i) => `Semana del ${i[0].label}`,
              label: (i) => ` ${i.dataset.label}: ${duracion(i.parsed.y * 3600)}`,
            },
          },
        },
      },
    });
  }

  function renderUltimas(ctx) {
    const c = colores();
    const lista = [...ctx.actividades].reverse().slice(0, 5);
    document.getElementById("ultimas").innerHTML = lista.length ? lista.map((a) => `
      <li>
        <span class="fecha">${fechaCorta(a.fecha)}</span>
        <span><span class="punto" style="background:${c.categoria[categoria(a)]}"></span>${escapar(a.categoria)}${a.subtipo ? ` · ${escapar(a.subtipo)}` : ""}</span>
        <span class="det">${duracion(a.duracion_s)}${a.distancia_m ? ` · ${numero(a.distancia_m / 1000, 1)} km` : ""}${a.carga != null ? ` · ${a.carga} HRSS` : ""}</span>
      </li>`).join("") : '<li class="vacio">Sin sesiones en este período</li>';
  }

  Tablero.secciones.resumen = { render };
})();
