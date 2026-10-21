// produtoController.js - regras dos produtos (cadastrar e listar)

const db = require('../db');
const { validarProduto } = require('../validacoes');

// POST /produtos
function cadastrar(req, res) {
  // Confere cada campo e junta os erros (campo -> mensagem)
  const { erros, dados } = validarProduto(req.body ?? {});
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erro: "Corrija os campos indicados.", campos: erros });
  }
  const { nome, codigo_barras, descricao, quantidade, categoria, data_validade, imagem } = dados;

  try {
    const resultado = db
      .prepare(
        `INSERT INTO produtos
         (nome, codigo_barras, descricao, quantidade_estoque, categoria, data_validade, imagem)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(nome, codigo_barras || null, descricao, quantidade, categoria, data_validade || null, imagem || null);

    res.status(201).json({ id: resultado.lastInsertRowid, nome, categoria, quantidade_estoque: quantidade });
  } catch (error_) {
    if (error_.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ erro: 'Produto com este código de barras já está cadastrado!' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar produto.' });
  }
}

// GET /produtos
function listar(req, res) {
  const produtos = db.prepare('SELECT * FROM produtos').all();
  res.json(produtos);
}

module.exports = { cadastrar, listar };
