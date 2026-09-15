// db.js - conexão com o banco de dados e criação das tabelas

const Database = require('better-sqlite3');

// Isso cria (ou abre, se já existir) o arquivo do banco de dados
const db = new Database('estoque.db');

// Aqui criamos as 3 tabelas, só se elas ainda não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_empresa TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    contato_principal TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo_barras TEXT UNIQUE,
    descricao TEXT NOT NULL,
    quantidade_estoque INTEGER,
    categoria TEXT NOT NULL,
    data_validade TEXT,
    imagem TEXT
  );

  CREATE TABLE IF NOT EXISTS produto_fornecedor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    UNIQUE(produto_id, fornecedor_id)
  );
`);

console.log('Banco de dados e tabelas prontos!');

module.exports = db;