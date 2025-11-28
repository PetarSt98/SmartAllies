import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ReportPage } from '@/components/report/ReportPage';
import '@/index.css';
import { ResponderPage } from '@/components/responder/ResponderPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/report/:reportId" element={<ReportPage />} />
        <Route path="/responder/1" element={<ResponderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
