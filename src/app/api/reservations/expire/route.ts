import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.rpc('cancel_expired_reservations');

    if (error) {
      console.error('[Expire Reservations Error]', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cancelled_count: data,
      message: `Successfully processed expired reservations. ${data} reservations cancelled.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
