import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [modoEditar, setModoEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const nombreRef = useRef(null);
  const precioRef = useRef(null);
  const stockRef = useRef(null);
  const buttonRef = useRef(null);
  const busquedaRef = useRef(null);

  const cargarProductos = async () => {
    const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
    if (!error) {
      setProductos(data);
      setProductosFiltrados(data);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    const listener = (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        busquedaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  useEffect(() => {
    const resultado = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    setProductosFiltrados(resultado);
  }, [busqueda, productos]);

  const handleKeyDown = (e, nextField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!e.target.value.trim()) {
        alert('Por favor completa este campo');
        return;
      }
      if (nextField === 'submit') {
        if (nombre && precio && stock) {
          buttonRef.current?.click();
        }
      } else if (nextField?.current) {
        nextField.current.focus();
      }
    }
  };

  const agregarProducto = async () => {
    if (!nombre || !precio || !stock) {
      alert('Completa todos los campos');
      nombreRef.current?.focus();
      return;
    }
    const { error } = await supabase.from('productos').insert([{ nombre, precio: parseFloat(precio), stock: parseInt(stock) }]);
    if (!error) {
      resetFormulario();
      cargarProductos();
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  const seleccionarProducto = (producto) => {
    setModoEditar(true);
    setProductoEditando(producto);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setStock(producto.stock);
    nombreRef.current?.focus();
  };

  const actualizarProducto = async () => {
    const { error } = await supabase
      .from('productos')
      .update({ nombre, precio: parseFloat(precio), stock: parseInt(stock) })
      .eq('id', productoEditando.id);
    if (!error) {
      resetFormulario();
      cargarProductos();
    } else {
      alert('Error al actualizar: ' + error.message);
    }
  };

  const eliminarProducto = async (id) => {
    const confirmado = window.confirm('¿Seguro que quieres eliminar este producto?');
    if (!confirmado) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) {
      cargarProductos();
    } else {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const resetFormulario = () => {
    setModoEditar(false);
    setProductoEditando(null);
    setNombre('');
    setPrecio('');
    setStock('');
    nombreRef.current?.focus();
  };

  const getNombreArchivo = (extension) => {
    const fecha = new Date().toISOString().split('T')[0];
    return `productos_${fecha}.${extension}`;
  };

  const exportarExcel = () => {
    const datos = productosFiltrados.map(({ nombre, precio, stock }) => ({ Nombre: nombre, Precio: precio, Stock: stock }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Productos');
    XLSX.writeFile(libro, getNombreArchivo('xlsx'));
  };

  const exportarCSV = () => {
    const datos = productosFiltrados.map(({ nombre, precio, stock }) => ({ Nombre: nombre, Precio: precio, Stock: stock }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Productos');
    XLSX.writeFile(libro, getNombreArchivo('csv'), { bookType: 'csv' });
  };

  const exportarJSON = () => {
    const datos = productosFiltrados.map(({ nombre, precio, stock }) => ({ nombre, precio, stock }));
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    saveAs(blob, getNombreArchivo('json'));
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '80%', maxWidth: 800, marginBottom: 20 }}>
        <h2>{modoEditar ? 'Editar producto' : 'Agregar producto'}</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input ref={nombreRef} placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} onKeyDown={e => handleKeyDown(e, precioRef)} style={{ padding: 8, flex: 1 }} />
          <input ref={precioRef} placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} onKeyDown={e => handleKeyDown(e, stockRef)} style={{ padding: 8, width: 100 }} />
          <input ref={stockRef} placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} onKeyDown={e => handleKeyDown(e, 'submit')} style={{ padding: 8, width: 100 }} />
          <button ref={buttonRef} onClick={modoEditar ? actualizarProducto : agregarProducto} style={{ padding: '8px 16px', backgroundColor: modoEditar ? '#e69500' : '#667ba6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>{modoEditar ? 'Actualizar' : 'Guardar'}</button>
        </div>
        <div style={{ marginBottom: 20 }}>
          <button onClick={exportarExcel} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 10 }}>Descargar Excel</button>
          <button onClick={exportarCSV} style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 10 }}>Descargar CSV</button>
          <button onClick={exportarJSON} style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Descargar JSON</button>
        </div>
        <h2>Buscar Producto</h2>
        <input ref={busquedaRef} placeholder="Buscar producto (Ctrl + B)" value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 10 }} />
      </div>
      <div style={{ width: '80%', maxWidth: 800, maxHeight: '60vh', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', margin: '16px 0' }}>Lista de productos</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#667ba6', color: 'white', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: '12px 16px' }}>Nombre</th>
              <th style={{ padding: '12px 16px' }}>Precio</th>
              <th style={{ padding: '12px 16px' }}>Stock</th>
              <th style={{ padding: '12px 16px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 16px' }}>{p.nombre}</td>
                <td style={{ padding: '12px 16px' }}>${p.precio}</td>
                <td style={{ padding: '12px 16px' }}>{p.stock}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => seleccionarProducto(p)} style={{ marginRight: 8 }}>Editar</button>
                  <button onClick={() => eliminarProducto(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '12px 16px', textAlign: 'center' }}>No se encontraron productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Productos;
