// validacoes.js - regras para conferir os dados antes de salvar no banco

function somenteDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function formatarCnpj(digitos) {
  return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function validarFornecedor(entrada) {
  const erros = {};

  const nome_empresa = String(entrada.nome_empresa ?? "").trim();
  const cnpjTexto = String(entrada.cnpj ?? "").trim();
  const endereco = String(entrada.endereco ?? "").trim();
  const telefone = String(entrada.telefone ?? "").trim();
  const email = String(entrada.email ?? "").trim();
  const contato_principal = String(entrada.contato_principal ?? "").trim();

  if (!nome_empresa) {
    erros.nome_empresa = "Informe o nome da empresa.";
  }

  const digitosCnpj = somenteDigitos(cnpjTexto);
  if (!cnpjTexto) {
    erros.cnpj = "Informe o CNPJ.";
  } else if (digitosCnpj.length !== 14) {
    erros.cnpj = "CNPJ inv\u00e1lido. Use 14 d\u00edgitos: 00.000.000/0000-00.";
  }

  if (!endereco) {
    erros.endereco = "Informe o endere\u00e7o completo.";
  }

  const digitosTelefone = somenteDigitos(telefone);
  if (!telefone) {
    erros.telefone = "Informe o telefone.";
  } else if (digitosTelefone.length < 10 || digitosTelefone.length > 11) {
    erros.telefone = "Telefone inv\u00e1lido. Use DDD + n\u00famero: (00) 0000-0000.";
  }

  if (!email) {
    erros.email = "Informe o e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erros.email = "E-mail inv\u00e1lido. Exemplo: exemplo@fornecedor.com.";
  }

  if (!contato_principal) {
    erros.contato_principal = "Informe o contato principal.";
  }

  const dados = {
    nome_empresa,
    cnpj: digitosCnpj.length === 14 ? formatarCnpj(digitosCnpj) : cnpjTexto,
    endereco,
    telefone,
    email,
    contato_principal,
  };

  return { erros, dados };
}

module.exports = { validarFornecedor };
