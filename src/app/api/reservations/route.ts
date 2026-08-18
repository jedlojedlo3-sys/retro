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
    const generatedNumber = `RB-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Calculate items & total
    let calculatedTotal = 0;
    const resolvedItems = items.map((it: any, idx: number) => {
      const matchingProduct = FALLBACK_DEMO_PRODUCTS.find((p) =>
        p.variants?.some((v) => v.id === it.variant_id) || p.id === it.product_id
      );
      const matchingVariant = matchingProduct?.variants?.find((v) => v.id === it.variant_id);
      const price = matchingProduct ? matchingProduct.price : 1490;
      const qty = it.quantity || 1;
      const lineTotal = price * qty;
      calculatedTotal += lineTotal;

      return {
        product_id: matchingProduct ? matchingProduct.id : null,
        variant_id: matchingVariant ? matchingVariant.id : null,
        product_name: matchingProduct ? matchingProduct.name : (it.product_name || 'Retro Boutique Piece'),
        size: matchingVariant ? matchingVariant.size : (it.size || 'Standard'),
        quantity: qty,
        price: price,
        line_total: lineTotal,
      };
    });

    // 2. Insert into Supabase table directly
    if (supabaseConfigured) {
      try {
        const { data: dbRes, error: dbErr } = await adminClient
          .from('reservations')
          .insert({
            reservation_number: generatedNumber,
            customer_name: customer_name.trim(),
            customer_phone: customer_phone.trim(),
            customer_email: customer_email?.trim() || null,
            status: 'new',
            total: calculatedTotal || 1490,
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (!dbErr && dbRes) {
          const resId = dbRes.id;
          // Insert items
          const itemsToInsert = resolvedItems.map((item) => ({
            reservation_id: resId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            line_total: item.line_total,
          }));

          await adminClient.from('reservation_items').insert(itemsToInsert);

          reservationResult = {
            id: resId,
            reservation_number: dbRes.reservation_number,
            customer_name: dbRes.customer_name,
            customer_phone: dbRes.customer_phone,
            customer_email: dbRes.customer_email,
            total: dbRes.total,
            status: dbRes.status,
            expires_at: dbRes.expires_at,
            created_at: dbRes.created_at,
            items: resolvedItems,
          };
        } else {
          console.warn('[Supabase direct insert fallback]:', dbErr?.message);
        }
      } catch (err) {
        console.warn('[Supabase direct insert error]:', err);
      }
    }

    // 3. In-memory / local fallback if Supabase not reachable
    if (!reservationResult) {
      const resId = `res-${Date.now()}`;
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
        items: resolvedItems.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          reservation_id: resId,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          line_total: item.line_total,
          created_at: new Date().toISOString(),
        })),
      };

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
        items: resolvedItems,
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
