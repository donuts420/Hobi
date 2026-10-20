import { jsonResponse, readJson, withSupabase } from '../_shared/supabase.ts';
import { finalizeCapturedPayment } from '../_shared/payment.ts';
import { verifyCheckoutSignature } from '../_shared/razorpay.js';
import { sendTicketEmailIfNeeded } from '../_shared/ticket-email.ts';

Deno.serve(withSupabase({ auth: 'user' }, async (request: Request, context) => {
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed' }, 405);

  try {
    const userId = context.userClaims?.id;
    if (!userId) return jsonResponse(request, { error: 'Sign in to verify this payment.' }, 401);
    const body = await readJson(request);
    if (
      typeof body?.bookingId !== 'string' ||
      typeof body?.orderId !== 'string' ||
      typeof body?.paymentId !== 'string' ||
      typeof body?.signature !== 'string'
    ) return jsonResponse(request, { error: 'Payment details are incomplete.' }, 400);

    const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!secret) return jsonResponse(request, { error: 'Payment service is not configured.' }, 503);
    const signatureValid = await verifyCheckoutSignature(
      secret,
      body.orderId,
      body.paymentId,
      body.signature,
    );
    if (!signatureValid) return jsonResponse(request, { error: 'Payment signature is invalid.' }, 400);

    const admin = context.supabaseAdmin;
    const { data: booking, error } = await admin
      .from('bookings')
      .select('id,razorpay_order_id,status')
      .eq('id', body.bookingId)
      .eq('customer_id', userId)
      .maybeSingle();
    if (error || !booking || booking.razorpay_order_id !== body.orderId) {
      return jsonResponse(request, { error: 'Booking was not found.' }, 404);
    }

    const outcome = await finalizeCapturedPayment(admin, body.orderId, body.paymentId);
    let ticketEmailSent = false;
    if (outcome === 'paid') {
      try {
        ticketEmailSent = await sendTicketEmailIfNeeded(admin, booking.id);
      } catch (error) {
        console.error('Ticket email will need retry', error instanceof Error ? error.message : 'unknown error');
      }
    }
    return jsonResponse(request, { status: outcome, bookingId: booking.id, ticketEmailSent });
  } catch (error) {
    console.error('razorpay-verify-payment failed', error instanceof Error ? error.message : 'unknown error');
    return jsonResponse(request, { error: 'We could not confirm the payment yet. Check My Bookings before retrying.' }, 502);
  }
}));
