import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MisLigas from './pages/Ligas/MisLigas';
import CrearLiga from './pages/Ligas/CrearLiga';
import VerLiga from './pages/Ligas/VerLiga';
import ConfiguracionLiga from './pages/Ligas/ConfiguracionLiga';
import ListaEquipos from './pages/Equipos/ListaEquipos';
import CrearEquipo from './pages/Equipos/CrearEquipo';
import EditarEquipo from './pages/Equipos/EditarEquipo';
import EquipoAnalytics from './pages/Equipos/EquipoAnalytics';
import ListaJornadas from './pages/Jornadas/ListaJornadas';
import CrearJornada from './pages/Jornadas/CrearJornada';
import ListaPartidos from './pages/Partidos/ListaPartidos';
import CrearPartido from './pages/Partidos/CrearPartido';
import VerPartido from './pages/Partidos/VerPartido';
import Clasificacion from './pages/Ligas/Clasificacion';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import PublicLogin from './pages/Public/PublicLogin';
import PublicDashboard from './pages/Public/PublicDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Ligas */}
          <Route
            path="/ligas"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MisLigas />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/crear"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CrearLiga />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VerLiga />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:id/configuracion"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ConfiguracionLiga />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Equipos */}
          <Route
            path="/ligas/:ligaId/equipos"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ListaEquipos />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:ligaId/equipos/crear"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CrearEquipo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:ligaId/equipos/:equipoId/editar"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditarEquipo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:ligaId/equipos/:equipoId/analytics"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EquipoAnalytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Jornadas */}
          <Route
            path="/ligas/:ligaId/jornadas"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ListaJornadas />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:ligaId/jornadas/crear"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CrearJornada />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Partidos */}
          <Route
            path="/ligas/:ligaId/partidos"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ListaPartidos />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:ligaId/partidos/crear"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CrearPartido />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:id/clasificacion"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Clasificacion />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ligas/:ligaId/partidos/:partidoId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VerPartido />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas Públicas */}
          <Route path="/public" element={<PublicLayout />}>
            <Route path=":ligaId/login" element={<PublicLogin />} />
            <Route path=":ligaId/dashboard" element={<PublicDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
