import { BrowserRouter as Router, Routes, Route } from 'react-router';
import ProcessPage from './pages/ProcessPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProcessPage />} />
      </Routes>
    </Router>
  );
}

