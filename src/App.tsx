import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import EventoDetalle from './pages/EventoDetalle';
import ExitoCompra from './pages/ExitoCompra';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

// Admin Components
import AdminLayout from './layouts/AdminLayout';
import DashboardHome from './pages/admin/DashboardHome';
import EventList from './pages/admin/EventList';
import CreateEvent from './pages/admin/CreateEvent';
import EditEvent from './pages/admin/EditEvent';
import EventTickets from './pages/admin/EventTickets';
import Validator from './pages/admin/Validator';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas Públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/evento/:id" element={<EventoDetalle />} />
          <Route path="/exito" element={<ExitoCompra />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rutas de Admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="eventos" element={<EventList />} />
          <Route path="crear-evento" element={<CreateEvent />} />
          <Route path="editar-evento/:id" element={<EditEvent />} />
          <Route path="evento/:id/tickets" element={<EventTickets />} />
          <Route path="validar" element={<Validator />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
