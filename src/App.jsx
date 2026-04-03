import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SyncProvider } from './context/SyncContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Clients from './pages/Clients';
import ClientHistory from './pages/ClientHistory';
import Machinery from './pages/Machinery';
import MachineryDetail from './pages/MachineryDetail';
import Collaborators from './pages/Collaborators';
import CollaboratorDetail from './pages/CollaboratorDetail';
import ServiceHistory from './pages/ServiceHistory';
import ServiceDetail from './pages/ServiceDetail';
import Agenda from './pages/Agenda';
import Settings from './pages/Settings';
import './styles/global.css';

function App() {
  const isAuthenticated = true;

  return (
    <ThemeProvider>
      <SyncProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/clientes/:id/historico" element={<ClientHistory />} />
            <Route path="/maquinario" element={<Machinery />} />
            <Route path="/maquinario/:id" element={<MachineryDetail />} />
            <Route path="/colaboradores" element={<Collaborators />} />
            <Route path="/colaboradores/:id" element={<CollaboratorDetail />} />
            <Route path="/historico" element={<ServiceHistory />} />
            <Route path="/historico/:id" element={<ServiceDetail />} />
            <Route path="/os" element={<div className="content-placeholder card"><h2>Serviços</h2><p>Redirecionando para histórico...</p></div>} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/ajustes" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SyncProvider>
    </ThemeProvider>
  );
}

export default App;
