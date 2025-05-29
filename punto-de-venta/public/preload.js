const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  obtenerProductos: () => ipcRenderer.invoke('obtener-productos'),
  crearProducto: (producto) => ipcRenderer.invoke('crear-producto', producto),
  actualizarProducto: (producto) => ipcRenderer.invoke('actualizar-producto', producto),
  eliminarProducto: (id) => ipcRenderer.invoke('eliminar-producto', id),
});
