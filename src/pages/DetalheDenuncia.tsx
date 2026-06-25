import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, User, Calendar, Building2, ChevronLeft, ImageIcon, CheckCircle, Shield } from 'lucide-react';

interface Denuncia {
  id: number;
  titulo: string;
  descricao: string;
  local: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  status: string;
  created_at: string;
  usuario_id: number;
  anonimo: boolean;
  usuario?: { nome: string };
  gravidade?: number;
  tipo_denuncia_id?: number;
  departamento_id?: number;
  imagem_url?: string;
}

export default function DetalheDenuncia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [concluindo, setConcluindo] = useState(false);

  const isAdmin = usuario?.papel === 'admin' || usuario?.papel === 'funcionario';

  useEffect(() => {
    carregarDenuncia();
  }, [id]);

  const carregarDenuncia = async () => {
    try {
      const { data } = await api.get('/denuncias');
      const encontrada = data.find((d: Denuncia) => d.id === Number(id));
      
      if (encontrada) {
        setDenuncia(encontrada);
      } else {
        setErro('Denúncia não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error);
      setErro('Erro ao carregar denúncia');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoConcluido = async () => {
    if (!confirm('Marcar esta denúncia como concluída?')) return;
    
    setConcluindo(true);
    try {
      await api.patch(`/denuncias/${id}/status`, {
        status: 'resolvido'
      });
      carregarDenuncia();
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
      alert('Erro ao marcar denúncia como concluída.');
    } finally {
      setConcluindo(false);
    }
  };

  const getStatusColor = (status: string) => {
    const cores: Record<string, string> = {
      pendente: 'bg-yellow-500',
      em_andamento: 'bg-blue-500',
      resolvido: 'bg-green-500',
    };
    return cores[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      resolvido: 'Resolvido',
    };
    return labels[status] || status;
  };

  const getGravidadeLabel = (gravidade?: number) => {
    const labels: Record<number, string> = {
      1: 'Baixa',
      2: 'Média',
      3: 'Alta',
      4: 'Urgente',
      5: 'Crítica',
    };
    return labels[gravidade || 1] || 'Média';
  };

  const getGravidadeColor = (gravidade?: number) => {
    const cores: Record<number, string> = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800',
      5: 'bg-red-200 text-red-900',
    };
    return cores[gravidade || 1] || 'bg-gray-100 text-gray-800';
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

  const imagemUrl = denuncia?.imagem_url || null;

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

  if (erro || !denuncia) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <span className="text-5xl block mb-4">😕</span>
          <h3 className="text-xl font-semibold text-gray-700">{erro || 'Denúncia não encontrada'}</h3>
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

  const enderecoCompleto = [
    denuncia.rua,
    denuncia.numero,
    denuncia.bairro,
    denuncia.cidade
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {imagemUrl ? (
                <img 
                  src={imagemUrl} 
                  alt={denuncia.titulo}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                  <p className="text-gray-400 mt-2">Esta denúncia não possui foto</p>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(denuncia.status)}`}>
                    {getStatusLabel(denuncia.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGravidadeColor(denuncia.gravidade)}`}>
                    {getGravidadeLabel(denuncia.gravidade)}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">{denuncia.titulo}</h1>
                
                <p className="text-gray-600 mt-4 whitespace-pre-wrap leading-relaxed">
                  {denuncia.descricao}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{enderecoCompleto || denuncia.local || 'Endereço não informado'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{denuncia.anonimo ? '🕵️ Anônimo' : denuncia.usuario?.nome || 'Usuário'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{formatarData(denuncia.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span>Obras Públicas</span>
                  </div>
                </div>

                {denuncia.cidade && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Cidade</span>
                      <p className="text-gray-700 font-medium">{denuncia.cidade}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Bairro</span>
                      <p className="text-gray-700 font-medium">{denuncia.bairro || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Rua</span>
                      <p className="text-gray-700 font-medium">{denuncia.rua || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Número</span>
                      <p className="text-gray-700 font-medium">{denuncia.numero || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400">Localização</p>
                  <p className="text-sm text-gray-700">{enderecoCompleto || denuncia.local || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Denunciante</p>
                  <p className="text-sm text-gray-700">{denuncia.anonimo ? 'Anônimo' : denuncia.usuario?.nome || 'Usuário'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Data</p>
                  <p className="text-sm text-gray-700">{formatarData(denuncia.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Departamento</p>
                  <p className="text-sm text-gray-700">Obras Públicas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Status</h3>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(denuncia.status)}`}></div>
                <span className="text-sm font-medium text-gray-700">{getStatusLabel(denuncia.status)}</span>
              </div>
            </div>

            {isAdmin && denuncia.status !== 'resolvido' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
                <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Ação Administrativa
                </h3>
                <button
                  onClick={marcarComoConcluido}
                  disabled={concluindo}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  {concluindo ? 'Processando...' : '✅ Marcar como Concluído'}
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Esta ação só está disponível para administradores
                </p>
              </div>
            )}

            {isAdmin && denuncia.status === 'resolvido' && (
              <div className="bg-green-50 rounded-2xl shadow-lg p-6 border border-green-200">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">Esta denúncia já foi concluída</span>
                </div>
                <p className="text-xs text-green-600 mt-2">Ação já realizada por um administrador.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}