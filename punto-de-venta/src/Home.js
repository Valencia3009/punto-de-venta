import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>Punto de Venta</h1>
      <button onClick={() => navigate('/productos-supabase')} style={{ margin: 20, padding: '10px 20px' }}>
        Usar Supabase
      </button>
      <button onClick={() => navigate('/productos-sqlite')} style={{ margin: 20, padding: '10px 20px' }}>
        Usar SQLite
      </button>
    </div>
  );
}

export default Home;