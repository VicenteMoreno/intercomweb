const express = require('express');
const configManager = require('./configManager');

const router = express.Router();

// Middleware de autenticación (clave de config)
function authConfig(req, res, next) {
    // Clave enviada por POST o GET (para demo simple: no robusto)
    const key = req.body?.config_key || req.query?.config_key;
    const config = configManager.getConfig();
    if (!key || key !== config.config_key) {
        return res.status(403).json({ error: 'Clave de configuración incorrecta.' });
    }
    next();
}

// API para obtener la configuración actual
router.get('/', (req, res) => {
    const config = configManager.getConfig();
    res.json(config);
});

// API para actualizar configuración
router.post('/update', authConfig, express.json(), (req, res) => {
    const newConfig = req.body;
    // Puedes validar aquí estructura de los datos
    if (!newConfig || !Array.isArray(newConfig.users)) {
        return res.status(400).json({ error: 'Datos inválidos.' });
    }
    const saved = configManager.updateConfig(newConfig);
    if (!saved) {
        return res.status(500).json({ error: 'No se pudo guardar la configuración.' });
    }
    res.json({ success: true });
});

module.exports = { router };
