// app.js - servidor do sistema de controle de estoque

const express = require('express');
const db = require('./db');

const app = express();
app.disable('x-powered-by');
const PORT = 3000;

// Permite que o servidor entenda dados enviados em formato JSON
app.use(express.json());

// Rota de teste: só para confirmar que o servidor está de pé
app.get('/', (req, res) => {
  res.send('Servidor do estoque funcionando!');
});

// ---------------------------------------------------------------
// FORNECEDORES
// ---------------------------------------------------------------

// Cadastrar um fornecedor novo
app.post('/fornecedores', (req, res) => {
  const { nome_empresa, cnpj, endereco, telefone, email, contato_principal } = req.body;

  // Todos os campos são obrigatórios
  if (!nome_empresa || !cnpj || !endereco || !telefone || !email || !contato_principal) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  try {
    const resultado = db
      .prepare(
        `INSERT INTO fornecedores
         (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(nome_empresa, cnpj, endereco, telefone, email, contato_principal);

    res.status(201).json({ id: resultado.lastInsertRowid, nome_empresa, cnpj });
  } catch (error_) {
    // O banco recusa CNPJ repetido (por causa do UNIQUE que criamos)
    if (error_.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ erro: 'Já existe um fornecedor com esse CNPJ.' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar fornecedor.' });
  }
});

// Listar todos os fornecedores
app.get('/fornecedores', (req, res) => {
  const fornecedores = db.prepare('SELECT * FROM fornecedores').all();
  res.json(fornecedores);
});

// ---------------------------------------------------------------
// PRODUTOS
// ---------------------------------------------------------------

// Cadastrar um produto novo
app.post('/produtos', (req, res) => {
  const { nome, codigo_barras, descricao, quantidade_estoque, categoria, data_validade, imagem } = req.body ?? {};

  // Campos obrigatórios (os mesmos que são NOT NULL no banco)
  if (!nome || !descricao || !categoria) {
    return res.status(400).json({ erro: 'Nome, descrição e categoria são obrigatórios.' });
  }

  // Se a quantidade não vier, começa em 0; se vier, tem que ser inteiro e >= 0
  const quantidade = quantidade_estoque ?? 0;
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    return res.status(400).json({ erro: 'A quantidade em estoque deve ser um número inteiro maior ou igual a zero.' });
  }

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
      return res.status(409).json({ erro: 'Já existe um produto com esse código de barras.' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar produto.' });
  }
});

// Listar todos os produtos
app.get('/produtos', (req, res) => {
  const produtos = db.prepare('SELECT * FROM produtos').all();
  res.json(produtos);
});

// ---------------------------------------------------------------
// ASSOCIAÇÃO PRODUTO-FORNECEDOR
// ---------------------------------------------------------------

// Associar um produto a um fornecedor
app.post('/associacoes', (req, res) => {
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
      return res.status(409).json({ erro: 'Esse produto já está associado a esse fornecedor.' });
    }
    res.status(500).json({ erro: 'Erro ao associar produto e fornecedor.' });
  }
});

// Listar todas as associações (com os nomes, para facilitar a leitura)
app.get('/associacoes', (req, res) => {
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
});

// Listar os fornecedores de um produto específico
app.get('/produtos/:id/fornecedores', (req, res) => {
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
      `SELECT f.*
       FROM fornecedores f
       JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
       WHERE pf.produto_id = ?`
    )
    .all(id);
  res.json(fornecedores);
});

// Liga o servidor e fica esperando pedidos na porta 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
