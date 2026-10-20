import { jsonResponse, readJson, withSupabase } from '../_shared/supabase.ts';
import { razorpayHeaders } from '../_shared/payment.ts';

Deno.serve(withSupabase({ auth: 'user' }, async (request: Request, context) => {
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed' }, 405);

  try {
    const userId = context.userClaims?.id;
    if (!userId) return jsonResponse(request, { error: 'Sign in to book tickets.' }, 401);
    const body = await readJson(request);
    if (
      typeof body?.eventId !== 'string' ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.items.length > 10 ||
      body.items.some((item: Record<string, unknown>) =>
        typeof item.ticketTypeId !== 'string' ||
        !Number.isInteger(item.quantity) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > 10
      )
    ) return jsonResponse(request, { error: 'Choose valid tickets and quantities.' }, 400);

    const admin = context.supabaseAdmin;
    const { data: booking, error: reserveError } = await admin.rpc('reserve_booking', {
      p_user_id: userId,
      p_event_id: body.eventId,
      p_items: body.items.map((item: { ticketTypeId: string; quantity: number }) => ({
        ticket_type_id: item.ticketTypeId,
        quantity: item.quantity,
      })),
    });
    if (reserveError || !booking) {
      console.warn('Booking reservation rejected', reserveError?.code);
      return jsonResponse(request, { error: reserveError?.message || 'Tickets could not be reserved.' }, 409);
    }

    const { keyId, headers } = razorpayHeaders();
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: Number(booking.amount_paise),
        currency: 'INR',
        receipt: booking.id,
        notes: { booking_id: booking.id, user_id: userId },
      }),
    });
    const order = await orderResponse.json();
    if (!orderResponse.ok || !order.id) {
      await admin.rpc('release_booking', { p_booking_id: booking.id });
      console.error('Razorpay order creation failed', orderResponse.status);
      return jsonResponse(request, { error: 'Checkout could not start. Please try again.' }, 502);
    }

    const { data: attached, error: attachError } = await admin.rpc('attach_razorpay_order', {
      p_booking_id: booking.id,
      p_order_id: order.id,
    });
    if (attachError || !attached) {
      await admin.rpc('release_booking', { p_booking_id: booking.id });
      return jsonResponse(request, { error: 'Ticket reservation expired. Please try again.' }, 409);
    }

    return jsonResponse(request, {
      bookingId: booking.id,
      orderId: order.id,
      amount: Number(booking.amount_paise),
      currency: 'INR',
      keyId,
      expiresAt: booking.expires_at,
    });
  } catch (error) {
    console.error('razorpay-create-order failed', error instanceof Error ? error.message : 'unknown error');
    return jsonResponse(request, { error: 'Checkout could not start. Please try again.' }, 500);
  }
}));
