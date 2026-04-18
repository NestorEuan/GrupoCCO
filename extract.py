import pandas as pd

file_path = r'c:\Desarrollo\Proyectos\nojochware\GrupoCCO\contexto\Alejandra Ruiz.xlsx'
xls = pd.ExcelFile(file_path)

dimensions = {
    'Filosofía Organizacional': 1,
    'Estrategias Organizacionales': 2,
    'Enfoque a Cl Usua y Mdos': 3,
    'Recursos Humanos': 4,
    'Dis y Des de Prod Proc Servs': 5,
    'Procesos': 6,
    'Proveedores': 7,
    'Impacto Ambiental': 8,
    'Factores Psicosociales': 9,
    'Resiliencia y Gestión Entornos': 10
}

sql = '-- Desactivar revisión de llaves foráneas para poder hacer Truncate\n'
sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n'
sql += 'TRUNCATE TABLE encuestas;\n'
sql += 'TRUNCATE TABLE subdimensiones;\n'
sql += 'TRUNCATE TABLE preguntas;\n\n'
sql += '-- Insertar las preguntas desde el Excel considerando Tabla Sub-Dimensiones (encuesta_id = 1 por defecto)\n'
sql += "INSERT INTO encuestas (titulo, descripcion) VALUES ('Diagnóstico Inicial', 'Cuestionario base extraído del Excel');\n\n"
sql += '-- Inserción de tabla Subdimensiones\n'
sql += 'INSERT INTO subdimensiones (id, dimension_id, nombre, orden) VALUES \n'

subdimension_values = []
pregunta_values = []

subdimension_id_counter = 1

for sheet in xls.sheet_names:
    if sheet == 'Consolidado' or sheet == 'Resultados':
        continue
    
    for dim_key, dim_id in dimensions.items():
        enc_sheet = sheet.replace('ó', 'o').replace('í', 'i').replace('é', 'e').replace('á', 'a')
        enc_key = dim_key.replace('ó', 'o').replace('í', 'i').replace('é', 'e').replace('á', 'a')
        if enc_key[:10] in enc_sheet[:10] or dim_key in sheet:
            df = pd.read_excel(xls, sheet, header=None)
            questions = df.iloc[:, 0].dropna().tolist()
            
            order = 1
            # By default register a general subdimension for the dimension
            current_subdimension_name = 'General'
            subdimension_values.append(f"({subdimension_id_counter}, {dim_id}, '{current_subdimension_name}', 1)")
            current_subdimension_id = subdimension_id_counter
            subdimension_id_counter += 1
            
            for q in questions:
                q_str = str(q).strip()
                if not q_str or q_str == sheet or 'Total' in q_str:
                    continue
                # If it doesn't have a ')', it's likely a subdimension title (like "Liderazgo")
                if ')' not in q_str and len(q_str) < 60:
                    current_subdimension_name = q_str.replace("'", "''")
                    subdimension_values.append(f"({subdimension_id_counter}, {dim_id}, '{current_subdimension_name}', {order})")
                    current_subdimension_id = subdimension_id_counter
                    subdimension_id_counter += 1
                    continue
                
                # It's a question containing e.g. "a)"
                if ')' in q_str:
                    clean_q = q_str.replace("'", "''")
                    pregunta_values.append(f"(1, {dim_id}, {current_subdimension_id}, '{clean_q}', {order})")
                    order += 1

sql += ',\n'.join(subdimension_values) + ';\n\n'

sql += '-- Inserción de tabla Preguntas\n'
sql += 'INSERT INTO preguntas (encuesta_id, dimension_id, subdimension_id, texto_pregunta, orden) VALUES \n'
sql += ',\n'.join(pregunta_values) + ';\n\n'
sql += '-- Reactivar revisión de llaves foráneas\n'
sql += 'SET FOREIGN_KEY_CHECKS = 1;\n'

with open(r'c:\Desarrollo\Proyectos\nojochware\GrupoCCO\insert_preguntas.sql', 'w', encoding='utf-8') as f:
    f.write(sql)
print("Finished extracting with normalized subdimension table.")
