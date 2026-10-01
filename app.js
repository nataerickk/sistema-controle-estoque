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
  } catch (erro) {
    // O banco recusa CNPJ repetido (por causa do UNIQUE que criamos)
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
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
// Liga o servidor e fica esperando pedidos na porta 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});