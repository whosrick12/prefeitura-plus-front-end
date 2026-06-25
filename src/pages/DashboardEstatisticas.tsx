import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  BarChart3,
  MapPin,
  User,
  Calendar,
  Tag,
  Eye,
  Shield,
  Award,
  X,
  Search,
  List,
  ChevronDown
} from 'lucide-react';

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
  tipo_denuncia?: { nome: string };
}

interface Estatisticas {
  total_denuncias: number;
  denuncias_por_status: { status: string; contagem: number }[];
  denuncias_por_departamento: { nome: string; contagem: number }[];
}

export default function DashboardEstatisticas() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [denunciasFiltradas, setDenunciasFiltradas] = useState<Denuncia[]>([]);

  useEffect(() => {
    const papel = usuario?.papel;
    if (papel !== 'admin' && papel !== 'funcionario') {
      setErro('Acesso negado. Apenas administradores podem acessar o dashboard.');
      setLoading(false);
      return;
    }
    carregarDados();
  }, []);

  useEffect(() => {
    if (modalAberto) {
      filtrarDenuncias();
    }
  }, [busca, filterStatus, denuncias, modalAberto]);

  const carregarDados = async () => {
    try {
      const [estatisticasRes, denunciasRes] = await Promise.all([
        api.get('/denuncias/estatisticas'),
        api.get('/denuncias/fila')
      ]);

      setEstatisticas(estatisticasRes.data);
      setDenuncias(denunciasRes.data);
      setDenunciasFiltradas(denunciasRes.data);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados. Tente novamente.');
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
    return nomes[tipoId || 0] || 'Sem categoria';
  };

  const getCategoriaColor = (tipoId?: number) => {
    const cores: Record<number, string> = {
      1: 'bg-orange-100 text-orange-800 border-orange-300',
      2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      3: 'bg-red-100 text-red-800 border-red-300',
      4: 'bg-green-100 text-green-800 border-green-300',
      5: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return cores[tipoId || 0] || 'bg-gray-100 text-gray-800 border-gray-300';
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

  const formatarDataCompleta = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncarTexto = (texto: string, max: number = 100) => {
    if (texto.length <= max) return texto;
    return texto.substring(0, max) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <span className="text-5xl block mb-4">🔒</span>
          <h3 className="text-xl font-semibold text-gray-700">Acesso negado</h3>
          <p className="text-gray-400 mt-2">{erro}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  const total = estatisticas?.total_denuncias || 0;
  const porStatus = estatisticas?.denuncias_por_status || [];
  const pendentes = porStatus.find(s => s.status === 'pendente')?.contagem || 0;
  const emAndamento = porStatus.find(s => s.status === 'em_andamento')?.contagem || 0;
  const resolvidos = porStatus.find(s => s.status === 'resolvido')?.contagem || 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Bem-vindo, <span className="text-primary">{usuario?.nome?.split(' ')[0] || 'Administrador'}</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    {usuario?.papel === 'admin' ? 'Administrador' : 'Funcionário'}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="text-primary hover:bg-primary/10 transition text-sm bg-gray-50 px-4 py-2 rounded-full border border-gray-200 flex items-center gap-1"
                >
                  ← Voltar
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-md border border-blue-100 p-5 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{total}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-500">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-md border border-yellow-100 p-5 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendentes}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-500">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-md border border-blue-100 p-5 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-600">{emAndamento}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-md border border-green-100 p-5 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resolvidos</p>
                  <p className="text-2xl font-bold text-green-600">{resolvidos}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center text-green-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Últimas Denúncias
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {denuncias.length} denúncias
                </span>
                <button
                  onClick={() => setModalAberto(true)}
                  className="flex items-center gap-1 text-sm text-primary hover:text-blue-700 transition bg-blue-50 px-3 py-1 rounded-full"
                >
                  <List className="w-4 h-4" />
                  Listar Todos
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {denuncias.slice(0, 6).length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nenhuma denúncia registrada.
                </div>
              ) : (
                denuncias.slice(0, 6).map((denuncia) => (
                  <div 
                    key={denuncia.id}
                    className="px-6 py-4 hover:bg-blue-50/50 transition cursor-pointer group"
                    onClick={() => navigate(`/denuncia/${denuncia.id}`)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-800 group-hover:text-primary transition">
                          {denuncia.titulo}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBg(denuncia.status)}`}>
                          {getStatusLabel(denuncia.status)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPrioridadeColor(denuncia.gravidade)}`}>
                          {getPrioridadeLabel(denuncia.gravidade)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoriaColor(denuncia.tipo_denuncia_id)}`}>
                          {getCategoriaNome(denuncia.tipo_denuncia, denuncia.tipo_denuncia_id)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {truncarTexto(denuncia.descricao, 120)}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
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
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            <span className="flex items-center justify-center gap-2">
              <Award className="w-3 h-3 text-primary" />
              Painel administrativo • {usuario?.nome}
            </span>
          </div>
        </div>
      </div>

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
                  placeholder="Buscar por título, descrição, local, autor ou categoria..."
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBg(denuncia.status)}`}>
                          {getStatusLabel(denuncia.status)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPrioridadeColor(denuncia.gravidade)}`}>
                          {getPrioridadeLabel(denuncia.gravidade)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoriaColor(denuncia.tipo_denuncia_id)}`}>
                          {getCategoriaNome(denuncia.tipo_denuncia, denuncia.tipo_denuncia_id)}
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
    </>
  );
}