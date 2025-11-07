module.exports = function(io, configManager) {
    // Estado de usuarios presentes
    let userStates = Array(40).fill("ausente"); // "libre", "ocupado", "ausente"
    let socketsPerIp = {};

    function enviarEstadoGlobal() {
        const config = configManager.getConfig();
        io.emit("estado-usuarios", {
            usuarios: config.users,
            estados: userStates,
            intercom_name: config.intercom_name
        });
    }

    io.on("connection", (socket) => {
        // Registrar presencia
        socket.on("marcar-presente", ({ ip }) => {
            const config = configManager.getConfig();
            const idx = config.users.findIndex(u => u.ip === ip);
            if (idx > 0 && config.users[idx].active) {
                userStates[idx] = "libre";
                socketsPerIp[ip] = socket;
                io.emit("actualizar-presente", { index: idx });
                enviarEstadoGlobal();
            }
        });
        // Gestionar ausente cuando se desconecta
        socket.on("disconnect", () => {
            for (let ip in socketsPerIp) {
                if (socketsPerIp[ip] === socket) {
                    const config = configManager.getConfig();
                    const idx = config.users.findIndex(u => u.ip === ip);
                    if (idx > 0) {
                        userStates[idx] = "ausente";
                        io.emit("actualizar-ausente", { index: idx });
                        enviarEstadoGlobal();
                    }
                    delete socketsPerIp[ip];
                }
            }
        });

        // Gestión de comunicación entre usuarios (inicio/fin de llamada)
        socket.on("iniciar-comunicacion", ({ index }) => {
            userStates[index] = "ocupado";
            enviarEstadoGlobal();
        });
        socket.on("finalizar-comunicacion", ({ index }) => {
            userStates[index] = "libre";
            enviarEstadoGlobal();
        });

        // Integración con página de configuración
        socket.on("pedir-config", () => {
            const config = configManager.getConfig();
            socket.emit("config-actual", config);
        });
        socket.on("actualizar-config", (data) => {
            const res = configManager.updateConfig(data);
            if (res) {
                socket.emit("config-guardada");
                enviarEstadoGlobal();
            } else {
                socket.emit("config-error", "No se pudo guardar la configuración.");
            }
        });
    });
};
