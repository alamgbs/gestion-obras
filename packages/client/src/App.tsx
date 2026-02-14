import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientsPage from './pages/clients/ClientsPage';
import MaterialsPage from './pages/materials/MaterialsPage';
import LaborPage from './pages/labor/LaborPage';
import RecipesPage from './pages/recipes/RecipesPage';
import RecipeFormPage from './pages/recipes/RecipeFormPage';
import BudgetsPage from './pages/budgets/BudgetsPage';
import BudgetDetailPage from './pages/budgets/BudgetDetailPage';
import BudgetFormPage from './pages/budgets/BudgetFormPage';
import UsersPage from './pages/users/UsersPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clientes/nuevo" element={<ClientsPage />} />
        <Route path="/materiales" element={<MaterialsPage />} />
        <Route path="/mano-de-obra" element={<LaborPage />} />
        <Route path="/recetas" element={<RecipesPage />} />
        <Route path="/recetas/nueva" element={<RecipeFormPage />} />
        <Route path="/recetas/:id" element={<RecipeFormPage />} />
        <Route path="/presupuestos" element={<BudgetsPage />} />
        <Route path="/presupuestos/nuevo" element={<BudgetFormPage />} />
        <Route path="/presupuestos/:id" element={<BudgetDetailPage />} />
        <Route path="/presupuestos/:id/editar" element={<BudgetFormPage />} />
        <Route path="/usuarios" element={
          <ProtectedRoute roles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
