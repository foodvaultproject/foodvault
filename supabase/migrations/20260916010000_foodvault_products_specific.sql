-- Third-level Vault Market aisle ("specific") under subcategory.

alter table public.foodvault_products
  add column if not exists specific text;

notify pgrst, 'reload schema';
