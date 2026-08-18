-- ==============================================================================
-- RETRO BOUTIQUE — DEMO SEED DATA
-- ==============================================================================

DO $$
DECLARE
  v_prod1_id uuid;
  v_prod2_id uuid;
  v_prod3_id uuid;
  v_prod4_id uuid;
  v_prod5_id uuid;
  v_prod6_id uuid;
BEGIN
  -- Clear existing demo items if necessary
  DELETE FROM products WHERE name IN (
    'Retro Slim Jeans 01',
    'Casual Knit Sweater Black',
    'Classic Oxford Shirt',
    'Casual Chino Trousers',
    'Retro Vintage Wash Jeans',
    'Everyday Crewneck Knit'
  );

  -- 1. Jeans 01
  INSERT INTO products (name, category, price, description, image_url, additional_images, active)
  VALUES (
    'Retro Slim Jeans 01',
    'jeans',
    1890,
    'Премиум slim fit фармерки од еластичен памук. Совршен крој за секојдневна комбинација.',
    '/assets/look-01.jpg',
    ARRAY['/assets/store-01.jpg'],
    true
  ) RETURNING id INTO v_prod1_id;

  INSERT INTO product_variants (product_id, size, stock_quantity, reserved_quantity, display_order)
  VALUES
    (v_prod1_id, '30', 3, 0, 1),
    (v_prod1_id, '31', 2, 0, 2),
    (v_prod1_id, '32', 4, 0, 3),
    (v_prod1_id, '33', 1, 0, 4),
    (v_prod1_id, '34', 3, 0, 5),
    (v_prod1_id, '36', 2, 0, 6);

  -- 2. Sweater 01
  INSERT INTO products (name, category, price, description, image_url, additional_images, active)
  VALUES (
    'Casual Knit Sweater Black',
    'sweaters',
    1490,
    'Класичен црн плетен џемпер. Мек и топол материјал, идеален за слоевити комбинации.',
    '/assets/store-02.jpg',
    ARRAY['/assets/look-01.jpg'],
    true
  ) RETURNING id INTO v_prod2_id;

  INSERT INTO product_variants (product_id, size, stock_quantity, reserved_quantity, display_order)
  VALUES
    (v_prod2_id, 'S', 2, 0, 1),
    (v_prod2_id, 'M', 5, 0, 2),
    (v_prod2_id, 'L', 4, 0, 3),
    (v_prod2_id, 'XL', 3, 0, 4),
    (v_prod2_id, 'XXL', 1, 0, 5);

  -- 3. Shirt 01
  INSERT INTO products (name, category, price, description, image_url, additional_images, active)
  VALUES (
    'Classic Oxford Shirt',
    'shirts',
    1290,
    'Памучна кошула со модерен структуриран крој. Погодна и за лежерен и за полу-елегантен стил.',
    '/assets/look-02.jpg',
    ARRAY['/assets/store-02.jpg'],
    true
  ) RETURNING id INTO v_prod3_id;

  INSERT INTO product_variants (product_id, size, stock_quantity, reserved_quantity, display_order)
  VALUES
    (v_prod3_id, 'M', 3, 0, 1),
    (v_prod3_id, 'L', 4, 0, 2),
    (v_prod3_id, 'XL', 2, 0, 3);

  -- 4. Trousers 01
  INSERT INTO products (name, category, price, description, image_url, additional_images, active)
  VALUES (
    'Casual Chino Trousers',
    'trousers',
    1790,
    'Удобни чино панталони со модерен крој. Квалитетен материјал што лесно се комбинира со кошули и џемпери.',
    '/assets/store-01.jpg',
    ARRAY['/assets/look-02.jpg'],
    true
  ) RETURNING id INTO v_prod4_id;

  INSERT INTO product_variants (product_id, size, stock_quantity, reserved_quantity, display_order)
  VALUES
    (v_prod4_id, '30', 2, 0, 1),
    (v_prod4_id, '32', 4, 0, 2),
    (v_prod4_id, '34', 3, 0, 3),
    (v_prod4_id, '36', 1, 0, 4);

  -- 5. Jeans 02
  INSERT INTO products (name, category, price, description, image_url, additional_images, active)
  VALUES (
    'Retro Vintage Wash Jeans',
    'jeans',
    1990,
    'Класични фармерки со vintage wash нијанса. Издржлив тексас со одлична удобност при носење.',
    '/assets/store-02.jpg',
    ARRAY['/assets/store-01.jpg'],
    true
  ) RETURNING id INTO v_prod5_id;

  INSERT INTO product_variants (product_id, size, stock_quantity, reserved_quantity, display_order)
  VALUES
    (v_prod5_id, '30', 2, 0, 1),
    (v_prod5_id, '32', 3, 0, 2),
    (v_prod5_id, '34', 4, 0, 3),
    (v_prod5_id, '36', 2, 0, 4);

  -- 6. Sweater 02
  INSERT INTO products (name, category, price, description, image_url, additional_images, active)
  VALUES (
    'Everyday Crewneck Knit',
    'sweaters',
    1590,
    'Елегантен crewneck плетен џемпер во неутрална боја. Лесен за носење врз кошула или маица.',
    '/assets/look-01.jpg',
    ARRAY['/assets/look-02.jpg'],
    true
  ) RETURNING id INTO v_prod6_id;

  INSERT INTO product_variants (product_id, size, stock_quantity, reserved_quantity, display_order)
  VALUES
    (v_prod6_id, 'S', 1, 0, 1),
    (v_prod6_id, 'M', 3, 0, 2),
    (v_prod6_id, 'L', 3, 0, 3),
    (v_prod6_id, 'XL', 2, 0, 4);

END $$;
