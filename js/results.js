/**
 * Lógica de Procesamiento y Visualización de Resultados - Grupo CCO
 * Versión Optimizada: Soporta configuración interactiva y desglose detallado.
 */

let radarChart = null;
let detailCharts = [];
let globalProcessedData = null;
let globalPeriodoId = null;
let globalRespuestas = [];
let globalEmpleados = [];

/**
 * Helper: Retorna etiqueta y color según el puntaje (Semáforo)
 */
function getMetadataEstado(promedio) {
    if (promedio <= 0) return { label: 'Sin Datos', color: '#94a3b8' };
    if (promedio < 3) return { label: 'Crítico', color: '#ef4444' }; // Rojo
    if (promedio < 4.5) return { label: 'En Desarrollo', color: '#f59e0b' }; // Naranja/Amarillo
    return { label: 'Fortaleza', color: '#10b981' }; // Verde
}

/**
 * Inicializa la vista de resultados (Poblar select de campañas)
 */
async function initResultadosView() {
    const select = document.getElementById('selPeriodoResultado');
    if (!select) return;
    select.innerHTML = '<option value="">Cargando campañas...</option>';
    try {
        const periodos = await CCOAPI.periodosencuesta.get();
        const empresas = await CCOAPI.empresas.get();
        const grupos = await CCOAPI.grupos.get();

        select.innerHTML = '<option value="">Seleccione Campaña/Periodo...</option>';
        if (periodos.length === 0) {
            select.innerHTML = '<option value="">No hay campañas registradas</option>';
            return;
        }

        periodos.forEach(p => {
            const g = grupos.find(gr => parseInt(gr.id) === parseInt(p.grupo_id));
            const e = g ? empresas.find(emp => parseInt(emp.id) === parseInt(g.empresa_id)) : null;
            const text = `${e ? e.nombre : 'S/I'} - ${g ? g.nombre : 'S/I'} - Iniciada: ${p.fecha_inicio}`;
            select.innerHTML += `<option value="${p.id}">${text}</option>`;
        });
    } catch (e) {
        console.error("Error initResultadosView:", e);
        select.innerHTML = '<option value="">Error de conexión</option>';
    }
}

/**
 * Calcula y prepara la configuración del reporte
 */
async function cargarDashboardResultados(periodoId) {
    if (!periodoId) return;
    globalPeriodoId = periodoId;
    
    const loading = document.getElementById('loading-results');
    loading.style.display = 'inline';
    
    try {
        const respuestas = await CCOAPI.respuestas.get();
        globalRespuestas = respuestas.filter(r => parseInt(r.periodo_encuesta_id) === parseInt(periodoId));
        
        if (globalRespuestas.length === 0) {
            alert("No se encontraron respuestas para esta campaña.");
            loading.style.display = 'none';
            return;
        }

        const dimensiones = await CCOAPI.dimensiones.get();
        const subdimensiones = await CCOAPI.subdimensiones.get();
        const preguntas = await CCOAPI.preguntas.get();
        globalEmpleados = await CCOAPI.empleados.get(); // Necesarios para la matriz

        // 1. Agrupación y Cálculo de Promedios por Dimensión/Subdimensión
        const resultadosDimen = dimensiones.map(dim => {
            const pregsDim = preguntas.filter(p => parseInt(p.dimension_id) === parseInt(dim.id));
            const pregsIds = pregsDim.map(p => parseInt(p.id));
            const respsDim = globalRespuestas.filter(r => pregsIds.includes(parseInt(r.pregunta_id)));
            
            const suma = respsDim.reduce((acc, curr) => acc + parseFloat(curr.valor_respuesta), 0);
            const promedio = respsDim.length > 0 ? (suma / respsDim.length) : 0;
            
            const subsDetalle = subdimensiones.filter(s => parseInt(s.dimension_id) === parseInt(dim.id)).map(sub => {
                const pregsSub = pregsDim.filter(p => parseInt(p.subdimension_id) === parseInt(sub.id));
                const subPregsIds = pregsSub.map(p => parseInt(p.id));
                const respsSub = respsDim.filter(r => subPregsIds.includes(parseInt(r.pregunta_id)));
                
                const sumaSub = respsSub.reduce((acc, curr) => acc + parseFloat(curr.valor_respuesta), 0);
                const promedioSub = respsSub.length > 0 ? (sumaSub / respsSub.length) : 0;
                
                return { id: sub.id, nombre: sub.nombre, promedio: promedioSub };
            });

            return {
                id: dim.id, orden: dim.orden, nombre: dim.nombre,
                promedio: promedio, count: respsDim.length, subdimensiones: subsDetalle
            };
        });

        resultadosDimen.sort((a, b) => a.orden - b.orden);
        globalProcessedData = resultadosDimen;

        // 2. Mostrar secciones base inmediatamente
        document.getElementById('seccion-global').style.display = 'block';
        document.getElementById('seccion-consolidado').style.display = 'block';
        document.getElementById('wrapper-configuracion').style.display = 'block';
        
        // 3. Renderizar métricas base
        renderGlobalMetrics(resultadosDimen);
        renderConsolidadoGeneral(resultadosDimen);
        
        // 4. Poblar configuración
        renderConfiguracionReporte(resultadosDimen);

    } catch (e) {
        console.error("Error cargarDashboardResultados:", e);
        alert("Ocurrió un error al procesar las métricas.");
    } finally {
        loading.style.display = 'none';
    }
}

