import { useState, useEffect } from 'react';
import { carsApi, ordersApi, consultationApi } from '../../lib/supabaseClient';
import { Users, Car, ShoppingCart, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    cars: 0,
    orders: 0,
    consultations: 0,
    pendingOrders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorObj, setErrorObj] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setErrorObj(null);
        const [cars, orders, consultations] = await Promise.all([
          carsApi.getAll(),
          ordersApi.getAll(),
          consultationApi.getAll()
        ]);

        setStats({
          cars: cars?.length || 0,
          orders: orders?.length || 0,
          consultations: consultations?.length || 0,
          pendingOrders: orders?.filter((o: any) => o.status === 'pending').length || 0
        });
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        setErrorObj('Не удалось подключиться к базе данных. Проверьте настройки Supabase.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Всего автомобилей', value: stats.cars, icon: Car, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Всего заказов', value: stats.orders, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Активные заказы', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Новые заявки', value: stats.consultations, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Загрузка дашборда...</div>;
  }

  if (errorObj) {
    return <div className="bg-red-50 text-red-600 p-6 rounded-2xl m-6 border border-red-100">{errorObj}</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-foreground px-1">Обзор системы</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100 dark:border-border flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-tight">{stat.label}</p>
                <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2 text-gray-900 dark:text-foreground">{stat.value}</p>
              </div>
              <div className={`p-2 sm:p-4 rounded-xl ${stat.bg} ${stat.color} dark:bg-opacity-10 mt-0.5 sm:mt-0`}>
                <stat.icon size={20} className="sm:hidden" />
                <stat.icon size={24} className="hidden sm:block" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="bg-white dark:bg-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-border">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 dark:text-foreground">Быстрые действия</h2>
          <div className="space-y-2 sm:space-y-4">
            <Link to="/cars" className="block w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-foreground dark:border-border">
              Управление автомобилями
            </Link>
            <Link to="/orders" className="block w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-foreground dark:border-border">
              Управление заказами
            </Link>
            <Link to="/consultations" className="block w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-foreground dark:border-border">
              Обработка заявок
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
