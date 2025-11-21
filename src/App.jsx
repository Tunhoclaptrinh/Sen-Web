import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { getMe } from './store/slices/authSlice';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Pages
import Home from './pages/Home';
import HeritageListPage from './pages/Heritage/HeritageListPage';
import HeritageDetailPage from './pages/Heritage/HeritageDetailPage';
import ArtifactListPage from './pages/Artifact/ArtifactListPage';
import ArtifactDetailPage from './pages/Artifact/ArtifactDetailPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import Collections from './pages/Profile/Collections';
import NotFound from './pages/NotFound';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import HeritageManagement from './pages/Admin/HeritageManagement';
import ArtifactManagement from './pages/Admin/ArtifactManagement';
import UserManagement from './pages/Admin/UserManagement';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const { theme: uiTheme } = useSelector((state) => state.ui);

  useEffect(() => {
    if (token && isAuthenticated) {
      dispatch(getMe());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <ConfigProvider
      theme={{
        algorithm: uiTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/heritage-sites" element={<HeritageListPage />} />
          <Route path="/heritage-sites/:id" element={<HeritageDetailPage />} />
          <Route path="/artifacts" element={<ArtifactListPage />} />
          <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/collections" element={<Collections />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/heritage" element={<HeritageManagement />} />
            <Route path="/admin/artifacts" element={<ArtifactManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;