function renderConfiguracionReporte(data) {
    const container = document.getElementById('container-config-acordion');
    container.innerHTML = '';
    
    data.forEach(dim => {
        const details = document.createElement('details');
        details.className = 'dim-accordion';
        
        const summary = document.createElement('summary');
        summary.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span style="font-weight:600;">${dim.orden}. ${dim.nombre}</span>
                <div class="cfg-row" onclick="event.stopPropagation()">
                    <label><input type="checkbox" class="cfg-dim-table" data-dim="${dim.id}" checked> Tabla</label>
                    <label><input type="checkbox" class="cfg-dim-chart" data-dim="${dim.id}" checked> Gráfico</label>
                </div>
            </div>
        `;
        
        const content = document.createElement('div');
        content.style.padding = '10px 15px';
        content.style.background = '#fff';
        
        let subHtml = `<table style="font-size:0.8rem; box-shadow:none; margin:0; border:1px solid #f1f5f9; width:100%;">
                        <thead style="background:#f8fafc;">
                            <tr>
                                <th style="color:#64748b; font-weight:600; padding:8px 12px;">Área de Evaluación</th>
                                <th style="text-align:center; color:#64748b; font-weight:600; padding:8px 12px;">Detalle Participantes</th>
                            </tr>
                        </thead>
                        <tbody>`;
        
        dim.subdimensiones.forEach(sub => {
            subHtml += `
                <tr>
                    <td style="color:#334155; padding:6px 12px; border-bottom:1px solid #f8fafc;">${sub.nombre}</td>
                    <td style="text-align:center; padding:6px 12px; border-bottom:1px solid #f8fafc;"><input type="checkbox" class="cfg-sub-part" data-sub="${sub.id}"></td>
                </tr>`;
        });
        
        subHtml += `</tbody></table>`;
        content.innerHTML = subHtml;
        
        details.appendChild(summary);
        details.appendChild(content);
        container.appendChild(details);
    });
    
    globalProcessedData = data;
}

function seleccionarTodoConfig(val) {
    document.querySelectorAll('#wrapper-configuracion input[type="checkbox"]').forEach(c => c.checked = val);
}

/**
 * Genera el reporte final basado en la selección
 */
function generarReporteConfigurado() {
    if (!globalProcessedData) return;
    
    // 1. Mostrar bloques principales
    document.getElementById('seccion-global').style.display = 'block';
    document.getElementById('seccion-consolidado').style.display = 'block';
    document.getElementById('detalle-por-dimension').style.display = 'block';
    document.getElementById('seccion-participantes').style.display = 'block';

    // 2. Renderizar Global y Ejecutivo (Siempre visibles)
    renderGlobalMetrics(globalProcessedData);

    // 3. Renderizar Consolidado General
    renderConsolidadoGeneral(globalProcessedData);

    // 4. Renderizar Detalle por Dimensión (Filtrado)
    renderDetalleDimensiones(globalProcessedData);

    // 5. Renderizar Matriz Participantes (Filtrado)
    renderMatrizParticipantes();

    // Scroll al inicio de los resultados
    document.getElementById('seccion-global').scrollIntoView({ behavior: 'smooth' });
}

function renderGlobalMetrics(data) {
    // Radar
    const ctxRadar = document.getElementById('chartRadarGlobal').getContext('2d');
    if (radarChart) radarChart.destroy();
    radarChart = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: data.map(d => d.nombre),
            datasets: [{
                label: 'Diagnóstico Actual',
                data: data.map(d => d.promedio.toFixed(2)),
                backgroundColor: 'rgba(42, 176, 184, 0.2)',
                borderColor: '#2ab0b8', borderWidth: 3, fill: true
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { min: 0, max: 6, beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });

    // Score General
    const validData = data.filter(d => d.promedio > 0);
    const avgGral = validData.length > 0 ? (validData.reduce((acc, curr) => acc + curr.promedio, 0) / validData.length) : 0;
    document.getElementById('score-general').innerText = avgGral.toFixed(2);
    const meta = getMetadataEstado(avgGral);
    const labelEl = document.getElementById('label-general');
    labelEl.innerText = meta.label;
    labelEl.style.backgroundColor = meta.color;

    // Tabla Resumen
    const tbody = document.querySelector('#table-resumen-dimensiones tbody');
    tbody.innerHTML = '';
    data.forEach(d => {
        const m = getMetadataEstado(d.promedio);
        tbody.innerHTML += `<tr><td>${d.orden}</td><td><strong>${d.nombre}</strong></td><td>${d.promedio.toFixed(2)}</td><td><span class="badge" style="background:${m.color}; color:#fff;">${m.label}</span></td></tr>`;
    });
}

function renderConsolidadoGeneral(data) {
    const container = document.getElementById('container-consolidado');
    let html = `<table><thead><tr><th>Dimensión / Subdimensión</th><th>Promedio</th><th>Estado</th></tr></thead><tbody>`;
    
    data.forEach(dim => {
        const mDim = getMetadataEstado(dim.promedio);
        html += `<tr style="background:#f1f5f9; font-weight:bold;"><td>${dim.nombre}</td><td>${dim.promedio.toFixed(2)}</td><td>${mDim.label}</td></tr>`;
        dim.subdimensiones.forEach(sub => {
            html += `<tr><td style="padding-left:40px;">- ${sub.nombre}</td><td>${sub.promedio.toFixed(2)}</td><td>${getMetadataEstado(sub.promedio).label}</td></tr>`;
        });
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderDetalleDimensiones(data) {
    const container = document.getElementById('detalle-por-dimension');
    container.innerHTML = '';
    detailCharts.forEach(c => c.destroy());
    detailCharts = [];

    data.forEach(dim => {
        const showTable = document.querySelector(`.cfg-dim-table[data-dim="${dim.id}"]`).checked;
        const showChart = document.querySelector(`.cfg-dim-chart[data-dim="${dim.id}"]`).checked;
        
        if (!showTable && !showChart) return;

        const div = document.createElement('div');
        div.className = 'metric-card';
        div.style.marginBottom = '40px';
        div.innerHTML = `<h3>${dim.orden}. ${dim.nombre}</h3><div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:15px;"></div>`;
        const content = div.querySelector('div');

        if (showChart) {
            const chartIdx = detailCharts.length;
            div.style.marginBottom = '15px'; // Más reducido
            content.innerHTML += `<div style="flex:1.5; min-width:300px; height:160px;"><canvas id="chart-dim-${dim.id}"></canvas></div>`;
            setTimeout(() => {
                const ctx = document.getElementById(`chart-dim-${dim.id}`).getContext('2d');
                detailCharts.push(new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: dim.subdimensiones.map(s => s.nombre),
                        datasets: [{ 
                            label: 'Puntaje', 
                            data: dim.subdimensiones.map(s => s.promedio.toFixed(2)), 
                            backgroundColor: '#1a3668',
                            barThickness: 14, // Más delgado
                            maxBarThickness: 16
                        }]
                    },
                    options: { 
                        indexAxis: 'y', 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        scales: { x: { min:0, max:6 } },
                        plugins: { legend: { display: false } }
                    }
                }));
            }, 0);
        }

        if (showTable) {
            content.innerHTML += `
                <div style="flex:1; min-width:250px;">
                    <table style="box-shadow:none; margin:0; border:1px solid #eee;">
                        <thead><tr><th>Sub-dimensión</th><th>Score</th></tr></thead>
                        <tbody>${dim.subdimensiones.map(s => `<tr><td>${s.nombre}</td><td>${s.promedio.toFixed(2)}</td></tr>`).join('')}</tbody>
                    </table>
                </div>`;
        }
        container.appendChild(div);
    });
}

