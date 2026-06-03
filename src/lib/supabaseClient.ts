import { createClient } from '@supabase/supabase-js';

const supabaseUrl ='https://nbmquntupeegnguxpruw.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibXF1bnR1cGVlZ25ndXhwcnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzY5NjEsImV4cCI6MjA5NTY1Mjk2MX0.4NiVs-dwJ3EWPLiHzTMYK_wkXAWa1StejoJvJ35SmOs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const trackingStagesApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('tracking_stages').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  }
};

export const carsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (carData: any) => {
    const { data, error } = await supabase.from('cars').insert([carData]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id: string, carData: any) => {
    const { data, error } = await supabase.from('cars').update(carData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

export const favoritesApi = {
  getAll: async (userId: string) => {
    // For now we persist favorites locally by ID
    const favs = JSON.parse(localStorage.getItem('favs_' + userId) || '[]');
    if (favs.length === 0) return [];
    
    const { data, error } = await supabase.from('cars').select('*').in('id', favs);
    if (error) throw error;
    return data || [];
  },
  toggle: async (carId: string, userId: string) => {
    let favs = JSON.parse(localStorage.getItem('favs_' + userId) || '[]');
    if (favs.includes(carId)) {
      favs = favs.filter((id: string) => id !== carId);
    } else {
      favs.push(carId);
    }
    localStorage.setItem('favs_' + userId, JSON.stringify(favs));
    return favs.includes(carId);
  }
};

export const ordersApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('orders').select('*, cars(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  create: async (orderData: any) => {
    const order_number = 'GI-TJ-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Fetch global stages
    const { data: stData } = await supabase.from('tracking_stages').select('*').order('id', { ascending: true });
    
    let defaultStages = [];
    if (stData && stData.length > 0) {
      defaultStages = stData.map((st) => ({
        id: st.id,
        title: st.title,
        description: st.description,
        location: st.location || '',
        date: st.id === 1 ? new Date().toISOString() : null,
        completed: st.id === 1
      }));
    } else {
      defaultStages = [
        { id: 1, title: 'Заказ подтверждён', description: 'Ваш заказ успешно зарегистрирован в системе', date: new Date().toISOString(), completed: true },
        { id: 2, title: 'Проверка автомобиля', description: 'Проверка технического состояния в Китае', date: null, completed: false },
        { id: 3, title: 'Оформление документов', description: 'Экспортное оформление', date: null, completed: false },
        { id: 4, title: 'В пути', description: 'Автомобиль в процессе доставки в Худжанд', date: null, completed: false },
        { id: 5, title: 'Таможенная очистка', description: 'Процедура растаможки в Таджикистане', date: null, completed: false },
        { id: 6, title: 'Готов к выдаче', description: 'Автомобиль готов к передаче владельцу', date: null, completed: false }
      ]
    }

    const { data, error } = await supabase.from('orders').insert([{
      ...orderData,
      order_number,
      created_at: new Date().toISOString(),
      status: 'pending',
      tracking_info: {
        current_stage: 1,
        stages: defaultStages
      }
    }]).select('*, cars(*)').single();
    
    if (error) throw error;
    return data;
  },
  getByOrderNumber: async (number: string) => {
    const { data, error } = await supabase.from('orders').select('*, cars(*)').eq('order_number', number).single();
    if (error) throw error;
    return data;
  },
  getByPhone: async (phone: string) => {
    const { data, error } = await supabase.from('orders').select('*, cars(*)').eq('customer_phone', phone);
    if (error) throw error;
    return data || [];
  },
  update: async (id: string, updateData: any) => {
    const { data, error } = await supabase.from('orders').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

export const consultationApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('consultations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  create: async (data: any) => {
    const { error } = await supabase.from('consultations').insert([data]);
    if (error) throw error;
    return true;
  },
  update: async (id: string, updateData: any) => {
    const { data, error } = await supabase.from('consultations').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('consultations').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

export const subscribeToOrder = (orderId: string, callback: any) => {
  const subscription = supabase
    .channel('order_updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      (payload) => {
        // We might want to fetch full order payload including car data here
        // but passing payload.new is basic version. We'll simply call getById inside the subscriber if needed
        callback(payload.new);
      }
    )
    .subscribe();

  return { 
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    } 
  };
};
