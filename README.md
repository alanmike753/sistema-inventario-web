# Sistema de Gestión de Inventario Web



## 📝 Descripción del Proyecto

Este es un sistema de gestión de inventario básico desarrollado como parte de un portafolio de proyectos web. Permite a los usuarios agregar, ver y actualizar la cantidad de productos en un inventario a través de una interfaz web intuitiva. El objetivo principal de este proyecto es demostrar habilidades en el desarrollo Full-Stack utilizando JavaScript tanto en el frontend como en el backend.

## ✨ Funcionalidades Principales (MVP)

* **Agregar Nuevo Producto:** Permite registrar nuevos productos con su nombre, SKU (código único), descripción y cantidad inicial.
* **Ver Lista de Productos:** Muestra todos los productos existentes en una tabla dinámica, con sus detalles y cantidad actual.
* **Actualizar Cantidad de Producto:** Permite modificar la cantidad de un producto existente (útil para entradas o salidas de stock).
* **Eliminar Producto (Opcional/Avanzado):** Permite retirar productos del inventario. 

## 🚀 Tecnologías Utilizadas

### Frontend
* **HTML5:** Estructura básica de la interfaz de usuario.
* **CSS3:** Estilos para una experiencia de usuario limpia y moderna.
* **JavaScript (ES6+):** Lógica del lado del cliente para la interacción con el usuario y la comunicación con la API.

### Backend
* **Node.js:** Entorno de ejecución de JavaScript para el servidor.
* **Express.js:** Framework web para Node.js, utilizado para construir la API RESTful.
* **SQLite3:** Base de datos ligera y basada en archivos para almacenar la información del inventario.
* **`sqlite` npm package:** Driver para interactuar con la base de datos SQLite.
* **`body-parser` npm package:** Middleware para procesar cuerpos de peticiones HTTP.
* **`cors` npm package:** Middleware para habilitar la comunicación entre el frontend y el backend (Cross-Origin Resource Sharing).

## ⚙️ Cómo Ejecutar el Proyecto Localmente



### Prerrequisitos


* [Node.js y npm](https://nodejs.org/) 
* [Git](https://git-scm.com/downloads)
* [Visual Studio Code](https://code.visualstudio.com/) 
* [DB Browser for SQLite](https://sqlitebrowser.org/dl/)

### Pasos de Instalación y Ejecución

1.  **Clonar el Repositorio:**
    Abre tu terminal (Git Bash, PowerShell, CMD) y clona este repositorio:
    ```bash
    git clone https://github.com/alanmike753/sistema-inventario-web.git
    ```
    (Reemplaza https://github.com/alanmike753/sistema-inventario-web.git con la URL real de tu repositorio de GitHub).

2.  **Navegar al Directorio del Proyecto:**
    ```bash
    cd sistema-inventario-web
    ```

3.  **Instalar Dependencias del Backend:**
    Navega a la carpeta `backend` e instala las dependencias:
    ```bash
    cd backend
    npm install express sqlite3 body-parser cors
    # O si tienes un package.json, simplemente: npm install
    ```
    *Asegúrate de que tu `package.json` en la carpeta `backend` tenga estas dependencias listadas.*

4.  **Iniciar el Servidor Backend:**
    Desde la carpeta `backend`, ejecuta el servidor:
    ```bash
    node server.js
    # O si tienes nodemon instalado para desarrollo: nodemon server.js
    ```
    Verás un mensaje en la terminal indicando que el servidor está corriendo en `http://localhost:3001`.

5.  **Abrir el Frontend:**
    Navega a la carpeta `frontend`:
    ```bash
    cd ../frontend
    ```
    Abre el archivo `index.html` en tu navegador web preferido. Puedes hacerlo arrastrando el archivo al navegador o, si usas VS Code, con la extensión "Live Server" (clic derecho en `index.html` -> "Open with Live Server").

6.  **¡Listo!**
    Ahora deberías ver la interfaz del sistema de inventario en tu navegador y poder interactuar con ella.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si tienes sugerencias o encuentras errores, por favor, abre un "issue" o envía un "pull request".

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
*(Si no tienes un archivo LICENSE, puedes omitir esta sección o crear uno. Para portafolios, la Licencia MIT es una opción común y permisiva).*

## 📞 Contacto

* Tu Nombre: Alvaro Alan Diaz de Dios
* GitHub: https://github.com/alanmike753
* LinkedIn: https://www.linkedin.com/in/alvaro-alan-diaz-de-dios-856364365/
* Email: alan-mx1@hotmail.com