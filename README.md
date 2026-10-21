# Sistema de Controle de Estoque

Projeto Integrador: Full Stack (Gran Faculdade). Aplicação web completa (telas, servidor e banco de dados) para controlar um estoque: cadastro de fornecedores, cadastro de produtos e associação entre produtos e fornecedores.

## O que o sistema faz

- **Fornecedores:** cadastra e lista fornecedores (nome da empresa, CNPJ, endereço, telefone, e-mail e contato principal). Não permite CNPJ repetido.
- **Produtos:** cadastra e lista produtos (nome, código de barras, descrição, quantidade em estoque, categoria, data de validade e imagem). A categoria é escolhida em uma lista, com a opção "Outro" para especificar. Não permite código de barras repetido.
- **Associações:** na tela de detalhes do produto, associa fornecedores a ele, mostra a tabela de fornecedores associados (nome e CNPJ) e permite desassociar. Um produto pode ter vários fornecedores e um fornecedor pode atender vários produtos (relação muitos-para-muitos).
- **Validação:** campos obrigatórios e dados inválidos não são cadastrados, e o erro aparece junto ao campo com problema.

## Tecnologias

- Backend: Node.js, Express e better-sqlite3 (banco SQLite)
- Frontend: React com Vite
- Banco de dados: SQLite (o arquivo `estoque.db` é criado automaticamente na primeira execução)

## Estrutura das pastas

- `app.js`: liga o servidor (porta 3000) e encaminha cada rota para o controller responsável
- `controllers/`: `fornecedorController.js`, `produtoController.js` e `associacaoController.js`
- `validacoes.js`: regras de validação de fornecedores e produtos
- `db.js`: conexão com o banco e criação das tabelas
- `frontend/`: aplicação React (telas de Fornecedores, Produtos e Associações)

## Como rodar

É preciso ter o Node.js (versão LTS) e o Git instalados. Use dois terminais.

1. Baixe o projeto: `git clone https://github.com/nataerickk/sistema-controle-estoque.git`
2. Entre na pasta: `cd sistema-controle-estoque`
3. Instale as dependências do backend: `npm install`
4. Instale as dependências do frontend: `cd frontend` e depois `npm install`
5. **Terminal 1 (backend):** na pasta `sistema-controle-estoque`, rode `node app.js`. Deve aparecer "Servidor rodando em http://localhost:3000".
6. **Terminal 2 (frontend):** na pasta `sistema-controle-estoque/frontend`, rode `npm run dev`.
7. Abra no navegador o endereço mostrado pelo Vite: `http://localhost:5173`

O backend só aceita pedidos vindos de `http://localhost:5173`, então use essa porta no frontend.

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| POST | `/fornecedores` | Cadastra um fornecedor |
| GET | `/fornecedores` | Lista os fornecedores |
| POST | `/produtos` | Cadastra um produto |
| GET | `/produtos` | Lista os produtos |
| POST | `/associacoes` | Associa um produto a um fornecedor |
| GET | `/associacoes` | Lista todas as associações |
| GET | `/produtos/:id/fornecedores` | Lista os fornecedores de um produto |
| DELETE | `/associacoes/:id` | Desassocia (remove a associação) |

## Mensagens do sistema

- "Fornecedor cadastrado com sucesso!"
- "Fornecedor com esse CNPJ já está cadastrado!"
- "Produto cadastrado com sucesso!"
- "Produto com este código de barras já está cadastrado!"
- "Fornecedor associado com sucesso ao produto!"
- "Fornecedor já está associado a este produto!"
- "Fornecedor desassociado com sucesso!"

## Decisões do projeto

- O CNPJ é guardado no formato `00.000.000/0000-00`, mesmo que seja digitado sem pontuação, para detectar CNPJ repetido.
- A imagem do produto é enviada como texto (base64) e guardada no próprio banco, com limite de 2 MB.
- Os dados são conferidos no servidor (`validacoes.js`), que devolve qual campo falhou.

## Possíveis melhorias

- Editar e excluir fornecedores e produtos (CRUD completo)
- Guardar as imagens em arquivos em vez de no banco
