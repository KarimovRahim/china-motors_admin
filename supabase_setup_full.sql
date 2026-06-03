-- Полный SQL-скрипт для абсолютно нового проекта в Supabase (China Motors TJ)
-- Он включает таблицы для автомобилей, заказов и консультаций, а также политики свободного доступа.

-- ====================================================
-- 1. Таблица: CARS (Автомобили)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.cars (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  price numeric NOT NULL,
  price_usd text,
  type text DEFAULT 'Электромобиль',
  country text NOT NULL,
  year integer,
  power_hp integer,
  range_km integer,
  acceleration text,
  image_url text,
  popular boolean DEFAULT false,
  in_stock boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- ====================================================
-- 2. Таблица: ORDERS (Заказы)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  tracking_info jsonb DEFAULT '{"current_stage": 1, "stages": [{"id": 1, "title": "Заявка принята", "description": "Мы получили вашу заявку", "date": null, "completed": false}, {"id": 2, "title": "В обработке", "description": "Менеджер обрабатывает заказ", "date": null, "completed": false}]}',
  created_at timestamp with time zone DEFAULT now()
);

-- ====================================================
-- 3. Таблица: CONSULTATIONS (Заявки на консультацию)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  service text,
  message text,
  status text DEFAULT 'new',
  created_at timestamp with time zone DEFAULT now()
);

-- ====================================================
-- 4. Настройка политик безопасности (RLS - Row Level Security)
-- ====================================================

-- Включаем RLS для всех таблиц
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Так как аутентификация администратора сейчас не реализована, мы полностью 
-- Открываем публичный доступ (чтение, добавление, обновление, удаление) для всех типов запросов.
-- ВАЖНО: В реальном проекте, доступ к DELETE и UPDATE должен быть строго ограничен.

-- Политики для автомобилей
DROP POLICY IF EXISTS "Allow ALL access to cars" ON public.cars;
CREATE POLICY "Allow ALL access to cars" ON public.cars FOR ALL USING (true) WITH CHECK (true);

-- Политики для заказов
DROP POLICY IF EXISTS "Allow ALL access to orders" ON public.orders;
CREATE POLICY "Allow ALL access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Политики для консультаций
DROP POLICY IF EXISTS "Allow ALL access to consultations" ON public.consultations;
CREATE POLICY "Allow ALL access to consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);

-- ====================================================
-- 5. Демонстрационные данные (Опционально)
-- ====================================================
INSERT INTO public.cars (name, brand, price, price_usd, type, country, year, power_hp, range_km, image_url, in_stock, popular)
VALUES 
('Model S', 'Tesla', 980000, '$98,000', 'Электромобиль', 'США', 2024, 1020, 600, 'https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=1000&auto=format&fit=crop', true, true),
('SU7', 'Xiaomi', 350000, '$35,000', 'Электромобиль', 'Китай', 2024, 299, 700, 'https://images.unsplash.com/photo-1706698696803-ec5272a11b65?q=80&w=1000&auto=format&fit=crop', false, true);
