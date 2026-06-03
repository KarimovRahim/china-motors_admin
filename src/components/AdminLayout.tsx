import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, ShoppingCart, MessageSquare, LogOut, ChevronLeft } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/cars', icon: Car, label: 'Автомобили' },
    { to: '/orders', icon: ShoppingCart, label: 'Заказы' },
    { to: '/consultations', icon: MessageSquare, label: 'Заявки' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row dark:bg-background overflow-hidden">
      <aside className="w-full md:w-64 bg-white dark:bg-card border-b md:border-b-0 md:border-r dark:border-border flex-shrink-0 flex flex-col md:h-screen">
        <div className="p-4 md:p-6 pb-2 md:pb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 dark:text-foreground">Админ-панель</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-muted-foreground mt-1">Официальный дилер</p>
        </div>
        <nav className="px-4 pb-4 md:pb-6 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar">
          {links.map((link) => {
            const isActive = location.pathname === link.to || 
                            (link.to !== '/' && location.pathname.startsWith(link.to));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} className="md:w-5 md:h-5" />
                <span className="text-sm md:text-base">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-140px)] md:h-screen">
        <Outlet />
      </main>
    </div>
  );
}
