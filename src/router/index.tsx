import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/views/Home';
import AlexSwap from '@/views/swap/alex';
import StarknetMonitor from '@/views/StarknetMonitor';
import StacksMonitor from '@/views/StacksMonitor';
import { UserRole } from '@/types/auth';

const router = createBrowserRouter([
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
          <ProtectedRoute requiredRole={UserRole.GUEST}>
            <StarknetMonitor />
          </ProtectedRoute>
        ),
      },
      {
        path: "stacks",
        element: (
          <ProtectedRoute requiredRole={UserRole.GUEST}>
            <StacksMonitor />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export const RouterProviderComponent: React.FC = () => {
  return <RouterProvider router={router} />;
};