-- 0001_community.sql — F-28 동행 매칭의 첫걸음: 프로필·체크인·게시판·신고·차단
--
-- ⚠️ 이 프로젝트 사상 첫 DB 스키마다(이전까진 정적 TS 파일만 있었음).
-- ⚠️ 실명·이메일은 어떤 public 테이블에도 저장하지 않는다(F-28 스펙 "실명·
--   전화번호 직접 노출 금지", 03문서 2244행) — 이메일은 auth.users에만 있고
--   RLS로 공개 노출을 아예 만들지 않는다. 순례자는 nickname(닉네임)으로만 보인다.
-- ⚠️ town_id는 data/towns.ts의 정적 문자열 id를 그대로 참조한다(FK 아님 —
--   마을 데이터는 DB가 아니라 코드에 있으므로).

-- ── profiles ──────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  travel_mode text,
  start_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- ── checkins — "오늘 이 마을에 있어요" ──────────────────────────────────────
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  town_id text not null,
  checked_in_at timestamptz not null default now()
);

create index checkins_town_id_idx on public.checkins (town_id);
create index checkins_checked_in_at_idx on public.checkins (checked_in_at desc);

alter table public.checkins enable row level security;

create policy "checkins_select_all" on public.checkins
  for select using (true);

create policy "checkins_insert_own" on public.checkins
  for insert with check (profile_id = auth.uid());

create policy "checkins_delete_own" on public.checkins
  for delete using (profile_id = auth.uid());

-- ── posts — 텍스트 전용 게시판(사진·좋아요 없음, 03문서 W2 반전 범위 제한) ──
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

-- 차단한 상대의 글은 로그인한 본인 화면에서만 숨긴다. 비로그인(auth.uid() is null)
-- 사용자는 게시판을 그대로 공개 열람할 수 있다(옵트인 로그인, 규칙 8).
create policy "posts_select_not_blocked" on public.posts
  for select using (
    auth.uid() is null
    or not exists (
      select 1 from public.blocks b
      where b.blocker_profile_id = auth.uid() and b.blocked_profile_id = posts.profile_id
    )
  );

create policy "posts_insert_own" on public.posts
  for insert with check (profile_id = auth.uid());

create policy "posts_delete_own" on public.posts
  for delete using (profile_id = auth.uid());

-- ── replies ──────────────────────────────────────────────────────────────
create table public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index replies_post_id_idx on public.replies (post_id);

alter table public.replies enable row level security;

create policy "replies_select_not_blocked" on public.replies
  for select using (
    auth.uid() is null
    or not exists (
      select 1 from public.blocks b
      where b.blocker_profile_id = auth.uid() and b.blocked_profile_id = replies.profile_id
    )
  );

create policy "replies_insert_own" on public.replies
  for insert with check (profile_id = auth.uid());

create policy "replies_delete_own" on public.replies
  for delete using (profile_id = auth.uid());

-- ── reports — 신고(필수 안전 기능, 03문서 "이 기능의 존재 이유보다 우선") ──
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('PROFILE', 'POST', 'REPLY')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- 신고 내용은 신고자 본인과 관리자(서비스 롤, RLS 우회)만 본다 — 목록 공개 안 함.
create policy "reports_select_own" on public.reports
  for select using (reporter_profile_id = auth.uid());

create policy "reports_insert_own" on public.reports
  for insert with check (reporter_profile_id = auth.uid());

-- ── blocks — 차단 ────────────────────────────────────────────────────────
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_profile_id uuid not null references public.profiles (id) on delete cascade,
  blocked_profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_profile_id, blocked_profile_id),
  check (blocker_profile_id <> blocked_profile_id)
);

alter table public.blocks enable row level security;

create policy "blocks_select_own" on public.blocks
  for select using (blocker_profile_id = auth.uid());

create policy "blocks_insert_own" on public.blocks
  for insert with check (blocker_profile_id = auth.uid());

create policy "blocks_delete_own" on public.blocks
  for delete using (blocker_profile_id = auth.uid());
