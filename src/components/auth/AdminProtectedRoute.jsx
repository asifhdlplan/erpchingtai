import React from 'react';

const AdminProtectedRoute = ({ unlocked, children, fallback }) => {
  return unlocked ? children : fallback;
};

export default AdminProtectedRoute;
