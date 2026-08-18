import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Upload to Supabase Storage 'product-images' bucket
    const { data, error } = await adminClient.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('[Storage upload warning]', error.message);
      // Fallback: If bucket does not exist or Supabase storage is not configured yet,
      // return a data URL so development / offline testing still works smoothly
      const base64Data = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64Data,
        note: 'Fallback base64 storage used',
      });
    }

    const { data: publicUrlData } = adminClient.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error('[Upload Exception]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
