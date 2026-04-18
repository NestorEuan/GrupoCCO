<?php

namespace App\Models;

use CodeIgniter\Model;

class PeriodoEncuestaModel extends Model
{
    protected $table            = 'periodos_encuesta';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['grupo_id', 'encuesta_id', 'fecha_inicio', 'fecha_fin', 'activa'];
    protected $useTimestamps    = false;
}
