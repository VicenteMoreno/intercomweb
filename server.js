/**
 * Intercom Web - Backend principal del servidor
 * Sirve frontend, gestiona configuración, certificado, señalización WebRTC y presencia de usuarios.
 *
 * Estructura modular:
 *  - modules/configManager.js: gestión de archivo de configuración config.json
 *  - modules/certManager.js: gestión/generación de certificados
 *  - modules/intercom.js: API REST configuración y presencia
 *  - modules/rtcSignaling.js: señalización WebRTC y estados via Socket.io
 *
 * Archivos importantes (en /configweb):
 *  - config.json       : configuración principal del sistema  
 *  - cert.pem / key.pem: certificados HTTPS autofirmados
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const https = require('https');
const socketio = require('socket.io');

// Rutas y módulos
const CONFIG_DIR = path.join(__dirname, 'configweb');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const CERT_FILE = path.join(CONFIG_DIR, 'cert.pem');
const KEY_FILE = path.join(CONFIG_DIR, 'key.pem');

// Carga de módulos propios
const configManager = require('./modules/configManager');
const certManager = require('./modules/certManager');
const intercom = require('./modules/intercom');
const rtcSignaling = require('./modules/rtcSignaling');

// --- Inicialización de configuración y certificados ---

// Asegura que existe carpeta y archivo de configuración
configManager.ensureConfig(CONFIG_FILE);

// Genera certificados autofirmados si no existen (carpeta configweb)
const { key, cert } = certManager.ensureCertificates(KEY_FILE, CERT_FILE);

// --- Inicialización de Express y Socket.io ---

const app = express();

// Servir archivos estáticos del frontend desde /public
app.use(express.static(path.join(__dirname, 'public')));

// API REST para la configuración, protegida y modularizada
// Endpoint: /api/config
app.use('/api/config', intercom.router);

// Página de inicio para comprobar estado ("vivo")
app.get('/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

// --- Arranque del servidor HTTPS ---

const server = https.createServer({ key, cert }, app);
// Socket.io para señalización y presencia
const io = socketio(server, { /* Opcional: configuración */ });

// Inicializa la señalización y presencia WebRTC
rtcSignaling(io, configManager);

// Puerto HTTPS (443 recomendado, pero puedes ajustar según permisos del sistema)
const PORT = 443;

// Mensaje de arranque
server.listen(PORT, () => {
    console.log('--------------------------------------------------');
    console.log(`Servidor Intercom corriendo en https://localhost:${PORT}`);
    console.log(`Certificados: ${KEY_FILE}, ${CERT_FILE}`);
    console.log(`Archivo de configuración: ${CONFIG_FILE}`);
    console.log('Frontend estático en /public');
    console.log('API REST en /api/config');
    console.log('--------------------------------------------------');
});
