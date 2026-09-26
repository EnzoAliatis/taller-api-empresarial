/**
 * Genera un reporte HTML a partir del JSON de `artillery run --output`.
 *
 * Artillery 2.x eliminó el comando `artillery report`, así que este script
 * lo reemplaza localmente.
 *
 * Uso: node scripts/reporte-artillery.js [entrada.json] [salida.html]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const entrada = process.argv[2] ?? 'reporte.json';
const salida = process.argv[3] ?? entrada.replace(/\.json$/, '') + '.html';

const { aggregate: total, intermediate: ventanas } = JSON.parse(readFileSync(entrada, 'utf8'));

const SLA_P99_MS = 200;
const SLA_MAX_ERROR_RATE = 1;

const c = total.counters;
const rt = total.summaries['http.response_time'] ?? {};
const rt2xx = total.summaries['http.response_time.2xx'] ?? {};
const rt4xx = total.summaries['http.response_time.4xx'] ?? {};

const errores = Object.entries(c)
  .filter(([k]) => k.startsWith('errors.'))
  .reduce((suma, [, v]) => suma + v, 0);
const solicitudes = c['http.requests'] ?? 0;
const tasaError = solicitudes ? (errores / solicitudes) * 100 : 0;

const inicio = ventanas[0]?.firstMetricAt ?? total.firstMetricAt;
const serie = ventanas.map((v) => {
  const s = v.summaries['http.response_time'] ?? {};
  return {
    t: Math.round(((v.lastMetricAt ?? v.period) - inicio) / 1000),
    rate: v.rates?.['http.request_rate'] ?? 0,
    c201: v.counters['http.codes.201'] ?? 0,
    c400: v.counters['http.codes.400'] ?? 0,
    p50: s.median ?? 0,
    p95: s.p95 ?? 0,
    p99: s.p99 ?? 0,
    max: s.max ?? 0,
  };
});

const fecha = new Date(total.firstMetricAt).toLocaleString('es-EC');
const ok = (cond) => (cond ? '<span class="ok">✔ OK</span>' : '<span class="fail">✘ FALLA</span>');
const fila = (nombre, s) =>
  `<tr><td>${nombre}</td><td>${s.min ?? '-'}</td><td>${s.median ?? '-'}</td><td>${s.p95 ?? '-'}</td><td>${s.p99 ?? '-'}</td><td>${s.max ?? '-'}</td><td>${s.mean ?? '-'}</td></tr>`;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reporte Artillery</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
  body { font-family: system-ui, sans-serif; margin: 0 auto; max-width: 1100px; padding: 24px 16px; color: #1f2937; background: #f9fafb; }
  h1 { margin-bottom: 4px; } .sub { color: #6b7280; margin-top: 0; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 20px 0; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
  .card .v { font-size: 28px; font-weight: 700; } .card .l { color: #6b7280; font-size: 13px; }
  .graf { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; background: #fff; }
  th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: right; } th:first-child, td:first-child { text-align: left; }
  th { background: #f3f4f6; } .ok { color: #047857; font-weight: 700; } .fail { color: #b91c1c; font-weight: 700; }
</style>
</head>
<body>
<h1>Reporte de estrés — Artillery</h1>
<p class="sub">Ejecución: ${fecha} · Duración: ${Math.round((total.lastMetricAt - total.firstMetricAt) / 1000)} s · Archivo: ${entrada}</p>

<div class="cards">
  <div class="card"><div class="v">${solicitudes}</div><div class="l">http.requests</div></div>
  <div class="card"><div class="v">${c['http.codes.201'] ?? 0}</div><div class="l">http.codes.201 (válidos)</div></div>
  <div class="card"><div class="v">${c['http.codes.400'] ?? 0}</div><div class="l">http.codes.400 (rechazo Zod)</div></div>
  <div class="card"><div class="v">${rt.p99 ?? '-'} ms</div><div class="l">http.response_time.p99</div></div>
  <div class="card"><div class="v">${tasaError.toFixed(2)} %</div><div class="l">Tasa de error (${errores})</div></div>
  <div class="card"><div class="v">${c['vusers.completed'] ?? 0}/${c['vusers.created'] ?? 0}</div><div class="l">VUsers completados</div></div>
</div>

<h2>Verificación del SLA (ensure)</h2>
<table>
  <tr><th>Criterio</th><th>Umbral</th><th>Obtenido</th><th>Resultado</th></tr>
  <tr><td>http.response_time.p99</td><td>&lt; ${SLA_P99_MS} ms</td><td>${rt.p99} ms</td><td>${ok(rt.p99 < SLA_P99_MS)}</td></tr>
  <tr><td>maxErrorRate</td><td>&lt; ${SLA_MAX_ERROR_RATE} %</td><td>${tasaError.toFixed(2)} %</td><td>${ok(tasaError < SLA_MAX_ERROR_RATE)}</td></tr>
  <tr><td>201 = 400 (cada payload corrupto rechazado)</td><td>iguales</td><td>${c['http.codes.201'] ?? 0} / ${c['http.codes.400'] ?? 0}</td><td>${ok(c['http.codes.201'] === c['http.codes.400'])}</td></tr>
</table>

<h2>Latencia (ms)</h2>
<table>
  <tr><th>Métrica</th><th>min</th><th>p50</th><th>p95</th><th>p99</th><th>max</th><th>media</th></tr>
  ${fila('http.response_time (total)', rt)}
  ${fila('http.response_time.2xx', rt2xx)}
  ${fila('http.response_time.4xx', rt4xx)}
</table>

<h2>Evolución en el tiempo</h2>
<div class="graf"><canvas id="lat"></canvas></div>
<div class="graf"><canvas id="rate"></canvas></div>
<div class="graf"><canvas id="codes"></canvas></div>

<script>
const serie = ${JSON.stringify(serie)};
const etiquetas = serie.map((p) => p.t + ' s');
const opciones = (titulo, eje) => ({
  responsive: true,
  plugins: { title: { display: true, text: titulo } },
  scales: { y: { beginAtZero: true, title: { display: true, text: eje } }, x: { title: { display: true, text: 'Tiempo transcurrido' } } },
});
new Chart(document.getElementById('lat'), {
  type: 'line',
  data: { labels: etiquetas, datasets: [
    { label: 'p50', data: serie.map((p) => p.p50) },
    { label: 'p95', data: serie.map((p) => p.p95) },
    { label: 'p99', data: serie.map((p) => p.p99) },
    { label: 'max', data: serie.map((p) => p.max), borderDash: [5, 5] },
  ] },
  options: opciones('Tiempo de respuesta por ventana de 10 s', 'ms'),
});
new Chart(document.getElementById('rate'), {
  type: 'line',
  data: { labels: etiquetas, datasets: [{ label: 'http.request_rate', data: serie.map((p) => p.rate), fill: true }] },
  options: opciones('Tasa de peticiones (calentamiento → saturación)', 'req/s'),
});
new Chart(document.getElementById('codes'), {
  type: 'bar',
  data: { labels: etiquetas, datasets: [
    { label: '201 Created', data: serie.map((p) => p.c201) },
    { label: '400 Bad Request (Zod)', data: serie.map((p) => p.c400) },
  ] },
  options: opciones('Códigos HTTP por ventana', 'respuestas'),
});
</script>
</body>
</html>
`;

writeFileSync(salida, html);
console.log(`📊 Reporte generado: ${salida}`);
