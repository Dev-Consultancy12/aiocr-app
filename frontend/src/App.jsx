import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import PolicyRegisterPage from './pages/PolicyRegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<UploadPage />} />
          <Route path="policies" element={<PolicyRegisterPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
