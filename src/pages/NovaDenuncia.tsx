import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function NovaDenuncia() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [categoria, setCategoria] = useState('');
  const [gravidade, setGravidade] = useState(1);
  const [anonimo, setAnonimo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setSucesso(false);

    try {
      const dados = {
        titulo,
        descricao,
        endereco_denuncia: local,
        tipo_denuncia_id: parseInt(categoria),
        gravidade,
        anonimo,
        usuario_id: anonimo ? null : usuario?.id
      };

      const response = await api.post('/denuncias', dados);
      setSucesso(true);
      
      setTimeout(() => {
        navigate(`/denuncia/${response.data.id || response.data}`);
      }, 1500);
      
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao criar denúncia');
    } finally {
      setLoading(false);
    }
  };

  const getGravidadeLabel = (value: number) => {
    const labels: Record<number, string> = {
      1: 'Baixa',
      2: 'Média',
      3: 'Alta',
      4: 'Urgente',
      5: 'Crítica'
    };
    return labels[value] || 'Baixa';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Nova Denúncia</h1>
            <p className="text-sm text-gray-500 mt-1">
              Preencha os dados abaixo para registrar sua denúncia. Campos com <span className="text-red-500">*</span> são obrigatórios.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {sucesso && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle className="w-5 h-5" />
                Denúncia criada com sucesso! Redirecionando...
              </div>
            )}

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {erro}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Buracão na rua, lixo acumulado..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Selecione uma categoria</option>
                <option value="1">Buraco</option>
                <option value="2">Iluminação</option>
                <option value="3">Lixo</option>
                <option value="4">Poda</option>
                <option value="5">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade <span className="text-red-500">*</span>
              </label>
              <select
                value={gravidade}
                onChange={(e) => setGravidade(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={1}>Baixa</option>
                <option value={2}>Média</option>
                <option value={3}>Alta</option>
                <option value={4}>Urgente</option>
                <option value={5}>Crítica</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Prioridade atual: <span className="font-medium">{getGravidadeLabel(gravidade)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Descreva o problema em detalhes..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Rua das Flores, 123 - Centro"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={anonimo}
                onChange={(e) => setAnonimo(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                id="anonimo"
              />
              <label htmlFor="anonimo" className="text-sm text-gray-700">
                Denúncia anônima
              </label>
              <span className="text-xs text-gray-400">
                Sua identidade não será revelada publicamente
              </span>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || sucesso}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? 'Enviando...' : 'Enviar Denúncia'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          <span className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Prefeitura+ • {usuario?.nome}
          </span>
        </div>
      </div>
    </div>
  );
}