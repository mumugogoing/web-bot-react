import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/views/Home';
import AlexSwap from '@/views/swap/alex';
import StarknetMonitor from '@/views/StarknetMonitor';

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
        element: <AlexSwap />,
      },
      {
        path: "monitor",
        element: <StarknetMonitor />,
      },
    ],
  },
]);

export const RouterProviderComponent: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default router;