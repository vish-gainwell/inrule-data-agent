// src/App.jsx
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

// Layout
import SchemaSidebar from './components/Layout/SchemaSidebar';
import TopTabs from './components/Layout/TopTabs';

// Pages
import Analyst from './pages/Analyst';
import Login from './pages/Login.jsx';

// Context
import { InputProvider } from './context/InputContext';
import { ClientProvider } from './context/ClientContext';

// Auth
import { useAuth } from './auth/AuthProvider';

// ---------- Protected layout (shell for authenticated pages) ----------
const ShellLayout = () => {
  const location = useLocation();
  const activePersistentPage = location.pathname === '/data-agent'
    ? 'dataAgent'
    : null;
  const [mountedPersistentPages, setMountedPersistentPages] = useState(() => ({
    dataAgent: location.pathname === '/data-agent',
  }));

  useEffect(() => {
    if (!activePersistentPage) return;
    setMountedPersistentPages((prev) => (
      prev[activePersistentPage]
        ? prev
        : { ...prev, [activePersistentPage]: true }
    ));
  }, [activePersistentPage]);

  const persistentPageStyle = (pageKey) => ({
    display: activePersistentPage === pageKey ? 'block' : 'none',
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-softblack font-sans">
      <SchemaSidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden bg-white">
        <TopTabs />

        <div className="flex-1 overflow-hidden relative h-full">
          {mountedPersistentPages.dataAgent && (
            <div
              className="h-full min-w-0 overflow-hidden"
              style={persistentPageStyle('dataAgent')}
            >
              <Analyst isActive={activePersistentPage === 'dataAgent'} />
            </div>
          )}

          {!activePersistentPage && <Outlet />}
        </div>
      </div>
    </div>
  );
};

const ProtectedShell = () => {
  const { account } = useAuth() || {};

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ClientProvider>
      <ShellLayout />
    </ClientProvider>
  );
};

// ---------- App root ----------
function App() {
  return (
    <InputProvider>
      <Router>
        <Routes>
          {/* Public route: login page only, no sidebar/top tabs */}
          <Route path="/login" element={<Login />} />

          {/* Auth-protected shell and app routes */}
          <Route element={<ProtectedShell />}>
            {/* Default redirect once authenticated */}
            <Route path="/" element={<Navigate to="/data-agent" replace />} />
            <Route path="/analyst" element={<Navigate to="/data-agent" replace />} />
            <Route path="/data-agent" element={null} />
            <Route path="/home" element={<Navigate to="/data-agent" replace />} />
            <Route path="/concept-development" element={<Navigate to="/data-agent" replace />} />
            <Route path="/master-query" element={<Navigate to="/data-agent" replace />} />
            <Route path="/metrics" element={<Navigate to="/data-agent" replace />} />
            <Route path="/prompts" element={<Navigate to="/data-agent" replace />} />
            <Route path="/admin" element={<Navigate to="/data-agent" replace />} />

            {/* Fallback: unknown routes -> data-agent */}
            <Route path="*" element={<Navigate to="/data-agent" replace />} />
          </Route>
        </Routes>
      </Router>
    </InputProvider>
  );
}

export default App;
