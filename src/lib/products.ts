import { Product, Category } from '@/types/database';
import { createServerSupabaseClient } from './supabase/server';
import { FALLBACK_DEMO_PRODUCTS } from './mock-data';

export { FALLBACK_DEMO_PRODUCTS };

export async function getActiveProducts(category?: Category): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Return filtered demo products as fallback
      if (category) {
        return FALLBACK_DEMO_PRODUCTS.filter((p) => p.category === category);
      }
      return FALLBACK_DEMO_PRODUCTS;
    }

    return data as Product[];
  } catch {
    if (category) {
      return FALLBACK_DEMO_PRODUCTS.filter((p) => p.category === category);
    }
    return FALLBACK_DEMO_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error || !data) {
      const demo = FALLBACK_DEMO_PRODUCTS.find((p) => p.id === id);
      return demo || null;
    }

    return data as Product;
  } catch {
    const demo = FALLBACK_DEMO_PRODUCTS.find((p) => p.id === id);
    return demo || null;
  }
}
