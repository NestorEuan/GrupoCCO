CREATE DATABASE IF NOT EXISTS grupocco_encuestas;
USE grupocco_encuestas;

DROP TABLE IF EXISTS respuestas;
DROP TABLE IF EXISTS periodos_encuesta;
DROP TABLE IF EXISTS preguntas;
DROP TABLE IF EXISTS encuestas;
DROP TABLE IF EXISTS subdimensiones;
DROP TABLE IF EXISTS dimensiones;
DROP TABLE IF EXISTS empleados;
DROP TABLE IF EXISTS grupos;
DROP TABLE IF EXISTS empresas;


CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contacto VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE
);

CREATE TABLE dimensiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    orden INT DEFAULT 0
);

CREATE TABLE subdimensiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dimension_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    orden INT DEFAULT 0,
    FOREIGN KEY (dimension_id) REFERENCES dimensiones(id) ON DELETE CASCADE
);
-- Dimensiones base a insertar: Filosofía Organizacional, Estrategias Organizacionales, etc.

CREATE TABLE encuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    encuesta_id INT NOT NULL,
    dimension_id INT NOT NULL,
    subdimension_id INT,
    texto_pregunta TEXT NOT NULL,
    orden INT DEFAULT 0,
    FOREIGN KEY (encuesta_id) REFERENCES encuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (dimension_id) REFERENCES dimensiones(id) ON DELETE CASCADE,
    FOREIGN KEY (subdimension_id) REFERENCES subdimensiones(id) ON DELETE CASCADE
);

-- Permite asignar una encuesta a un grupo específico en un periodo de tiempo.
CREATE TABLE periodos_encuesta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    encuesta_id INT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (encuesta_id) REFERENCES encuestas(id) ON DELETE CASCADE
);

CREATE TABLE respuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodo_encuesta_id INT NOT NULL,
    empleado_id INT NOT NULL,
    pregunta_id INT NOT NULL,
    valor_respuesta DECIMAL(5,2) NOT NULL, -- Normalmente del 1 al 5
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (periodo_encuesta_id) REFERENCES periodos_encuesta(id) ON DELETE CASCADE,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
);

-- Inserción de dimensiones base detectadas en el PDF/Excel
INSERT INTO dimensiones (nombre, orden) VALUES
('Filosofía Organizacional', 1),
('Estrategias Organizacionales', 2),
('Enfoque a Cl Usua y Mdos', 3),
('Recursos Humanos', 4),
('Dis y Des de Prod Proc Servs', 5),
('Procesos', 6),
('Proveedores', 7),
('Impacto Ambiental', 8),
('Factores Psicosociales', 9),
('Resiliencia y Gestión Entornos', 10),
('Resultados', 11);
-- Insertar las preguntas desde el Excel (encuesta_id = 1 por defecto)
INSERT INTO encuestas (titulo, descripcion) VALUES ('Diagnóstico Inicial', 'Cuestionario base extraído del Excel');

