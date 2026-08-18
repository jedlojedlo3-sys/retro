import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateClientReservationStatus } from '@/lib/reservations-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservation_id, new_status } = body;

    if (!reservation_id || !new_status) {
      return NextResponse.json({ success: false, error: 'Missing reservation_id or new_status' }, { status: 400 });
    }

    if (!['new', 'ready', 'picked_up', 'cancelled'].includes(new_status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    let rpcSucceeded = false;

    try {
      // Call atomic status stored procedure in Supabase if exists
      const { data, error } = await adminClient.rpc('update_reservation_status_atomic', {
        p_reservation_id: reservation_id,
        p_new_status: new_status,
      });

      if (!error) {
        rpcSucceeded = true;
      }
    } catch (e) {
      // ignore
    }

    // Always update in-memory/local store as well
    updateClientReservationStatus(reservation_id, new_status);

    return NextResponse.json({
      success: true,
      rpcSucceeded,
    });
  } catch (err: any) {
    console.error('[Update Status Exception]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
