import { Product, Category } from '@/types/database';
import { createServerSupabaseClient } from './supabase/server';
import { FALLBACK_DEMO_PRODUCTS } from './mock-data';

export { FALLBACK_DEMO_PRODUCTS };

// Helper to quickly check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !key.includes('placeholder') &&
    url.startsWith('https://')
  );
}

// Timeout helper so slow network/cold starts never freeze SSR page rendering
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 1500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs)
    ),
  ]);
}

export async function getActiveProducts(category?: Category): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    if (category) {
      return FALLBACK_DEMO_PRODUCTS.filter((p) => p.category === category);
    }
    return FALLBACK_DEMO_PRODUCTS;
  }

  try {
    const fetchOperation = async () => {
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
        return category
          ? FALLBACK_DEMO_PRODUCTS.filter((p) => p.category === category)
          : FALLBACK_DEMO_PRODUCTS;
      }
      return data as Product[];
    };

    return await withTimeout(fetchOperation(), 1500);
  } catch {
    if (category) {
      return FALLBACK_DEMO_PRODUCTS.filter((p) => p.category === category);
    }
    return FALLBACK_DEMO_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const demo = FALLBACK_DEMO_PRODUCTS.find((p) => p.id === id);
    return demo || null;
  }

  try {
    const fetchOperation = async () => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error || !data) {
        return FALLBACK_DEMO_PRODUCTS.find((p) => p.id === id) || null;
      }
      return data as Product;
    };

    return await withTimeout(fetchOperation(), 1500);
  } catch {
    const demo = FALLBACK_DEMO_PRODUCTS.find((p) => p.id === id);
    return demo || null;
  }
}
