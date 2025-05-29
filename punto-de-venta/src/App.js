import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import ProductosSupabase from './ProductosSupabase';
import ProductosSQLite from './ProductosSQLite';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos-supabase" element={<ProductosSupabase />} />
        <Route path="/productos-sqlite" element={<ProductosSQLite />} />
      </Routes>
    </Router>
  );
}

export default App;