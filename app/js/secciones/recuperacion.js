// Pestaña Recuperación: FC en reposo, sueño y pasos.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeFechas, ejeY, tituloFecha, estiloBarra } = Tablero.graficos;
  const { kpis } = Tablero.componentes;
  const { numero, ts, fechaLarga, promedio } = Tablero.formato;

  function render(ctx) {
    const dias = ctx.bienestar;
    const conDato = dias.filter((d) => d.fc_reposo != null || d.sueno_horas != null || d.pasos != null);
    const c = colores();

    const aviso = document.getElementById("recuperacion-aviso");
    aviso.textContent = conDato.length < dias.length
      ? `Hay datos de reposo, sueño y pasos en ${conDato.length} de ${dias.length} días del período` +
        (conDato.length ? ` (desde el ${fechaLarga(conDato[0].fecha)}).` : ".") +
        " Los días sin dato quedan como huecos: no se completan."
      : "";

    const ultimo = (clave) => [...dias].reverse().find((d) => d[clave] != null)?.[clave];
    kpis("recuperacion-kpis", [
      { etiqueta: "FC en reposo (media 7 d)", valor: numero(ultimo("fc_reposo_m7")), unidad: "ppm" },
      { etiqueta: "Sueño (media 7 d)", valor: numero(ultimo("sueno_horas_m7"), 1), unidad: "h" },
      { etiqueta: "Puntaje de sueño medio", valor: numero(promedio(dias, (d) => d.sueno_puntaje)) },
      { etiqueta: "Pasos por día", valor: numero(promedio(dias, (d) => d.pasos)) },
    ]);

    const serie = (clave) => dias.map((d) => ({ x: ts(d.fecha), y: d[clave] }));
    const tiene = (clave) => dias.some((d) => d[clave] != null);
    const opciones = (unidad, formato = (v) => numero(v), extra = {}) => ({
      interaction: { mode: "index", intersect: false },
      scales: { x: ejeFechas(ctx.desde, ctx.hasta), y: ejeY({ grace: "10%", ...extra }) },
      plugins: {
        tooltip: {
          filter: (i) => i.parsed.y != null,
          callbacks: { title: tituloFecha, label: (i) => ` ${i.dataset.label}: ${formato(i.parsed.y)} ${unidad}` },
        },
      },
    });
    const media7 = (clave, color) => ({
      type: "line", label: "Media 7 días", data: serie(clave), borderColor: color, backgroundColor: color,
      pointRadius: 0, spanGaps: false, order: 0,
    });

    if (tiene("fc_reposo")) {
      grafico("g-fc-reposo", {
        type: "line",
        data: {
          datasets: [
            { label: "Diaria", data: serie("fc_reposo"), borderColor: c.serie[0], backgroundColor: c.serie[0],
              showLine: false, pointRadius: 3, order: 1 },
            media7("fc_reposo_m7", c.serie[1]),
          ],
        },
        options: opciones("ppm"),
      });
    } else sinDatos("g-fc-reposo");

    if (tiene("sueno_horas")) {
      grafico("g-sueno", {
        type: "bar",
        data: {
          datasets: [
            { label: "Diaria", data: serie("sueno_horas"), ...estiloBarra(c.serie[0]), order: 1 },
            media7("sueno_horas_m7", c.serie[1]),
          ],
        },
        options: opciones("h", (v) => numero(v, 1), { beginAtZero: true }),
      });
    } else sinDatos("g-sueno");

    if (tiene("sueno_puntaje")) {
      grafico("g-sueno-puntaje", {
        type: "line",
        data: { datasets: [{ label: "Puntaje", data: serie("sueno_puntaje"), borderColor: c.serie[0], backgroundColor: c.serie[0], spanGaps: false }] },
        options: { ...opciones(""), plugins: { ...opciones("").plugins, legend: { display: false } } },
      });
    } else sinDatos("g-sueno-puntaje");

    if (tiene("pasos")) {
      grafico("g-pasos", {
        type: "bar",
        data: { datasets: [{ label: "Pasos", data: serie("pasos"), ...estiloBarra(c.serie[0]) }] },
        options: { ...opciones(""), plugins: { ...opciones("").plugins, legend: { display: false } } },
      });
    } else sinDatos("g-pasos");
  }

  Tablero.secciones.recuperacion = { render };
})();
