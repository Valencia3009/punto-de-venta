const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database'); // Asegúrate de que esta ruta sea correcta

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // para exponer la API
    },
  });

  win.loadURL('http://localhost:3000'); // para desarrollo
  // win.loadFile('index.html'); // para producción
}

// Mueve la creación de la ventana DENTRO de app.whenReady()
app.whenReady().then(() => {
  createWindow();

  // Aquí van tus ipcMain.handle
  ipcMain.handle('obtener-productos', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM productos ORDER BY id DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  ipcMain.handle('crear-producto', async (_, producto) => {
    const { nombre, precio, stock } = producto;
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)', [nombre, precio, stock], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  });

  ipcMain.handle('actualizar-producto', async (_, producto) => {
    const { id, nombre, precio, stock } = producto;
    return new Promise((resolve, reject) => {
      db.run('UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?', [nombre, precio, stock, id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  ipcMain.handle('eliminar-producto', async (_, id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM productos WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  });
});

// MacOS: vuelve a abrir la app si no hay ventanas
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Cierra completamente en Windows/Linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
