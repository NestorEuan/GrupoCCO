<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;
use App\Models\EmpresaModel;

class Empresas extends ResourceController
{
    protected $modelName = EmpresaModel::class;
    protected $format    = 'json';

    // GET /api/empresas
    public function index()
    {
        return $this->respond($this->model->findAll());
    }

    // GET /api/empresas/{id}
    public function show($id = null)
    {
        $data = $this->model->find($id);
        if ($data) {
            return $this->respond($data);
        }
        return $this->failNotFound('Empresa no encontrada.');
    }

    // POST /api/empresas
    public function create()
    {
        $data = $this->request->getJSON(true);
        if ($this->model->insert($data)) {
            $data['id'] = $this->model->getInsertID();
            return $this->respondCreated($data);
        }
        return $this->failValidationErrors($this->model->errors());
    }

    // PUT /api/empresas/{id}
    public function update($id = null)
    {
        $data = $this->request->getJSON(true);
        if ($this->model->update($id, $data)) {
            return $this->respond(['status' => 'actualizado', 'id' => $id]);
        }
        return $this->failValidationErrors($this->model->errors());
    }

    // DELETE /api/empresas/{id}
    public function delete($id = null)
    {
        if ($this->model->delete($id)) {
            return $this->respondDeleted(['id' => $id]);
        }
        return $this->failNotFound('Error al eliminar la empresa.');
    }
}
