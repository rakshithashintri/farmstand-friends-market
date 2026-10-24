create type public.app_role as enum ('farmer', 'buyer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text not null check (user_type in ('farmer', 'buyer', 'admin')),
  full_name text not null,
  phone text,
  location text,
  farm_name text,
  business_name text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.produce_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  crop_name text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null default 'kg',
  price_per_unit numeric not null check (price_per_unit > 0),
  quality_grade text not null default 'Standard',
  harvest_date date,
  farm_location text not null,
  delivery_areas text,
  image_url text,
  availability_status text not null default 'available' check (availability_status in ('available', 'reserved', 'sold_out', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.buyer_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  crop_name text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null default 'kg',
  max_price_per_unit numeric,
  quality_grade text,
  delivery_location text not null,
  delivery_date date,
  status text not null default 'inquiry' check (status in ('inquiry', 'matching', 'quotation', 'confirmation', 'preparation', 'fulfilled', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  buyer_request_id uuid references public.buyer_requests(id) on delete set null,
  listing_id uuid references public.produce_listings(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  crop_name text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null default 'kg',
  price_per_unit numeric not null check (price_per_unit > 0),
  quality_grade text not null default 'Standard',
  delivery_location text,
  delivery_date date,
  transport_cost numeric not null default 0 check (transport_cost >= 0),
  other_selling_cost numeric not null default 0 check (other_selling_cost >= 0),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'counteroffer', 'rejected', 'withdrawn', 'converted')),
  counter_price_per_unit numeric,
  counter_quantity numeric,
  counter_message text,
  is_group boolean not null default false,
  group_order_id uuid,
  parent_offer_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_request_id uuid references public.buyer_requests(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  initiator_farmer_id uuid references public.profiles(id) on delete cascade not null,
  crop_name text not null,
  total_quantity numeric not null check (total_quantity > 0),
  unit text not null default 'kg',
  proposed_price_per_unit numeric not null check (proposed_price_per_unit > 0),
  quality_grade text not null default 'Standard',
  delivery_location text,
  delivery_date date,
  status text not null default 'proposed' check (status in ('proposed', 'all_confirmed', 'accepted', 'counteroffer', 'rejected', 'converted', 'cancelled')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_contributions (
  id uuid primary key default gen_random_uuid(),
  group_order_id uuid references public.group_orders(id) on delete cascade not null,
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.produce_listings(id) on delete set null,
  quantity numeric not null check (quantity > 0),
  price_per_unit numeric not null check (price_per_unit > 0),
  transport_cost numeric not null default 0,
  other_selling_cost numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  farmer_id uuid references public.profiles(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null,
  group_order_id uuid references public.group_orders(id) on delete set null,
  buyer_request_id uuid references public.buyer_requests(id) on delete set null,
  crop_name text not null,
  total_quantity numeric not null check (total_quantity > 0),
  unit text not null default 'kg',
  agreed_price_per_unit numeric not null check (agreed_price_per_unit > 0),
  final_quantity numeric,
  delivery_location text,
  delivery_date date,
  transport_details text,
  status text not null default 'inquiry' check (status in ('inquiry', 'matching', 'quotation', 'confirmation', 'preparation', 'dispatched', 'delivered', 'completed', 'cancelled')),
  buyer_confirmed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  status text not null,
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  farmer_id uuid references public.profiles(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  transaction_type text not null check (transaction_type in ('sale', 'transport_cost', 'other_cost', 'net_payout')),
  amount numeric not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  notification_type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Grants ---------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.produce_listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.produce_listings TO authenticated;
GRANT ALL ON public.produce_listings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_requests TO authenticated;
GRANT ALL ON public.buyer_requests TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_orders TO authenticated;
GRANT ALL ON public.group_orders TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_contributions TO authenticated;
GRANT ALL ON public.group_contributions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT, INSERT ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- RLS ------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, user_type, full_name, phone, location, farm_name, business_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_type', 'buyer'),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'farm_name',
    new.raw_user_meta_data->>'business_name'
  );

  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'user_type')::public.app_role, 'buyer'));

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Profiles: anyone can read (marketplace needs farmer names); users manage their own
create policy "Anyone can view profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Admins manage all profiles" on public.profiles for all using (public.is_admin());

create policy "Users can view own roles" on public.user_roles for select using (auth.uid() = user_id);

create policy "Anyone can view listings" on public.produce_listings for select using (true);
create policy "Farmers manage own listings" on public.produce_listings for all using (auth.uid() = farmer_id) with check (auth.uid() = farmer_id);

create policy "Authenticated view open requests" on public.buyer_requests for select using (auth.uid() = buyer_id or status != 'cancelled');
create policy "Buyers manage own requests" on public.buyer_requests for all using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

create policy "Participants view offers" on public.offers for select using (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin());
create policy "Participants create offers" on public.offers for insert with check (auth.uid() = buyer_id or auth.uid() = farmer_id);
create policy "Participants update offers" on public.offers for update using (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin()) with check (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin());

create policy "Group order participants view" on public.group_orders for select using (auth.uid() = buyer_id or auth.uid() = initiator_farmer_id or exists (select 1 from public.group_contributions c where c.group_order_id = id and c.farmer_id = auth.uid()) or public.is_admin());
create policy "Farmers create group orders" on public.group_orders for insert with check (auth.uid() = initiator_farmer_id);
create policy "Participants update group orders" on public.group_orders for update using (auth.uid() = buyer_id or auth.uid() = initiator_farmer_id or exists (select 1 from public.group_contributions c where c.group_order_id = id and c.farmer_id = auth.uid()) or public.is_admin()) with check (true);

create policy "Contributors view" on public.group_contributions for select using (auth.uid() = farmer_id or public.is_admin() or exists (select 1 from public.group_orders g where g.id = group_order_id and (g.buyer_id = auth.uid() or g.initiator_farmer_id = auth.uid())));
create policy "Farmers manage own contributions" on public.group_contributions for all using (auth.uid() = farmer_id) with check (auth.uid() = farmer_id);

create policy "Order participants view" on public.orders for select using (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin() or exists (select 1 from public.group_contributions c where c.group_order_id = orders.group_order_id and c.farmer_id = auth.uid()));
create policy "Participants manage orders" on public.orders for insert with check (auth.uid() = buyer_id or auth.uid() = farmer_id);
create policy "Participants update orders" on public.orders for update using (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin() or exists (select 1 from public.group_contributions c where c.group_order_id = orders.group_order_id and c.farmer_id = auth.uid())) with check (true);

create policy "Order participants view events" on public.order_events for select using (exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.farmer_id = auth.uid())) or public.is_admin());
create policy "Participants add events" on public.order_events for insert with check (true);

create policy "Transaction participants view" on public.transactions for select using (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin());
create policy "Participants create transactions" on public.transactions for insert with check (auth.uid() = buyer_id or auth.uid() = farmer_id);
create policy "Participants update transactions" on public.transactions for update using (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin()) with check (true);

create policy "Users view own notifications" on public.notifications for select using (auth.uid() = user_id or public.is_admin());
create policy "Users create own notifications" on public.notifications for insert with check (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Indexes for common searches
create index idx_listings_crop on public.produce_listings (lower(crop_name));
create index idx_listings_farmer on public.produce_listings (farmer_id);
create index idx_requests_crop on public.buyer_requests (lower(crop_name));
create index idx_offers_buyer on public.offers (buyer_id);
create index idx_offers_farmer on public.offers (farmer_id);
create index idx_orders_buyer on public.orders (buyer_id);
create index idx_orders_farmer on public.orders (farmer_id);
create index idx_notifications_user on public.notifications (user_id, is_read);
create index idx_contributions_group on public.group_contributions (group_order_id);