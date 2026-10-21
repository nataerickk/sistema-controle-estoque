import { useEffect, useState } from 'react';
import { chamarApi } from '../api';

const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene e beleza', 'Eletr\u00f4nicos', 'Papelaria', 'Outro'];
const TAMANHO_MAXIMO_IMAGEM = 2 * 1024 * 1024;

const FORM_VAZIO = {
  nome: '',
  codigo_barras: '',
  descricao: '',
  quantidade_estoque: '',
  categoria: '',
  categoria_outro: '',
  data_validade: '',
};

export default function Produtos() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [imagem, setImagem] = useState('');
  const [chaveArquivo, setChaveArquivo] = useState(0);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);

  async function carregar() {
    try {
      const dados = await chamarApi('/produtos');
      setLista(dados);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function classe(nome) {
    return erros[nome] ? 'invalido' : '';
  }

  function erroDe(nome) {
    return erros[nome] ? <span className="erro-campo">{erros[nome]}</span> : null;
  }

  function mudar(evento) {
    const { name, value } = evento.target;
    setForm((formAtual) => ({ ...formAtual, [name]: value }));
    setErros((errosAtuais) => ({ ...errosAtuais, [name]: undefined }));
  }

  function escolherImagem(evento) {
    const arquivo = evento.target.files[0];
    setErros((errosAtuais) => ({ ...errosAtuais, imagem: undefined }));

    if (!arquivo) {
      setImagem('');
      return;
    }

    if (!arquivo.type.startsWith('image/')) {
      setErros((errosAtuais) => ({ ...errosAtuais, imagem: 'Escolha um arquivo de imagem.' }));
      setImagem('');
      setChaveArquivo((c) => c + 1);
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      setErros((errosAtuais) => ({ ...errosAtuais, imagem: 'A imagem deve ter no m\u00e1ximo 2 MB.' }));
      setImagem('');
      setChaveArquivo((c) => c + 1);
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => setImagem(leitor.result);
    leitor.readAsDataURL(arquivo);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErros({});
    setMensagem(null);

    try {
      await chamarApi('/produtos', {
        method: 'POST',
        body: JSON.stringify({ ...form, imagem }),
      });

      setMensagem({ tipo: 'ok', texto: 'Produto cadastrado com sucesso!' });
      setForm(FORM_VAZIO);
      setImagem('');
      setChaveArquivo((c) => c + 1);
      await carregar();
    } catch (erro) {
      setErros(erro.campos || {});
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <h2>Cadastrar produto</h2>
      <form onSubmit={salvar} noValidate>
        <label>
          Nome
          <input
            name="nome"
            type="text"
            placeholder="Insira o nome do produto"
            value={form.nome}
            onChange={mudar}
            className={classe('nome')}
          />
          {erroDe('nome')}
        </label>

        <label>
          {'C\u00f3digo de barras'}
          <input
            name="codigo_barras"
            type="text"
            inputMode="numeric"
            placeholder={'Insira o c\u00f3digo de barras'}
            value={form.codigo_barras}
            onChange={mudar}
            className={classe('codigo_barras')}
          />
          {erroDe('codigo_barras')}
        </label>

        <label className="campo-largo">
          {'Descri\u00e7\u00e3o'}
          <textarea
            name="descricao"
            rows="3"
            placeholder="Descreva brevemente o produto"
            value={form.descricao}
            onChange={mudar}
            className={classe('descricao')}
          />
          {erroDe('descricao')}
        </label>

        <label>
          Quantidade em estoque
          <input
            name="quantidade_estoque"
            type="number"
            placeholder={'Quantidade dispon\u00edvel'}
            value={form.quantidade_estoque}
            onChange={mudar}
            className={classe('quantidade_estoque')}
          />
          {erroDe('quantidade_estoque')}
        </label>

        <label>
          Categoria
          <select name="categoria" value={form.categoria} onChange={mudar} className={classe('categoria')}>
            <option value="">Selecione uma categoria</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {erroDe('categoria')}
        </label>

        {form.categoria === 'Outro' && (
          <label>
            Especifique a categoria
            <input
              name="categoria_outro"
              type="text"
              placeholder="Especifique a categoria"
              value={form.categoria_outro}
              onChange={mudar}
              className={classe('categoria_outro')}
            />
            {erroDe('categoria_outro')}
          </label>
        )}

        <label>
          {"Data de validade (se aplic\u00e1vel)"}
          <input
            name="data_validade"
            type="text"
            placeholder="Selecione a data de validade"
            value={form.data_validade}
            onChange={mudar}
            onFocus={(e) => {
              e.target.type = 'date';
              try {
                e.target.showPicker?.();
              } catch {
                /* se o navegador nao abrir o calendario, o campo continua funcionando */
              }
            }}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = 'text';
            }}
            className={classe('data_validade')}
          />
          {erroDe('data_validade')}
        </label>

        <label>
          {"Imagem (se aplic\u00e1vel)"}
          <input key={chaveArquivo} type="file" accept="image/*" onChange={escolherImagem} className={classe('imagem')} />
          {erroDe('imagem')}
          {imagem && <img className="previa-imagem" src={imagem} alt="Pre-visualizacao da imagem" />}
        </label>

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
                <th>{'C\u00f3digo de barras'}</th>
                <th>{'Descri\u00e7\u00e3o'}</th>
                <th>Estoque</th>
                <th>Categoria</th>
                <th>Validade</th>
                <th>Imagem</th>
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
                  <td>{p.imagem ? <img className="miniatura" src={p.imagem} alt={p.nome} /> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
