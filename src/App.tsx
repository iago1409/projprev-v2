import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Registro } from './pages/Registro';
import { Indicadores } from './pages/Indicadores';
import { Consolidacao } from './pages/Consolidacao';
import { TemplatePage } from './pages/TemplatePage';
import DadosProcesso from './pages/DadosProcesso';
import InformacoesDecisao from './pages/InformacoesDecisao';
import InformacoesProcesso from './pages/InformacoesProcesso';
import InformacoesTrabalhador from './pages/InformacoesTrabalhador';
import MesmoProcessoMultiplosEventos from './pages/MesmoProcessoMultiplosEventos';
import { SucessaoVinculo } from './pages/SucessaoVinculo';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/registrar" element={<Registro />} />
          <Route path="/indicadores" element={<Indicadores />} />
          <Route path="/consolidacao" element={<Consolidacao />} />
          <Route path="/template" element={<TemplatePage />} />
          <Route path="/dados-processo" element={<DadosProcesso />} />
          <Route path="/processo/informacoes-do-processo" element={<InformacoesProcesso />} />
          <Route path="/processo/informacoes-do-trabalhador" element={<InformacoesTrabalhador />} />
          <Route path="/processo/multiplos-eventos" element={<MesmoProcessoMultiplosEventos />} />
          <Route path="/processo/informacoes-da-decisao" element={<InformacoesDecisao />} />
          <Route path="/processo/SucessaoVinculo" element={<SucessaoVinculo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;