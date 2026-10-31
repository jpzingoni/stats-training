// Pestaña Pádel: sesiones, carga, frecuencia cardíaca y zonas.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeY, estiloBarra } = Tablero.graficos;
  const { escapar } = Tablero.componentes;
  const { numero, duracion, fechaCorta, fechaLarga, suma } = Tablero.formato;

  function render(ctx) {
    const sesiones = ctx.actividades.filter((a) => a.categoria === "Pádel");
    const c = colores();

    renderFcMinutos(ctx, sesiones);

    Tablero.sesiones.tabla("tabla-padel", sesiones, [
      { titulo: "Fecha", valor: (a) => fechaLarga(a.fecha) },
      { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
      { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
      { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
      { titulo: "Calorías", num: true, valor: (a) => numero(a.calorias) },
    ], { vacio: "Sin sesiones de pádel en este período" });

    if (!sesiones.length) {
      ["g-padel-carga", "g-padel-fc", "g-padel-zonas"].forEach((id) => sinDatos(id, "Sin sesiones de pádel en este período"));
      return;
    }

    const etiquetas = sesiones.map((a) => fechaCorta(a.fecha));
    const titulo = (i) => `${fechaLarga(sesiones[i[0].dataIndex].fecha)} · ${duracion(sesiones[i[0].dataIndex].duracion_s)}`;
    const ejeX = { grid: { display: false }, ticks: { maxRotation: 0 } };

    grafico("g-padel-carga", {
      type: "bar",
      data: { labels: etiquetas, datasets: [{ label: "Carga", data: sesiones.map((a) => a.carga), ...estiloBarra(c.categoria["Pádel"]) }] },
      options: {
        scales: { x: ejeX, y: ejeY({ beginAtZero: true, title: { display: true, text: "HRSS" } }) },
        plugins: { legend: { display: false }, tooltip: { callbacks: { title: titulo, label: (i) => ` Carga: ${i.parsed.y} HRSS` } } },
      },
    });

    grafico("g-padel-fc", {
      type: "bar",
      data: {
        labels: etiquetas,
        datasets: [
          { label: "FC media", data: sesiones.map((a) => a.fc_media), ...estiloBarra(c.serie[0]) },
          { label: "FC máxima", data: sesiones.map((a) => a.fc_max), ...estiloBarra(c.serie[1]) },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: { x: ejeX, y: ejeY({ beginAtZero: true, title: { display: true, text: "ppm" } }) },
        plugins: { tooltip: { callbacks: { title: titulo, label: (i) => ` ${i.dataset.label}: ${i.parsed.y} ppm` } } },
      },
    });

    const zonas = [0, 1, 2, 3, 4, 5, 6].map((z) => suma(sesiones, (a) => a.zonas_s[z]) / 60);
    const total = zonas.reduce((a, b) => a + b, 0) || 1;
    grafico("g-padel-zonas", {
      type: "bar",
      data: {
        labels: zonas.map((_, z) => `Z${z + 1}`),
        datasets: [{
          label: "Minutos", data: zonas, backgroundColor: c.zonas,
          borderRadius: { topRight: 4, bottomRight: 4 }, borderSkipped: "left", maxBarThickness: 22,
        }],
      },
      options: {
        indexAxis: "y",
        scales: {
          x: ejeY({ beginAtZero: true, title: { display: true, text: "minutos" } }),
          y: { grid: { display: false }, border: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (i) => ` ${numero(i.parsed.x)} min · ${numero((i.parsed.x / total) * 100)}% del tiempo` } },
        },
      },
    });
  }

  // ─── FC minuto a minuto de un partido ──────────────────────────────────────

  let partidoElegido = null;

  function renderFcMinutos(ctx, sesiones) {
    const sel = document.getElementById("padel-partido");
    const nota = document.getElementById("padel-fc-nota");
    const conMinutos = sesiones.filter((a) => ctx.todo.minutos?.[a.id]?.fc);
    if (!conMinutos.length) {
      sel.innerHTML = ""; nota.textContent = "";
      return sinDatos("g-padel-minutos", "Sin partidos con FC por minuto en este período");
    }
    if (!conMinutos.some((a) => a.id === partidoElegido)) partidoElegido = conMinutos.at(-1).id;   // el último
    sel.innerHTML = [...conMinutos].reverse().map((a) =>
      `<option value="${escapar(a.id)}"${a.id === partidoElegido ? " selected" : ""}>${fechaLarga(a.fecha)} · ${duracion(a.duracion_s)}</option>`).join("");
    sel.onchange = () => { partidoElegido = sel.value; renderFcMinutos(ctx, sesiones); };

    const m = ctx.todo.minutos[partidoElegido];
    const limites = ctx.meta.zonas_fc_carrera;                 // límite superior de Z1…Z7
    const zonaDe = (fc) => { const z = limites.findIndex((l) => fc <= l); return z === -1 ? limites.length - 1 : z; };
    const puntos = m.fc.map((fc, i) => ({ x: i + (m.seg?.[i] ?? 60) / 120, y: fc })).filter((p) => p.y != null);
    const minutosPorZona = limites.map(() => 0);
    m.fc.forEach((fc, i) => { if (fc != null) minutosPorZona[zonaDe(fc)] += (m.seg?.[i] ?? 60) / 60; });
    const altos = minutosPorZona.slice(2).reduce((x, y) => x + y, 0);
    const total = minutosPorZona.reduce((x, y) => x + y, 0) || 1;
    const pico = Math.max(...m.fc.filter((x) => x != null));
    nota.textContent = `${numero(altos)} de ${numero(total)} min en zona 3 o más (${numero((altos / total) * 100)} %) · pico de ${pico} ppm. ` +
      "Las bandas de fondo son tus zonas de FC.";

    const c = colores();
    grafico("g-padel-minutos", {
      type: "line",
      data: { datasets: [{ label: "FC", data: puntos, borderColor: c.categoria["Pádel"], backgroundColor: c.categoria["Pádel"],
        borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 8, tension: 0 }] },
      plugins: [Tablero.graficos.BANDAS_ZONAS],
      options: {
        interaction: { mode: "nearest", intersect: false, axis: "x" },
        scales: {
          x: { type: "linear", min: 0, max: Math.ceil(puntos.at(-1).x), grid: { display: false }, title: { display: true, text: "minutos desde el inicio" },
               ticks: { callback: (v) => (Number.isInteger(v) ? `${v}′` : "") } },
          y: ejeY({ suggestedMin: 80, suggestedMax: limites.at(-1), ticks: { callback: (v) => `${v} ppm` } }),
        },
        plugins: {
          legend: { display: false },
          bandasZonas: { limites, colores: c.zonas },
          tooltip: { callbacks: {
            title: (i) => `Minuto ${Math.floor(i[0].parsed.x) + 1}`,
            label: (i) => ` FC: ${i.parsed.y} ppm · Z${zonaDe(i.parsed.y) + 1}`,
          } },
        },
      },
    });
  }

  Tablero.secciones.padel = { render };
})();
