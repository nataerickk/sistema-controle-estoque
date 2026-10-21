// fornecedorController.js - regras dos fornecedores (cadastrar e listar)

const db = require('../db');
const { validarFornecedor } = require('../validacoes');

// POST /fornecedores
function cadastrar(req, res) {
  // Confere cada campo e junta os erros (campo -> mensagem)
  const { erros, dados } = validarFornecedor(req.body ?? {});
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erro: "Corrija os campos indicados.", campos: erros });
  }
  const { nome_empresa, cnpj, endereco, telefone, email, contato_principal } = dados;

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
      return res.status(409).json({ erro: 'Fornecedor com esse CNPJ já está cadastrado!' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar fornecedor.' });
  }
}

// GET /fornecedores
function listar(req, res) {
  const fornecedores = db.prepare('SELECT * FROM fornecedores').all();
  res.json(fornecedores);
}

module.exports = { cadastrar, listar };
