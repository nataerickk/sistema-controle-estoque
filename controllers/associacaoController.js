// associacaoController.js - regras da associacao produto-fornecedor (muitos para muitos)

const db = require('../db');

// POST /associacoes
function associar(req, res) {
  const { produto_id, fornecedor_id } = req.body ?? {};

  // Os dois ids são obrigatórios e precisam ser números inteiros
  if (!Number.isInteger(produto_id) || !Number.isInteger(fornecedor_id)) {
    return res.status(400).json({ erro: 'produto_id e fornecedor_id são obrigatórios e devem ser números inteiros.' });
  }

  // Confere se o produto e o fornecedor realmente existem
  const produto = db.prepare('SELECT id FROM produtos WHERE id = ?').get(produto_id);
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }
  const fornecedor = db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(fornecedor_id);
  if (!fornecedor) {
    return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  }

  try {
    const resultado = db
      .prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)')
      .run(produto_id, fornecedor_id);

    res.status(201).json({ id: resultado.lastInsertRowid, produto_id, fornecedor_id });
  } catch (error_) {
    // O banco recusa a mesma dupla produto + fornecedor duas vezes
    if (error_.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ erro: 'Fornecedor já está associado a este produto!' });
    }
    res.status(500).json({ erro: 'Erro ao associar produto e fornecedor.' });
  }
}

// GET /associacoes
function listar(req, res) {
  const associacoes = db
    .prepare(
      `SELECT pf.id, pf.produto_id, p.nome AS produto,
              pf.fornecedor_id, f.nome_empresa AS fornecedor
       FROM produto_fornecedor pf
       JOIN produtos p ON p.id = pf.produto_id
       JOIN fornecedores f ON f.id = pf.fornecedor_id`
    )
    .all();
  res.json(associacoes);
}

// GET /produtos/:id/fornecedores
function listarFornecedoresDoProduto(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'O id do produto deve ser um número inteiro.' });
  }

  const produto = db.prepare('SELECT id FROM produtos WHERE id = ?').get(id);
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  const fornecedores = db
    .prepare(
      `SELECT f.*, pf.id AS associacao_id
       FROM fornecedores f
       JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
       WHERE pf.produto_id = ?`
    )
    .all(id);
  res.json(fornecedores);
}

// DELETE /associacoes/:id
function desassociar(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'O id da associação deve ser um número inteiro.' });
  }

  const resultado = db.prepare('DELETE FROM produto_fornecedor WHERE id = ?').run(id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Associação não encontrada.' });
  }

  res.json({ mensagem: 'Associação removida com sucesso.' });
}

module.exports = { associar, listar, listarFornecedoresDoProduto, desassociar };
