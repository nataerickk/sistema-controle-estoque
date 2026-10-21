// validacoes.js - regras para conferir os dados antes de salvar no banco

function texto(valor) {
  return String(valor ?? "").trim();
}

function somenteDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function formatarCnpj(digitos) {
  return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function validarFornecedor(entrada) {
  const erros = {};

  const nome_empresa = texto(entrada.nome_empresa);
  const cnpjTexto = texto(entrada.cnpj);
  const endereco = texto(entrada.endereco);
  const telefone = texto(entrada.telefone);
  const email = texto(entrada.email);
  const contato_principal = texto(entrada.contato_principal);

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

function validarProduto(entrada) {
  const erros = {};

  const nome = texto(entrada.nome);
  const codigoTexto = texto(entrada.codigo_barras);
  const descricao = texto(entrada.descricao);
  const quantidadeTexto = texto(entrada.quantidade_estoque);
  const categoriaEscolhida = texto(entrada.categoria);
  const categoriaOutro = texto(entrada.categoria_outro);
  const validade = texto(entrada.data_validade);
  const imagemTexto = texto(entrada.imagem);

  if (!nome) {
    erros.nome = "Informe o nome do produto.";
  }

  if (codigoTexto && !/^\d+$/.test(codigoTexto)) {
    erros.codigo_barras = "C\u00f3digo de barras inv\u00e1lido. Use apenas n\u00fameros.";
  }

  if (!descricao) {
    erros.descricao = "Informe a descri\u00e7\u00e3o do produto.";
  }

  let quantidade = 0;
  if (quantidadeTexto !== "") {
    quantidade = Number(quantidadeTexto);
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      erros.quantidade_estoque = "Quantidade inv\u00e1lida. Use um n\u00famero inteiro maior ou igual a zero.";
    }
  }

  let categoria = categoriaEscolhida;
  if (!categoriaEscolhida) {
    erros.categoria = "Selecione uma categoria.";
  } else if (categoriaEscolhida === "Outro") {
    if (!categoriaOutro) {
      erros.categoria_outro = "Especifique a categoria.";
    } else {
      categoria = categoriaOutro;
    }
  }

  if (validade) {
    const data = new Date(validade + "T00:00:00Z");
    const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(validade) && !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === validade;
    if (!dataValida) {
      erros.data_validade = "Data de validade inv\u00e1lida.";
    }
  }

  if (imagemTexto) {
    if (!/^data:image\/(png|jpeg|gif|webp);base64,/.test(imagemTexto)) {
      erros.imagem = "Imagem inv\u00e1lida. Envie um arquivo PNG, JPG, GIF ou WEBP.";
    } else if (imagemTexto.length > 3000000) {
      erros.imagem = "A imagem deve ter no m\u00e1ximo 2 MB.";
    }
  }

  const dados = {
    nome,
    codigo_barras: codigoTexto || null,
    descricao,
    quantidade,
    categoria,
    data_validade: validade || null,
    imagem: imagemTexto || null,
  };

  return { erros, dados };
}

module.exports = { validarFornecedor, validarProduto };
