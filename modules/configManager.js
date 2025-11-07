const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'configweb');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureConfig(filePath = CONFIG_FILE) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
        // Configuración inicial: 40 botones, el primero ("Todos") fijo y activo, resto vacíos (desactivados)
        const initialConfig = {
            intercom_name: "IntercomServidor",
            config_key: "1234",
            users: Array.from({ length: 40 }, (_, i) => ({
                index: i,
                name: i === 0 ? "Todos" : "",
                ip: "",
                active: i === 0 ? true : false
            }))
        };
        fs.writeFileSync(filePath, JSON.stringify(initialConfig, null, 2), 'utf-8');
    }
}

function loadConfig(filePath = CONFIG_FILE) {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        return null;
    }
}

function saveConfig(config, filePath = CONFIG_FILE) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    } catch (err) {
        return false;
    }
}

function getConfig() {
    ensureConfig();
    return loadConfig();
}

function updateConfig(newConfig) {
    return saveConfig(newConfig);
}

module.exports = {
    ensureConfig,
    loadConfig,
    saveConfig,
    getConfig,
    updateConfig,
    CONFIG_FILE,
    CONFIG_DIR
};
