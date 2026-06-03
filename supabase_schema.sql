-- Supabase Schema for China Motors TJ

-- Reset existing tables if you prefer running this script completely
-- DROP TABLE IF EXISTS public.consultations;
-- DROP TABLE IF EXISTS public.orders;
-- DROP TABLE IF EXISTS public.cars;

-- 1. Create `cars` table
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC NOT NULL,
  price_usd TEXT,
  type TEXT NOT NULL, -- Электромобиль, Гибрид, ДВС
  country TEXT NOT NULL,
  year INTEGER,
  power_hp INTEGER,
  range_km INTEGER,
  acceleration TEXT,
  delivery_time TEXT,
  popular BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT false,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create `orders` table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  car_id UUID REFERENCES public.cars(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_city TEXT,
  notes TEXT,
  total_price NUMERIC,
  tracking_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create `consultations` table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  service TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 5. Policies

-- Cars: Anyone can read, only anon/authenticated can't edit by default
CREATE POLICY "Allow public read access to cars" ON public.cars FOR SELECT USING (true);

-- Orders: Anyone can insert, anyone can read to track (in production, you might want it restricted by phone number)
CREATE POLICY "Allow public insert to orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to orders for tracking" ON public.orders FOR SELECT USING (true);

-- Consultations: Anyone can insert
CREATE POLICY "Allow public insert to consultations" ON public.consultations FOR INSERT WITH CHECK (true);

-- ==========================================
-- Insert Default Data into cars
-- ==========================================
INSERT INTO public.cars (name, brand, price, price_usd, type, country, year, power_hp, range_km, acceleration, delivery_time, popular, in_stock, image_url, images, description, specs, features)
VALUES 
(
  'Zeekr 001', 'Zeekr', 350000, '$32,000', 'Электромобиль', 'Китай', 2024, 544, 656, '3.8с', '15-25 дней', true, true, 
  'https://images.unsplash.com/photo-1752959837780-72d6192a5265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  '["https://images.unsplash.com/photo-1752959837780-72d6192a5265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"]'::jsonb,
  'Инновационный электромобиль с выдающейся динамикой и комфортом.',
  '{"battery": "100 кВт·ч", "warranty": "8 лет или 160 000 км", "drive": "Полный"}'::jsonb,
  '["Панорамная крыша", "Автопилот", "Пневмоподвеска"]'::jsonb
),
(
  'BYD Han', 'BYD', 280000, '$25,000', 'Электромобиль', 'Китай', 2024, 517, 715, '3.9с', '12-20 дней', true, false, 
  'https://images.unsplash.com/photo-1745715689234-6e64c312d6fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  '["https://images.unsplash.com/photo-1745715689234-6e64c312d6fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"]'::jsonb,
  'Роскошный седан с передовыми технологиями BYD.',
  '{"battery": "85.4 кВт·ч", "warranty": "8 лет или 150 000 км"}'::jsonb,
  '["Кожаный салон", "Вентиляция сидений", "Продвинутая мультимедиа"]'::jsonb
),
(
  'Li Auto L9', 'Li Auto', 450000, '$41,000', 'Гибрид', 'Китай', 2024, 449, 1315, '5.3с', '20-30 дней', false, true, 
  'https://images.unsplash.com/photo-1753026351567-cb61056e4056?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  '["https://images.unsplash.com/photo-1753026351567-cb61056e4056?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"]'::jsonb,
  'Полноразмерный семейный внедорожник с невероятным запасом хода.',
  '{"battery": "42.8 кВт·ч + 1.5L", "warranty": "5 лет или 100 000 км"}'::jsonb,
  '["Массаж всех сидений", "Холодильник", "Экраны для задних пассажиров"]'::jsonb
);
