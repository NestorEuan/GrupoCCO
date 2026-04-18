const API_BASE_URL = 'http://localhost/nojochware/GrupoCCO/backend/public/api';

/**
 * Servicio base genérico para realizar peticiones REST al Backend CI4
 */
const ApiService = {
    async request(endpoint, method = 'GET', data = null) {
        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
            if (!response.ok) {
                console.error("Error en la petición:", response.status);
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error en ApiService.${method} /${endpoint}:`, error);
            throw error;
        }
    },

    // Métodos Genéricos
    async getAll(resource) {
        return this.request(resource, 'GET');
    },

    async getById(resource, id) {
        return this.request(`${resource}/${id}`, 'GET');
    },

    async create(resource, data) {
        return this.request(resource, 'POST', data);
    },

    async update(resource, id, data) {
        return this.request(`${resource}/${id}`, 'PUT', data);
    },

    async delete(resource, id) {
        return this.request(`${resource}/${id}`, 'DELETE');
    }
};

// Módulos Específicos Emulando Firebase Firestore / Collection logic
const CCOAPI = {
    empresas: {
        get: () => ApiService.getAll('empresas'),
        getById: (id) => ApiService.getById('empresas', id),
        add: (data) => ApiService.create('empresas', data),
        update: (id, data) => ApiService.update('empresas', id, data),
        delete: (id) => ApiService.delete('empresas', id)
    },
    grupos: {
        get: () => ApiService.getAll('grupos'),
        add: (data) => ApiService.create('grupos', data)
    },
    empleados: {
        get: () => ApiService.getAll('empleados'),
        add: (data) => ApiService.create('empleados', data)
    },
    dimensiones: {
        get: () => ApiService.getAll('dimensiones'),
    },
    subdimensiones: {
        get: () => ApiService.getAll('subdimensiones'),
    },
    preguntas: {
        get: () => ApiService.getAll('preguntas'),
    },
    encuestas: {
        get: () => ApiService.getAll('encuestas'),
    },
    respuestas: {
        get: () => ApiService.getAll('respuestas'),
        add: (data) => ApiService.create('respuestas', data)
    },
    periodosencuesta: {
        get: () => ApiService.getAll('periodosencuesta'),
        add: (data) => ApiService.create('periodosencuesta', data)
    }
};
