BTL - CCO

# 2026-04-18

1. Revisar porque el guardado de la encuesta (survey) está muy lenta.
2. Reduce el espaciado vertical de las respuestas en la encuesta. Cuando falte contestar reactivos que lo señale con un asterisco en rojo y que te posicione en el primer faltante. Que el botón de siguiente y anterior esten "sticky" en el fondo.
3. Revisa el script de importación del archivo de excel, ya que faltaron las preguntas de la hoja _Resultados_
4. Creame un modo de prueba en survey con una variable _bPrueba_, donde si es _true_ las respuestas estén contestadas, con valor 3. Para poder avanzar con el botón siguiente, hasta guardar la encuesta, ya que me tardo mucho contestando las preguntas en modo prueba.
5. Revisa el archivo _Diagnóstico Vacco 2023.pdf_ en la carpeta _contexto_ y modifica la sección de "Resultados y reortes" como sigue:
   Deja el diagrama de araña, en puntaje general y la tabla de resumen ejecutivo.
   Luego crea una tabla por dimensión y subdimensión, con checkboxes donde seleccion si se presenta la tabla y el gráfico por dimensión, y la tabla por participantes. Para que quede como en el pdf.
   Después de esas secciones, agrega el consolidado general como en el pdf, es una tabla por dimensión y subdimensión y sus puntajes, con totales por subdimensión y por dimensión y el gráfico correspondiente debe ser por subdimensión como en el pdf (linea 8)
   Después, dependiendo de lo seleccionado en los checkboxes se presentan las secciones correspondientes.

- Secciones por dimensión, donde se presenta la tabla por subdimensión y el histograma.
- Sección de respuestas por subdimensión y se presentan los resultados por participante (como en la pagina 13)
  La exportación del pdf dependerá de lo visible y estará en formato horizontal para que se pueda visualizar mejor.

6. No hay un botón para generar las gráficas una vez que se haga la selección de lo que se va a visualizar. Solo hay un botón que dice "Generar reporte completo", en lugar de eso debe decir "Generar reporte" y se debe generar según lo seleccionado. Haz la sección "Configuración del reporte" que sea tipo acordeón. Y que cada "Dimensión" también sea acordeon. (Que no esté seleccionada de manera predeterminada la opcion de "Detalle participantes")
   Siempre utiliza tu skills de ux_ui y senior_web para que puedas presentar una interfaz amigable y funcional.

7. Revisa los titulos en los acordeones, pues en las subdimensiones no se ven las letras. Reduce el espaciado vertical en el acordeon de personalización, no es necesario que aparezca la leyenda "Subdimensión/" en los títulos de los acordeones. Agrega un "triangulo" o "flecha" para que se vea que es un acordeón.
   De manera predeterminada se debe ver la gráfica de araña, la puntuación y el consolidado general.
   Y debajo de eso debe estar el acordeón de "Configuración del reporte".
   El botón de generar reporte, marcar todo y limpiar déjalos fuera del acordeón.

8. Elimina los espaciados verticales para que no ocupen mucho espacio, igual las gráficas reduce el thickness al tamaño de la letra, para aprovechar espacios, y en el pdf no tiene que exportar toda la pagina, solo las gráficas generadas.

9. No se ven los gráficos en el pdf, y la tabla de detalle por participante no se ve. Quita un poco más de especio vertical en las tablas y en los gráficos que tengan aun mucho espacio.

# 2026-04-16

1. En la pantalla de _Lanzar encuesta_ el botón de Abrir enlace debe ser copiar enlace. Al ingresar al sistema con el correo del empleado debe lanzar la encuesta para dicho empleado.

# 2026-04-15

Eres un experto analista programador, te adjunto un archivo en excell donde están las métricas de una metodología de la empresa Grupo CCO. Y unos pdf de ejemplo de lo que se presenta a la empresa cliente de las evaluaciones correspondientes.

En la carpeta contexto se encuentran los archivos de la metodología. pdf y xlsx.
El objetivo es analizar el archivo xlsx para desarrollar una aplicación web en varias etapas.
Una donde se pueda aplicar la encuesta a empleados de las empresas que contraten a CCO , y otra un panel administrativo que genere una visualización de diagramas como en el pdf.

En el panel administrativo podrán darse de alta las empresas que contraten el servicio.
Por cada empresa se podrán crear grupos y empleados.
Se crearan encuestas para los grupos. Las encuestas podrán repetirse para medir avances.
El dashboard podrá consultar el resultado por empresa y por fecha. Como en el PDF y podrá hacer una exportacion en pdf.
Se podrán consultar los resultados de las encuestas por personas y podrá exportarse los resultados por encuesta también, para poder analizar las respuestas.

La aplicación WEB será para firebase, pero también se podrá usar localmente para hacer pruebas con xampp y mysql.

Separa los archivos de programas por capas: vistas, css, js, etc.
Usa el archivo coorporativo.css como estilo principal.

Utiliza cada skill para optimizar las tareas.
