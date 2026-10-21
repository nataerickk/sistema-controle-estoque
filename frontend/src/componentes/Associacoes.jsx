import { useEffect, useState } from 'react';
import { chamarApi } from '../api';

export default function Associacoes() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [fornecedoresDoProduto, setFornecedoresDoProduto] = useState([]);

  async function carregarFornecedoresDoProduto(id) {
    if (!id) {
      setFornecedoresDoProduto([]);
      return;
    }
    try {
      const dados = await chamarApi('/produtos/' + id + '/fornecedores');
      setFornecedoresDoProduto(dados);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  useEffect(() => {
    carregarFornecedoresDoProduto(produtoId);
  }, [produtoId]);

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

      setMensagem({ tipo: 'ok', texto: 'Fornecedor associado com sucesso ao produto!' });
      setFornecedorId('');
      await carregarAssociacoes();
      await carregarFornecedoresDoProduto(produtoId);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  async function desassociar(id) {
    try {
      await chamarApi(`/associacoes/${id}`, { method: 'DELETE' });
      setMensagem({ tipo: 'ok', texto: 'Fornecedor desassociado com sucesso!' });
      await carregarAssociacoes();
      await carregarFornecedoresDoProduto(produtoId);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  const produtoAtual = produtos.find((p) => String(p.id) === String(produtoId));

  function escolherProduto(evento) {
    setProdutoId(evento.target.value);
    setFornecedorId('');
    setMensagem(null);
  }

  return (
    <section>
      <h2>Detalhes do produto</h2>
      <label className="seletor-produto">
        Produto
        <select value={produtoId} onChange={escolherProduto}>
          <option value="">Selecione um produto</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>

      {produtoAtual && (
        <>
          <div className="detalhes-produto">
            {produtoAtual.imagem && (
              <img className="previa-imagem" src={produtoAtual.imagem} alt={produtoAtual.nome} />
            )}
            <div>
              <p><strong>Nome:</strong> {produtoAtual.nome}</p>
              <p><strong>Código de barras:</strong> {produtoAtual.codigo_barras || '-'}</p>
              <p><strong>Descrição:</strong> {produtoAtual.descricao}</p>
            </div>
          </div>

          <h2>Associar fornecedor</h2>
          <form onSubmit={salvar} noValidate>
            <label>
              Fornecedor
              <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome_empresa}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Associar Fornecedor</button>
          </form>
        </>
      )}

      {mensagem && <p className={'mensagem ' + mensagem.tipo}>{mensagem.texto}</p>}

      {produtoAtual && (
        <>
          <h2>Fornecedores associados</h2>
          {fornecedoresDoProduto.length === 0 ? (
            <p>Nenhum fornecedor associado a este produto.</p>
          ) : (
            <div className="tabela-rolavel">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CNPJ</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedoresDoProduto.map((f) => (
                    <tr key={f.associacao_id}>
                      <td>{f.nome_empresa}</td>
                      <td>{f.cnpj}</td>
                      <td>
                        <button type="button" onClick={() => desassociar(f.associacao_id)}>
                          Desassociar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
