// Navegación Básica Sidebar
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('view-' + viewId).classList.add('active');
    document.getElementById('nav-' + viewId).classList.add('active');

    if (viewId === 'empresas') cargarEmpresas();
    if (viewId === 'grupos') {
        cargarGrupos();
        cargarEmpleados();
    }
    if (viewId === 'periodos') cargarPeriodos();
    if (viewId === 'resultados') initResultadosView();
    if (viewId === 'dashboard') cargarDashboardData();
}

// ==========================================
// EMPRESAS
// ==========================================
async function cargarEmpresas() {
    const tbody = document.querySelector('#table-empresas tbody');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    try {
        const empresas = await CCOAPI.empresas.get();
        tbody.innerHTML = '';
        if (empresas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay empresas registradas.</td></tr>';
            return;
        }
        empresas.forEach(emp => {
            tbody.innerHTML += `
                <tr>
                    <td>${emp.id}</td>
                    <td><strong>${emp.nombre}</strong></td>
                    <td>${emp.contacto || '-'}</td>
                    <td>${emp.creado_en || 'Reciente'}</td>
                    <td><button class="button-primary" style="background:#ef4444; padding:5px 10px;" onclick="eliminarEmpresa(${emp.id})">Eliminar</button></td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5">Error de conexión. Revise CORS o BD.</td></tr>';
    }
}

document.getElementById('formEmpresa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    try {
        await CCOAPI.empresas.add({
            nombre: document.getElementById('empNombre').value,
            contacto: document.getElementById('empContacto').value
        });
        document.getElementById('formEmpresa').reset();
        await cargarEmpresas();
    } catch (e) {
        alert("Error creando empresa: " + e.message);
    }
    btn.disabled = false;
});

async function eliminarEmpresa(id) {
    if (confirm("¿Seguro que quiere eliminar esta empresa?")) {
        await CCOAPI.empresas.delete(id);
        cargarEmpresas();
    }
}

// ==========================================
// GRUPOS Y EMPLEADOS
// ==========================================
async function cargarGrupos() {
    const tbody = document.querySelector('#table-grupos tbody');
    const selectEmpresa = document.getElementById('selEmpresa');
    const selectGrupoParaEmp = document.getElementById('selGrupoParaEmpleado');
    
    tbody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
    try {
        const grupos = await CCOAPI.grupos.get();
        const empresas = await CCOAPI.empresas.get();
        
        // Llenar select de creación de grupo
        selectEmpresa.innerHTML = '<option value="">Seleccione Empresa...</option>';
        empresas.forEach(emp => selectEmpresa.innerHTML += `<option value="${emp.id}">${emp.nombre}</option>`);

        // Llenar select para formulario de empleados
        selectGrupoParaEmp.innerHTML = '<option value="">Seleccione un Grupo...</option>';
        grupos.forEach(grupo => {
            const empNombre = empresas.find(e => parseInt(e.id) === parseInt(grupo.empresa_id))?.nombre || '';
            selectGrupoParaEmp.innerHTML += `<option value="${grupo.id}">${grupo.nombre} (${empNombre})</option>`;
        });

        // Dibujar tabla de Grupos
        tbody.innerHTML = '';
        grupos.forEach(grupo => {
            const empNombre = empresas.find(e => parseInt(e.id) === parseInt(grupo.empresa_id))?.nombre || `ID: ${grupo.empresa_id}`;
            tbody.innerHTML += `
                <tr>
                    <td>${grupo.id}</td>
                    <td>${empNombre}</td>
                    <td><strong>${grupo.nombre}</strong></td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="3">Error cargando grupos.</td></tr>';
    }
}

document.getElementById('formGrupo').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await CCOAPI.grupos.add({
            empresa_id: document.getElementById('selEmpresa').value,
            nombre: document.getElementById('grupoNombre').value
        });
        document.getElementById('formGrupo').reset();
        await cargarGrupos();
    } catch (e) { alert("Error creando grupo"); }
});

