<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// API Routes para CCO
$routes->group('api', ['namespace' => 'App\Controllers\Api'], static function ($routes) {
    // Manejo de Preflight CORS para cualquier ruta API
    $routes->options('(:any)', function () {
        return response()
            ->setHeader('Access-Control-Allow-Origin', '*')
            ->setHeader('Access-Control-Allow-Headers', '*')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
            ->setStatusCode(200);
    });

    $routes->resource('empresas');
    $routes->resource('grupos');
    $routes->resource('empleados');
    $routes->resource('dimensiones');
    $routes->resource('subdimensiones');
    $routes->resource('preguntas');
    $routes->resource('encuestas');
    $routes->resource('respuestas');
    $routes->resource('periodosencuesta');
});
