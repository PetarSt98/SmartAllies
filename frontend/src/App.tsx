import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ReportPage } from '@/components/report/ReportPage';
import '@/index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/report/:reportId" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