INSERT INTO preguntas (encuesta_id, dimension_id, texto_pregunta, orden) VALUES 
(1, 1, 'a) Existe un alto involucramiento de la Dirección y Gerencia en asumir, apoyar e implementar prácticas para la calidad, la excelencia de operación, la mejora continua, la disrupción de negocio y la innovación.', 1),
(1, 1, 'b) Las prácticas de liderazgo están implementadas en los diferentes niveles de la organización.', 2),
(1, 1, 'c) La Dirección y Gerencia se aseguran de cumplir con los requisitos legales, normativos y regulatorios vinculados a la organización.', 3),
(1, 1, 'd) La Dirección y Gerencia se aseguran de contribuir y/o gestionar la administración del cambio en la Organización de forma estratégica, observable, gradual y medible.', 4),
(1, 1, 'e) La Dirección y Gerencia se aseguran de integrar y gestionar las directrices de negocio encaminadas a mantener la cadena de valor del negocio de forma sustentable.', 5),
(1, 1, 'f) Cuenta la organización con descripción de la Misión, Visión, Valores.', 6),
(1, 1, 'g) Se enuncia, promueve y asegura el comportamiento ético en la organización (a través de por ejemplo un código de ética, o reglamento, o procedimientos, o normas).', 7),
(1, 1, 'h) Se cuenta con prácticas generalizadas para promover la Creatividad, Innovación y la Mejora Continua en la organización.', 8),
(1, 1, 'i) Se cuenta con mecanismos que se utilizan para obtener una comunicación efectiva en la organización.', 9),
(1, 2, 'a) Se cuenta con un proceso de planeación estratégica con un horizonte de al menos 3 años, contemplando diferentes escenarios de actuación con base a las variables internas y externas y se revisa anualmente.', 1),
(1, 2, 'b) En el proceso de planeación se revisan y actualizan los elementos de la filosofía organizacional', 2),
(1, 2, 'c) En el proceso de planeación se analiza la información sobre el sector y sus competidores principales (análisis competitivo), determinando brechas en productos y servicios en materia de precios, condiciones de venta, calidad, atributos, posibilidades de nuevos competidores y prácticas de negocio, tanto en la posición estratégica actual como en la futura de la Organización.', 3),
(1, 2, 'd) En el proceso de planeación se integra información relativa al desempeño de la organización: mercado, análisis competitivo, calidad, servicio, financiera, recurso humano, productividad, impacto ambiental.', 4),
(1, 2, 'e) En su proceso de planeación se incluyen las proyecciones socioeconómicas del entorno, así como las tendencias globales, al mediano y largo plazo.', 5),
(1, 2, 'f) En su proceso de planeación se integra la información de clientes: Se tiene identificado el tamaño del mercado, su participación y evolución.', 6),
(1, 2, 'g) En su proceso de planeación se integra la información relativa a proveedores, tales como: tendencia en precios, confiabilidad, logística, oferta, entre otros.', 7),
(1, 2, 'h) En la organización se tienen definidos los factores clave de éxito y se les da seguimiento.', 8),
(1, 2, 'i) En su proceso de planeación se incluye el análisis para el desarrollo de nuevos negocios (Diversificación / Disrupción).', 9),
(1, 2, 'j) A partir del proceso de planeación estratégica, la organización cuenta con prácticas utilizadas para la definición de los objetivos, metas (cuantificables) y planes de acción tácticos.', 10),
(1, 2, 'k) Se cuenta con modelo de negocio que incluye la determinación de ingresos, egresos, capital de trabajo, cálculo de inversiones, recurso humano y en su caso requerimiento de recursos financieros.', 11),
(1, 2, 'l) La organización cuenta con mecanismos para asegurar la efectiva ejecución de sus planes de acción tácticos y cumplimiento de metas.', 12),
(1, 2, 'm) En la organización se promueve y se ha protegido la creación de nuevos productos, servicios y/o marcas.', 13),
(1, 2, 'n) La organización cuenta con un mecanismo para la administración y gestión de los costos y gastos de la organización en cada uno de sus subsistemas organizacionales.', 14),
(1, 2, 'o) La organización cuenta con un mecanismo o mejores prácticas para mejorar la eficiencia de su proceso de producción / operación.', 15),
(1, 2, 'p) La organización cuenta con mejores prácticas para la administración y seguimiento del desempeño financiero y fiscal.', 16),
(1, 2, 'q) La organización cuenta con mejores prácticas para la administración de inventarios / almacenes / insumos.', 17),
(1, 2, 'r) La innovación de los productos, procesos y servicios está alineada a las estrategias de la organización.', 18),
(1, 2, 's) Se cuenta con una descripción clara de las necesidades y expectativas de los clientes, para planear la innovación de sus productos, procesos y servicios.', 19),
(1, 3, 'a) Se tienen identificados los segmentos de mercados / clientes / servicios / rentabilidad / estratificación de la cartera de clientes a través de prácticas de Inteligencia Comercial.', 1),
(1, 3, 'b) Se cuenta con una estrategia de mercadotecnia para atraer clientes y desarrollar nuevos mercados para posicionar a la organización en sus diferentes segmentos de mercados.', 2),
(1, 3, 'c) Se cuenta con métodos para identificar las necesidades actuales y futuras de los diferentes segmentos de mercados / clientes / servicios / rentabilidad. Incluyendo entre otros: precios, canales de distribución, términos y condiciones de venta.', 3),
(1, 3, 'd) La organización se asegura de cumplir con los requerimientos de los clientes / usuarios, previo a la contratación del producto y/o servicio.', 4),
(1, 3, 'e) La organización incorpora las necesidades y/o requerimientos de los clientes / usuarios a los procesos de negocio.', 5),
(1, 3, 'f) Se cuenta con un sistema integral de calidad enfocado a los clientes.', 6),
(1, 3, 'g) Se cuenta con un modelo y/o mejor práctica para establecer relaciones de negocio a largo plazo con los clientes.', 7),
(1, 3, 'h) Se cuenta con una descripción de los compromisos de calidad y servicio con los clientes / usuarios.', 8),
(1, 3, 'i) Se cuenta con un proceso para conocer el grado de satisfacción de los clientes / usuarios.', 9),
(1, 3, 'j) La organización incorpora la información de satisfacción de sus clientes / usuarios a los procesos de negocio.', 10),
(1, 3, 'k) Se cuenta con un proceso para asegurar la recuperación de los clientes / usuarios perdidos. (Postventa / Venta Cruzada)', 11),
(1, 3, 'l) Se cuenta con un proceso para asegurar la atención efectiva de sugerencias, quejas formales e informales.', 12),
(1, 4, 'a) Se cuenta con un Plan Estratégico de Recursos Humanos (PERH) a partir de los Objetivos Estratégicos de la Organización.', 1),
(1, 4, 'b) Se cuentan con mejores prácticas de Recursos Humanos en: Gestión Estratégica de RRHH, Administración de RRHH, Desarrollo de RRHH, Gestión de la Productividad de RRHH, Operación de RRHH y Relaciones Laborales.', 2),
(1, 4, 'c) A partir del plan estratégico y del análisis de los procesos son definidos los puestos, así como sus requerimientos en toda la organización.', 3),
(1, 4, 'd) Se cuenta con un proceso formal de captación, reclutamiento y selección y retención de talento humano alineado a los requerimientos estratégicos definidos.', 4),
(1, 4, 'e) Se cuenta con un proceso de inducción formal para el talento humano.', 5),
(1, 4, 'f) Se cuenta con un proceso para detectar las necesidades de capacitación y desarrollo enfocadas a las estrategias de la organización.', 6),
(1, 4, 'g) Se cuenta con programas de capacitación y desarrollo del talento humano.', 7),
(1, 4, 'h) Se cuenta con un proceso de evaluación y/o gestión del desempeño y retroalimentación del talento humano.', 8),
(1, 4, 'i) Se cuenta con mecanismos de reconocimiento y compensación al talento humano alineados a la evaluación del desempeño y a la productividad.', 9),
(1, 4, 'j) Se cuenta con métodos para promover el involucramiento del talento humano en el logro de los objetivos, tanto en forma individual como grupal.', 10),
(1, 4, 'k) Se cuenta con prácticas para asegurar que las condiciones de trabajo sean adecuadas y acordes a normativas aplicables a su organización: seguridad e higiene industrial', 11),
(1, 4, 'l) Se cuenta con mecanismos para evaluar la satisfacción del talento humano.', 12),
(1, 4, 'm) Se cuenta con mecanismos que contribuyen a fomentar el bienestar del talento humano.', 13),
(1, 5, 'a) Se cuenta con un proceso para el diseño y modificación de productos, procesos y /o servicios.', 1),
(1, 5, 'b) Se cuenta con mecanismos para verificar que el diseño de productos, procesos y/o servicios cumplan con los requerimientos del cliente y la normatividad aplicable previo a su liberación.', 2),
(1, 5, 'c) Se cuenta con mecanismos para asegurar que el nuevo diseño del producto, proceso y/o servicio esté libre de fallas durante su operación. Algunos medios pueden ser: simulaciones, pruebas, prototipos, modelaciones, entre otros.', 3),
(1, 5, 'd) Se cuenta con mecanismos para implementar y/o transferir los diseños de los productos, procesos y/o servicios a las áreas involucradas.', 4),
(1, 5, 'e) Se cuentan con mejores prácticas para la optimización de la operación / producción a través de la definición, documentación, análisis, actualización y/o mejora y comunicación de los procesos de negocio de la empresa.', 5),
(1, 6, 'a) Se cuenta con clara definición del Macroproceso Organización incluyendo sus indicadores de desempeño.', 1),
(1, 6, 'b) Se cuenta con clara definición de los procesos básicos en la organización incluyendo sus indicadores de desempeño.', 2),
(1, 6, 'c) Se cuenta con un proceso establecido para el suministro, transporte, almacenaje y aprovechamiento óptimo de los insumos.', 3),
(1, 6, 'd) Se cuenta con equipo e instalaciones adecuadas para la operación, así como un programa de mantenimiento que asegure su integridad, operación y seguridad en uso.', 4),
(1, 6, 'e) Se cuenta con sistemas de operación que asegure: flexibilidad, minimice desperdicios y retrabajos, reduzca tiempo de ciclos, aumente la productividad del personal y activos.', 5),
(1, 6, 'f) Se cuenta con procesos para la administración y control de la documentación de la operación, tales como: facturación, órdenes de compra, registros de operación, pólizas contables, entre otros.', 6),
(1, 6, 'g) Se cuenta con mecanismos de control de los procesos básicos.', 7),
(1, 6, 'h) Se utiliza la información generada por los mecanismos de control para asegurar que el desempeño de los procesos permita cumplir los requerimientos de diseño.', 8),
(1, 6, 'i) Se cuenta con métodos para evaluar, analizar y mejorar los procesos', 9),
(1, 6, 'j) Se cuenta con prácticas para asegurar la continuidad de los procesos en situaciones de contingencia en los que pueda verse interrumpido el proceso, producto o servicio.', 10),
(1, 6, 'k) Se cuenta con mecanismos para mantener y proteger la información derivada de la administración y seguimiento de los procesos.', 11),
(1, 6, 'l) Se cuenta con mecanismos para mantener y proteger el conocimiento tanto el de la operación, así como, el generado a partir de la Innovación y Mejora Continua en la organización.', 12),
(1, 7, 'a) Se cuenta con un proceso para la selección de sus proveedores basado en elementos objetivos como: confiabilidad, logística, disponibilidad y precio.', 1),
(1, 7, 'b) Se cuenta con mecanismos para asegurar que el producto / servicio solicitado cumple con los requerimientos y especificaciones establecidas dentro de los documentos o fichas técnicas establecidas; así como en su caso, los ciclos de vida correspondientes.', 2),
(1, 7, 'c) El proceso para evaluar y retroalimentar el desempeño de los proveedores se basa en el impacto sobre los procesos básicos.', 3),
(1, 7, 'd) Se cuenta con prácticas en donde se involucra a los proveedores para definir proyectos orientados a mejorar la competitividad mutua.', 4),
(1, 8, 'a) Se tienen identificados sus agentes contaminantes y/o responsabilidades ecológicas, derivadas de su operación.', 1),
(1, 8, 'b) Se cuenta con procedimientos para cumplir con sus responsabilidades ecológicas y para evitar la contaminación del entorno.', 2),
(1, 9, 'a) Se cuentan con procedimientos específicos para contrarrestar los efectos de acontecimientos traumáticos severos (Asaltos, accidentes, secuestros, lesiones, etc.)', 1),
(1, 9, 'b) Se cuenta con procedimientos para identificar a los colaboradores afectados por algún acontecimiento traumático', 2),
(1, 9, 'c) Se tienen identificados los puestos que requieren un esfuerzo físico o habilidad específica, además de que son informados a los colaboradores que los realizan desde su integración a la Organización.', 3),
(1, 9, 'd) Se cuenta con procedimientos para evitar y actuar si existe algún riesgo de accidente en el Trabajo.', 4),
(1, 9, 'e) Se cuenta con prácticas para fomentar una relación favorable con la comunidad Organizacional', 5),
(1, 9, 'f) Se promueve y difunde la filosofía de la organización con la comunidad.', 6),
(1, 9, 'g) Se cuenta con programas de prevención de violencia laboral dentro de la Organización', 7),
(1, 9, 'h) Se cuenta con programas de prevención y promoción de la Salud dentro de la Organización', 8),
(1, 9, 'i) Se cuenta con un descriptivo de puesto, en el que los Colaboradores saben exactamente cuáles son sus funciones y métricas de desempeño esperadas.', 9),
(1, 9, 'j) Se cuenta con procedimientos y controles para los Colaboradores que son responsables de activos de valor.', 10),
(1, 9, 'k) Se cuenta con mejores prácticas para fomentar una relación favorable entre colaboradores y la línea de mando', 11),
(1, 9, 'l) Se cuenta con programas de Capacitación orientados a los factores psicosociales definidos de acuerdo con las necesidades de los puestos y del entorno organizacional', 12),
(1, 9, 'm) Se cuenta con procesos formales de medición del desempeño de cada uno de los puestos y son informados a los Colaboradores mediante una sesión de retroalimentación', 13),
(1, 9, 'n) Se cuenta con procesos o mejores prácticas relacionadas a las jornadas de trabajo (horas extra, días de descanso, días festivos)', 14),
(1, 9, 'ñ) Se cuenta con procesos o mejores prácticas promocionadas por la Organización que contribuyan al bienestar familiar', 15),
(1, 9, 'o) Se cuenta con procedimientos y/o mejores prácticas para gestionar los planes de carrera de acuerdo con la productividad individual y colectiva', 16),
(1, 10, 'a) Se cuentan con procedimientos o mejores prácticas para actuar ante entornos imprevistos, complejos, ambiguos, frágiles o acontecimientos que impliquen un cambio Organizacional disruptivo.', 1),
(1, 10, 'b) Al encontrarse dentro de entornos imprevistos, complejos, ambiguos, frágiles o acontecimientos que impliquen un cambio Organizacional disruptivo, se cuentan con los procedimientos o mejores prácticas para determinar las mejoras y/o habilidades que necesitan los colaboradores para seguir realizando sus actividades de forma eficaz y eficiente.', 2),
(1, 10, 'c) Al encontrarse dentro de entornos imprevistos, complejos, ambiguos, frágiles o acontecimientos que impliquen un cambio Organizacional disruptivo, se cuentan con procedimientos o mejores prácticas de contención de factores psicosociales y/ salud organizacional.', 3),
(1, 10, 'd) Al encontrarse dentro de entornos imprevistos, complejos, ambiguos, frágiles o acontecimientos que impliquen un cambio Organizacional disruptivo, se realizan procedimientos o mejores prácticas para contener y/o fortalecer la Inteligencia Emocional de los colaboradores.', 4);
