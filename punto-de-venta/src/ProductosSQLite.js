import { useEffect, useRef, useState } from 'react';

const ProductosSQLite = () => {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [modoEditar, setModoEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const nombreRef = useRef();

  const cargarProductos = async () => {
    const data = await window.electronAPI.obtenerProductos();
    setProductos(data);
  };

  const guardarProducto = async () => {
    if (!nombre || !precio || !stock) return alert('Completa todos los campos');
    await window.electronAPI.crearProducto({ nombre, precio: parseFloat(precio), stock: parseInt(stock) });
    limpiar();
    cargarProductos();
  };

  const actualizarProducto = async () => {
    if (!nombre || !precio || !stock) return alert('Completa todos los campos');
    await window.electronAPI.actualizarProducto({
      id: productoEditando.id,
      nombre,
      precio: parseFloat(precio),
      stock: parseInt(stock)
    });
    limpiar();
    cargarProductos();
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await window.electronAPI.eliminarProducto(id);
    cargarProductos();
  };

  const limpiar = () => {
    setModoEditar(false);
    setProductoEditando(null);
    setNombre('');
    setPrecio('');
    setStock('');
    nombreRef.current?.focus();
  };

  const seleccionarProducto = (producto) => {
    setModoEditar(true);
    setProductoEditando(producto);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setStock(producto.stock);
    nombreRef.current?.focus();
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>{modoEditar ? 'Editar' : 'Agregar'} producto (SQLite)</h2>
      <input ref={nombreRef} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
      <input value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Precio" />
      <input value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" />
      <button onClick={modoEditar ? actualizarProducto : guardarProducto}>
        {modoEditar ? 'Actualizar' : 'Guardar'}
      </button>
      <button onClick={limpiar}>Cancelar</button>

      <h3>Productos</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.precio}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => seleccionarProducto(p)}>Editar</button>
                <button onClick={() => eliminarProducto(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductosSQLite;