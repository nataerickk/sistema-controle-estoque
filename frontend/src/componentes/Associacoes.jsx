import { useEffect, useState } from 'react';
import { chamarApi } from '../api';

export default function Associacoes() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [mensagem, setMensagem] = useState(null);

  async function carregarAssociacoes() {
    try {
      const dados = await chamarApi('/associacoes');
      setAssociacoes(dados);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  async function carregarTudo() {
    try {
      const [produtosCarregados, fornecedoresCarregados, associacoesCarregadas] = await Promise.all([
        chamarApi('/produtos'),
        chamarApi('/fornecedores'),
        chamarApi('/associacoes'),
      ]);

      setProdutos(produtosCarregados);
      setFornecedores(fornecedoresCarregados);
      setAssociacoes(associacoesCarregadas);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  function limparSelecao() {
    setProdutoId('');
    setFornecedorId('');
  }

  async function salvar(evento) {
    evento.preventDefault();

    const produtoSelecionado = Number(produtoId);
    const fornecedorSelecionado = Number(fornecedorId);

    if (!produtoId || !fornecedorId || !Number.isInteger(produtoSelecionado) || !Number.isInteger(fornecedorSelecionado)) {
      setMensagem({ tipo: 'erro', texto: 'Escolha um produto e um fornecedor válidos.' });
      return;
    }

    try {
      await chamarApi('/associacoes', {
        method: 'POST',
        body: JSON.stringify({
          produto_id: produtoSelecionado,
          fornecedor_id: fornecedorSelecionado,
        }),
      });

      setMensagem({ tipo: 'ok', texto: 'Produto associado ao fornecedor com sucesso!' });
      limparSelecao();
      await carregarAssociacoes();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  async function desassociar(id) {
    try {
      await chamarApi(`/associacoes/${id}`, { method: 'DELETE' });
      setMensagem({ tipo: 'ok', texto: 'Fornecedor desassociado com sucesso!' });
      await carregarAssociacoes();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <h2>Associar produto a fornecedor</h2>
      <form onSubmit={salvar}>
        <label>
          Produto
          <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">Escolha um produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fornecedor
          <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
            <option value="">Escolha um fornecedor</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome_empresa}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Associar</button>
      </form>

      {mensagem && <p className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</p>}

      <h2>Associações existentes</h2>
      {associacoes.length === 0 ? (
        <p>Nenhuma associação cadastrada ainda.</p>
      ) : (
        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Fornecedor</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {associacoes.map((a) => (
                <tr key={a.id}>
                  <td>{a.produto}</td>
                  <td>{a.fornecedor}</td>
                  <td>
                    <button type="button" onClick={() => desassociar(a.id)}>
                      Desassociar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
