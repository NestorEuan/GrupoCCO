/**
 * Lógica de Exportación a PDF para Reportes de Grupo CCO
 * Utiliza la librería html2pdf.js
 */

async function exportarPDF() {
    const element = document.getElementById('view-resultados');
    const btn = document.querySelector('#view-resultados .btn-action');
    const select = document.getElementById('selPeriodoResultado');
    
    // 1. Validaciones previas
    if (!select.value) {
        alert("Por favor seleccione un periodo/campaña antes de exportar el reporte.");
        return;
    }

    const periodoTexto = select.options[select.selectedIndex].text;
    const timestamp = new Date().toISOString().split('T')[0];

    // 2. Preparar el DOM para la captura (ocultar controles de UI)
    const uiElements = document.querySelectorAll('#view-resultados .header-top, #view-resultados > div:nth-child(2)');
    uiElements.forEach(el => el.style.display = 'none');

    // 3. Insertar encabezado de marca temporal para el PDF
    const reportHeader = document.createElement('div');
    reportHeader.id = 'pdf-temp-header';
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
    element.prepend(reportHeader);

    // 4. Configuración de html2pdf
    const opt = {
        margin:       [15, 15, 15, 15],
        filename:     `Reporte_CCO_${periodoTexto.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            scrollY: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'], before: '.metric-card' }
    };

    try {
        btn.disabled = true;
        const originalText = btn.innerText;
        btn.innerText = "Preparando documento...";

        // Ejecutar conversión
        await html2pdf().set(opt).from(element).save();

        btn.innerText = originalText;
    } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("Ocurrió un error al intentar generar el PDF. Verifique que todos los recursos se hayan cargado correctamente.");
    } finally {
        // 5. Limpieza y Restauración de la UI
        reportHeader.remove();
        uiElements.forEach(el => el.style.display = '');
        btn.disabled = false;
    }
}
