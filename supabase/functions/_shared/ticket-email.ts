import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';
import QRCode from 'npm:qrcode@1.5.4';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

function formatDate(value: string | null) {
  if (!value) return 'Date to be announced';
  return new Date(value).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  });
}

function base64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

async function createTicketPdf(booking: any, event: any, items: any[], bookingCode: string) {
  const pdf = await PDFDocument.create();
  const createdAt = new Date(booking.paid_at || booking.created_at);
  pdf.setCreationDate(createdAt);
  pdf.setModificationDate(createdAt);
  pdf.setTitle(`Hopi ticket - ${event.title || 'Event'}`);
  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const dark = rgb(0.13, 0.10, 0.09);
  const terracotta = rgb(0.69, 0.24, 0.17);
  const cream = rgb(0.96, 0.93, 0.86);
  const left = 48;
  let y = 790;

  page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: cream });
  page.drawRectangle({ x: 28, y: 28, width: 539, height: 786, borderColor: terracotta, borderWidth: 1.5 });
  page.drawText('HOPI  |  EVENT TICKET', { x: left, y, size: 14, font: bold, color: terracotta });
  y -= 44;
  page.drawText(event.title || 'Event', { x: left, y, size: 22, font: bold, color: dark, maxWidth: 490 });
  y -= 32;
  page.drawText(formatDate(event.starts_at), { x: left, y, size: 12, font: regular, color: dark });
  y -= 22;
  page.drawText([event.venue, event.city].filter(Boolean).join(' · ') || 'Venue details to be announced', {
    x: left, y, size: 12, font: regular, color: dark, maxWidth: 490,
  });
  y -= 50;
  page.drawLine({ start: { x: left, y }, end: { x: 547, y }, thickness: 1, color: terracotta });
  y -= 30;
  page.drawText(`Booking ${booking.id.slice(0, 8).toUpperCase()}`, { x: left, y, size: 13, font: bold, color: dark });
  y -= 30;

  for (const item of items) {
    page.drawText(`${item.ticket_name}  ×  ${item.quantity}`, { x: left, y, size: 12, font: bold, color: dark, maxWidth: 350 });
    page.drawText(`INR ${(Number(item.unit_price_inr) * Number(item.quantity)).toFixed(2)}`, {
      x: 405, y, size: 11, font: regular, color: dark,
    });
    y -= 24;
  }

  y -= 14;
  page.drawLine({ start: { x: left, y }, end: { x: 547, y }, thickness: 1, color: terracotta });
  y -= 30;
  page.drawText(`Total paid  INR ${Number(booking.total_amount_inr).toFixed(2)}`, {
    x: left, y, size: 13, font: bold, color: dark,
  });

  const qrDataUrl = await QRCode.toDataURL(bookingCode, { errorCorrectionLevel: 'M', margin: 1, width: 240 });
  const qrBytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), (character) => character.charCodeAt(0));
  const qr = await pdf.embedPng(qrBytes);
  page.drawImage(qr, { x: left, y: 120, width: 130, height: 130 });
  page.drawText('BOOKING REFERENCE', { x: 198, y: 214, size: 10, font: bold, color: terracotta });
  page.drawText(bookingCode, { x: 198, y: 192, size: 16, font: bold, color: dark });
  page.drawText('Keep this ticket available for event entry.', { x: 198, y: 166, size: 10, font: regular, color: dark });
  page.drawText('This email confirms your paid booking.', { x: left, y: 66, size: 9, font: regular, color: dark });

  return await pdf.save();
}

export async function sendTicketEmailIfNeeded(admin: SupabaseClient, bookingId: string) {
  const { data: booking, error } = await admin
    .from('bookings')
    .select('id,status,customer_id,total_amount_inr,created_at,paid_at,ticket_email_sent_at,events(title,starts_at,venue,city),booking_items(ticket_name,quantity,unit_price_inr)')
    .eq('id', bookingId)
    .maybeSingle();
  if (error || !booking) throw new Error('Ticket booking could not be loaded');
  if (booking.status !== 'confirmed') return false;
  if (booking.ticket_email_sent_at) return true;

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');
  if (!apiKey || !from) throw new Error('Ticket email is not configured');
  const { data: userResult, error: userError } = await admin.auth.admin.getUserById(booking.customer_id);
  const to = userResult?.user?.email;
  if (userError || !to) throw new Error('Ticket recipient email could not be loaded');

  const event = Array.isArray(booking.events) ? booking.events[0] : booking.events;
  if (!event) throw new Error('Ticket event could not be loaded');
  const items = booking.booking_items || [];
  const bookingCode = `HOPI-${booking.id.replaceAll('-', '').slice(0, 4).toUpperCase()}`;
  const pdf = await createTicketPdf(booking, event, items, bookingCode);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `ticket-email/${booking.id}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Your Hopi ticket: ${event.title}`,
      html: `<p>Your payment is confirmed.</p><p><strong>${escapeHtml(event.title)}</strong></p><p>Booking reference: <strong>${bookingCode}</strong></p><p>Your ticket PDF is attached.</p>`,
      attachments: [{ filename: `Hopi-ticket-${booking.id.slice(0, 8)}.pdf`, content: base64(pdf) }],
    }),
  });
  if (!response.ok) {
    console.error('Resend ticket email failed', response.status, await response.text());
    throw new Error('Ticket email could not be sent');
  }

  const { error: updateError } = await admin
    .from('bookings')
    .update({ ticket_email_sent_at: new Date().toISOString() })
    .eq('id', booking.id)
    .is('ticket_email_sent_at', null);
  if (updateError) throw new Error('Ticket email was sent but its delivery status could not be saved');
  return true;
}
