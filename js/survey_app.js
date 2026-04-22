let currentDimensionIndex = 0;
let uiDimensions = [];
const bPrueba = true; // Set to true to auto-fill answers for testing

// Extracción de parámetros de URL (Ejemplo: survey.html?emp=1&per=1)
const urlParams = new URLSearchParams(window.location.search);
const EMPLEADO_ID = urlParams.get('emp') || 1; 
const PERIODO_ID = urlParams.get('per') || 1;

async function initSurvey() {
    const container = document.getElementById('survey-content-container');
    container.innerHTML = '<p>Cargando preguntas desde el servidor...</p>';
    
    try {
        const dimensiones = await CCOAPI.dimensiones.get();
        const subdimensiones = await CCOAPI.subdimensiones.get();
        const preguntas = await CCOAPI.preguntas.get();
        
        container.innerHTML = '';
        uiDimensions = [];

        // Agrupar preguntas por dimensión
        dimensiones.forEach((dim, index) => {
            const pregs = preguntas.filter(p => p.dimension_id == dim.id);
            if(pregs.length === 0) return;

            // Agrupar adentro por subdimension ID
            const subdims_agrupadas = {};
            pregs.forEach(p => {
                const sub_id = p.subdimension_id;
                if(!subdims_agrupadas[sub_id]) subdims_agrupadas[sub_id] = [];
                subdims_agrupadas[sub_id].push(p);
            });

            // Contenedor principal de la dimensión
            const dimDiv = document.createElement('div');
            dimDiv.className = 'dimension-section';
            dimDiv.id = `dim-${index}`;
            // Mostrar sólo el primero
            if(uiDimensions.length === 0) dimDiv.classList.add('active');

            dimDiv.innerHTML = `<h3 class="dimension-title">${index + 1}. ${dim.nombre}</h3>`;

            for(let subIdVar in subdims_agrupadas) {
                const sObj = subdimensiones.find(s => parseInt(s.id) === parseInt(subIdVar));
                const nSub = sObj ? sObj.nombre : 'General';

                if(nSub !== 'General') {
                    const subHeader = document.createElement('h4');
                    subHeader.innerText = nSub;
                    subHeader.style.color = "var(--color-primary)";
                    subHeader.style.marginTop = "20px";
                    dimDiv.appendChild(subHeader);
                }

                subdims_agrupadas[subIdVar].forEach(p => {
                    const qGroup = document.createElement('div');
                    qGroup.className = 'question-group';
                    qGroup.dataset.questionName = `q_${p.id}`;
                    
                    let radiosHtml = '';
                    for(let i=1; i<=6; i++) {
                        const checkedAttr = (typeof bPrueba !== 'undefined' && bPrueba && i === 3) ? 'checked' : '';
                        radiosHtml += `<label><input type="radio" name="q_${p.id}" value="${i}" required ${checkedAttr}>${i}</label>`;
                    }

                    qGroup.innerHTML = `
                        <span class="question-text">${p.texto_pregunta}</span>
                        <div class="rating-options">${radiosHtml}</div>
                    `;
                    dimDiv.appendChild(qGroup);
                });
            }
            
            container.appendChild(dimDiv);
            uiDimensions.push(dimDiv);
        });

        updateButtons();
    } catch(e) {
        container.innerHTML = '<p style="color:red;">Error conectando con la base de datos.</p>';
    }
}

function updateButtons() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');

    // Manejo btn Anterior
    if(currentDimensionIndex === 0) {
        btnPrev.style.display = 'none';
    } else {
        btnPrev.style.display = 'block';
    }

    // Manejo btn Siguiente / Finalizar
    if(currentDimensionIndex === uiDimensions.length - 1) {
        btnNext.style.display = 'none';
        btnSubmit.style.display = 'block';
    } else {
        btnNext.style.display = 'block';
        btnSubmit.style.display = 'none';
    }
}

function validateCurrentDimension() {
    const currentDiv = uiDimensions[currentDimensionIndex];
    const questionGroups = currentDiv.querySelectorAll('.question-group');
    let firstMissing = null;
    let isValid = true;

    questionGroups.forEach(group => {
        const name = group.dataset.questionName;
        const checked = group.querySelector(`input[name="${name}"]:checked`);
        
        if(!checked) {
            group.classList.add('has-error');
            isValid = false;
            if(!firstMissing) firstMissing = group;
        } else {
            group.classList.remove('has-error');
        }
    });

    if(!isValid && firstMissing) {
        firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return isValid;
}

window.nextDimension = function() {
    if(!validateCurrentDimension()) return;

    uiDimensions[currentDimensionIndex].classList.remove('active');
    currentDimensionIndex++;
    uiDimensions[currentDimensionIndex].classList.add('active');
    
    // Scroll al inicio del documento para reenfocar la vista del usuario
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateButtons();
};

window.prevDimension = function() {
    uiDimensions[currentDimensionIndex].classList.remove('active');
    currentDimensionIndex--;
    uiDimensions[currentDimensionIndex].classList.add('active');
    updateButtons();
};

document.getElementById('surveyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!validateCurrentDimension()) return;
    
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Guardando...";
    
    try {
        const formData = new FormData(e.target);
        const responses = [];

        for(let [name, value] of formData.entries()) {
            const preguntaId = name.replace('q_', '');
            responses.push({
                periodo_encuesta_id: PERIODO_ID,
                empleado_id: EMPLEADO_ID,
                pregunta_id: preguntaId,
                valor_respuesta: value
            });
        }

        // Ejecutar inserción masiva en una sola petición
        await CCOAPI.respuestas.add(responses);

        document.getElementById('survey-content-container').innerHTML = `
            <div style="text-align:center; padding: 40px 0;">
                <h2>¡Respuestas Registradas!</h2>
                <p>Tu información ha sido guardada con éxito en el servidor central de CCO.</p>
                <p>Puedes cerrar esta ventana.</p>
            </div>
        `;
        document.querySelector('.survey-footer').style.display = 'none';
        
    } catch (error) {
        alert("Error al enviar respuestas. Revise conexión a Base de Datos.");
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Finalizar Encuesta";
    }
});

// Arrancar al cargar la pagina
window.addEventListener('load', () => {
    initSurvey();
    
    // Escuchar cambios para quitar el error visual en tiempo real
    document.getElementById('survey-content-container').addEventListener('change', (e) => {
        if(e.target.type === 'radio') {
            const group = e.target.closest('.question-group');
            if(group) group.classList.remove('has-error');
        }
    });
});
