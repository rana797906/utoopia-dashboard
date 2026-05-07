# Meta Ads Dashboard — Setup Guide

## Ek baar ka setup (20 minute)

---

## Step 1 — Google Sheets publicly share karo

Har 5 sheets ke liye:
1. Sheet open karo
2. **File → Share → Publish to web**
3. **"Entire Document"** aur **"CSV"** select karo
4. **Publish** dabao — confirm karo

> ⚠️ Yeh zaroori hai, warna dashboard data nahi uthaye ga

---

## Step 2 — Supabase setup (free)

1. Jao [supabase.com](https://supabase.com) → **"Start your project"**
2. GitHub se sign in karo → New project banao
3. Project name: `ads-dashboard`, password koi bhi rakho, region: **Singapore** (closest)
4. Project banne ke baad: **Settings → API** mein jao
5. Copy karo:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database table banao

Supabase dashboard mein **SQL Editor** kholo aur yeh run karo:

```sql
create table notes (
  id uuid default gen_random_uuid() primary key,
  account_id text not null,
  text text not null,
  type text default 'info',
  author text default 'Admin',
  created_at timestamp with time zone default now()
);

alter table notes enable row level security;

create policy "Anyone can read notes"
  on notes for select using (true);

create policy "Anyone can insert notes"
  on notes for insert with check (true);

create policy "Anyone can delete notes"
  on notes for delete using (true);
```

---

## Step 3 — Vercel deploy

1. Is project folder ko GitHub pe push karo:
```bash
cd ads-dashboard
git init
git add .
git commit -m "Initial commit"
# GitHub pe new repo banao phir:
git remote add origin https://github.com/TUMHARA_USERNAME/ads-dashboard.git
git push -u origin main
```

2. Jao [vercel.com](https://vercel.com) → **"New Project"** → GitHub repo import karo

3. **Environment Variables** mein add karo:
```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxxx...
```

4. **Deploy** dabao — 2 minute mein live ho jayega!

---

## Auto-refresh kaise hota hai?

- Dashboard **har 5 minute** mein automatically data refresh karta hai
- Coefficient jo bhi Google Sheet update kare, 5 min mein dashboard pe aa jata hai
- Manual refresh button bhi hai sidebar mein

---

## Local mein test karna ho to:

```bash
npm install
cp .env.local.example .env.local
# .env.local mein apni keys daalo
npm run dev
# http://localhost:3000 kholo
```

---

## Koi masla aaye to:

- **"Sheet publicly shared hai?"** error → Step 1 dobara karo
- **Notes save nahi ho rahe** → Supabase URL/Key check karo
- **Data nahi aa raha** → Sheet ka tab name "Sheet1" hona chahiye (default)
