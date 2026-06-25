import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Home, FileText, Users, LogOut, User, PlusCircle, BarChart3, Shield, UserCheck } from 'lucide-react';

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = usuario?.papel === 'admin' || usuario?.papel === 'funcionario';

  const getRoleLabel = () => {
    if (usuario?.papel === 'admin') return 'Admin';
    if (usuario?.papel === 'funcionario') return 'Funcionário';
    return 'Cidadão';
  };

  const getRoleIcon = () => {
    if (usuario?.papel === 'admin' || usuario?.papel === 'funcionario') {
      return <Shield className="w-4 h-4" />;
    }
    return <UserCheck className="w-4 h-4" />;
  };

  const navItems = [
    { nome: 'Início', icone: Home, path: '/' },
    { nome: 'Minhas Denúncias', icone: FileText, path: '/minhas-denuncias' },
  ];

  if (isAdmin) {
    navItems.push({ nome: 'Dashboard', icone: BarChart3, path: '/dashboard' });
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">🏛️</span>
            <span className="text-xl font-bold text-primary">Prefeitura+</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition"
              >
                <item.icone className="w-4 h-4" />
                {item.nome}
              </Link>
            ))}
            <Link
              to="/nova-denuncia"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition ml-2"
            >
              <PlusCircle className="w-4 h-4" />
              Nova
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                {getRoleIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {getRoleLabel()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>

            <button
              onClick={() => setMobileMenuAberto(!mobileMenuAberto)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuAberto && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition"
              onClick={() => setMobileMenuAberto(false)}
            >
              <item.icone className="w-5 h-5" />
              {item.nome}
            </Link>
          ))}
          <Link
            to="/nova-denuncia"
            className="flex items-center gap-3 px-4 py-2.5 text-white bg-primary hover:bg-blue-700 rounded-lg transition"
            onClick={() => setMobileMenuAberto(false)}
          >
            <PlusCircle className="w-5 h-5" />
            Nova Denúncia
          </Link>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-2.5 text-gray-600">
              {getRoleIcon()}
              <span className="font-medium">{getRoleLabel()}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
}