/**
 * Helper para calcular promedios individuales por subdimensión
 */
function calcularPromedioPartSub(partId, subId, preguntas) {
    const pregsSub = preguntas.filter(p => parseInt(p.subdimension_id) === parseInt(subId));
    const pregsIds = pregsSub.map(p => parseInt(p.id));
    
    const resps = globalRespuestas.filter(r => 
        parseInt(r.empleado_id) === parseInt(partId) && 
        pregsIds.includes(parseInt(r.pregunta_id))
    );
    
    if (resps.length === 0) return 0;
    const suma = resps.reduce((acc, curr) => acc + parseFloat(curr.valor_respuesta), 0);
    return suma / resps.length;
}

/**
 * Matriz de participantes dividida cada 10 personas
 */
async function renderMatrizParticipantes() {
    const container = document.getElementById('container-participantes');
    container.innerHTML = '<p>Generando matriz de participantes...</p>';
    
    const subIdsToShow = Array.from(document.querySelectorAll('.cfg-sub-part:checked')).map(c => parseInt(c.dataset.sub));
    if (subIdsToShow.length === 0) {
        container.innerHTML = '<p class="text-muted">No se seleccionaron subdimensiones para el detalle individual.</p>';
        return;
    }

    try {
        const preguntas = await CCOAPI.preguntas.get();
        const resps = globalRespuestas || [];
        const idsParticipantesEnPeriodo = [...new Set(resps.map(r => parseInt(r.empleado_id)))];
        const participantes = (globalEmpleados || []).filter(e => idsParticipantesEnPeriodo.includes(parseInt(e.id)));

        if (participantes.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay participantes con respuestas en este periodo.</p>';
            return;
        }

        container.innerHTML = '';
        const chunkSize = 10;
        
        for (let i = 0; i < participantes.length; i += chunkSize) {
            const chunk = participantes.slice(i, i + chunkSize);
            let html = `<div style="margin-bottom:40px;"><h3>Bloque de Participantes ${i+1} a ${i+chunk.length}</h3>`;
            html += `<div style="overflow-x:auto;"><table style="font-size:0.75rem; border:1px solid #e2e8f0; box-shadow:none;">`;
            html += `<thead style="background:#f8fafc;"><tr><th>Subdimensión / Área</th>`;
            chunk.forEach(p => html += `<th style="text-align:center; min-width:80px;">${p.nombre.split(' ')[0]}</th>`); 
            html += `</tr></thead><tbody>`;

            globalProcessedData.forEach(dim => {
                dim.subdimensiones.forEach(sub => {
                    if (!subIdsToShow.includes(parseInt(sub.id))) return;
                    
                    const scores = chunk.map(part => calcularPromedioPartSub(part.id, sub.id, preguntas));
                    // Solo renderizar si al menos uno tiene score? No, renderizar todas las seleccionadas
                    
                    html += `<tr><td>${sub.nombre}</td>`;
                    scores.forEach(score => {
                        const color = score === 0 ? '#fff' : (score < 3 ? '#fee2e2' : (score > 4.5 ? '#dcfce7' : '#fef3c7'));
                        html += `<td style="text-align:center; background:${color}; font-weight:bold; border:1px solid #f1f5f9;">${score > 0 ? score.toFixed(1) : '-'}</td>`;
                    });
                    html += `</tr>`;
                });
            });

            html += `</tbody></table></div></div>`;
            container.innerHTML += html;
        }
    } catch (e) {
        console.error("Error renderMatrizParticipantes:", e);
        container.innerHTML = '<p style="color:red;">Error al generar matriz de participantes.</p>';
    }
}

