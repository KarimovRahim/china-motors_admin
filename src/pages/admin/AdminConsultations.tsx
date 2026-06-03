import { useState, useEffect } from 'react';
import { consultationApi } from '../../lib/supabaseClient';
import { Loader2, MessageSquare, CheckCircle, Clock, Trash2 } from 'lucide-react';

export function AdminConsultations() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorObj, setErrorObj] = useState<string | null>(null);
  const [consultToDelete, setConsultToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadConsultations();
  }, []);

  async function loadConsultations() {
    try {
      setLoading(true);
      setErrorObj(null);
      const data = await consultationApi.getAll();
      setConsultations(data || []);
    } catch (error: any) {
      console.error(error);
      setErrorObj('Ошибка при загрузке: ' + (error?.message || 'Таймаут подключения'));
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await consultationApi.update(id, { status: newStatus });
      await loadConsultations();
    } catch (error: any) {
      console.error(error);
      alert('Ошибка при обновлении статуса: ' + (error?.message || 'Неизвестная ошибка'));
    }
  };

  const confirmDelete = async () => {
    if (!consultToDelete) return;
    try {
      await consultationApi.delete(consultToDelete);
      setConsultToDelete(null);
      await loadConsultations();
    } catch (error: any) {
      console.error(error);
      setErrorObj('Ошибка удаления: ' + (error?.message || 'Неизвестная ошибка'));
      setConsultToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-foreground">Заявки на консультацию</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : errorObj ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">{errorObj}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.map((item) => (
            <div key={item.id} className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${item.status === 'new' ? 'bg-blue-100 text-primary' : 'bg-green-100 text-green-600'}`}>
                    {item.status === 'new' ? <MessageSquare size={20} /> : <CheckCircle size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 flex-1">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Телефон</span>
                  <a href={`tel:${item.phone}`} className="font-mono text-sm text-primary hover:underline">{item.phone}</a>
                </div>
                {item.service && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Интересует</span>
                    <span className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded dark:text-gray-300">{item.service}</span>
                  </div>
                )}
                {item.message && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Сообщение</span>
                    <p className="text-sm dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-800">{item.message}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t dark:border-gray-800 flex items-center justify-between mt-auto">
                <span className={`text-sm font-medium ${item.status === 'new' ? 'text-blue-600' : 'text-green-600'}`}>
                  {item.status === 'new' ? 'Новая заявка' : 'Обработано'}
                </span>
                
                <div className="flex items-center space-x-2">
                  {item.status === 'new' ? (
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'completed')}
                      className="flex items-center space-x-2 text-sm px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition"
                    >
                      <CheckCircle size={16} />
                      <span className="hidden sm:inline">Сделано</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'new')}
                      className="flex items-center space-x-2 text-sm px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      <Clock size={16} />
                      <span className="hidden sm:inline">В новые</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setConsultToDelete(item.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition dark:hover:bg-red-900/30"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {consultations.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Нет заявок на консультацию
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {consultToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Удалить заявку?</h3>
            <p className="text-gray-500 text-sm mb-6 dark:text-gray-400">Это действие невозможно отменить. Вы уверены, что хотите продолжить?</p>
            <div className="flex gap-3">
              <button onClick={() => setConsultToDelete(null)} className="flex-1 px-4 py-2.5 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Отмена</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
