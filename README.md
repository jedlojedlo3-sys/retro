# Retro Boutique — Web Store & Admin Inventory System

Production-ready web application and inventory system for **Retro Boutique**, a local men's clothing store in **Prilep, North Macedonia** (Stiv Naumov 8, Established in 2003).

Target repository: `https://github.com/jedlojedlo3-sys/retro.git`

---

## 👔 Business Context & Store Model

* **Business Name**: Retro Boutique
* **Location**: Stiv Naumov 8, Prilep 7500, North Macedonia
* **Established**: 2003
* **Working Hours**: Monday – Saturday: 09:00 – 20:00 | Sunday: Closed
* **Instagram**: [@retro_boutique](https://www.instagram.com/retro_boutique/)
* **Concept**: **Click & Collect (Browse → Reserve → Pick up & Pay in store)**.
  * No online payments (no credit cards / Stripe / PayPal).
  * No delivery or shipping calculations.
  * Customers browse the catalog, select their size, reserve items with their phone number, and pick up/pay physically at the store in Prilep.
  * Reservations expire after **48 hours** to protect stock from being reserved indefinitely.

---

## ⚡ Tech Stack

* **Frontend & Backend**: Next.js 15 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS with custom editorial design (`DM Sans` + `Bebas Neue`), rich dark ink (`#11110f`) and warm paper (`#f4f1ea`) palette
* **Database & Auth**: Supabase PostgreSQL + Supabase Auth + Supabase Storage (`product-images`) + Row Level Security (RLS)
* **Atomic Inventory Procedures**: Concurrency-safe PostgreSQL stored procedures with row-level locks (`SELECT FOR UPDATE`)
* **Email Notifications**: Resend API sending order details to `retroboutique2020@gmail.com`
* **Deployment**: Vercel

---

## 📱 Daily Use for Maria (Упатство за Марија)

Ова упатство е напишано на едноставен јазик за Марија да може лесно да ја води продавницата директно од својот мобилен телефон без потреба од техничко знаење.

### 1. Како да се најавиш во админ панелот
1. Отвори го линкот: `твојот-сајт.vercel.app/admin` (или кликни на „Марија Админ“ на дното на сајтот).
2. Внеси ја твојата е-пошта и лозинка.
3. Кликни **„Најави се“**. Веднаш ќе ти се отвори главниот екран.

---

### 2. Како да додадеш нов производ (за помалку од 1 минута)
1. На главниот екран кликни на големото црно копче **„➕ Додај производ“**.
2. **Фотографии**: Кликни на иконата со камера и сликај го парчето директно со телефонот или избери слика од галерија.
3. **Назив**: Внеси го името на моделот (на пр. *Фармерки Slim Dark Blue*).
4. **Категорија**: Избери една од понудените (Фармерки, Џемпери, Кошули, Панталони, Останато).
5. **Цена**: Внеси ја цената во денари (на пр. *1890*).
6. **Големини и залиха**: 
   - Кликни на **S–XXL** или **30–36** за брзо поставување.
   - Со копчињата **`+`** и **`-`** постави колку парчиња имаш физички во продавницата од секоја големина.
   - Ако имаш и друга големина (на пр. 38 или XXXL), внеси ја во полето подолу и кликни „Додај“.
7. Кликни на црното копче **„Објави производ“**. Производот веднаш се појавува во онлајн каталогот за купувачите!

---

### 3. Како да промениш залиха на постоечки производ
1. Оди во **„👕 Производи“**.
2. Најди го моделот и кликни **„Измени“**.
3. Кај делот за големини, со копчињата **`+`** и **`-`** додај или намали парчиња.
   - *Физичка*: Колку парчиња има вкупно во продавницата.
   - *Резервирано*: Колку парчиња чекаат купувачи.
   - *Достапно*: Колку парчиња се слободни за нови резервации.
4. Кликни **„Зачувај измени“**.

---

### 4. Како да скриеш стар производ што повеќе не го продаваш
1. Оди во **„👕 Производи“**.
2. До производот кликни на иконата со **око**. Производот веднаш ќе се скрие од купувачите на сајтот, но останува зачуван во твојот систем.
3. Ако повторно добиеш од истиот модел, со еден клик на истото копче можеш пак да го направиш видлив.

---

### 5. Како да обработиш резервација од купувач
Кога купувач ќе направи резервација, веднаш добиваш е-пошта на `retroboutique2020@gmail.com`, а на главниот екран на `/admin` се појавува портокалово известување (на пр. *„1 нова резервација“*).

1. Оди во **„📋 Резервации“**.
2. Во табот **„Нови“** ќе ги видиш името, телефонот и резервираните парчиња со големини.
3. Пронајди ги парчињата во продавницата и тргни ги настрана, па кликни на синото копче **„Подготвено“**.
4. **Кога купувачот ќе дојде во Retro Boutique:**
   - Го проба моделот и плаќа на каса.
   - Кликни на црното копче **„Подигнато“** и потврди.
   - *Системот автоматски ја намалува физичката залиха.*
5. **Ако купувачот се откаже или истечат 48 часа:**
   - Кликни на **„Откажи“**.
   - *Резервираните парчиња автоматски се враќаат како слободни за други купувачи.*

---

## 🗄️ Database Setup (Supabase)

### 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Note your **Project URL**, **Anon / Public Key**, and **Service Role Key** (under Project Settings → API).

### 2. Run Database Migrations
1. In the Supabase dashboard, open the **SQL Editor**.
2. Copy and paste the contents of `supabase/migrations/001_schema_and_rpcs.sql` and run it.
3. Copy and paste the contents of `supabase/migrations/002_seed_demo_data.sql` and run it to populate the demo inventory.

### 3. Create Storage Bucket for Product Photos
1. In Supabase, go to **Storage → New Bucket**.
2. Name the bucket `product-images`.
3. Check the **"Public bucket"** toggle.
4. Click **Save**.

### 4. Create Maria's Admin Account
1. In Supabase, go to **Authentication → Users → Add user → Create user**.
2. Enter Maria's email (e.g. `retroboutique2020@gmail.com` or `maria@retroboutique.mk`) and a secure password.
3. Open the **SQL Editor** and run:
   ```sql
   INSERT INTO admin_users (id, email)
   SELECT id, email FROM auth.users WHERE email = 'retroboutique2020@gmail.com'
   ON CONFLICT (id) DO NOTHING;
   ```
4. Maria can now log in at `/admin/login`.

---

## ✉️ Resend Email Setup

1. Create a free account at [resend.com](https://resend.com).
2. Go to **API Keys** → **Create API Key**.
3. Copy the key (starts with `re_...`).
4. Set the following environment variables in your `.env.local` or Vercel dashboard:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ORDER_NOTIFICATION_EMAIL=retroboutique2020@gmail.com
   ```
5. *(Optional for production domain)*: Under Resend Domains, add your custom domain (e.g. `retroboutique.mk`) and verify DNS records to send from `orders@retroboutique.mk`.

---

## 🚀 Deploy to Vercel

1. Push this repository to GitHub: `https://github.com/jedlojedlo3-sys/retro.git`.
2. Go to [vercel.com](https://vercel.com) and click **"Add New... → Project"**.
3. Select the repository `retro`.
4. Add the following **Environment Variables**:
   * `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxx.supabase.co`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...`
   * `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...`
   * `RESEND_API_KEY` = `re_...`
   * `ORDER_NOTIFICATION_EMAIL` = `retroboutique2020@gmail.com`
   * `NEXT_PUBLIC_SITE_URL` = `https://your-vercel-domain.vercel.app`
5. Click **Deploy**.

---

## 🧪 Verified Scenarios & Inventory Logic

| Scenario | Physical Stock | Reserved Stock | Available Stock | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Initial** | 3 | 0 | 3 | Normal in-stock state |
| **Customer reserves 1 item** | 3 | 1 | 2 | `create_reservation_atomic` locks row & reserves 1 |
| **Customer reserves 2 more** | 3 | 3 | 0 | Available is 0; UI disables size & server rejects 4th piece |
| **Admin cancels 1st order** | 3 | 2 | 1 | Reserved decreases by 1, Available becomes 1 |
| **Admin confirms pickup on 2nd** | 1 | 0 | 1 | Physical & reserved both decrease by 2 |
