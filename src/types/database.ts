export type Category = 'jeans' | 'sweaters' | 'shirts' | 'trousers' | 'other';

export type ReservationStatus = 'new' | 'ready' | 'picked_up' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string | null;
  image_url: string;
  additional_images: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity?: number; // Computed: stock_quantity - reserved_quantity
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  reservation_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: ReservationStatus;
  total: number;
  expires_at: string;
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
  updated_at: string;
  items?: ReservationItem[];
}

export interface ReservationItem {
  id: string;
  reservation_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  line_total: number;
  created_at: string;
  image_url?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export interface CreateReservationItemInput {
  variant_id: string;
  quantity: number;
}

export interface CreateReservationRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: CreateReservationItemInput[];
}

export interface CreateReservationResponse {
  id: string;
  reservation_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  total: number;
  status: ReservationStatus;
  expires_at: string;
  created_at: string;
  items: {
    product_name: string;
    size: string;
    quantity: number;
    price: number;
    line_total: number;
    image_url?: string;
  }[];
}
