import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/views/Dashboard';
import Login from '@/views/login';
import AlexSwap from '@/views/swap/alex';
import StarknetMonitor from '@/views/StarknetMonitor';
import StacksMonitor from '@/views/stacks';
import StacksAlex from '@/views/stacks/Alex';
import StacksDex from '@/views/stacks/Dex';
import PendingMonitor from '@/views/stacks/PendingMonitor';
import SbtcMakerGun from '@/views/makergun/SbtcMakerGun';
import Profile from '@/views/profile';
import UserManagement from '@/views/system/UserManagement';
import RoleManagement from '@/views/system/RoleManagement';
import MenuManagement from '@/views/system/MenuManagement';
import ApiManagement from '@/views/system/ApiManagement';
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
        element: <Dashboard />,
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
        path: "stacks/alex",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <StacksAlex />
          </ProtectedRoute>
        ),
      },
      {
        path: "stacks/dex",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <StacksDex />
          </ProtectedRoute>
        ),
      },
      {
        path: "stacks/pending",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <PendingMonitor />
          </ProtectedRoute>
        ),
      },
      {
        path: "makergun/sbtc",
        element: (
          <ProtectedRoute requiredRole={UserRole.USER}>
            <SbtcMakerGun />
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
        path: "system/menus",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <MenuManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "system/apis",
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <ApiManagement />
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