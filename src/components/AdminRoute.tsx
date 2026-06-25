import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = usuario.papel === 'admin' || usuario.papel === 'funcionario';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <span className="text-5xl block mb-4">🔒</span>
          <h3 className="text-xl font-semibold text-gray-700">Acesso negado</h3>
          <p className="text-gray-400 mt-2">
            Você não tem permissão para acessar o dashboard.
            <br />
            Apenas administradores podem visualizar esta página.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}