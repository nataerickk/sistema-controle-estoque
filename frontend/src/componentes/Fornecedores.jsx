import { useEffect, useState } from 'react';
import { chamarApi } from '../api';

// Os campos do formulário: o "nome" é o mesmo nome da coluna no banco
const CAMPOS = [
  { nome: 'nome_empresa', rotulo: 'Nome da empresa' },
  { nome: 'cnpj', rotulo: 'CNPJ' },
  { nome: 'endereco', rotulo: 'Endereço' },
  { nome: 'telefone', rotulo: 'Telefone' },
  { nome: 'email', rotulo: 'E-mail', tipo: 'email' },
  { nome: 'contato_principal', rotulo: 'Contato principal' },
];

const FORM_VAZIO = Object.fromEntries(CAMPOS.map((c) => [c.nome, '']));

export default function Fornecedores() {
  const [lista, setLista] = useState([]); // fornecedores que vieram do servidor
  const [form, setForm] = useState(FORM_VAZIO); // o que está digitado no formulário
  const [mensagem, setMensagem] = useState(null); // aviso de sucesso ou erro

  async function carregar() {
    try {
      setLista(await chamarApi('/fornecedores'));
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  // Roda uma vez, quando a tela aparece: busca a lista no servidor
  useEffect(() => {
    carregar();
  }, []);

  function mudar(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  async function salvar(evento) {
    evento.preventDefault(); // impede a página de recarregar ao enviar
    try {
      await chamarApi('/fornecedores', { method: 'POST', body: JSON.stringify(form) });
      setMensagem({ tipo: 'ok', texto: 'Fornecedor cadastrado com sucesso!' });
      setForm(FORM_VAZIO);
      carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <h2>Cadastrar fornecedor</h2>
      <form onSubmit={salvar}>
        {CAMPOS.map((campo) => (
          <label key={campo.nome}>
            {campo.rotulo}
            <input
              name={campo.nome}
              type={campo.tipo || 'text'}
              value={form[campo.nome]}
              onChange={mudar}
            />
          </label>
        ))}
        <button type="submit">Cadastrar</button>
      </form>

      {mensagem && <p className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</p>}

      <h2>Fornecedores cadastrados</h2>
      {lista.length === 0 ? (
        <p>Nenhum fornecedor cadastrado ainda.</p>
      ) : (
        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>Endereço</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Contato</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((f) => (
                <tr key={f.id}>
                  <td>{f.nome_empresa}</td>
                  <td>{f.cnpj}</td>
                  <td>{f.endereco}</td>
                  <td>{f.telefone}</td>
                  <td>{f.email}</td>
                  <td>{f.contato_principal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
