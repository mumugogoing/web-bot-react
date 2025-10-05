import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/views/Home';
import AlexSwap from '@/views/swap/alex';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/swap",
    element: <AlexSwap />,
  },
]);

export const RouterProviderComponent: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default router;