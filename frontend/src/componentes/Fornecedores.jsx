import { useEffect, useState } from 'react';
import { chamarApi } from '../api';

const CAMPOS = [
  { nome: 'nome_empresa', rotulo: 'Nome da empresa', placeholder: 'Insira o nome da empresa' },
  { nome: 'cnpj', rotulo: 'CNPJ', placeholder: '00.000.000/0000-00' },
  { nome: 'endereco', rotulo: 'Endere\u00e7o', placeholder: 'Insira o endere\u00e7o completo da empresa' },
  { nome: 'telefone', rotulo: 'Telefone', placeholder: '(00) 0000-0000' },
  { nome: 'email', rotulo: 'E-mail', tipo: 'email', placeholder: 'exemplo@fornecedor.com' },
  { nome: 'contato_principal', rotulo: 'Contato principal', placeholder: 'Nome do contato principal' },
];

const FORM_VAZIO = Object.fromEntries(CAMPOS.map((c) => [c.nome, '']));

export default function Fornecedores() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);

  async function carregar() {
    try {
      const dados = await chamarApi('/fornecedores');
      setLista(dados);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function mudar(evento) {
    const { name, value } = evento.target;
    setForm((formAtual) => ({ ...formAtual, [name]: value }));
    setErros((errosAtuais) => ({ ...errosAtuais, [name]: undefined }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErros({});
    setMensagem(null);

    try {
      await chamarApi('/fornecedores', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setMensagem({ tipo: 'ok', texto: 'Fornecedor cadastrado com sucesso!' });
      setForm(FORM_VAZIO);
      await carregar();
    } catch (erro) {
      setErros(erro.campos || {});
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <h2>Cadastrar fornecedor</h2>
      <form onSubmit={salvar} noValidate>
        {CAMPOS.map((campo) => (
          <label key={campo.nome}>
            {campo.rotulo}
            <input
              name={campo.nome}
              type={campo.tipo || 'text'}
              placeholder={campo.placeholder}
              value={form[campo.nome]}
              onChange={mudar}
              className={erros[campo.nome] ? 'invalido' : ''}
              aria-invalid={erros[campo.nome] ? 'true' : 'false'}
            />
            {erros[campo.nome] && <span className="erro-campo">{erros[campo.nome]}</span>}
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
                <th>{'Endere\u00e7o'}</th>
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
