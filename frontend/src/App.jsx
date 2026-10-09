import { useState } from 'react';
import './App.css';
import Fornecedores from './componentes/Fornecedores';
import Produtos from './componentes/Produtos';
import Associacoes from './componentes/Associacoes';

const ABAS = [
  { id: 'fornecedores', rotulo: 'Fornecedores' },
  { id: 'produtos', rotulo: 'Produtos' },
  { id: 'associacoes', rotulo: 'Associações' },
];

export default function App() {
  const [abaAtual, setAbaAtual] = useState('fornecedores');

  return (
    <div className="app">
      <h1>Controle de Estoque</h1>

      <nav>
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            className={aba.id === abaAtual ? 'aba ativa' : 'aba'}
            onClick={() => setAbaAtual(aba.id)}
          >
            {aba.rotulo}
          </button>
        ))}
      </nav>

      <main>
        {abaAtual === 'fornecedores' && <Fornecedores />}
        {abaAtual === 'produtos' && <Produtos />}
        {abaAtual === 'associacoes' && <Associacoes />}
      </main>
    </div>
  );
}
