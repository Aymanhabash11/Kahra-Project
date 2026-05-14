-- Fix: add unique constraint required for cart upsert (onConflict: 'user_id,product_id,size,color')
alter table cart_items
  add constraint cart_items_user_product_size_color_key
  unique (user_id, product_id, size, color);
