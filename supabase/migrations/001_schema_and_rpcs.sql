-- ==============================================================================
-- RETRO BOUTIQUE — SCHEMA, CONSTRAINTS, RLS & ATOMIC RPCS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('jeans', 'sweaters', 'shirts', 'trousers', 'other')),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  description text,
  image_url text NOT NULL,
  additional_images text[] DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ------------------------------------------------------------------------------
-- 2. PRODUCT VARIANTS (STOCK PER SIZE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  stock_quantity int NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity int NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_reserved_lte_stock CHECK (reserved_quantity <= stock_quantity),
  CONSTRAINT unq_product_size UNIQUE (product_id, size)
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);

-- ------------------------------------------------------------------------------
-- 3. RESERVATIONS SEQUENCE & TABLE
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS reservation_number_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'ready', 'picked_up', 'cancelled')),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  email_sent boolean NOT NULL DEFAULT false,
  email_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_number ON reservations(reservation_number);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON reservations(expires_at);

-- ------------------------------------------------------------------------------
-- 4. RESERVATION ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  size text NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  line_total numeric(10,2) NOT NULL CHECK (line_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservation_items_res_id ON reservation_items(reservation_id);

-- ------------------------------------------------------------------------------
-- 5. ADMIN USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY, -- matches auth.users(id)
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$;

-- Products Policies
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (active = true OR is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_admin());

-- Product Variants Policies
DROP POLICY IF EXISTS "Public can view active variants" ON product_variants;
CREATE POLICY "Public can view active variants"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND (products.active = true OR is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can insert variants" ON product_variants;
CREATE POLICY "Admins can insert variants"
  ON product_variants FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update variants" ON product_variants;
CREATE POLICY "Admins can update variants"
  ON product_variants FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete variants" ON product_variants;
CREATE POLICY "Admins can delete variants"
  ON product_variants FOR DELETE
  USING (is_admin());

-- Reservations Policies
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update reservations" ON reservations;
CREATE POLICY "Admins can update reservations"
  ON reservations FOR UPDATE
  USING (is_admin());

-- Reservation Items Policies
DROP POLICY IF EXISTS "Admins can view all reservation items" ON reservation_items;
CREATE POLICY "Admins can view all reservation items"
  ON reservation_items FOR SELECT
  USING (is_admin());

-- Admin Users Policies
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (is_admin());

-- ------------------------------------------------------------------------------
-- 7. ATOMIC RESERVATION CREATION RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_reservation_atomic(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_items jsonb -- Array of {"variant_id": "uuid", "quantity": 1}
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_res_id uuid;
  v_res_number text;
  v_item record;
  v_variant record;
  v_product record;
  v_line_total numeric(10,2);
  v_grand_total numeric(10,2) := 0;
  v_items_result jsonb := '[]'::jsonb;
  v_item_json jsonb;
BEGIN
  -- Basic validation
  IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF p_customer_phone IS NULL OR trim(p_customer_phone) = '' THEN
    RAISE EXCEPTION 'Customer phone number is required';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Reservation must contain at least one item';
  END IF;

  -- Generate human-friendly reservation number: RB-01001
  v_res_number := 'RB-' || LPAD(nextval('reservation_number_seq')::text, 4, '0');

  -- First pass: lock variants, validate active product & stock availability, calculate total
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id uuid, quantity int)
  LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity must be greater than 0';
    END IF;

    -- Row locking on variant
    SELECT * INTO v_variant
    FROM product_variants
    WHERE id = v_item.variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product variant % not found', v_item.variant_id;
    END IF;

    -- Fetch product details
    SELECT * INTO v_product
    FROM products
    WHERE id = v_variant.product_id;

    IF NOT FOUND OR v_product.active = false THEN
      RAISE EXCEPTION 'Product "%" is no longer available', coalesce(v_product.name, 'Unknown');
    END IF;

    -- Validate stock availability: (stock - reserved) >= quantity
    IF (v_variant.stock_quantity - v_variant.reserved_quantity) < v_item.quantity THEN
      RAISE EXCEPTION 'За жал, големината % за "%" нема доволна залиха (достапно: %, побарано: %)',
        v_variant.size, v_product.name, (v_variant.stock_quantity - v_variant.reserved_quantity), v_item.quantity;
    END IF;

    -- Compute server-side price
    v_line_total := v_product.price * v_item.quantity;
    v_grand_total := v_grand_total + v_line_total;
  END LOOP;

  -- Insert reservation header (default 48 hour expiration)
  INSERT INTO reservations (
    reservation_number,
    customer_name,
    customer_phone,
    customer_email,
    status,
    total,
    expires_at
  ) VALUES (
    v_res_number,
    trim(p_customer_name),
    trim(p_customer_phone),
    CASE WHEN trim(coalesce(p_customer_email, '')) = '' THEN NULL ELSE trim(p_customer_email) END,
    'new',
    v_grand_total,
    now() + interval '48 hours'
  )
  RETURNING id INTO v_res_id;

  -- Second pass: insert items & increment reserved_quantity
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id uuid, quantity int)
  LOOP
    SELECT * INTO v_variant FROM product_variants WHERE id = v_item.variant_id;
    SELECT * INTO v_product FROM products WHERE id = v_variant.product_id;
    v_line_total := v_product.price * v_item.quantity;

    INSERT INTO reservation_items (
      reservation_id,
      product_id,
      variant_id,
      product_name,
      size,
      quantity,
      price,
      line_total
    ) VALUES (
      v_res_id,
      v_product.id,
      v_variant.id,
      v_product.name,
      v_variant.size,
      v_item.quantity,
      v_product.price,
      v_line_total
    );

    -- Atomically increase reserved quantity
    UPDATE product_variants
    SET reserved_quantity = reserved_quantity + v_item.quantity,
        updated_at = now()
    WHERE id = v_variant.id;

    -- Collect item json for response
    v_item_json := jsonb_build_object(
      'product_name', v_product.name,
      'size', v_variant.size,
      'quantity', v_item.quantity,
      'price', v_product.price,
      'line_total', v_line_total,
      'image_url', v_product.image_url
    );
    v_items_result := v_items_result || v_item_json;
  END LOOP;

  -- Return complete created reservation payload
  RETURN jsonb_build_object(
    'id', v_res_id,
    'reservation_number', v_res_number,
    'customer_name', trim(p_customer_name),
    'customer_phone', trim(p_customer_phone),
    'customer_email', trim(coalesce(p_customer_email, '')),
    'total', v_grand_total,
    'status', 'new',
    'expires_at', (now() + interval '48 hours'),
    'created_at', now(),
    'items', v_items_result
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. ATOMIC STATUS TRANSITION RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_reservation_status_atomic(
  p_reservation_id uuid,
  p_new_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_res record;
  v_item record;
BEGIN
  IF p_new_status NOT IN ('new', 'ready', 'picked_up', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid reservation status: %', p_new_status;
  END IF;

  -- Lock reservation row
  SELECT * INTO v_res
  FROM reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation % not found', p_reservation_id;
  END IF;

  -- Idempotency check: if status is already target, return immediately
  IF v_res.status = p_new_status THEN
    RETURN jsonb_build_object(
      'id', v_res.id,
      'reservation_number', v_res.reservation_number,
      'status', v_res.status,
      'updated_at', v_res.updated_at
    );
  END IF;

  -- Protect finished statuses from illegal re-transition
  IF v_res.status IN ('picked_up', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot change status of a % reservation.', v_res.status;
  END IF;

  -- Action 1: Transitioning to 'picked_up' -> deduct both physical and reserved stock
  IF p_new_status = 'picked_up' THEN
    FOR v_item IN SELECT * FROM reservation_items WHERE reservation_id = p_reservation_id
    LOOP
      IF v_item.variant_id IS NOT NULL THEN
        UPDATE product_variants
        SET stock_quantity = GREATEST(0, stock_quantity - v_item.quantity),
            reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.variant_id;
      END IF;
    END LOOP;
  END IF;

  -- Action 2: Transitioning to 'cancelled' -> release only reserved stock
  IF p_new_status = 'cancelled' THEN
    FOR v_item IN SELECT * FROM reservation_items WHERE reservation_id = p_reservation_id
    LOOP
      IF v_item.variant_id IS NOT NULL THEN
        UPDATE product_variants
        SET reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.variant_id;
      END IF;
    END LOOP;
  END IF;

  -- Update reservation status
  UPDATE reservations
  SET status = p_new_status,
      updated_at = now()
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'id', v_res.id,
    'reservation_number', v_res.reservation_number,
    'status', p_new_status,
    'updated_at', now()
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. AUTO-EXPIRATION RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cancel_expired_reservations()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_res record;
  v_item record;
  v_count int := 0;
BEGIN
  FOR v_res IN
    SELECT id, reservation_number
    FROM reservations
    WHERE status IN ('new', 'ready')
      AND expires_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Release reserved quantities
    FOR v_item IN SELECT * FROM reservation_items WHERE reservation_id = v_res.id
    LOOP
      IF v_item.variant_id IS NOT NULL THEN
        UPDATE product_variants
        SET reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.variant_id;
      END IF;
    END LOOP;

    UPDATE reservations
    SET status = 'cancelled',
        updated_at = now()
    WHERE id = v_res.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
