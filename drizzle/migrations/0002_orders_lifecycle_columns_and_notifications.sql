alter table public.orders add column if not exists buyer_confirmed boolean not null default false;
alter table public.orders add column if not exists farmer_confirmed boolean not null default false;

-- Initiator farmer may add contributions for other participating farmers
create policy "Group initiator adds contributions" on public.group_contributions for insert with check (
  exists (select 1 from public.group_orders g where g.id = group_order_id and g.initiator_farmer_id = auth.uid())
);

-- Notification helper (security definer: system-generated notifications)
create or replace function public.notify_user(_user_id uuid, _type text, _title text, _message text, _link text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _user_id is null then return; end if;
  insert into public.notifications (user_id, notification_type, title, message, link)
  values (_user_id, _type, _title, _message, _link);
end;
$$;

-- Offer created -> notify the receiving party
create or replace function public.on_offer_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare msg text;
begin
  msg := format('%s kg %s @ ₹%s/kg — %s', NEW.quantity, NEW.crop_name, NEW.price_per_unit, coalesce(NEW.message, 'New offer'));
  if NEW.is_group then
    msg := 'Group offer: ' || msg;
  end if;
  if NEW.farmer_id != NEW.buyer_id then
    perform public.notify_user(NEW.farmer_id, 'offer', 'New offer received', msg, '/farmer/offers');
  end if;
  return NEW;
end;
$$;

create trigger offers_notify_created
after insert on public.offers
for each row execute function public.on_offer_created();

-- Offer status change -> notify the other party
create or replace function public.on_offer_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare title text; msg text;
begin
  if NEW.status = OLD.status then return NEW; end if;
  title := 'Offer ' || NEW.status;
  if NEW.status = 'counteroffer' then
    title := 'Counteroffer received';
    msg := format('Counteroffer: %s kg %s @ ₹%s/kg. %s', coalesce(NEW.counter_quantity, NEW.quantity), NEW.crop_name, coalesce(NEW.counter_price_per_unit, NEW.price_per_unit), coalesce(NEW.counter_message, ''));
  else
    msg := format('Offer for %s kg %s @ ₹%s/kg is now %s.', NEW.quantity, NEW.crop_name, NEW.price_per_unit, NEW.status);
  end if;
  if NEW.buyer_id != NEW.farmer_id then
    -- notify whichever party did NOT make the change (approximation: notify both except when actor unknown)
    perform public.notify_user(NEW.buyer_id, 'offer', title, msg, '/buyer/offers');
    perform public.notify_user(NEW.farmer_id, 'offer', title, msg, '/farmer/offers');
  end if;
  return NEW;
end;
$$;

create trigger offers_notify_status
after update on public.offers
for each row execute function public.on_offer_status_change();

-- Group contribution invitation
create or replace function public.on_contribution_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare g record;
begin
  select * into g from public.group_orders where id = NEW.group_order_id;
  perform public.notify_user(NEW.farmer_id, 'group_order', 'Group order invitation',
    format('You are invited to contribute %s kg %s @ ₹%s/kg to a combined order.', NEW.quantity, g.crop_name, NEW.price_per_unit),
    '/farmer/group-selling');
  return NEW;
end;
$$;

create trigger contributions_notify_created
after insert on public.group_contributions
for each row execute function public.on_contribution_created();

-- Contribution confirmed / all confirmed
create or replace function public.on_contribution_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare g record; pending int;
begin
  if NEW.status = OLD.status then return NEW; end if;
  select * into g from public.group_orders where id = NEW.group_order_id;
  perform public.notify_user(g.buyer_id, 'group_order', 'Farmer confirmed contribution',
    format('A farmer confirmed %s kg %s in the combined order.', NEW.quantity, g.crop_name), '/buyer/group-orders');
  if NEW.status = 'confirmed' then
    select count(*) into pending from public.group_contributions where group_order_id = NEW.group_order_id and status = 'pending';
    if pending = 0 then
      update public.group_orders set status = 'all_confirmed', updated_at = now() where id = NEW.group_order_id;
      perform public.notify_user(g.buyer_id, 'group_order', 'Group offer ready', 'All farmers confirmed. Review and accept the combined offer.', '/buyer/group-orders');
      perform public.notify_user(g.initiator_farmer_id, 'group_order', 'Group offer ready', 'All farmers confirmed. The combined offer was sent to the buyer.', '/farmer/group-selling');
    end if;
  end if;
  return NEW;
end;
$$;

create trigger contributions_notify_status
after update on public.group_contributions
for each row execute function public.on_contribution_status_change();

-- Order lifecycle notifications: notify counterparties on every stage change
create or replace function public.on_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare titles text; msg text;
begin
  if NEW.status = OLD.status then return NEW; end if;
  select case NEW.status
    when 'inquiry' then 'New order inquiry'
    when 'matching' then 'Smart matches found'
    when 'quotation' then 'Quotation received'
    when 'confirmation' then 'Offer accepted — confirm the order'
    when 'preparation' then 'Order in preparation'
    when 'dispatched' then 'Order dispatched'
    when 'delivered' then 'Order delivered — inspect and confirm'
    when 'completed' then 'Order completed'
    when 'cancelled' then 'Order cancelled'
    else 'Order update'
  end into titles;
  msg := format('Order for %s kg %s is now: %s. %s', NEW.total_quantity, NEW.crop_name, NEW.status, coalesce(NEW.transport_details, ''));
  perform public.notify_user(NEW.buyer_id, 'order', titles, msg, '/orders/' || NEW.id);
  if NEW.farmer_id is not null then
    perform public.notify_user(NEW.farmer_id, 'order', titles, msg, '/orders/' || NEW.id);
  else
    -- group order: notify all contributing farmers
    perform public.notify_user(c.farmer_id, 'order', titles, msg, '/orders/' || NEW.id)
      from public.group_contributions c where c.group_order_id = NEW.group_order_id;
  end if;
  return NEW;
end;
$$;

create trigger orders_notify_status
after update on public.orders
for each row execute function public.on_order_status_change();

-- Group order accepted by buyer -> order creation notification handled by orders trigger
grant execute on function public.notify_user(uuid, text, text, text, text) to authenticated;
grant execute on function public.notify_user(uuid, text, text, text, text) to service_role;