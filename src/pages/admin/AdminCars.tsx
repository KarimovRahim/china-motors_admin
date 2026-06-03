import React, { useState, useEffect } from 'react';
import { carsApi } from '../../lib/supabaseClient';
import { Plus, Edit2, Trash2, XCircle, Loader2 } from 'lucide-react';

export function AdminCars() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorObj, setErrorObj] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCar, setCurrentCar] = useState<any>(null);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadCars();
  }, []);

  async function loadCars() {
    try {
      setLoading(true);
      setErrorObj(null);
      const data = await carsApi.getAll();
      setCars(data || []);
    } catch (error: any) {
      console.error(error);
      setErrorObj('Ошибка при загрузке: ' + (error?.message || 'Таймаут подключения'));
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = async () => {
    if (!carToDelete) return;
    try {
      await carsApi.delete(carToDelete);
      setCarToDelete(null);
      await loadCars();
    } catch (error: any) {
      console.error(error);
      setErrorObj('Ошибка удаления: ' + (error?.message || 'Неизвестная ошибка'));
      setCarToDelete(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Файл слишком большой. Максимальный размер 2 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentCar({...currentCar, image_url: reader.result as string});
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!currentCar.name || !currentCar.brand || !currentCar.price || !currentCar.country) {
      setFormError('Пожалуйста, заполните обязательные поля: Название, Бренд, Цена, Страна');
      return;
    }
    try {
      const payload = {
        ...currentCar,
        price: currentCar.price ? Number(currentCar.price) : 0,
        power_hp: currentCar.power_hp ? Number(currentCar.power_hp) : null,
        range_km: currentCar.range_km ? Number(currentCar.range_km) : null,
        year: currentCar.year ? Number(currentCar.year) : null
      };

      if (currentCar.id) {
        await carsApi.update(currentCar.id, payload);
      } else {
        await carsApi.create(payload);
      }
      setIsEditing(false);
      setCurrentCar(null);
      await loadCars();
    } catch (error: any) {
      console.error(error);
      setFormError('Ошибка при сохранении: ' + error.message);
    }
  };

  const openEditor = (car: any = { type: 'Электромобиль', features: [], specs: {}, images: [], popular: false, in_stock: false }) => {
    setFormError(null);
    setCurrentCar(car);
    setIsEditing(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-foreground">Управление автомобилями</h1>
        <button onClick={() => openEditor()} className="w-full sm:w-auto bg-primary text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition">
          <Plus size={20} />
          <span>Добавить авто</span>
        </button>
      </div>

      {isEditing && currentCar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white dark:bg-gray-900 w-full sm:rounded-xl sm:max-w-lg p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-b-xl border-t sm:border dark:border-gray-800">
            <button onClick={() => setIsEditing(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-100 p-1.5 rounded-full dark:bg-gray-800">
              <XCircle size={20} />
            </button>
            <h2 className="text-xl font-bold mb-5 pr-10 dark:text-white">
              {currentCar.id ? 'Редактировать авто' : 'Новое авто'}
            </h2>
            
            {formError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-100 dark:border-red-900/50">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Бренд *</label>
                  <input type="text" value={currentCar.brand || ''} onChange={e => setCurrentCar({...currentCar, brand: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Название *</label>
                  <input type="text" value={currentCar.name || ''} onChange={e => setCurrentCar({...currentCar, name: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Цена TJS *</label>
                  <input type="number" value={currentCar.price || ''} onChange={e => setCurrentCar({...currentCar, price: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Цена USD</label>
                  <input type="text" value={currentCar.price_usd || ''} onChange={e => setCurrentCar({...currentCar, price_usd: e.target.value})} placeholder="$25,000" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Тип</label>
                  <select value={currentCar.type || 'Электромобиль'} onChange={e => setCurrentCar({...currentCar, type: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-700">
                    <option value="Электромобиль">Электромобиль</option>
                    <option value="Гибрид">Гибрид</option>
                    <option value="ДВС">ДВС</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Страна *</label>
                  <input type="text" value={currentCar.country || ''} onChange={e => setCurrentCar({...currentCar, country: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                </div>

                <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Год</label>
                    <input type="number" value={currentCar.year || ''} onChange={e => setCurrentCar({...currentCar, year: e.target.value})} className="w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Л.С.</label>
                    <input type="number" value={currentCar.power_hp || ''} onChange={e => setCurrentCar({...currentCar, power_hp: e.target.value})} className="w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Запас</label>
                    <input type="number" value={currentCar.range_km || ''} onChange={e => setCurrentCar({...currentCar, range_km: e.target.value})} className="w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">0-100</label>
                    <input type="text" value={currentCar.acceleration || ''} onChange={e => setCurrentCar({...currentCar, acceleration: e.target.value})} placeholder="3.5s" className="w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Фото</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" value={currentCar.image_url || ''} onChange={e => setCurrentCar({...currentCar, image_url: e.target.value})} placeholder="Вставьте URL картинки" className="flex-1 w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 focus:bg-white dark:focus:bg-gray-700" />
                    <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center text-center">
                      С устройства
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  {currentCar.image_url && (
                    <div className="mt-3 aspect-video w-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700">
                      <img src={currentCar.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-6 py-2">
                <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={currentCar.popular || false} onChange={e => setCurrentCar({...currentCar, popular: e.target.checked})} className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary transition-all cursor-pointer" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Популярный</span>
                </label>
                <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={currentCar.in_stock || false} onChange={e => setCurrentCar({...currentCar, in_stock: e.target.checked})} className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary transition-all cursor-pointer" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">В наличии</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-5 mt-2 border-t dark:border-gray-800">
                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Отмена</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl shadow-sm hover:shadow hover:bg-blue-600 hover:-translate-y-0.5 transition-all">Сохранить авто</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {carToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Удалить автомобиль?</h3>
            <p className="text-gray-500 text-sm mb-6 dark:text-gray-400">Это действие невозможно отменить. Вы уверены, что хотите продолжить?</p>
            <div className="flex gap-3">
              <button onClick={() => setCarToDelete(null)} className="flex-1 px-4 py-2.5 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Отмена</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">Удалить</button>
            </div>
          </div>
        </div>
      )}

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
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">Автомобиль</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">Цена</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">В наличии</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-500 dark:text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-t dark:border-border">
                    <td className="px-4 py-3 sm:px-6 sm:py-4 truncate max-w-[200px] sm:max-w-none">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                          {car.image_url && <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="truncate">
                          <div className="font-bold dark:text-white truncate">{car.brand} {car.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{car.year} • {car.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 dark:text-gray-300">
                      <div className="text-sm font-medium">{new Intl.NumberFormat('ru-RU').format(car.price)} TJS</div>
                      <div className="text-xs sm:text-sm text-gray-500">{car.price_usd}</div>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${car.in_stock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {car.in_stock ? 'В наличии' : 'Под заказ'}
                    </span>
                  </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button onClick={() => openEditor(car)} className="text-blue-600 hover:bg-blue-50 p-2 sm:p-2 rounded-lg transition"><Edit2 size={18} /></button>
                        <button onClick={() => setCarToDelete(car.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 sm:p-2 rounded-lg transition"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
