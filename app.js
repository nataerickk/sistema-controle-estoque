// app.js - servidor do sistema de controle de estoque

const express = require('express');
const cors = require('cors');

const app = express();
app.disable('x-powered-by');
const PORT = 3000;

// Autoriza o frontend (React, rodando na porta 5173) a conversar com este servidor
app.use(cors({ origin: 'http://localhost:5173' }));

// Permite que o servidor entenda dados enviados em formato JSON
app.use(express.json({ limit: '5mb' }));

// Rota de teste: só para confirmar que o servidor está de pé
app.get('/', (req, res) => {
  res.send('Servidor do estoque funcionando!');
});

// ---------------------------------------------------------------
// ROTAS - cada rota chama uma funcao do controller responsavel
// ---------------------------------------------------------------

const fornecedorController = require('./controllers/fornecedorController');
const produtoController = require('./controllers/produtoController');
const associacaoController = require('./controllers/associacaoController');

// Fornecedores
app.post('/fornecedores', fornecedorController.cadastrar);
app.get('/fornecedores', fornecedorController.listar);

// Produtos
app.post('/produtos', produtoController.cadastrar);
app.get('/produtos', produtoController.listar);

// Associacao produto-fornecedor
app.post('/associacoes', associacaoController.associar);
app.get('/associacoes', associacaoController.listar);
app.get('/produtos/:id/fornecedores', associacaoController.listarFornecedoresDoProduto);
app.delete('/associacoes/:id', associacaoController.desassociar);

// Liga o servidor e fica esperando pedidos na porta 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
