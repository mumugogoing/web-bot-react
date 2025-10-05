import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/views/Home';
import Login from '@/views/login';
import AlexSwap from '@/views/swap/alex';
import StarknetMonitor from '@/views/StarknetMonitor';
import StacksMonitor from '@/views/StacksMonitor';
import Profile from '@/views/profile';
import UserManagement from '@/views/system/UserManagement';
import RoleManagement from '@/views/system/RoleManagement';
import MessageCenter from '@/views/system/MessageCenter';
import OperationLogManagement from '@/views/system/OperationLogManagement';
import { UserRole } from '@/types/auth';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "swap",
        element: (
          <ProtectedRoute requiredRole={UserRole.USER}>
            <AlexSwap />
          </ProtectedRoute>
        ),
      },
      {
        path: "monitor",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <StarknetMonitor />
          </ProtectedRoute>
        ),
      },
      {
        path: "stacks",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <StacksMonitor />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute requiredRole={UserRole.USER}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "system/users",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "system/roles",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <RoleManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "system/messages",
        element: (
          <ProtectedRoute requiredRole={UserRole.USER}>
            <MessageCenter />
          </ProtectedRoute>
        ),
      },
      {
        path: "system/logs",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <OperationLogManagement />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export const RouterProviderComponent: React.FC = () => {
  return <RouterProvider router={router} />;
};