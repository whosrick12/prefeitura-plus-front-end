import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, User, Calendar, Building2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

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
  gravidade?: number;
  tipo_denuncia_id?: number;
  departamento_id?: number;
  tipo_denuncia?: { nome: string };
}

export default function MinhasDenuncias() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [filteredDenuncias, setFilteredDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarDenuncias();
  }, []);

  useEffect(() => {
    filtrarDenuncias();
  }, [denuncias, searchTerm, filtroStatus]);

  const carregarDenuncias = async () => {
    try {
      const { data } = await api.get('/denuncias/fila');
      const minhas = data.filter((d: Denuncia) => d.usuario_id === usuario?.id);
      setDenuncias(minhas);
      setFilteredDenuncias(minhas);
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarDenuncias = () => {
    let filtradas = [...denuncias];

    if (filtroStatus !== 'todos') {
      filtradas = filtradas.filter(d => d.status === filtroStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtradas = filtradas.filter(d =>
        d.titulo.toLowerCase().includes(term) ||
        d.descricao.toLowerCase().includes(term) ||
        d.local.toLowerCase().includes(term)
      );
    }

    setFilteredDenuncias(filtradas);
  };

  const getStatusBg = (status: string) => {
    const cores: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      em_andamento: 'bg-blue-100 text-blue-800 border-blue-300',
      resolvido: 'bg-green-100 text-green-800 border-green-300',
    };
    return cores[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      resolvido: 'Resolvido',
    };
    return labels[status] || status;
  };

  const getPrioridadeLabel = (gravidade?: number) => {
    const labels: Record<number, string> = {
      1: 'Baixa',
      2: 'Média',
      3: 'Alta',
      4: 'Urgente',
      5: 'Crítica',
    };
    return labels[gravidade || 1] || 'Baixa';
  };

  const getPrioridadeColor = (gravidade?: number) => {
    const cores: Record<number, string> = {
      1: 'bg-green-100 text-green-800 border-green-300',
      2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      3: 'bg-orange-100 text-orange-800 border-orange-300',
      4: 'bg-red-100 text-red-800 border-red-300',
      5: 'bg-red-200 text-red-900 border-red-400',
    };
    return cores[gravidade || 1] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getCategoriaNome = (tipo?: { nome: string } | null, tipoId?: number) => {
    if (tipo?.nome) return tipo.nome;
    const nomes: Record<number, string> = {
      1: 'Buraco',
      2: 'Iluminação',
      3: 'Lixo',
      4: 'Poda',
      5: 'Outro',
    };
    return nomes[tipoId || 0] || 'Infraestrutura';
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    const hoje = new Date();
    const diff = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'hoje';
    if (diff === 1) return 'há 1 dia';
    if (diff < 7) return `há ${diff} dias`;
    if (diff < 30) return `há ${Math.floor(diff / 7)} semanas`;
    if (diff < 365) return `há ${Math.floor(diff / 30)} meses`;
    return `há ${Math.floor(diff / 365)} anos`;
  };

  const truncarTexto = (texto: string, max: number = 100) => {
    if (texto.length <= max) return texto;
    return texto.substring(0, max) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Minhas Denúncias</h1>
          <p className="text-sm text-gray-500">{filteredDenuncias.length} denúncias encontradas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar denúncias por título, descrição ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setFiltroAberto(!filtroAberto)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition"
            >
              <Filter className="w-4 h-4" />
              {filtroAberto ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              {filtroAberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {filtroAberto && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setFiltroStatus('todos')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    filtroStatus === 'todos'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroStatus('pendente')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    filtroStatus === 'pendente'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setFiltroStatus('em_andamento')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    filtroStatus === 'em_andamento'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Em Andamento
                </button>
                <button
                  onClick={() => setFiltroStatus('resolvido')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    filtroStatus === 'resolvido'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Resolvidos
                </button>
              </div>
            )}
          </div>
        </div>

        {filteredDenuncias.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
            <span className="text-5xl block mb-4">📭</span>
            <h3 className="text-xl font-semibold text-gray-700">Nenhuma denúncia encontrada</h3>
            <p className="text-gray-400 mt-2">
              {searchTerm ? 'Tente alterar seus filtros de busca' : 'Você ainda não criou nenhuma denúncia.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/nova-denuncia')}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Criar Denúncia
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDenuncias.map((denuncia) => (
              <div
                key={denuncia.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/denuncia/${denuncia.id}`)}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">{denuncia.titulo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(denuncia.status)}`}>
                      {getStatusLabel(denuncia.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(denuncia.gravidade)}`}>
                      {getPrioridadeLabel(denuncia.gravidade)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {truncarTexto(denuncia.descricao, 120)}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {getCategoriaNome(denuncia.tipo_denuncia, denuncia.tipo_denuncia_id)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {denuncia.local}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {denuncia.anonimo ? 'Anônimo' : denuncia.usuario?.nome || 'Usuário'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatarData(denuncia.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}