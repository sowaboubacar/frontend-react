import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat'; 
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider} from './context/AuthContext';
import Rooms from './pages/Rooms';
import Profile from './pages/Profile';

import AdminUsers from './pages/AdminUsers';
import Home from './pages/Home'; 

function AppRoutes() { 
 

  return (
    <Routes>
      <Route path="/" element={<Home />} />  {/* Route racine vers Home */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Routes protégées */}
      <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
      <Route path="/chat/:roomId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Routes admin uniquement */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      {/* Redirection par défaut si route inconnue */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