async function cargarEmpleados() {
    const tbody = document.querySelector('#table-empleados tbody');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const empleados = await CCOAPI.empleados.get();
        tbody.innerHTML = '';
        if(empleados.length === 0) tbody.innerHTML = '<tr><td colspan="4">No hay empleados registrados...</td></tr>';
        
        empleados.forEach(emp => {
            tbody.innerHTML += `
                <tr>
                    <td>${emp.id}</td>
                    <td>Grupo ${emp.grupo_id}</td>
                    <td>${emp.nombre}</td>
                    <td>${emp.email || '-'}</td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4">Error de conexión.</td></tr>';
    }
}

document.getElementById('formEmpleado').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await CCOAPI.empleados.add({
            grupo_id: document.getElementById('selGrupoParaEmpleado').value,
            nombre: document.getElementById('empEmpleadoNombre').value,
            email: document.getElementById('empEmpleadoEmail').value,
        });
        document.getElementById('formEmpleado').reset();
        await cargarEmpleados();
    } catch (e) { alert("Error creando empleado"); }
});


// ==========================================
// PERIODOS Y ASIGNACIÓN DE ENCUESTAS
// ==========================================
let cacheGrupos = []; // Para filtrado local
async function cargarPeriodos() {
    const tbody = document.querySelector('#table-periodos tbody');
    const selectEmpresa = document.getElementById('selEmpresaParaPeriodo');
    const selectGrupo = document.getElementById('selGrupoPeriodo');
    
    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';
    
    try {
        const periodos = await CCOAPI.periodosencuesta.get();
        const empresas = await CCOAPI.empresas.get();
        cacheGrupos = await CCOAPI.grupos.get();
        
        // 1. Poblar Dropdown de Empresas
        selectEmpresa.innerHTML = '<option value="">Seleccione Empresa...</option>';
        empresas.forEach(emp => {
            selectEmpresa.innerHTML += `<option value="${emp.id}">${emp.nombre}</option>`;
        });

        // 2. Event Listener para filtrar Grupos (solo si no existe)
        if (!selectEmpresa.dataset.listenerSet) {
            selectEmpresa.addEventListener('change', (e) => {
                const empId = e.target.value;
                if (!empId) {
                    selectGrupo.innerHTML = '<option value="">Seleccione Grupo...</option>';
                    selectGrupo.disabled = true;
                    return;
                }
                const filtrados = cacheGrupos.filter(g => parseInt(g.empresa_id) === parseInt(empId));
                selectGrupo.innerHTML = '<option value="">Seleccione Grupo...</option>';
                filtrados.forEach(g => {
                    selectGrupo.innerHTML += `<option value="${g.id}">${g.nombre}</option>`;
                });
                selectGrupo.disabled = false;
            });
            selectEmpresa.dataset.listenerSet = "true";
        }

        // 3. Renderizar Tabla
        tbody.innerHTML = '';
        if(periodos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay campañas iniciadas...</td></tr>';
            return;
        }

        periodos.forEach(p => {
            const grupo = cacheGrupos.find(g => parseInt(g.id) === parseInt(p.grupo_id));
            const empresa = grupo ? empresas.find(e => parseInt(e.id) === parseInt(grupo.empresa_id)) : null;
            
            const eNombre = empresa ? empresa.nombre : 'S/I';
            const gNombre = grupo ? grupo.nombre : `ID: ${p.grupo_id}`;
            const linkActivo = `survey.html?per=${p.id}&grupo=${p.grupo_id}`;

            const absoluteLink = window.location.origin + window.location.pathname.replace('admin.html', '') + linkActivo;

            tbody.innerHTML += `
                <tr>
                    <td>${eNombre}</td>
                    <td><strong>${gNombre}</strong></td>
                    <td>Encuesta ID: ${p.encuesta_id}</td>
                    <td>${p.fecha_inicio}</td>
                    <td><span class="badge ${p.activa == 1 ? 'badge-active' : ''}">${p.activa == 1 ? 'Activa' : 'Cerrada'}</span></td>
                    <td>
                        <button class="button-primary" style="padding:5px 10px; background-color: var(--color-accent); color: var(--color-secondary);" onclick="copyToClipboard('${absoluteLink}')">Copiar Enlace</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6">Error de comunicación.</td></tr>';
    }
}

// Lógica de filtrado para seguimiento
document.getElementById('filterPeriodos').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#table-periodos tbody tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});

document.getElementById('formPeriodo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    try {
        await CCOAPI.periodosencuesta.add({
            encuesta_id: document.getElementById('selEncuestaPeriodo').value,
            grupo_id: document.getElementById('selGrupoPeriodo').value,
            fecha_inicio: document.getElementById('fechaIncioPer').value,
            fecha_fin: '2026-12-31', 
            activa: 1
        });
        document.getElementById('formPeriodo').reset();
        document.getElementById('selGrupoPeriodo').disabled = true; // Reset state
        await cargarPeriodos();
    } catch (e) { 
        alert("Error iniciando encuesta"); 
    } finally {
        btn.disabled = false;
    }
});


