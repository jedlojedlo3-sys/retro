import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReservationNotification } from '@/lib/resend';
import { CreateReservationResponse, Reservation, ReservationItem } from '@/types/database';
import { addInMemoryReservation } from '@/lib/reservations-store';
import { FALLBACK_DEMO_PRODUCTS } from '@/lib/mock-data';

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

    let reservationResult: CreateReservationResponse | null = null;

    if (supabaseConfigured) {
      try {
        // Try calling atomic stored procedure in Supabase
        const { data: rpcData, error: rpcError } = await adminClient.rpc('create_reservation_atomic', {
          p_customer_name: customer_name.trim(),
          p_customer_phone: customer_phone.trim(),
          p_customer_email: customer_email?.trim() || null,
          p_items: items,
        });

        if (!rpcError && rpcData) {
          reservationResult = rpcData as CreateReservationResponse;
        } else {
          console.warn('[Supabase RPC not found or errored, falling back to direct/memory storage]:', rpcError?.message);
        }
      } catch (err) {
        console.warn('[Supabase RPC exception, using fallback storage]:', err);
      }
    }

    // Fallback if Supabase tables/RPC not created yet
    if (!reservationResult) {
      const generatedNumber = `RB-${Math.floor(1000 + Math.random() * 9000)}`;
      const resId = `res-${Date.now()}`;
      
      // Calculate total and extract details from items
      let calculatedTotal = 0;
      const reservationItems: ReservationItem[] = items.map((it: any, idx: number) => {
        const matchingProduct = FALLBACK_DEMO_PRODUCTS.find((p) =>
          p.variants?.some((v) => v.id === it.variant_id)
        );
        const matchingVariant = matchingProduct?.variants?.find((v) => v.id === it.variant_id);
        const price = matchingProduct ? matchingProduct.price : 1490;
        const qty = it.quantity || 1;
        const lineTotal = price * qty;
        calculatedTotal += lineTotal;

        return {
          id: `item-${Date.now()}-${idx}`,
          reservation_id: resId,
          product_id: matchingProduct ? matchingProduct.id : null,
          variant_id: matchingVariant ? matchingVariant.id : null,
          product_name: matchingProduct ? matchingProduct.name : 'Retro Boutique Piece',
          size: matchingVariant ? matchingVariant.size : 'Standard',
          quantity: qty,
          price: price,
          line_total: lineTotal,
          created_at: new Date().toISOString(),
        };
      });

      const fallbackReservation: Reservation = {
        id: resId,
        reservation_number: generatedNumber,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_email: customer_email?.trim() || null,
        total: calculatedTotal || 1490,
        status: 'new',
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        email_sent: false,
        email_error: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: reservationItems,
      };

      // Store in memory store so admin /api/admin/reservations sees it immediately!
      addInMemoryReservation(fallbackReservation);

      reservationResult = {
        id: fallbackReservation.id,
        reservation_number: fallbackReservation.reservation_number,
        customer_name: fallbackReservation.customer_name,
        customer_phone: fallbackReservation.customer_phone,
        customer_email: fallbackReservation.customer_email,
        total: fallbackReservation.total,
        status: fallbackReservation.status,
        expires_at: fallbackReservation.expires_at,
        created_at: fallbackReservation.created_at,
        items: (fallbackReservation.items || []).map((i) => ({
          product_name: i.product_name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
          line_total: i.line_total,
        })),
      };
    }

    // Send asynchronous Resend email notification if configured
    sendReservationNotification(reservationResult).catch((err) => {
      console.warn('Email notification skipped:', err);
    });

    return NextResponse.json({
      success: true,
      data: reservationResult,
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
