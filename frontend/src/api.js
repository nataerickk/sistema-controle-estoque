// api.js - único ponto de comunicação entre a tela (React) e o servidor (backend)

const URL_BASE = 'http://localhost:3000';

// Faz um pedido ao servidor e devolve a resposta já convertida (JSON).
// Se o servidor responder com erro (400, 404, 409...), lança um Error com a mensagem dele.
export async function chamarApi(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch {
    throw new Error('Não consegui falar com o servidor. Ele está ligado?');
  }

  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro inesperado.');
  }
  return dados;
}
