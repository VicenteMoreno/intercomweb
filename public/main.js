const socket = io();

let usuarios = [];
let estados = [];
let miIp = null;

// Util para obtener dirección IP del usuario (solamente para mostrar presencia)
async function getLocalIP() {
    // Usar WebRTC para obtener ip local (solo para presencia)
    return new Promise(resolve => {
        let ipFound = null;
        const pc = new RTCPeerConnection({iceServers: []});
        pc.createDataChannel("");
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        pc.onicecandidate = evt => {
            if (!evt.candidate) return;
            let ip = /(\d+\.\d+\.\d+\.\d+)/.exec(evt.candidate.candidate);
            if (ip) ipFound = ip[1];
            pc.close();
            resolve(ipFound);
        };
        setTimeout(() => resolve(ipFound), 900);
    });
}

// Render de la botonera 5x8
function renderBotonera() {
    const botonera = document.getElementById("botonera");
    botonera.innerHTML = "";
    for (let i=0; i < usuarios.length; i++) {
        let user = usuarios[i];
        let btn = document.createElement("button");
        btn.classList.add("intercom-btn");
        // Botón azul, global
        if (i == 0) {
            btn.classList.add("btn-azul");
        } else if (!user.active) {
            btn.classList.add("btn-gris");
        } else if (estados[i] === "ocupado") {
            btn.classList.add("btn-rojo");
        } else if (estados[i] === "ausente") {
            btn.classList.add("btn-gris");
        } else {
            btn.classList.add("btn-verde");
        }
        btn.id = "btn-id-" + i;
        btn.textContent = user.name || `Usuario ${i}`;

        // Pulsación/click para iniciar/finalizar conversación (PTT o ON/OFF)
        if (user.active && miIp !== user.ip) {
            let pulsado = false;
            btn.addEventListener("mousedown", () => {
                pulsado = true;
                iniciarComunicacion(i, user);
                btn.classList.add("active");
            });
            btn.addEventListener("mouseup", () => {
                if (pulsado) {
                    finalizarComunicacion(i, user);
                    btn.classList.remove("active");
                    pulsado = false;
                }
            });
            btn.addEventListener("click", () => {
                // Pulsación breve: alterna conversación
                alternarComunicacion(i, user);
            });
            btn.addEventListener("mouseleave", () => {
                // Si se deja de pulsar
                if (pulsado) {
                    finalizarComunicacion(i, user);
                    btn.classList.remove("active");
                    pulsado = false;
                }
            });
        } else {
            btn.disabled = true;
        }

        botonera.appendChild(btn);
    }
}

// Manejadores de audio/conexión (simulación, para conectar con WebRTC)
function iniciarComunicacion(idx, user) {
    // TODO: señalizar inicio a WebRTC, cambiar estado local
    estados[idx] = "ocupado";
    renderBotonera();
    socket.emit("iniciar-comunicacion", {index: idx, ip: user.ip});
}
function finalizarComunicacion(idx, user) {
    // TODO: señalizar fin a WebRTC, cambiar estado local
    estados[idx] = "libre";
    renderBotonera();
    socket.emit("finalizar-comunicacion", {index: idx, ip: user.ip});
}
function alternarComunicacion(idx, user) {
    // Cambia entre "ocupado" y "libre"
    if (estados[idx] === "ocupado") {
        finalizarComunicacion(idx, user);
    } else {
        iniciarComunicacion(idx, user);
    }
}

// Recibe actualizaciones del servidor
socket.on("estado-usuarios", data => {
    usuarios = data.usuarios;
    estados = data.estados;
    document.getElementById("nombre-intercom").textContent = data.intercom_name;
    renderBotonera();
});

// Marcar presencia según IP (envía al server al entrar)
getLocalIP().then(ip => {
    miIp = ip;
    socket.emit("marcar-presente", { ip });
});

// Actualización de presencia en tiempo real
socket.on("actualizar-presente", data => {
    estados[data.index] = "libre";
    renderBotonera();
});
socket.on("actualizar-ausente", data => {
    estados[data.index] = "ausente";
    renderBotonera();
});

// Botón de configuración
document.getElementById("btn-configuracion").onclick = () => {
    window.location.href = "config.html";
};
