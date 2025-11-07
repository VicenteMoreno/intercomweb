const socket = io();

let usuarios = [];
let claveConfig = '';
let nombreIntercom = '';

const listaBotones = document.getElementById("lista-botones");
const formConfig = document.getElementById("form-config");
const statusMsg = document.getElementById("mensaje-status");

// Volver a la página principal
document.getElementById("btn-principal").onclick = () => {
    window.location.href = "index.html";
};

// Pedir la configuración actual al backend
function cargarConfig() {
    socket.emit("pedir-config");
}
cargarConfig();

// Rellenar formulario con datos actuales
socket.on("config-actual", (data) => {
    usuarios = data.users;
    nombreIntercom = data.intercom_name;
    claveConfig = data.config_key;

    document.getElementById("intercom_name").value = nombreIntercom;
    document.getElementById("config_key").value = claveConfig;
    renderListaBotones();
});

// Render buttons editor
function renderListaBotones() {
    listaBotones.innerHTML = "";
    for (let i = 0; i < usuarios.length; i++) {
        const user = usuarios[i];
        const div = document.createElement("div");
        div.className = "config-user-row";
        // Primer botón: "Todos" es fijo y sólo se puede cambiar si lo quieres en el futuro
        if (i === 0) {
            div.innerHTML = `
                <span class="cuadro-azul">#0</span>
                <b>${user.name}</b>
                <span style="color:#3482d4;margin-left:12px;">(Botón global: comunicación a todos)</span>
            `;
        } else {
            div.innerHTML = `
                <label>
                    <input type="checkbox" class="activo-check" data-index="${i}" ${user.active ? 'checked' : ''}>
                    activo
                </label>
                <span class="cuadro-index">#${i}</span>
                <input type="text" maxlength="6" class="user-name-input" value="${user.name || ''}" data-index="${i}" placeholder="Nombre">
                <input type="text" maxlength="32" class="user-ip-input" value="${user.ip || ''}" data-index="${i}" placeholder="IP (xxx.xxx.xxx.xxx)">
            `;
        }
        listaBotones.appendChild(div);
    }
}

// Validación IP simple
function validaIP(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

// Al guardar el formulario
formConfig.onsubmit = (e) => {
    e.preventDefault();

    // Leer y validar campos generales
    const nuevoNombre = document.getElementById("intercom_name").value.trim();
    const nuevaClave = document.getElementById("config_key").value.trim();

    // Leer cada usuario
    for (let i = 1; i < usuarios.length; i++) {
        const activo = listaBotones.querySelector(`input.activo-check[data-index="${i}"]`).checked;
        const nombre = listaBotones.querySelector(`input.user-name-input[data-index="${i}"]`).value.trim();
        const ip = listaBotones.querySelector(`input.user-ip-input[data-index="${i}"]`).value.trim();

        if (activo && (!nombre || !validaIP(ip))) {
            statusMsg.textContent = `Corrige: botón #${i} requiere nombre e IP válida si está activo.`;
            statusMsg.style.color = "red";
            return;
        }
        usuarios[i].active = activo;
        usuarios[i].name = nombre.substring(0, 6); // Máx 6 caracteres
        usuarios[i].ip = ip;
    }

    // Nota: El primer botón "Todos" es fijo

    // Enviar datos al backend para guardar
    socket.emit("actualizar-config", {
        intercom_name: nuevoNombre,
        config_key: nuevaClave,
        users: usuarios
    });
    statusMsg.textContent = "Guardando...";
    statusMsg.style.color = "green";
};

// Mensaje tras guardar config
socket.on("config-guardada", () => {
    statusMsg.textContent = "Cambios guardados correctamente";
    statusMsg.style.color = "green";
    cargarConfig();
});

// Mensaje en caso de error
socket.on("config-error", msg => {
    statusMsg.textContent = msg;
    statusMsg.style.color = "red";
});

// Solicitar clave de configuración si deseas proteger acceso
// (En este ejemplo, podrías implementar una pantalla-prompt si hace falta)
