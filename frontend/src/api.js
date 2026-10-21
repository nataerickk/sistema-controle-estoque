// api.js - unico ponto de comunicacao entre a tela (React) e o servidor (backend)

const URL_BASE = 'http://localhost:3000';

// Faz um pedido ao servidor e devolve a resposta ja convertida (JSON).
// Se o servidor responder com erro (400, 404, 409...), lanca um Error com a mensagem dele.
// Se o servidor mandar erros por campo, eles ficam em erro.campos.
export async function chamarApi(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch {
    throw new Error('N\u00e3o consegui falar com o servidor. Ele est\u00e1 ligado?');
  }

  const dados = await resposta.json();
  if (!resposta.ok) {
    const erro = new Error(dados.erro || 'Erro inesperado.');
    erro.campos = dados.campos;
    throw erro;
  }
  return dados;
}
