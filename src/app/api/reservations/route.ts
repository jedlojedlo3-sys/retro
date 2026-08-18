import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReservationNotification } from '@/lib/resend';
import { CreateReservationResponse } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, customer_email, items } = body;

    // Validate inputs
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Името и презимето се задолжителни.' },
        { status: 400 }
      );
    }

    if (!customer_phone || typeof customer_phone !== 'string' || !customer_phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Телефонскиот број е задолжителен.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Резервацијата мора да содржи барем еден производ.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check if Supabase URL is set
    const supabaseConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (!supabaseConfigured) {
      // Demo / Offline Simulation Mode
      const simulatedNumber = `RB-${Math.floor(1000 + Math.random() * 9000)}`;
      const simulatedResponse: CreateReservationResponse = {
        id: 'demo-res-id',
        reservation_number: simulatedNumber,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_email: customer_email?.trim() || null,
        total: 1890,
        status: 'new',
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        items: [
          {
            product_name: 'Retro Denim Piece',
            size: '32',
            quantity: 1,
            price: 1890,
            line_total: 1890,
          },
        ],
      };

      // Try sending email in simulation mode if Resend configured
      await sendReservationNotification(simulatedResponse);

      return NextResponse.json({
        success: true,
        data: simulatedResponse,
      });
    }

    // Call atomic stored procedure
    const { data: rpcData, error: rpcError } = await adminClient.rpc('create_reservation_atomic', {
      p_customer_name: customer_name.trim(),
      p_customer_phone: customer_phone.trim(),
      p_customer_email: customer_email?.trim() || null,
      p_items: items,
    });

    if (rpcError) {
      console.error('[Create Reservation RPC Error]', rpcError);
      return NextResponse.json(
        {
          success: false,
          error: rpcError.message || 'Грешка при креирање на резервацијата. Проверете ја достапноста.',
        },
        { status: 400 }
      );
    }

    const reservation = rpcData as CreateReservationResponse;

    // Send asynchronous Resend email notification
    sendReservationNotification(reservation).then(async (emailResult) => {
      if (emailResult.success) {
        await adminClient
          .from('reservations')
          .update({ email_sent: true })
          .eq('id', reservation.id);
      } else {
        await adminClient
          .from('reservations')
          .update({ email_error: emailResult.error || 'Failed to send email' })
          .eq('id', reservation.id);
      }
    });

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (err: any) {
    console.error('[Create Reservation Exception]', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Се појави неочекувана грешка на серверот.',
      },
      { status: 500 }
    );
  }
}
