import React, { useState, useEffect } from 'react';
import { ordersApi, trackingStagesApi } from '../../lib/supabaseClient';
import { Loader2, Search, Edit2, ChevronDown, Check, Plus, Trash2, RefreshCw } from 'lucide-react';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [globalStages, setGlobalStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorObj, setErrorObj] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // modal state
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  // delete state
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorObj(null);
      const [ordersData, stagesData] = await Promise.all([
        ordersApi.getAll(),
        trackingStagesApi.getAll().catch(() => []) // fallback if table not ready
      ]);
      setOrders(ordersData || []);
      setGlobalStages(stagesData || []);
    } catch (error: any) {
      console.error(error);
      setErrorObj('Ошибка при загрузке: ' + (error?.message || 'Таймаут подключения'));
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      const data = await ordersApi.getAll();
      setOrders(data || []);
    } catch (error: any) {
      console.error(error);
    }
  }

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await ordersApi.delete(orderToDelete);
      setOrderToDelete(null);
      await loadOrders();
    } catch (error: any) {
      console.error(error);
      setErrorObj('Ошибка удаления: ' + (error?.message || 'Неизвестная ошибка'));
      setOrderToDelete(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_phone.includes(searchTerm)
  );

  const openTrackerEditor = (order: any) => {
    // Clone deep to avoid mutating state directly
    setCurrentOrder(JSON.parse(JSON.stringify(order)));
    setIsEditing(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ordersApi.update(currentOrder.id, {
        status: currentOrder.status,
        tracking_info: currentOrder.tracking_info
      });
      setIsEditing(false);
      setCurrentOrder(null);
      await loadOrders();
    } catch (error: any) {
      console.error(error);
      alert('Ошибка при сохранении статуса: ' + (error?.message || 'Неизвестная ошибка'));
    }
  };

  const loadBaseStages = () => {
    if (!globalStages.length) {
      alert('Базовые этапы не найдены в базе данных.');
      return;
    }
    const newStages = globalStages.map((st: any) => ({
      id: st.id,
      title: st.title,
      description: st.description,
      location: st.location || '',
      date: null,
      completed: false
    }));
    setCurrentOrder({
      ...currentOrder,
      tracking_info: {
        ...currentOrder.tracking_info,
        stages: newStages,
        current_stage: 1
      }
    });
  };

  const addStage = () => {
    const newStage = {
      id: Date.now(),
      title: 'Новая стадия',
      description: 'Описание стадии',
      date: null,
      completed: false
    };
    setCurrentOrder({
      ...currentOrder,
      tracking_info: {
        ...currentOrder.tracking_info,
        stages: [...currentOrder.tracking_info.stages, newStage]
      }
    });
  };

  const updateStage = (index: number, field: string, value: any) => {
    const newStages = [...currentOrder.tracking_info.stages];
    newStages[index] = { ...newStages[index], [field]: value };
    
    setCurrentOrder({
      ...currentOrder,
      tracking_info: {
        ...currentOrder.tracking_info,
        stages: newStages
      }
    });
  };

  const removeStage = (index: number) => {
    const newStages = [...currentOrder.tracking_info.stages];
    newStages.splice(index, 1);
    setCurrentOrder({
      ...currentOrder,
      tracking_info: {
        ...currentOrder.tracking_info,
        stages: newStages
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-foreground">Управление зака..</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Поиск по номеру заказа, ФИО..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-80 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : errorObj ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">{errorObj}</div>
      ) : (
        <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">Заказ</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">Клиент</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">Авто</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">Статус</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t dark:border-border">
                    <td className="px-4 py-3 sm:px-6 sm:py-4 font-mono text-xs sm:text-sm dark:text-white font-bold">{order.order_number}</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <div className="text-sm dark:text-white">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm dark:text-gray-300 truncate max-w-[150px]">
                      {order.cars?.brand} {order.cars?.name}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                      ${order.status === 'processing' ? 'bg-blue-100 text-blue-700' : ''}
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openTrackerEditor(order)} className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-lg transition flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
                        <Edit2 size={16} />
                        <span className="hidden sm:inline">Трекинг</span>
                      </button>
                      <button onClick={() => setOrderToDelete(order.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Удалить заказ?</h3>
            <p className="text-gray-500 text-sm mb-6 dark:text-gray-400">Это действие невозможно отменить. Вы уверены, что хотите продолжить?</p>
            <div className="flex gap-3">
              <button onClick={() => setOrderToDelete(null)} className="flex-1 px-4 py-2.5 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Отмена</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {isEditing && currentOrder && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white dark:bg-card w-full sm:rounded-2xl max-w-3xl flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-t-2xl relative">
            <button onClick={() => setIsEditing(false)} className="absolute top-4 sm:top-6 right-4 sm:right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-100 p-1.5 rounded-full dark:bg-gray-800 z-10 w-8 h-8 flex items-center justify-center">
              ✕
            </button>
            <div className="p-4 sm:p-6 border-b dark:border-gray-800 flex justify-between items-start sm:items-center">
              <div className="pr-10">
                <h2 className="text-lg sm:text-xl font-bold dark:text-white">Редактирование: {currentOrder.order_number}</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate max-w-[250px] sm:max-w-none">{currentOrder.customer_name} — {currentOrder.cars?.brand} {currentOrder.cars?.name}</p>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="mb-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 dark:text-white">Общий статус заказа</label>
                  <select 
                    value={currentOrder.status}
                    onChange={e => setCurrentOrder({...currentOrder, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-900 focus:bg-white dark:focus:bg-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="pending">Ожидает (Pending)</option>
                    <option value="processing">В процессе (Processing)</option>
                    <option value="delivered">Доставлен (Delivered)</option>
                    <option value="cancelled">Отменен (Cancelled)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-primary mb-1.5">Активный этап трекинга</label>
                  <select 
                    value={currentOrder.tracking_info?.current_stage || 1}
                    onChange={e => setCurrentOrder({
                      ...currentOrder, 
                      tracking_info: {
                        ...currentOrder.tracking_info,
                        current_stage: parseInt(e.target.value, 10)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg font-medium outline-none transition-all bg-gray-50 text-gray-900 focus:bg-white dark:focus:bg-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    {currentOrder.tracking_info?.stages?.map((stage: any, idx: number) => (
                      <option key={idx} value={idx + 1}>
                        Этап {idx + 1}: {stage.title || 'Без названия'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Подсвечивается клиенту как текущий</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="font-bold text-base sm:text-lg dark:text-white">Стадии трекинга</h3>
                <div className="flex space-x-2">
                  <button type="button" onClick={loadBaseStages} className="flex-1 sm:flex-none justify-center text-xs sm:text-sm px-3 py-1.5 sm:py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center space-x-1 transition dark:bg-blue-900/20 dark:text-blue-400">
                    <RefreshCw size={14} /> <span className="inline">Базовые</span>
                  </button>
                  <button type="button" onClick={addStage} className="flex-1 sm:flex-none justify-center text-xs sm:text-sm px-3 py-1.5 sm:py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center space-x-1 transition dark:bg-green-900/20 dark:text-green-400">
                    <Plus size={14} /> <span className="inline">Добавить</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {currentOrder.tracking_info?.stages?.map((stage: any, index: number) => (
                  <div key={index} className={`p-3 sm:p-4 rounded-xl border ${stage.completed ? 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}>
                    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 relative">
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={stage.completed}
                              onChange={(e) => updateStage(index, 'completed', e.target.checked)}
                              className="w-4 sm:w-5 h-4 sm:h-5 rounded text-primary"
                            />
                            <span className="text-sm font-bold dark:text-white">Завершено</span>
                          </label>
                          {stage.completed && (
                            <input 
                              type="date" 
                              value={stage.date ? stage.date.split('T')[0] : ''}
                              onChange={(e) => updateStage(index, 'date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                              className="text-xs sm:text-sm border px-2 py-1 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Название стадии</label>
                            <input 
                              type="text" 
                              value={stage.title}
                              onChange={(e) => updateStage(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Описание</label>
                            <input 
                              type="text" 
                              value={stage.description}
                              onChange={(e) => updateStage(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Локация</label>
                            <input 
                              type="text" 
                              value={stage.location || ''}
                              onChange={(e) => updateStage(index, 'location', e.target.value)}
                              className="w-full px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                              placeholder="Напр. Китай, Хоргос..."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto">
                        <button type="button" onClick={() => removeStage(index)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 sm:p-2 rounded-lg sm:mt-6 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            <div className="p-4 sm:p-6 border-t dark:border-gray-800 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50 pb-8 sm:pb-6">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-4 py-2 border rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 text-sm sm:text-base transition">
                Отмена
              </button>
              <button type="button" onClick={handleUpdateOrder} className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base font-medium transition">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
