import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, FileText, Building2, AlertCircle, CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface Denuncia {
  id: number;
  titulo: string;
  descricao: string;
  local: string;
  status: string;
  created_at: string;
  usuario_id: number;
  anonimo: boolean;
  usuario?: { nome: string };
}

export default function Home() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarDenuncias();
  }, []);

  const carregarDenuncias = async () => {
    try {
      const { data } = await api.get('/denuncias');
      setDenuncias(data);
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const cores: Record<string, string> = {
      pendente: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      em_andamento: 'bg-blue-500/10 text-blue-600 border-blue-200',
      resolvido: 'bg-green-500/10 text-green-600 border-green-200',
    };
    return cores[status] || 'bg-gray-500/10 text-gray-600 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      resolvido: 'Resolvido',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pendente: '⏳',
      em_andamento: '🔄',
      resolvido: '✅',
    };
    return icons[status] || '📌';
  };

  const getBadgeColor = (status: string) => {
    const cores: Record<string, string> = {
      pendente: 'bg-yellow-500 text-white',
      em_andamento: 'bg-blue-500 text-white',
      resolvido: 'bg-green-500 text-white',
    };
    return cores[status] || 'bg-gray-500 text-white';
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    const hoje = new Date();
    const diff = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'hoje';
    if (diff === 1) return 'há 1 dia';
    if (diff < 7) return `há ${diff} dias`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncarTexto = (texto: string, max: number = 60) => {
    if (texto.length <= max) return texto;
    return texto.substring(0, max) + '...';
  };

  const ultimasDenuncias = denuncias.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Olá, {usuario?.nome || 'Cidadão'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">Bem-vindo ao seu painel de serviços urbanos.</p>
          </div>
          <button
            onClick={() => navigate('/nova-denuncia')}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            Nova Denúncia
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Registrar Nova Denúncia</h3>
                <p className="text-sm text-gray-500 mt-1">Inicie um novo protocolo rapidamente.</p>
                <button 
                  onClick={() => navigate('/nova-denuncia')}
                  className="mt-3 text-sm font-medium text-primary hover:underline flex items-center gap-1"
                >
                  Registrar agora <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Minhas Denúncias</h3>
                <p className="text-sm text-gray-500 mt-1">Acompanhe o status dos seus chamados.</p>
                <button className="mt-3 text-sm font-medium text-primary hover:underline flex items-center gap-1">
                  Ver todas <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Departamentos</h3>
                <p className="text-sm text-gray-500 mt-1">Consulte os setores responsáveis.</p>
                <button className="mt-3 text-sm font-medium text-primary hover:underline flex items-center gap-1">
                  Explorar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Denúncias Recentes</h2>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {ultimasDenuncias.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhuma denúncia registrada ainda.
              </div>
            ) : (
              ultimasDenuncias.map((denuncia) => (
                <div
                  key={denuncia.id}
                  className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer group"
                  onClick={() => navigate(`/denuncia/${denuncia.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition truncate">
                          {denuncia.titulo}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(denuncia.status)}`}>
                          {getStatusIcon(denuncia.status)} {getStatusLabel(denuncia.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span>📍 {truncarTexto(denuncia.local, 40)}</span>
                        <span>👤 {denuncia.anonimo ? 'Anônimo' : denuncia.usuario?.nome || 'Usuário'}</span>
                        <span>🕐 {formatarData(denuncia.created_at)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      Prot: #{String(denuncia.id).padStart(4, '0')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}