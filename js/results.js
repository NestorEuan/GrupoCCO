/**
 * Lógica de Procesamiento y Visualización de Resultados - Grupo CCO
 * Utiliza Chart.js para gráficos y aggregaciones locales.
 */

let radarChart = null;
let detailCharts = [];

/**
 * Inicializa la vista de resultados (Poblar select de campañas)
 */
async function initResultadosView() {
    const select = document.getElementById('selPeriodoResultado');
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
 * Calcula y renderiza el Dashboard de una campaña específica
 */
async function cargarDashboardResultados(periodoId) {
    if (!periodoId) return;
    
    const loading = document.getElementById('loading-results');
    loading.style.display = 'inline';
    
    try {
        // En un escenario real, el backend debería proveer este analytics.
        // Aquí lo calculamos "on the fly" para esta etapa inicial.
        const respuestas = await CCOAPI.respuestas.get();
        const periodRespuestas = respuestas.filter(r => parseInt(r.periodo_encuesta_id) === parseInt(periodoId));
        
        if (periodRespuestas.length === 0) {
            alert("No se encontraron respuestas para esta campaña. Asegúrese de que los empleados hayan completado la encuesta.");
            loading.style.display = 'none';
            return;
        }

        const dimensiones = await CCOAPI.dimensiones.get();
        const subdimensiones = await CCOAPI.subdimensiones.get();
        const preguntas = await CCOAPI.preguntas.get();

        // Agrupación y Cálculo de Promedios
        const resultadosDimen = dimensiones.map(dim => {
            // Preguntas de esta dimensión
            const pregsDim = preguntas.filter(p => parseInt(p.dimension_id) === parseInt(dim.id));
            const pregsIds = pregsDim.map(p => parseInt(p.id));
            
            // Respuestas vinculadas a estas preguntas en el periodo actual
            const respsDim = periodRespuestas.filter(r => pregsIds.includes(parseInt(r.pregunta_id)));
            
            const suma = respsDim.reduce((acc, curr) => acc + parseFloat(curr.valor_respuesta), 0);
            const promedio = respsDim.length > 0 ? (suma / respsDim.length) : 0;
            
            // Desglose por subdimensión
            const subsDetalle = subdimensiones.filter(s => parseInt(s.dimension_id) === parseInt(dim.id)).map(sub => {
                const pregsSub = pregsDim.filter(p => parseInt(p.subdimension_id) === parseInt(sub.id));
                const subPregsIds = pregsSub.map(p => parseInt(p.id));
                const respsSub = respsDim.filter(r => subPregsIds.includes(parseInt(r.pregunta_id)));
                
                const sumaSub = respsSub.reduce((acc, curr) => acc + parseFloat(curr.valor_respuesta), 0);
                const promedioSub = respsSub.length > 0 ? (sumaSub / respsSub.length) : 0;
                
                return {
                    id: sub.id,
                    nombre: sub.nombre,
                    promedio: promedioSub
                };
            });

            return {
                id: dim.id,
                orden: dim.orden,
                nombre: dim.nombre,
                promedio: promedio,
                respuestasCount: respsDim.length,
                subdimensiones: subsDetalle
            };
        });

        // Ordenar por el campo 'orden' si existe
        resultadosDimen.sort((a, b) => a.orden - b.orden);

        renderDashboard(resultadosDimen);

    } catch (e) {
        console.error("Error cargarDashboardResultados:", e);
        alert("Ocurrió un error al procesar las métricas.");
    } finally {
        loading.style.display = 'none';
    }
}

/**
 * Determina el estado visual (Semáforo) según el promedio
 */
function getMetadataEstado(promedio) {
    if (promedio === 0) return { label: 'S/I', color: '#94a3b8' };
    if (promedio < 3.0) return { label: 'Crítico', color: '#ef4444' };
    if (promedio <= 4.5) return { label: 'En Desarrollo', color: '#f59e0b' };
    return { label: 'Fortaleza', color: '#10b981' };
}

/**
 * Renderiza todos los componentes visuales del dashboard
 */
function renderDashboard(data) {
    // 1. Radar Global
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
                borderColor: '#2ab0b8',
                pointBackgroundColor: '#1a3668',
                pointBorderColor: '#fff',
                borderWidth: 3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 6,
                    beginAtZero: true,
                    ticks: { stepSize: 1, backdropColor: 'transparent' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 2. Score General (Promedio de promedios válidos)
    const validData = data.filter(d => d.promedio > 0);
    const avgGral = validData.length > 0 
        ? (validData.reduce((acc, curr) => acc + curr.promedio, 0) / validData.length) 
        : 0;
    
    const scoreEl = document.getElementById('score-general');
    const labelEl = document.getElementById('label-general');
    
    scoreEl.innerText = avgGral.toFixed(2);
    const metaGral = getMetadataEstado(avgGral);
    labelEl.innerText = metaGral.label;
    labelEl.style.backgroundColor = metaGral.color;
    labelEl.style.color = '#fff';

    // 3. Tabla Resumen Ejecutivo
    const tbody = document.querySelector('#table-resumen-dimensiones tbody');
    tbody.innerHTML = '';
    data.forEach(d => {
        const meta = getMetadataEstado(d.promedio);
        tbody.innerHTML += `
            <tr>
                <td>${d.orden || '-'}</td>
                <td><strong>${d.nombre}</strong></td>
                <td><span style="font-weight:bold; color:var(--color-primary);">${d.promedio.toFixed(2)}</span> / 6.00</td>
                <td><span class="badge" style="background:${meta.color}; color:#fff;">${meta.label}</span></td>
            </tr>
        `;
    });

    // 4. Detalle por Dimensión (Gráficos de Barras Horizontales)
    const containerDetalle = document.getElementById('detalle-por-dimension');
    containerDetalle.innerHTML = '<h2 style="margin-bottom:25px;">Desglose Detallado por Dimensión</h2>';
    
    // Limpiar charts anteriores de la memoria
    detailCharts.forEach(c => c.destroy());
    detailCharts = [];

    data.forEach(dim => {
        const card = document.createElement('div');
        card.className = 'metric-card';
        card.style.marginBottom = '30px';
        card.style.textAlign = 'left';
        card.innerHTML = `
            <h3>${dim.orden}. ${dim.nombre}</h3>
            <div style="display:flex; gap:30px; flex-wrap:wrap; margin-top:20px;">
                <div style="flex:1.5; min-width:350px; height:300px;">
                    <canvas id="canvas-dim-${dim.id}"></canvas>
                </div>
                <div style="flex:1; min-width:250px;">
                    <table style="box-shadow:none; margin:0; border:1px solid #e2e8f0;">
                       <thead style="background:#f8fafc;">
                           <tr><th style="color:var(--color-text); font-size:0.8rem;">Sub-dimensión / Área</th><th style="color:var(--color-text); font-size:0.8rem;">Score</th></tr>
                       </thead>
                       <tbody>
                           ${dim.subdimensiones.map(s => `
                               <tr>
                                   <td style="font-size:0.85rem;">${s.nombre}</td>
                                   <td style="font-weight:bold;">${s.promedio.toFixed(2)}</td>
                               </tr>
                           `).join('')}
                       </tbody>
                    </table>
                </div>
            </div>
        `;
        containerDetalle.appendChild(card);

        // Crear chart de barras para esta dimensión
        const ctxDim = document.getElementById(`canvas-dim-${dim.id}`).getContext('2d');
        const chartDim = new Chart(ctxDim, {
            type: 'bar',
            data: {
                labels: dim.subdimensiones.map(s => s.nombre),
                datasets: [{
                    label: 'Puntaje Obtenido',
                    data: dim.subdimensiones.map(s => s.promedio.toFixed(2)),
                    backgroundColor: '#1a3668',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { min: 0, max: 6, grid: { display: false } },
                    y: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
        detailCharts.push(chartDim);
    });
}
