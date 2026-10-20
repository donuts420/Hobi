alter table public.bookings
  add column if not exists ticket_email_sent_at timestamptz;
