// components/PublicRoute.js
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  return !isAuthenticated ? <Outlet /> : <Navigate to="/talent-search" replace />;
};

export default PublicRoute;