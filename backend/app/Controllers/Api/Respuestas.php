<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;
use App\Models\RespuestaModel;

class Respuestas extends ResourceController
{
    protected $modelName = RespuestaModel::class;
    protected $format    = 'json';

    public function index()
    {
        return $this->respond($this->model->findAll());
    }

    public function show($id = null)
    {
        $data = $this->model->find($id);
        if ($data) return $this->respond($data);
        return $this->failNotFound('Respuesta no encontrado.');
    }

    public function create()
    {
        $data = $this->request->getJSON(true);
        
        // Detect if it's a batch insertion (array of arrays)
        if (isset($data[0]) && is_array($data[0])) {
            if ($this->model->insertBatch($data)) {
                return $this->respondCreated(['status' => 'batch_created', 'count' => count($data)]);
            }
        } else {
            // Single insertion
            if ($this->model->insert($data)) {
                $data['id'] = $this->model->getInsertID();
                return $this->respondCreated($data);
            }
        }
        
        return $this->failValidationErrors($this->model->errors());
    }

    public function update($id = null)
    {
        $data = $this->request->getJSON(true);
        if ($this->model->update($id, $data)) {
            return $this->respond(['status' => 'actualizado', 'id' => $id]);
        }
        return $this->failValidationErrors($this->model->errors());
    }

    public function delete($id = null)
    {
        if ($this->model->delete($id)) {
            return $this->respondDeleted(['id' => $id]);
        }
        return $this->failNotFound('Error al eliminar.');
    }
}
