# ESTRA Collaborative Research Platform

A minimal editorial-style multi-user research workspace built with React + Tailwind + Supabase.

## Features

- Lightweight email-based identity (mock sign-in) for attribution.
- Shared multi-user data persistence in Supabase.
- Real-time syncing across users via Supabase realtime subscriptions.
- Three collaborative modules:
  - **Flagship Project**: editable section blocks with `last_updated` and `updated_by`.
  - **Geopolitics Tracker**: editable table, add new rows, status filtering.
  - **Insights & Signals**: feed-style entries with create + edit.

## 1) Create your Supabase project

1. Go to [Supabase](https://supabase.com/) and create a project.
2. In **Project Settings → API**, copy:
   - Project URL
   - `anon` public key
3. Copy `.env.example` to `.env` and paste keys:

```bash
cp .env.example .env
```

## 2) Create database tables

Run this SQL in **SQL Editor**:

```sql
create table if not exists flagship_project (
  id bigint generated always as identity primary key,
  section_name text not null unique,
  content text default '',
  last_updated timestamptz default now(),
  updated_by text default ''
);

create table if not exists geopolitics_tracker (
  id bigint generated always as identity primary key,
  country text default '',
  policy text default '',
  status text default 'Planned' check (status in ('Planned', 'Active', 'Scaling')),
  impact text default '',
  source text default '',
  notes text default '',
  last_updated timestamptz default now()
);

create table if not exists insights_signals (
  id bigint generated always as identity primary key,
  title text not null,
  author text default '',
  type text default 'Insight' check (type in ('Insight', 'Misinformation Response')),
  summary text default '',
  tags text default '',
  date date default current_date
);
```

## 3) Enable access (for quick research collaboration)

For quick setup, disable RLS on these tables (or add equivalent policies):

```sql
alter table flagship_project disable row level security;
alter table geopolitics_tracker disable row level security;
alter table insights_signals disable row level security;
```

## 4) Enable realtime

In SQL editor:

```sql
alter publication supabase_realtime add table flagship_project;
alter publication supabase_realtime add table geopolitics_tracker;
alter publication supabase_realtime add table insights_signals;
```

## 5) Run app

```bash
npm install
npm run dev
```

Open the displayed local URL in two browsers/windows to verify live collaboration.

## Notes

- Authentication is intentionally lightweight: email input is stored locally and used for `updated_by` attribution.
- If env keys are missing, the UI loads but editing is disabled until Supabase is configured.
