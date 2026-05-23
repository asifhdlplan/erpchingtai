import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : fallback;
};

export default ProtectedRoute;
