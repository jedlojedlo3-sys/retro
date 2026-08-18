import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getInMemoryReservations, addInMemoryReservation } from '@/lib/reservations-store';
import { Reservation } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('reservations')
      .select('*, items:reservation_items(*)')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({
        success: true,
        data: data as Reservation[],
        source: 'supabase',
      });
    }

    // Fallback to in-memory / local reservations
    const memoryData = getInMemoryReservations();
    return NextResponse.json({
      success: true,
      data: memoryData,
      source: 'memory',
    });
  } catch (err: any) {
    const memoryData = getInMemoryReservations();
    return NextResponse.json({
      success: true,
      data: memoryData,
      source: 'memory',
      fallbackError: err.message,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body && body.reservation) {
      addInMemoryReservation(body.reservation);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Missing reservation data' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
