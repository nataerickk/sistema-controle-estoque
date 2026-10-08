import { useEffect, useState } from 'react';
import { chamarApi } from '../api';

// Campos opcionais não têm "obrigatorio"; o servidor valida o resto
const CAMPOS = [
  { nome: 'nome', rotulo: 'Nome' },
  { nome: 'codigo_barras', rotulo: 'Código de barras (opcional)' },
  { nome: 'descricao', rotulo: 'Descrição' },
  { nome: 'quantidade_estoque', rotulo: 'Quantidade em estoque', tipo: 'number' },
  { nome: 'categoria', rotulo: 'Categoria' },
  { nome: 'data_validade', rotulo: 'Data de validade (opcional)', tipo: 'date' },
  { nome: 'imagem', rotulo: 'Imagem - endereço (opcional)' },
];

const FORM_VAZIO = Object.fromEntries(CAMPOS.map((c) => [c.nome, '']));

export default function Produtos() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mensagem, setMensagem] = useState(null);

  async function carregar() {
    try {
      setLista(await chamarApi('/produtos'));
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function mudar(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  async function salvar(evento) {
    evento.preventDefault();

    // O campo de quantidade chega como texto; o servidor espera um número.
    // Se estiver vazio, não enviamos e o servidor começa em 0.
    const dados = { ...form };
    if (dados.quantidade_estoque === '') {
      delete dados.quantidade_estoque;
    } else {
      dados.quantidade_estoque = Number(dados.quantidade_estoque);
    }

    try {
      await chamarApi('/produtos', { method: 'POST', body: JSON.stringify(dados) });
      setMensagem({ tipo: 'ok', texto: 'Produto cadastrado com sucesso!' });
      setForm(FORM_VAZIO);
      carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <h2>Cadastrar produto</h2>
      <form onSubmit={salvar}>
        {CAMPOS.map((campo) => (
          <label key={campo.nome}>
            {campo.rotulo}
            <input
              name={campo.nome}
              type={campo.tipo || 'text'}
              min={campo.tipo === 'number' ? 0 : undefined}
              value={form[campo.nome]}
              onChange={mudar}
            />
          </label>
        ))}
        <button type="submit">Cadastrar</button>
      </form>

      {mensagem && <p className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</p>}

      <h2>Produtos cadastrados</h2>
      {lista.length === 0 ? (
        <p>Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código de barras</th>
                <th>Descrição</th>
                <th>Estoque</th>
                <th>Categoria</th>
                <th>Validade</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.codigo_barras || '-'}</td>
                  <td>{p.descricao}</td>
                  <td>{p.quantidade_estoque}</td>
                  <td>{p.categoria}</td>
                  <td>{p.data_validade || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
