import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import { AuthContainer } from './components/auth';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  const handleLogin = (name) => {
    setUserName(name);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AuthContainer onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home userName={userName} />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;