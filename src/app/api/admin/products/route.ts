import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Category } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, price, description, image_url, additional_images, variants, active } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Името на производот е задолжително.' }, { status: 400 });
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ success: false, error: 'Цената мора да биде позитивен број.' }, { status: 400 });
    }

    if (!image_url?.trim()) {
      return NextResponse.json({ success: false, error: 'Потребна е барем една слика.' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Insert product
    const { data: productData, error: productError } = await adminClient
      .from('products')
      .insert({
        name: name.trim(),
        category: (category || 'other') as Category,
        price: Number(price),
        description: description?.trim() || null,
        image_url: image_url.trim(),
        additional_images: additional_images || [],
        active: active !== false,
      })
      .select()
      .single();

    if (productError || !productData) {
      console.error('[Insert Product Error]', productError);
      return NextResponse.json({ success: false, error: productError?.message || 'Failed to create product' }, { status: 500 });
    }

    // 2. Insert variants
    if (Array.isArray(variants) && variants.length > 0) {
      const variantRows = variants.map((v: any, index: number) => ({
        product_id: productData.id,
        size: String(v.size).trim().toUpperCase(),
        stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
        reserved_quantity: 0,
        display_order: index + 1,
      }));

      const { error: variantError } = await adminClient
        .from('product_variants')
        .insert(variantRows);

      if (variantError) {
        console.error('[Insert Variants Error]', variantError);
      }
    }

    return NextResponse.json({
      success: true,
      data: productData,
    });
  } catch (err: any) {
    console.error('[Create Product Exception]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, category, price, description, image_url, additional_images, variants, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Update product
    const { data: productData, error: productError } = await adminClient
      .from('products')
      .update({
        name: name?.trim(),
        category: category as Category,
        price: Number(price),
        description: description?.trim() || null,
        image_url: image_url?.trim(),
        additional_images: additional_images || [],
        active: active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ success: false, error: productError.message }, { status: 500 });
    }

    // 2. Upsert/Update variants
    if (Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (v.id) {
          await adminClient
            .from('product_variants')
            .update({
              stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
              updated_at: new Date().toISOString(),
            })
            .eq('id', v.id);
        } else if (v.size) {
          await adminClient
            .from('product_variants')
            .insert({
              product_id: id,
              size: String(v.size).trim().toUpperCase(),
              stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
              reserved_quantity: 0,
              display_order: i + 1,
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: productData,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
