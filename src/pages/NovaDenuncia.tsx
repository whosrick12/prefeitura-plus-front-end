import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function NovaDenuncia() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [tipoDenunciaId, setTipoDenunciaId] = useState(1);
  const [anonimo, setAnonimo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      await api.post('/denuncias', {
        titulo,
        descricao,
        endereco_denuncia: local,
        tipo_denuncia_id: tipoDenunciaId,
        anonimo,
      });
      navigate('/');
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao criar denúncia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-primary hover:underline mb-4"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Nova Denúncia</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Título *</label>
              <input
                type="text"
                placeholder="Ex: Buraco na Rua das Flores"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Endereço *</label>
              <input
                type="text"
                placeholder="Ex: Rua das Flores, 123 - Centro"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Categoria</label>
              <select
                value={tipoDenunciaId}
                onChange={(e) => setTipoDenunciaId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>Buraco</option>
                <option value={2}>Iluminação</option>
                <option value={3}>Lixo</option>
                <option value={4}>Poda</option>
                <option value={5}>Outro</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Descrição *</label>
              <textarea
                placeholder="Descreva o problema detalhadamente..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonimo}
                  onChange={(e) => setAnonimo(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-gray-700">Denunciar anonimamente</span>
              </label>
            </div>

            {erro && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Denúncia'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}