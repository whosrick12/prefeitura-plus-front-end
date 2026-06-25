import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, X, List, MapPin, User, Calendar, Award } from 'lucide-react';

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
}

export default function Home() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvidos, setResolvidos] = useState<Denuncia[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [denunciasFiltradas, setDenunciasFiltradas] = useState<Denuncia[]>([]);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarDenuncias();
  }, []);

  useEffect(() => {
    if (modalAberto) {
      filtrarDenuncias();
    }
  }, [busca, filterStatus, denuncias, modalAberto]);

  const carregarDenuncias = async () => {
    try {
      const { data } = await api.get('/denuncias/fila');
      
      const denunciasComNomes = data.map((denuncia: Denuncia) => {
        if (denuncia.anonimo) {
          return { ...denuncia, usuario: { nome: '🕵️ Anônimo' } };
        }
        return denuncia;
      });
      
      setDenuncias(denunciasComNomes);
      setDenunciasFiltradas(denunciasComNomes);
      const resolvidosList = denunciasComNomes.filter((d: Denuncia) => d.status === 'resolvido');
      setResolvidos(resolvidosList);
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarDenuncias = () => {
    let filtradas = [...denuncias];
    if (filterStatus !== 'todos') {
      filtradas = filtradas.filter(d => d.status === filterStatus);
    }
    if (busca.trim()) {
      const term = busca.toLowerCase();
      filtradas = filtradas.filter(d =>
        d.titulo.toLowerCase().includes(term) ||
        d.descricao.toLowerCase().includes(term) ||
        d.local.toLowerCase().includes(term)
      );
    }
    setDenunciasFiltradas(filtradas);
  };

  const getStatusColor = (status: string) => {
    const cores: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      em_andamento: 'bg-blue-100 text-blue-800 border-blue-200',
      resolvido: 'bg-green-100 text-green-800 border-green-200',
    };
    return cores[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em andamento',
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

  const formatarData = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarDataResolvido = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const truncarTexto = (texto: string, max: number = 120) => {
    if (texto.length <= max) return texto;
    return texto.substring(0, max) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando denúncias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                👋 Olá, {usuario?.nome || 'Cidadão'}
              </h1>
              <p className="text-blue-100 mt-1">
                {denuncias.length} denúncias registradas • {resolvidos.length} resolvidas
              </p>
            </div>
            <button
              onClick={() => navigate('/nova-denuncia')}
              className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">+</span> Nova Denúncia
            </button>
          </div>
        </div>
      </div>

      {resolvidos.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-200 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800">
                Já resolvemos{' '}
                <span className="text-primary bg-primary/10 px-4 py-1 rounded-2xl">
                  {resolvidos.length}
                </span>{' '}
                problemas este mês!
              </h2>
              <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
                Sua voz está transformando a cidade. Veja algumas das conquistas recentes da comunidade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {resolvidos.slice(0, 3).map((denuncia) => (
                <div
                  key={denuncia.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-green-500 cursor-pointer group hover:-translate-y-1"
                  onClick={() => navigate(`/denuncia/${denuncia.id}`)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-gray-800 group-hover:text-green-600 transition line-clamp-1">
                        {denuncia.titulo}
                      </h3>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        ✅ Resolvido
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {truncarTexto(denuncia.descricao, 100)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                      <span>📍 {denuncia.local}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-green-600 font-medium">
                        ✅ Resolvido em {formatarDataResolvido(denuncia.created_at)}
                      </span>
                      <span className="text-gray-400">
                        {denuncia.anonimo ? '🕵️ Anônimo' : denuncia.usuario?.nome || 'Usuário'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Denúncias Recentes</h2>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1 text-sm text-primary hover:text-blue-700 transition bg-blue-50 px-3 py-1 rounded-full"
          >
            <List className="w-4 h-4" />
            Listar Todos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {denuncias.slice(0, 6).map((denuncia) => (
            <div
              key={denuncia.id}
              onClick={() => navigate(`/denuncia/${denuncia.id}`)}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group hover:-translate-y-1"
            >
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition line-clamp-1">
                      {denuncia.titulo}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(denuncia.status)}`}>
                        {getStatusLabel(denuncia.status)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPrioridadeColor(denuncia.gravidade)}`}>
                        {getPrioridadeLabel(denuncia.gravidade)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {truncarTexto(denuncia.descricao)}
                </p>
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate max-w-[150px]">{denuncia.local}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 font-medium">
                    {denuncia.anonimo ? '🕵️ Anônimo' : denuncia.usuario?.nome || 'Usuário'}
                  </span>
                </div>
              </div>

              <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatarData(denuncia.created_at)}
                </span>
              </div>

              <div className="h-1 bg-gradient-to-r from-primary to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>🏛️ Prefeitura+ • Sua voz transforma a cidade</p>
          <p className="mt-1">{denuncias.length} denúncias registradas • {resolvidos.length} resolvidas</p>
        </div>
      </footer>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <List className="w-5 h-5 text-primary" />
                Todas as Denúncias
                <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                  {denunciasFiltradas.length}
                </span>
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, descrição ou local..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
                {busca && (
                  <button
                    onClick={() => setBusca('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                <button
                  onClick={() => setFilterStatus('todos')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    filterStatus === 'todos'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterStatus('pendente')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    filterStatus === 'pendente'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setFilterStatus('em_andamento')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    filterStatus === 'em_andamento'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Em andamento
                </button>
                <button
                  onClick={() => setFilterStatus('resolvido')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    filterStatus === 'resolvido'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Resolvidos
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {denunciasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl block mb-2">🔍</span>
                  <p>Nenhuma denúncia encontrada para "{busca}"</p>
                </div>
              ) : (
                denunciasFiltradas.map((denuncia) => (
                  <div
                    key={denuncia.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-blue-50 transition cursor-pointer border border-gray-100 hover:border-primary/30"
                    onClick={() => {
                      setModalAberto(false);
                      navigate(`/denuncia/${denuncia.id}`);
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {denuncia.titulo}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(denuncia.status)}`}>
                          {getStatusLabel(denuncia.status)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPrioridadeColor(denuncia.gravidade)}`}>
                          {getPrioridadeLabel(denuncia.gravidade)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {denuncia.descricao}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {denuncia.local}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {denuncia.anonimo ? '🕵️ Anônimo' : denuncia.usuario?.nome || 'Usuário'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatarData(denuncia.created_at)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400">#{String(denuncia.id).padStart(4, '0')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between text-xs text-gray-400">
              <span>{denunciasFiltradas.length} denúncias encontradas</span>
              <button
                onClick={() => setModalAberto(false)}
                className="text-primary hover:underline"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}