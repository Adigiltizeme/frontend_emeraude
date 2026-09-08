import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si c'est un Admin, il ne devrait pas etre sur le dashboard utilisateur classique, 
  // mais on peut le laisser voir s'il veut.
  
  return <Outlet />;
};

export default UserRoute;
