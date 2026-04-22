async function exportarPDF() {
    const select = document.getElementById('selPeriodoResultado');
    
    // 1. Validaciones previas
    if (!select.value) {
        alert("Por favor seleccione un periodo/campaña antes de exportar el reporte.");
        return;
    }

    const periodoTexto = select.options[select.selectedIndex].text;
    const timestamp = new Date().toISOString().split('T')[0];
    const element = document.querySelector('.main-content'); // Capturamos el contenido principal

    // 2. Activar modo exportación (CSS ocultará sidebar, filtros, etc.)
    document.body.classList.add('pdf-export-mode');

    // 3. Preparar encabezado temporal en el DOM real para que sea capturado
    const reportHeader = document.createElement('div');
    reportHeader.id = 'pdf-runtime-header';
    reportHeader.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 3px solid #1a3668; margin-bottom: 25px; padding-bottom: 15px;">
            <div>
                <h1 style="color:#1a3668; margin:0; font-size: 24px;">Reporte de Diagnóstico Organizacional</h1>
                <p style="color:#64748b; margin:5px 0 0 0; font-size: 14px;">Metodología de Evaluación Grupo CCO</p>
            </div>
            <div style="text-align:right;">
                <h2 style="color:#2ab0b8; margin:0;">Grupo CCO</h2>
                <p style="margin:0; font-size: 12px; color:#94a3b8;">Fecha de reporte: ${timestamp}</p>
            </div>
        </div>
        <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:30px; border-left: 5px solid #2ab0b8;">
            <p style="margin:0; font-size: 16px;"><strong>Campaña evaluada:</strong> ${periodoTexto}</p>
        </div>
    `;
    const resultsView = document.getElementById('view-resultados');
    resultsView.prepend(reportHeader);

    // 4. Configuración avanzada de html2pdf
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `Reporte_CCO_${periodoTexto.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true, 
            scrollY: 0,
            logging: false
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
        // Ejecutar conversión
        // Esperamos un momento para asegurar que el DOM se ajuste al modo exportación
        await new Promise(resolve => setTimeout(resolve, 500));
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("Ocurrió un error al intentar generar el PDF.");
    } finally {
        // 5. Limpieza: Restaurar UI y quitar encabezado
        document.body.classList.remove('pdf-export-mode');
        reportHeader.remove();
    }
}
