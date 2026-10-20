import { jsonResponse, withSupabase } from '../_shared/supabase.ts';
import { finalizeCapturedPayment } from '../_shared/payment.ts';
import { verifyWebhookSignature } from '../_shared/razorpay.js';

Deno.serve(withSupabase({ auth: 'none' }, async (request: Request, context) => {
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed' }, 405);
  try {
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    const signature = request.headers.get('X-Razorpay-Signature');
    if (!secret || !signature) return jsonResponse(request, { error: 'Webhook is not configured.' }, 503);

    const rawBody = await request.text();
    if (rawBody.length > 1_000_000) return jsonResponse(request, { error: 'Request is too large.' }, 413);
    if (!await verifyWebhookSignature(secret, rawBody, signature)) {
      return jsonResponse(request, { error: 'Invalid webhook signature.' }, 400);
    }

    const event = JSON.parse(rawBody);
    if (event?.event === 'refund.processed') {
      const refund = event?.payload?.refund?.entity;
      const bookingId = refund?.notes?.booking_id;
      if (typeof refund?.id === 'string' && typeof refund?.payment_id === 'string' && typeof bookingId === 'string') {
        const admin = context.supabaseAdmin;
        const { error } = await admin
          .from('bookings')
          .update({ status: 'refunded', razorpay_refund_id: refund.id, updated_at: new Date().toISOString() })
          .eq('id', bookingId)
          .eq('razorpay_payment_id', refund.payment_id)
          .eq('status', 'refund_processing');
        if (error) throw new Error('Could not save refund confirmation');
      }
      return jsonResponse(request, { received: true });
    }
    if (event?.event !== 'payment.captured') return jsonResponse(request, { received: true });

    const payment = event?.payload?.payment?.entity;
    if (typeof payment?.order_id !== 'string' || typeof payment?.id !== 'string') {
      return jsonResponse(request, { error: 'Captured payment data is incomplete.' }, 400);
    }

    const outcome = await finalizeCapturedPayment(context.supabaseAdmin, payment.order_id, payment.id);
    if (outcome === 'refund_needs_review') {
      console.error('Late captured payment refund needs review', payment.order_id);
    }
    return jsonResponse(request, { received: true, status: outcome });
  } catch (error) {
    console.error('razorpay-webhook failed', error instanceof Error ? error.message : 'unknown error');
    return jsonResponse(request, { error: 'Webhook processing failed.' }, 500);
  }
}));
