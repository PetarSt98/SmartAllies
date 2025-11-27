import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import ReportPage from '@/pages/ReportPage';
import '@/index.css';

function App() {
  const [path, setPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const normalizedPath = path.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/report') {
    return <ReportPage />;
  }

  return <ChatInterface />;
}

export default App;
