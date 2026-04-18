/**
 * Lógica de Autenticación y Redirección para Grupo CCO
 */

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const btn = event.target.querySelector('button');
    const originalText = btn.innerText;
    
    btn.disabled = true;
    btn.innerText = "Verificando acceso...";

    try {
        // Consultar la base de datos de empleados
        const empleados = await CCOAPI.empleados.get();
        
        // Buscar si el usuario ingresado coincide con un correo de empleado
        const empleado = empleados.find(e => e.email === username);

        if (empleado) {
            // El usuario es un empleado. Buscar si tiene una encuesta activa para su grupo.
            const periodos = await CCOAPI.periodosencuesta.get();
            const periodoActivo = periodos.find(p => 
                parseInt(p.grupo_id) === parseInt(empleado.grupo_id) && 
                parseInt(p.activa) === 1
            );

            if (periodoActivo) {
                // Redirigir directamente a la encuesta con sus parámetros
                console.log("Empleado detectado, lanzando encuesta...");
                window.location.href = `survey.html?per=${periodoActivo.id}&grupo=${periodoActivo.grupo_id}&emp=${empleado.id}`;
                return;
            } else {
                alert("Hola " + empleado.nombre + ". Actualmente no hay una encuesta activa programada para tu departamento.");
                btn.disabled = false;
                btn.innerText = originalText;
                return;
            }
        }

        // Si no es empleado, intentamos login administrativo (simulado)
        if (username.toLowerCase().includes('admin') || username === 'admin') {
            window.location.href = 'admin.html';
        } else {
            // Caso por defecto: Permitir entrar al admin si no se reconoce como empleado (para fines de desarrollo)
            // En producción aquí se validaría la contraseña.
            window.location.href = 'admin.html';
        }

    } catch (error) {
        console.error("Error en el proceso de login:", error);
        alert("Ocurrió un error al conectar con el servidor. Verifique que el backend esté corriendo.");
        btn.disabled = false;
        btn.innerText = originalText;
    }
}
