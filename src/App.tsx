import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import NovaDenuncia from './pages/NovaDenuncia';
import DetalheDenuncia from './pages/DetalheDenuncia';
import MinhasDenuncias from './pages/MinhasDenuncias';
import DashboardEstatisticas from './pages/DashboardEstatisticas';
import AdminRoute from './components/AdminRoute';
import Header from './components/Header';

function AppRoutes() {
  const { usuario } = useAuth();

  if (!usuario) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nova-denuncia" element={<NovaDenuncia />} />
        <Route path="/denuncia/:id" element={<DetalheDenuncia />} />
        <Route path="/minhas-denuncias" element={<MinhasDenuncias />} />
        <Route 
          path="/dashboard" 
          element={
            <AdminRoute>
              <DashboardEstatisticas />
            </AdminRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;