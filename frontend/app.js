// app.js - Lógica del frontend para el sistema de inventario

// URL base de la API de nuestro backend.
// Asegúrate de que este puerto (3001) coincida con el puerto en el que tu servidor backend está escuchando.
const API_URL = 'http://localhost:3001/api/productos';

// Espera a que el DOM (Document Object Model) esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a Elementos del DOM ---
    // Obtiene el formulario de agregar producto por su ID 'productForm'.
    const productForm = document.getElementById('productForm');
    // Obtiene el cuerpo de la tabla donde se listarán los productos.
    // Utiliza querySelector para seleccionar el elemento <tbody> dentro de la tabla con ID 'productTable'.
    const productTableBody = document.querySelector('#productTable tbody');
    // Obtiene el botón de envío del formulario para deshabilitarlo/habilitarlo durante las peticiones.
    const addProductButton = productForm.querySelector('button[type="submit"]');

    /**
     * Muestra mensajes de notificación en la consola del navegador.
     * Esta función es un placeholder y podría expandirse para mostrar mensajes
     * en un área visible de la interfaz de usuario para una mejor experiencia.
     * @param {string} message - El mensaje de texto a mostrar.
     * @param {string} type - El tipo de mensaje ('success', 'error', 'info').
     */
    function showMessage(message, type = 'success') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // TODO: Implementar visualización de mensajes en un div en el HTML (ej. con ID 'messageArea')
        // para proporcionar feedback visual al usuario directamente en la página.
    }

    /**
     * Carga todos los productos desde la API del backend y los muestra en la tabla del inventario.
     * Realiza una petición GET al endpoint de productos, limpia la tabla existente
     * y la repopula con los datos más recientes.
     * @returns {Promise<void>} Una promesa que se resuelve cuando los productos han sido cargados y renderizados.
     */
    async function loadProducts() {
        // Muestra un mensaje de carga en la tabla mientras se obtienen los datos del servidor.
        productTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Cargando productos...</td></tr>`;

        try {
            // Realiza una petición GET asíncrona a la API para obtener la lista de productos.
            const response = await fetch(API_URL);
            // Verifica si la respuesta HTTP fue exitosa (códigos de estado 200-299).
            if (!response.ok) {
                // Si la respuesta no es exitosa, lanza un error con el estado y texto de la respuesta.
                throw new Error(`Error al obtener productos: ${response.status} ${response.statusText}`);
            }
            // Parsea el cuerpo de la respuesta como JSON.
            const data = await response.json();
            
            // Determina si los datos recibidos son un array directo o un objeto que contiene el array de productos.
            // Esto maneja la flexibilidad en la estructura de la respuesta del backend.
            const products = Array.isArray(data) ? data : data.productos; 

            // Limpia el contenido actual del cuerpo de la tabla para insertar los nuevos datos.
            productTableBody.innerHTML = '';

            // Si no hay productos (la lista está vacía o es nula/indefinida), muestra un mensaje indicándolo.
            if (!products || products.length === 0) {
                productTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay productos en el inventario.</td></tr>`;
                return; // Sale de la función si no hay productos.
            }

            // Itera sobre cada producto en el array 'products' y crea una fila en la tabla para cada uno.
            products.forEach(product => {
                const row = productTableBody.insertRow(); // Crea un nuevo elemento <tr> (fila de tabla).

                // Inserta celdas <td> (datos de la tabla) con la información del producto.
                // Se asume que el objeto 'product' tiene propiedades como id, nombre, sku, descripcion y cantidad.
                row.insertCell(0).textContent = product.id; // ID del producto
                row.insertCell(1).textContent = product.nombre; // Nombre del producto
                row.insertCell(2).textContent = product.sku; // SKU del producto
                row.insertCell(3).textContent = product.descripcion || 'N/A'; // Descripción (muestra 'N/A' si es nula o vacía)
                row.insertCell(4).textContent = product.cantidad; // Cantidad en stock

                // Celda para los botones de acción (Actualizar y Eliminar).
                const actionsCell = row.insertCell(5);

                // --- Botón de Actualizar Cantidad ---
                const updateButton = document.createElement('button'); // Crea un elemento <button>.
                updateButton.textContent = 'Actualizar Cantidad'; // Texto visible del botón.
                updateButton.className = 'update-btn'; // Asigna la clase CSS para aplicar estilos.
                // Asigna un manejador de evento 'onclick' que llama a 'showUpdateQuantityPrompt'
                // con el ID, nombre y cantidad actual del producto.
                updateButton.onclick = () => showUpdateQuantityPrompt(product.id, product.nombre, product.cantidad);
                actionsCell.appendChild(updateButton); // Añade el botón a la celda de acciones.

                // --- Botón de Eliminar --- (Esta sección es opcional y depende de si tienes el endpoint DELETE en tu backend)
                const deleteButton = document.createElement('button'); // Crea un elemento <button>.
                deleteButton.textContent = 'Eliminar'; // Texto visible del botón.
                deleteButton.className = 'delete-btn'; // Asigna la clase CSS para aplicar estilos.
                // Asigna un manejador de evento 'onclick' que llama a 'handleDeleteProduct'
                // con el ID y nombre del producto.
                deleteButton.onclick = () => handleDeleteProduct(product.id, product.nombre);
                actionsCell.appendChild(deleteButton); // Añade el botón a la celda de acciones.
            });

        } catch (error) {
            // Captura y maneja cualquier error que ocurra durante la petición o procesamiento de los productos.
            console.error('Error al cargar los productos:', error);
            // Muestra un mensaje de error en la tabla para informar al usuario.
            productTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar productos: ${error.message}</td></tr>`;
            // Utiliza la función 'showMessage' para una notificación adicional.
            showMessage(`Error al cargar productos: ${error.message}`, 'error');
        }
    }

    /**
     * Maneja el envío del formulario para añadir un nuevo producto al inventario.
     * Realiza validaciones en el frontend y envía una petición POST al backend.
     * @param {Event} event - El objeto de evento del formulario (submit).
     * @returns {Promise<void>} Una promesa que se resuelve al completar la operación.
     */
    async function addProduct(event) {
        event.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página).

        // Deshabilita el botón de envío y cambia su texto para indicar que se está procesando la petición.
        addProductButton.disabled = true;
        addProductButton.textContent = 'Agregando...';

        // Obtiene y limpia (elimina espacios en blanco al inicio/final) los valores de los campos del formulario.
        // Los IDs de los inputs deben coincidir con los definidos en index.html.
        const nombre = document.getElementById('nombre').value.trim();
        const sku = document.getElementById('sku').value.trim();
        const cantidadStr = document.getElementById('cantidad').value; // Cantidad se obtiene como string inicialmente
        const descripcion = document.getElementById('descripcion').value.trim();

        // --- Validaciones básicas en el frontend ---
        // Verifica que los campos obligatorios no estén vacíos.
        if (!nombre || !sku || cantidadStr === '') {
            alert('Por favor, complete todos los campos obligatorios (Nombre, SKU, Cantidad).');
            // Habilita el botón y restaura su texto si la validación falla.
            addProductButton.disabled = false;
            addProductButton.textContent = 'Agregar Producto';
            return; // Sale de la función.
        }

        // Convierte la cantidad a un número entero y valida que sea un número válido y no negativo.
        const cantidad = parseInt(cantidadStr, 10);
        if (isNaN(cantidad) || cantidad < 0) {
            alert('La cantidad debe ser un número entero igual o mayor a cero.');
            // Habilita el botón y restaura su texto si la validación falla.
            addProductButton.disabled = false;
            addProductButton.textContent = 'Agregar Producto';
            return; // Sale de la función.
        }

        // Crea un objeto con los datos del nuevo producto.
        const newProduct = { nombre, sku, descripcion, cantidad };

        try {
            // Realiza una petición POST asíncrona a la API para añadir el nuevo producto.
            const response = await fetch(API_URL, {
                method: 'POST', // Método HTTP para crear recursos.
                headers: {
                    'Content-Type': 'application/json', // Indica que el cuerpo de la petición es JSON.
                },
                body: JSON.stringify(newProduct), // Convierte el objeto JavaScript a una cadena JSON.
            });

            // Verifica si la respuesta HTTP fue exitosa.
            if (!response.ok) {
                // Intenta leer el mensaje de error del cuerpo de la respuesta del backend si está en formato JSON.
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
                // Lanza un error con el mensaje obtenido o un mensaje genérico.
                throw new Error(errorData.message || 'Error al agregar el producto.');
            }

            // Si la petición fue exitosa:
            productForm.reset(); // Limpia todos los campos del formulario.
            await loadProducts(); // Recarga la lista de productos para mostrar el recién añadido.
            showMessage('Producto agregado con éxito!'); // Muestra un mensaje de éxito.

        } catch (error) {
            // Captura y maneja cualquier error que ocurra durante la petición o procesamiento.
            console.error('Error al agregar el producto:', error);
            showMessage(`Error al agregar el producto: ${error.message}`, 'error'); // Muestra un mensaje de error.
        } finally {
            // Este bloque se ejecuta siempre, independientemente de si hubo éxito o error.
            // Habilita el botón de envío y restaura su texto original.
            addProductButton.disabled = false;
            addProductButton.textContent = 'Agregar Producto';
        }
    }

    /**
     * Muestra un cuadro de diálogo (prompt) al usuario para que ingrese la nueva cantidad de un producto.
     * Valida la entrada del usuario antes de llamar a la función de actualización.
     * @param {number} productId - El ID del producto a actualizar.
     * @param {string} productName - El nombre del producto (para mostrar en el prompt).
     * @param {number} currentQuantity - La cantidad actual del producto (para prellenar el prompt).
     * @returns {Promise<void>} Una promesa que se resuelve al completar la operación.
     */
    async function showUpdateQuantityPrompt(productId, productName, currentQuantity) {
        // Muestra un cuadro de diálogo al usuario pidiendo la nueva cantidad.
        const newQuantityStr = prompt(`Ingresa la nueva cantidad para "${productName}" (actual: ${currentQuantity}):`, currentQuantity);

        // Si el usuario cancela el prompt (newQuantityStr es null) o lo deja vacío.
        if (newQuantityStr === null || newQuantityStr.trim() === '') {
            return; // Sale de la función sin hacer nada.
        }

        // Convierte la entrada del usuario a un número entero.
        const newQuantity = parseInt(newQuantityStr, 10);

        // Valida que la nueva cantidad sea un número válido y no negativo.
        if (isNaN(newQuantity) || newQuantity < 0) {
            alert('La cantidad ingresada no es válida. Debe ser un número entero igual o mayor a cero.');
            return; // Sale de la función.
        }

        // Si la nueva cantidad es la misma que la actual, no hay necesidad de actualizar.
        if (newQuantity === currentQuantity) {
            showMessage('La cantidad no ha cambiado.', 'info');
            return; // Sale de la función.
        }

        // Llama a la función para actualizar la cantidad en el backend.
        await updateProductQuantity(productId, newQuantity);
    }

    /**
     * Envía una petición PUT al backend para actualizar la cantidad de un producto específico.
     * @param {number} id - El ID del producto a actualizar.
     * @param {number} newQuantity - La nueva cantidad para el producto.
     * @returns {Promise<void>} Una promesa que se resuelve al completar la actualización.
     */
    async function updateProductQuantity(id, newQuantity) {
        try {
            // Realiza una petición PUT asíncrona a la API para actualizar el producto.
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT', // Método HTTP para actualizar recursos existentes.
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cantidad: newQuantity }), // Envía solo la cantidad a actualizar.
            });

            // Verifica si la respuesta HTTP fue exitosa.
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
                throw new Error(errorData.message || 'Error al actualizar la cantidad del producto.');
            }

            await loadProducts(); // Recarga la lista de productos para reflejar el cambio.
            showMessage('Cantidad actualizada con éxito!'); // Muestra un mensaje de éxito.

        } catch (error) {
            // Captura y maneja cualquier error durante la actualización.
            console.error('Error al actualizar la cantidad del producto:', error);
            showMessage(`Error al actualizar la cantidad: ${error.message}`, 'error'); // Muestra un mensaje de error.
        }
    }

    /**
     * Maneja la eliminación de un producto del inventario.
     * Pide confirmación al usuario antes de enviar una petición DELETE al backend.
     * @param {number} productId - El ID del producto a eliminar.
     * @param {string} productName - El nombre del producto (para el mensaje de confirmación).
     * @returns {Promise<void>} Una promesa que se resuelve al completar la eliminación.
     */
    async function handleDeleteProduct(productId, productName) {
        // Pide confirmación al usuario antes de proceder con la eliminación.
        if (confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}" (ID: ${productId})? Esta acción no se puede deshacer.`)) {
            try {
                // Realiza una petición DELETE asíncrona a la API para eliminar el producto.
                const response = await fetch(`${API_URL}/${productId}`, {
                    method: 'DELETE' // Método HTTP para eliminar recursos.
                });

                // Verifica si la respuesta HTTP fue exitosa.
                if (!response.ok) {
                    let errorMessage = `Error ${response.status}: No se pudo eliminar el producto.`;
                    // Intenta obtener un mensaje de error más específico del backend.
                    if (response.headers.get("content-type")?.includes("application/json")) {
                        const errorData = await response.json().catch(() => null);
                        if (errorData && (errorData.error || errorData.message)) {
                            errorMessage = errorData.error || errorData.message;
                        }
                    } else if (response.status !== 204) { // 204 No Content es una respuesta válida para DELETE sin cuerpo de respuesta.
                        const textError = await response.text().catch(() => null);
                        if (textError) errorMessage = textError;
                    }
                    throw new Error(errorMessage);
                }
                
                await loadProducts(); // Recarga la lista de productos para reflejar la eliminación.
                showMessage(`Producto "${productName}" eliminado exitosamente.`); // Muestra un mensaje de éxito.

            } catch (error) {
                // Captura y maneja cualquier error durante la eliminación.
                console.error('Error al eliminar el producto:', error);
                showMessage(`Error al eliminar el producto: ${error.message}`, 'error'); // Muestra un mensaje de error.
            }
        }
    }

    // --- Inicialización de Event Listeners y Carga Inicial ---
    // Adjunta el event listener de envío al formulario de agregar producto.
    // Solo se adjunta si el elemento del formulario se encuentra en el DOM.
    if (productForm) {
        productForm.addEventListener('submit', addProduct);
    } else {
        console.warn("El formulario con ID 'productForm' no fue encontrado en el DOM. Asegúrate de que el ID en index.html sea correcto.");
    }

    // Carga los productos en la tabla cuando la página se carga por primera vez.
    loadProducts();

}); // Fin del addEventListener('DOMContentLoaded', ...)