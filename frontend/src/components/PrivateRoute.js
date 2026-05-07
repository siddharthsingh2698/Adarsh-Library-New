import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#00236f', fontFamily: 'Newsreader, serif', fontSize: 18 }}>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
