import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SolverPage from './pages/SolverPage';
import DocumentationPage from './pages/DocumentationPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SolverPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
