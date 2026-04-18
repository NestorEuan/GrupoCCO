import os

entities = [
    {'name': 'Grupo', 'table': 'grupos', 'fields': "['empresa_id', 'nombre']"},
    {'name': 'Empleado', 'table': 'empleados', 'fields': "['grupo_id', 'nombre', 'email']"},
    {'name': 'Dimension', 'table': 'dimensiones', 'fields': "['nombre', 'orden']"},
    {'name': 'Pregunta', 'table': 'preguntas', 'fields': "['encuesta_id', 'dimension_id', 'texto_pregunta', 'orden']"},
    {'name': 'Encuesta', 'table': 'encuestas', 'fields': "['titulo', 'descripcion']"},
    {'name': 'Respuesta', 'table': 'respuestas', 'fields': "['periodo_encuesta_id', 'empleado_id', 'pregunta_id', 'valor_respuesta']"},
    {'name': 'PeriodoEncuesta', 'table': 'periodos_encuesta', 'fields': "['grupo_id', 'encuesta_id', 'fecha_inicio', 'fecha_fin', 'activa']"}
]

base_path = r'c:\Desarrollo\Proyectos\nojochware\GrupoCCO\backend\app'

for entity in entities:
    # MODEL
    model_code = f"""<?php

namespace App\Models;

use CodeIgniter\Model;

class {entity['name']}Model extends Model
{{
    protected $table            = '{entity['table']}';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = {entity['fields']};
    protected $useTimestamps    = false;
}}
"""
    model_path = os.path.join(base_path, 'Models', f"{entity['name']}Model.php")
    with open(model_path, 'w', encoding='utf-8') as f:
        f.write(model_code)

    # CONTROLLER
    plural_name = entity['name'] + 's'
    if entity['name'] == 'Dimension': plural_name = 'Dimensiones'
    
    controller_code = f"""<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;
use App\Models\{entity['name']}Model;

class {plural_name} extends ResourceController
{{
    protected $modelName = {entity['name']}Model::class;
    protected $format    = 'json';

    public function index()
    {{
        return $this->respond($this->model->findAll());
    }}

    public function show($id = null)
    {{
        $data = $this->model->find($id);
        if ($data) return $this->respond($data);
        return $this->failNotFound('{entity['name']} no encontrado.');
    }}

    public function create()
    {{
        $data = $this->request->getJSON(true);
        if ($this->model->insert($data)) {{
            $data['id'] = $this->model->getInsertID();
            return $this->respondCreated($data);
        }}
        return $this->failValidationErrors($this->model->errors());
    }}

    public function update($id = null)
    {{
        $data = $this->request->getJSON(true);
        if ($this->model->update($id, $data)) {{
            return $this->respond(['status' => 'actualizado', 'id' => $id]);
        }}
        return $this->failValidationErrors($this->model->errors());
    }}

    public function delete($id = null)
    {{
        if ($this->model->delete($id)) {{
            return $this->respondDeleted(['id' => $id]);
        }}
        return $this->failNotFound('Error al eliminar.');
    }}
}}
"""
    controller_path = os.path.join(base_path, 'Controllers', 'Api', f"{plural_name}.php")
    with open(controller_path, 'w', encoding='utf-8') as f:
        f.write(controller_code)

print("Models and Controllers generated successfully.")
