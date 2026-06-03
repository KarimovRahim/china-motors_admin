import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCars } from './pages/admin/AdminCars';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminConsultations } from './pages/admin/AdminConsultations';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'cars', Component: AdminCars },
      { path: 'orders', Component: AdminOrders },
      { path: 'consultations', Component: AdminConsultations },
    ],
  }
]);
