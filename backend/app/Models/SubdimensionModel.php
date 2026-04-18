<?php
namespace App\Models;
use CodeIgniter\Model;

class SubdimensionModel extends Model
{
    protected $table            = 'subdimensiones';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['dimension_id', 'nombre', 'orden'];
    protected $useTimestamps    = false;
}