// ==========================================
// PREGUNTAS / METODOLOGIA (ACORDEON Y SUBDIMENSIONES NORMALIZADAS)
// ==========================================
async function obtenerPreguntas() {
    const accContainer = document.getElementById('accordion-preguntas');
    accContainer.innerHTML = '<p>Conectando con DB y leyendo catálogo...</p>';
    try {
        const dimensiones = await CCOAPI.dimensiones.get();
        const subdimensiones = await CCOAPI.subdimensiones.get();
        const preguntas = await CCOAPI.preguntas.get();
        
        accContainer.innerHTML = '';
        
        if (!dimensiones || dimensiones.length === 0) {
            accContainer.innerHTML = '<p>Hubo un error o el catálogo está vacío en la Base de Datos.</p>';
            return;
        }

        dimensiones.forEach(dim => {
            const pregs = preguntas.filter(p => parseInt(p.dimension_id) === parseInt(dim.id));
            if(pregs.length === 0) return;

            // Agrupar preguntas usando el ID real de la subdimensión
            const subdims_agrupadas = {};
            pregs.forEach(p => {
                const sub_id = p.subdimension_id;
                if(!subdims_agrupadas[sub_id]) subdims_agrupadas[sub_id] = [];
                subdims_agrupadas[sub_id].push(p);
            });

            let preguntasHtml = '';
            for (let subIdVar in subdims_agrupadas) {
                // Conseguir el nombre de la subdimension consultando el objeto real `subdimensiones`
                const sObj = subdimensiones.find(s => parseInt(s.id) === parseInt(subIdVar));
                const nSub = sObj ? sObj.nombre : 'General';
                
                if(nSub !== 'General') {
                    preguntasHtml += `<li style="list-style:none; font-weight:bold; color:var(--color-primary); padding-top:15px; border-bottom:none;">${nSub}</li>`;
                }
                
                subdims_agrupadas[subIdVar].forEach(p => {
                    preguntasHtml += `<li>${p.texto_pregunta}</li>`;
                });
            }

            accContainer.innerHTML += `
                <details>
                    <summary>Dimensión ${dim.orden}: ${dim.nombre} <span>(${pregs.length} preguntas) ▼</span></summary>
                    <ul>
                        ${preguntasHtml}
                    </ul>
                </details>
            `;
        });

    } catch (e) {
        accContainer.innerHTML = '<p>Error: ¿Ejecutaste el database.sql en XAMPP?</p>';
    }
}

// INICIALIZACIÓN
async function cargarDashboardData() {
    try {
        const emp = await CCOAPI.empresas.get();
        const gru = await CCOAPI.grupos.get();
        const res = await CCOAPI.respuestas.get();
        document.getElementById('stat-empresas').innerText = emp.length || 0;
        document.getElementById('stat-grupos').innerText = gru.length || 0;
        document.getElementById('stat-respuestas').innerText = res.length || 0;
    } catch (e) {}
}

// Funciones de utilidad
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Enlace copiado al portapapeles: " + text);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

window.addEventListener('load', () => cargarDashboardData());
