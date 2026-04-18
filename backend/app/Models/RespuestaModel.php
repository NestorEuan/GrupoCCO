<?php

namespace App\Models;

use CodeIgniter\Model;

class RespuestaModel extends Model
{
    protected $table            = 'respuestas';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['periodo_encuesta_id', 'empleado_id', 'pregunta_id', 'valor_respuesta'];
    protected $useTimestamps    = false;
}
