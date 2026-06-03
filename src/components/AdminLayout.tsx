import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, ShoppingCart, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminLayout() {
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/cars', icon: Car, label: 'Автомобили' },
    { to: '/orders', icon: ShoppingCart, label: 'Заказы' },
    { to: '/consultations', icon: MessageSquare, label: 'Заявки' },
  ];

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col md:flex-row dark:bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-card border-r dark:border-border flex-shrink-0 flex-col h-full z-20">
        <div className="p-6 pb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-foreground">Обзор</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Панель управления</p>
        </div>
        <nav className="px-4 pb-6 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {links.map((link) => {
            const isActive = location.pathname === link.to || 
                            (link.to !== '/' && location.pathname.startsWith(link.to));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'text-primary font-medium' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-3">
                  <Icon size={20} className={isActive ? 'text-primary' : ''} />
                  <span>{link.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex-shrink-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b dark:border-border p-4 flex items-center justify-between z-40">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-foreground">Админ-панель</h2>
        </div>
      </div>

      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto min-h-0 relative">
        <Outlet />
      </main>

      {/* Mobile Animated Bottom Navbar */}
      <nav className="md:hidden flex-shrink-0 w-full bg-white dark:bg-gray-900 border-t dark:border-gray-800 z-50 px-2 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] flex justify-around items-center h-[72px] sm:h-[80px]">
        {links.map((link) => {
          const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
          const Icon = link.icon;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-x-2 inset-y-1 bg-primary/10 dark:bg-primary/20 rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center">
                <Icon size={22} className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className="text-[10px] font-semibold tracking-wide">{link.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
