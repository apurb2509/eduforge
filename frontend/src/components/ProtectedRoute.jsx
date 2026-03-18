import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, allowedRole, children }) => {
  // 1. If not logged in, send to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. If role doesn't match, send to their respective "home"
  if (user.role !== allowedRole) {
    const redirectPath = user.role === 'instructor' ? '/instructor-dashboard' : '/student-gallery';
    return <Navigate to={redirectPath} replace />;
  }

  // 3. If all good, show the page
  return children;
};

export default ProtectedRoute;