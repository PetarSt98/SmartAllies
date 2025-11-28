import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ChatInterface } from '@/components/chat/ChatInterface';
import ReportPage from '@/pages/ReportPage';
import '@/index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
