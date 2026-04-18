<?php

namespace App\Models;

use CodeIgniter\Model;

class DimensionModel extends Model
{
    protected $table            = 'dimensiones';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['nombre', 'orden'];
    protected $useTimestamps    = false;
}
