import { Route, Routes } from 'react-router-dom';

import Layout from '@/components/Layout';
import DocumentationPage from '@/pages/DocumentationPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import SolverPage from '@/pages/SolverPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SolverPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
