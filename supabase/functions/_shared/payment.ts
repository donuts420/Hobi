import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

function razorpayHeaders() {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) throw new Error('Razorpay is not configured');
  return {
    keyId,
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      'Content-Type': 'application/json',
    },
  };
}

export async function fetchCapturedPayment(orderId: string, paymentId: string, expectedAmount: number) {
  const { headers } = razorpayHeaders();
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers });
  if (!response.ok) throw new Error('Payment could not be verified with Razorpay');
  const payment = await response.json();
  if (
    payment.order_id !== orderId ||
    payment.amount !== expectedAmount ||
    payment.currency !== 'INR' ||
    payment.status !== 'captured' ||
    payment.captured !== true
  ) throw new Error('Payment is not captured for this booking');
  return payment;
}

async function refundLatePayment(admin: SupabaseClient, orderId: string, paymentId: string, booking: { id: string; total_amount_inr: number | string }) {
  const { headers } = razorpayHeaders();
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      amount: Math.round(Number(booking.total_amount_inr) * 100),
      notes: { booking_id: booking.id, reason: 'ticket_reservation_expired' },
    }),
  });
  if (!response.ok) {
    console.error('Razorpay late-payment refund request failed', response.status);
    return 'refund_needs_review';
  }
  const refund = await response.json();
  const { error } = await admin.rpc('record_late_payment_refund', {
    p_order_id: orderId,
    p_payment_id: paymentId,
    p_refund_id: refund.id,
  });
  if (error) {
    console.error('Could not record Razorpay refund', error.code);
    return 'refund_needs_review';
  }
  return 'refund_initiated';
}

export async function finalizeCapturedPayment(admin: SupabaseClient, orderId: string, paymentId: string) {
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select('id,total_amount_inr,status')
    .eq('razorpay_order_id', orderId)
    .maybeSingle();
  if (bookingError || !booking) throw new Error('Booking was not found for this payment');

  const expectedAmountPaise = Math.round(Number(booking.total_amount_inr) * 100);
  await fetchCapturedPayment(orderId, paymentId, expectedAmountPaise);
  const { data: outcome, error } = await admin.rpc('finalize_razorpay_payment', {
    p_order_id: orderId,
    p_payment_id: paymentId,
  });
  if (error) throw new Error('Could not save payment confirmation');

  if (outcome === 'late_payment_refund') {
    return await refundLatePayment(admin, orderId, paymentId, booking);
  }
  if (outcome === 'paid') return 'paid';
  if (outcome === 'refund_processing' || outcome === 'refunded') return 'refund_in_progress';
  throw new Error(outcome === 'conflict' ? 'Payment conflicts with this booking' : 'Payment could not be applied to this booking');
}

export { razorpayHeaders };
