// 1. Importar los módulos necesarios
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// 2. Crear una instancia de la aplicación Express
const app = express();

// 3. Definir el puerto
const PORT = process.env.PORT || 3001;

// --- INICIO: CONFIGURACIÓN DE MIDDLEWARES ---
app.use(express.json()); // Para parsear JSON
app.use(cors());         // Para habilitar CORS
// --- FIN: CONFIGURACIÓN DE MIDDLEWARES ---

const DBNAME = 'inventario.db';
let db;

db = new sqlite3.Database(DBNAME, (err) => {
    if (err) {
        console.error("Error al abrir la base de datos:", err.message);
    } else {
        console.log(`Conectado exitosamente a la base de datos: ${DBNAME}`);
        db.run(`CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            sku TEXT UNIQUE NOT NULL,
            descripcion TEXT,
            cantidad INTEGER NOT NULL DEFAULT 0
        )`, (err) => {
            if (err) {
                console.error("Error al crear la tabla 'productos':", err.message);
            } else {
                console.log("Tabla 'productos' lista o ya existente.");
            }
        });
    }
});

// --- INICIO: API ENDPOINTS ---

// Endpoint para registrar un nuevo producto (POST /api/productos)
app.post('/api/productos', (req, res) => {
    const { nombre, sku, descripcion, cantidad } = req.body;
    if (!nombre || !sku || cantidad === undefined) {
        return res.status(400).json({ error: 'Los campos nombre, sku y cantidad son obligatorios.' });
    }
    if (typeof cantidad !== 'number' || cantidad < 0) {
        return res.status(400).json({ error: 'La cantidad debe ser un número entero no negativo.' });
    }
    const sql = `INSERT INTO productos (nombre, sku, descripcion, cantidad) VALUES (?, ?, ?, ?)`;
    const params = [nombre, sku, descripcion || null, cantidad];
    db.run(sql, params, function(err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed: productos.sku")) {
                return res.status(409).json({ error: 'Error al guardar el producto: El SKU ya existe.' });
            }
            console.error("Error al insertar en la base de datos:", err.message);
            return res.status(500).json({ error: 'Error interno del servidor al guardar el producto.' });
        }
        res.status(201).json({
            id: this.lastID,
            nombre: nombre,
            sku: sku,
            descripcion: descripcion || null,
            cantidad: cantidad
        });
    });
});

// Endpoint para obtener todos los productos (GET /api/productos)
app.get('/api/productos', (req, res) => {
    const sql = `SELECT * FROM productos ORDER BY nombre ASC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error al consultar la base de datos:", err.message);
            return res.status(500).json({ error: 'Error interno del servidor al obtener los productos.' });
        }
        res.status(200).json({ productos: rows });
    });
});

// Endpoint para actualizar la cantidad de un producto existente (PUT /api/productos/:id)
app.put('/api/productos/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const { cantidad } = req.body;
    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ error: 'El ID del producto no es válido.' });
    }
    if (cantidad === undefined || typeof cantidad !== 'number' || cantidad < 0) {
        return res.status(400).json({ error: 'La cantidad es obligatoria y debe ser un número entero no negativo.' });
    }
    const sql = `UPDATE productos SET cantidad = ? WHERE id = ?`;
    const params = [cantidad, productId];
    db.run(sql, params, function(err) {
        if (err) {
            console.error("Error al actualizar en la base de datos:", err.message);
            return res.status(500).json({ error: 'Error interno del servidor al actualizar el producto.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.status(200).json({ message: `Producto con ID ${productId} actualizado exitosamente.`, filas_afectadas: this.changes });
    });
});

// Endpoint para obtener un producto específico por su ID (GET /api/productos/:id)
app.get('/api/productos/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ error: 'El ID del producto no es válido.' });
    }
    const sql = `SELECT * FROM productos WHERE id = ?`;
    const params = [productId];
    db.get(sql, params, (err, row) => {
        if (err) {
            console.error("Error al consultar la base de datos por ID:", err.message);
            return res.status(500).json({ error: 'Error interno del servidor al obtener el producto.' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.status(200).json({ producto: row });
    });
});

// --- NUEVO ENDPOINT ---
// Endpoint para eliminar un producto específico por su ID
// Método: DELETE, Ruta: /api/productos/:id
app.delete('/api/productos/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    // Validación del ID
    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ error: 'El ID del producto no es válido.' });
    }

    const sql = `DELETE FROM productos WHERE id = ?`;
    const params = [productId];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Error al eliminar en la base de datos:", err.message);
            return res.status(500).json({ error: 'Error interno del servidor al eliminar el producto.' });
        }
        // this.changes contiene el número de filas afectadas (eliminadas)
        if (this.changes === 0) {
            // Si no se afectó ninguna fila, significa que no se encontró un producto con ese ID
            return res.status(404).json({ error: 'Producto no encontrado para eliminar.' });
        }
        // Si todo va bien, enviar una respuesta 200 (OK) con un mensaje de éxito.
        // Alternativamente, se podría enviar un 204 No Content sin cuerpo de respuesta.
        res.status(200).json({ message: `Producto con ID ${productId} eliminado exitosamente.`, filas_afectadas: this.changes });
    });
});
// --- FIN NUEVO ENDPOINT ---

// --- FIN: API ENDPOINTS ---

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡El servidor backend del sistema de inventario está funcionando y conectado a SQLite, con CORS habilitado!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});