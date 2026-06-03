-- Новые политики (policies) для того, чтобы админ-панель могла вносить изменения.
-- Внимание: для реального production сайта эти права (UPDATE/DELETE/INSERT) 
-- должны выдаваться только авторизованным администраторам (authenticated role).
-- Здесь мы открываем доступ, так как это прототип.

-- ==========================================
-- 1. Таблица: CARS (Автомобили)
-- ==========================================
-- Разрешаем удаление автомобилей
DROP POLICY IF EXISTS "Allow public delete access to cars" ON public.cars;
CREATE POLICY "Allow public delete access to cars" ON public.cars FOR DELETE USING (true);

-- Разрешаем обновление автомобилей
DROP POLICY IF EXISTS "Allow public update access to cars" ON public.cars;
CREATE POLICY "Allow public update access to cars" ON public.cars FOR UPDATE USING (true) WITH CHECK (true);

-- Разрешаем добавление автомобилей
DROP POLICY IF EXISTS "Allow public insert to cars" ON public.cars;
CREATE POLICY "Allow public insert to cars" ON public.cars FOR INSERT WITH CHECK (true);


-- ==========================================
-- 2. Таблица: ORDERS (Заказы)
-- ==========================================
-- Разрешаем обновление статусов и трекинга в заказах
DROP POLICY IF EXISTS "Allow public update access to orders" ON public.orders;
CREATE POLICY "Allow public update access to orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Разрешаем удаление заказов (опционально)
DROP POLICY IF EXISTS "Allow public delete access to orders" ON public.orders;
CREATE POLICY "Allow public delete access to orders" ON public.orders FOR DELETE USING (true);

-- Разрешаем чтение всех заказов
DROP POLICY IF EXISTS "Allow public read access to orders for tracking" ON public.orders;
CREATE POLICY "Allow public read access to orders for tracking" ON public.orders FOR SELECT USING (true);


-- ==========================================
-- 3. Таблица: CONSULTATIONS (Заявки)
-- ==========================================
-- Разрешаем чтение всех заявок для админки
DROP POLICY IF EXISTS "Allow public read access to consultations" ON public.consultations;
CREATE POLICY "Allow public read access to consultations" ON public.consultations FOR SELECT USING (true);

-- Разрешаем обновление статуса (выполнено / не выполнено)
DROP POLICY IF EXISTS "Allow public update access to consultations" ON public.consultations;
CREATE POLICY "Allow public update access to consultations" ON public.consultations FOR UPDATE USING (true) WITH CHECK (true);

-- Разрешаем удаление заявок (опционально)
DROP POLICY IF EXISTS "Allow public delete access to consultations" ON public.consultations;
CREATE POLICY "Allow public delete access to consultations" ON public.consultations FOR DELETE USING (true);
