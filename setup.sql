-- Jalankan di Supabase: SQL Editor. Ganti GANTI_EMAIL_ADMIN (3 tempat) dengan emailmu.
create table karya(
  id uuid primary key default gen_random_uuid(),
  judul text not null, gambar_url text not null, fotografer text not null,
  asal text not null default 'Open Submission', deskripsi text,
  jual text not null default 'tidak' check (jual in ('tidak','dijual','terjual')),
  draft boolean not null default false, created_at timestamptz default now());
alter table karya enable row level security;
create policy "baca" on karya for select using (draft=false or (auth.jwt()->>'email')='GANTI_EMAIL_ADMIN');
create policy "tulis" on karya for all to authenticated
  using ((auth.jwt()->>'email')='GANTI_EMAIL_ADMIN') with check ((auth.jwt()->>'email')='GANTI_EMAIL_ADMIN');
insert into storage.buckets(id,name,public) values('karya','karya',true) on conflict do nothing;
create policy "foto tulis" on storage.objects for all to authenticated
  using (bucket_id='karya' and (auth.jwt()->>'email')='GANTI_EMAIL_ADMIN')
  with check (bucket_id='karya' and (auth.jwt()->>'email')='GANTI_EMAIL_ADMIN');
