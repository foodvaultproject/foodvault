-- Record how many units have already been taken off the shelf.
-- Also correct the captured tomato order whose shelf count never moved.

alter table public.foodvault_order_items
  add column if not exists quantity_committed integer;

do $$
declare
  v_item_id uuid := '4c4f3b4f-5e8a-4888-b1a0-2b301184c3a3';
  v_product_id uuid := '2e2db601-af0b-4647-b849-aa82a37610f2';
  v_batch_id uuid := '6e0b49c2-69b8-4c1d-830f-fb48c6341899';
  v_already integer;
  v_picked integer;
begin
  select quantity_committed, coalesce(quantity_picked, quantity)
    into v_already, v_picked
  from public.foodvault_order_items
  where id = v_item_id
  for update;

  if v_already is null and coalesce(v_picked, 0) > 0 then
    update public.foodvault_inventory_batches
    set quantity_remaining = quantity_remaining - v_picked
    where id = v_batch_id
      and product_id = v_product_id
      and quantity_remaining >= v_picked;

    if found then
      update public.foodvault_products
      set stock_quantity = (
        select coalesce(sum(quantity_remaining), 0)
        from public.foodvault_inventory_batches
        where product_id = v_product_id
      )
      where id = v_product_id;

      update public.foodvault_order_items
      set quantity_committed = v_picked
      where id = v_item_id;
    end if;
  end if;
end $$;

notify pgrst, 'reload schema';
