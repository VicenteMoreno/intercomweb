# Instrucciones de instalación Intercom Web en un servidor Linux

## Requisitos previos

- **Ubuntu/Debian/CentOS/Fedora o similar**.
- Permisos de superusuario (sudo).
- **Node.js** (v18 o superior).
- Todas las máquinas cliente deben tener la IP del servidor en la misma red local.
- El puerto 443 debe estar libre (o elegir otro si está ocupado).

---

## 1. Instalar Node.js y npm

En Ubuntu/Debian:

```sh
sudo apt update
sudo apt install nodejs npm
```

En CentOS/RHEL/Fedora:

```sh
sudo dnf install nodejs npm
```

**Verifica la instalación:**

```sh
node -v
npm -v
```
Debes tener Node.js (v18+) y npm instalados.

---

## 2. Crear la carpeta del proyecto

```sh
cd ~
mkdir intercomweb
cd intercomweb
```

---

## 3. Crear la estructura de directorios

```sh
mkdir configweb
mkdir public
mkdir modules
```
*(Los archivos se generarán automáticamente en `configweb` en el primer arranque)*

---

## 4. Copiar los archivos del proyecto

Descarga cada archivo proporcionado (usa `nano`, `vim`, o editores gráficos como VS Code).  
Ejemplo para crear el archivo principal:

```sh
nano server.js
```
(Pega el contenido del archivo `server.js` allí y guarda con CTRL+O, ENTER, CTRL+X).  
Repite para cada archivo (`modules/`, `public/` y `README.md`).

---

## 5. Instalar las dependencias locales

En la carpeta del proyecto:

```sh
npm install express socket.io selfsigned
```

---

## 6. Abrir el puerto 443

Si está bloqueado por el firewall:

```sh
sudo ufw allow 443/tcp
```
(Si usas otro puerto, ajusta en el archivo `server.js` y el firewall).

---

## 7. Arrancar el servidor

En la carpeta del proyecto:

```sh
sudo node server.js
```

> **Nota:** Usa `sudo` si el puerto es 443 (<1024), debido a permisos de privilegios especiales en Linux.

---

## 8. Permitir acceso en la red local

- Comprueba la IP local del servidor con:  
  ```sh
  ip a
  ```
  O  
  ```sh
  hostname -I
  ```
- Los clientes deben acceder a:
  ```
  https://IP_DE_TU_SERVIDOR/
  ```
  desde su navegador Firefox/Chrome/Edge en la LAN.

- Si el navegador avisa "sitio no seguro", acepta el certificado autofirmado.

---

## 9. Configuración inicial

- Pulsa el botón ⚙ arriba a la derecha en la web principal.
- Introduce la clave por defecto: **1234**
- Configura nombres, IPs y activa los botones según los usuarios de la red.
- Guarda los cambios.

---

## 10. Detener el servidor

Pulsa `CTRL+C` en la terminal.

---

## 11. (Opcional) Ejecutar el servidor en segundo plano

Si quieres que el servidor esté siempre activo:

```sh
nohup sudo node server.js > server.log 2>&1 &
```

Para detener el proceso, busca el PID y usa `kill`:
```sh
ps aux | grep server.js
kill <PID>
```

---

## 12. Actualizaciones o copias de seguridad

- El archivo principal de configuración está en:  
  ```
  ~/intercomweb/configweb/config.json
  ```
- Los certificados están en la misma carpeta, puedes hacer backup de todo `configweb`.
- Para restaurar, copia los archivos de backup en la misma ubicación.

---

## 13. Preguntas comunes

- **¿Cómo cambio el puerto?**  
  Edita la línea `const PORT = 443;` en `server.js`.
- **¿Puedo usar otro directorio?**  
  Sí, pero mantén la estructura `configweb`, `public`, `modules`.

---

## 14. Reinstalación rápida

Para reinstalar dependencias:

```sh
rm -rf node_modules
npm install
```

---

## 15. Visualización de logs

Si el servidor falla, revisa el log con:

```sh
cat server.log
```
o revisa mensajes en la terminal.

---

**¡Listo! Tu servidor Intercom está operativo en la red local Linux.**
