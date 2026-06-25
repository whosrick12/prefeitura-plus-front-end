import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registro: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const usuarioSalvo = localStorage.getItem('usuario');
      if (token && usuarioSalvo) {
        const parsed = JSON.parse(usuarioSalvo);
        setUsuario(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, senha: string) => {
    const { data } = await api.post('/usuarios/login', { email, senha });
    const token = data.token || data;
    localStorage.setItem('token', token);
    
    try {
      const userData = await api.get('/usuarios/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('usuario', JSON.stringify(userData.data));
      setUsuario(userData.data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw new Error('Erro ao buscar dados do usuário');
    }
  };

  const registro = async (nome: string, email: string, senha: string) => {
    const { data } = await api.post('/usuarios', { nome, email, senha });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);