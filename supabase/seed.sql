-- Vault Market catalog seed (imported B2B pantry products).
-- Apply in the Supabase SQL editor, or via `supabase db reset` when seed is enabled.
-- Re-run safe: skips SKUs that already exist.

insert into public.foodvault_products (
  sku,
  name,
  brand,
  retail_price,
  member_price,
  stock_quantity,
  category,
  image_url
)
select
  'FV-COND-STK-430',
  'Stokes Real Mayonnaise 430g',
  'Stokes',
  12.90,
  9.70,
  48,
  'Condiments',
  'https://images.unsplash.com/photo-1506368083636-6defb67639a7?w=800&h=800&fit=crop'
where not exists (
  select 1 from public.foodvault_products p where p.sku = 'FV-COND-STK-430'
);

insert into public.foodvault_products (
  sku,
  name,
  brand,
  retail_price,
  member_price,
  stock_quantity,
  category,
  image_url
)
select
  'FV-BISC-CAB-200',
  'All Butter Shortbread Rounds 200g',
  'Cartwright & Butler',
  17.50,
  13.20,
  36,
  'Biscuits',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=800&fit=crop'
where not exists (
  select 1 from public.foodvault_products p where p.sku = 'FV-BISC-CAB-200'
);

insert into public.foodvault_products (
  sku,
  name,
  brand,
  retail_price,
  member_price,
  stock_quantity,
  category,
  image_url
)
select
  'FV-TEA-FAM-125',
  'Royal Blend Loose Leaf Tea 125g',
  'Fortnum & Mason',
  34.00,
  25.50,
  24,
  'Tea',
  'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&h=800&fit=crop'
where not exists (
  select 1 from public.foodvault_products p where p.sku = 'FV-TEA-FAM-125'
);
