import { Route, Routes } from 'react-router-dom';

import Layout from '@/components/Layout';
import { ThemeProvider } from '@/context/ThemeContext';
import DocumentationPage from '@/pages/DocumentationPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import QuizMode from '@/pages/QuizMode';
import SolverPage from '@/pages/SolverPage';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<SolverPage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/quiz" element={<QuizMode />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
