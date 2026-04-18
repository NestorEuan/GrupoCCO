<?php

namespace App\Models;

use CodeIgniter\Model;

class EncuestaModel extends Model
{
    protected $table            = 'encuestas';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['titulo', 'descripcion'];
    protected $useTimestamps    = false;
}
