-- Remove Vault Market preview/filler catalog rows (Unsplash images + demo SKUs).

delete from public.foodvault_inventory_batches
where product_id::text in (
  select id::text from public.foodvault_products
  where sku in (
    'FV-COND-STK-430',
    'FV-BISC-CAB-200',
    'FV-TEA-FAM-125',
    'FV-COND-TRK-300',
    'FV-BISC-MCV-250',
    'FV-TEA-TWN-100',
    'FV-OIL-FBO-500',
    'FV-SWEET-WTK-180',
    'FV-SPREAD-BM-370',
    'FV-TEA-YT-80'
  )
  or image_url ilike '%unsplash.com%'
  or id::text like 'seed-%'
);

delete from public.foodvault_lost_sales
where product_id::text in (
  select id::text from public.foodvault_products
  where sku in (
    'FV-COND-STK-430',
    'FV-BISC-CAB-200',
    'FV-TEA-FAM-125',
    'FV-COND-TRK-300',
    'FV-BISC-MCV-250',
    'FV-TEA-TWN-100',
    'FV-OIL-FBO-500',
    'FV-SWEET-WTK-180',
    'FV-SPREAD-BM-370',
    'FV-TEA-YT-80'
  )
  or image_url ilike '%unsplash.com%'
  or id::text like 'seed-%'
)
or sku in (
  'FV-COND-STK-430',
  'FV-BISC-CAB-200',
  'FV-TEA-FAM-125',
  'FV-COND-TRK-300',
  'FV-BISC-MCV-250',
  'FV-TEA-TWN-100',
  'FV-OIL-FBO-500',
  'FV-SWEET-WTK-180',
  'FV-SPREAD-BM-370',
  'FV-TEA-YT-80'
);

delete from public.foodvault_products
where sku in (
  'FV-COND-STK-430',
  'FV-BISC-CAB-200',
  'FV-TEA-FAM-125',
  'FV-COND-TRK-300',
  'FV-BISC-MCV-250',
  'FV-TEA-TWN-100',
  'FV-OIL-FBO-500',
  'FV-SWEET-WTK-180',
  'FV-SPREAD-BM-370',
  'FV-TEA-YT-80'
)
or image_url ilike '%unsplash.com%'
or id::text like 'seed-%';
