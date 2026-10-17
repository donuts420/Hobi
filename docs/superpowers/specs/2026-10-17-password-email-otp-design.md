# Password + Email OTP Authentication Design

## Goal

Replace the demo authentication flow with Supabase-backed registration and login. Login requires both the user's password and a six-digit email code. Supabase issues and validates the JWT session; the application does not create its own JWT.

## Current state

- `AuthModal.jsx` has a demo OTP step that accepts the hardcoded code `123456` and constructs a fake user/token.
- `App.jsx` keeps the signed-in user only in React state and clears it locally on sign-out.
- The Supabase JavaScript client and Vite environment variables are already present.
- The working tree contains unrelated local edits; implementation must preserve them.

## User flows

### Registration

1. The client calls Supabase Auth `signUp` with email, password, and `full_name` metadata.
2. Supabase sends its default confirmation email with a link; no template edit or custom SMTP is needed for the development flow.
3. The user opens the link and returns to the app through the configured Supabase Site URL and redirect allow list.
4. Supabase restores the confirmed user's session in the app.

### Login

1. The client sends email and password to a public Supabase Edge Function over HTTPS.
2. The function validates the credentials against Supabase Auth, discards the returned session, and does not return a JWT at this stage.
3. The function generates a cryptographically random six-digit code, stores only a keyed digest in a private challenge table, and sends the code using Resend.
4. The user enters the code. The function validates the password again, validates and atomically consumes the unexpired code, then returns the Supabase session.
5. The client passes that session to `supabase.auth.setSession`. A wrong or expired code never produces a usable client session.

## Security requirements

- Keep the service-role key, Resend key, and OTP digest key in Supabase Edge Function secrets. Never expose them to the Vite client or commit them.
- Store challenges in a table with RLS enabled and no client policies. Only server-side function code may access it.
- Expire codes after five minutes, allow at most five verification attempts, and throttle resends per email. Make code consumption atomic and single-use.
- Return generic request-step responses so invalid credentials do not reveal whether an account exists.
- Do not log passwords, OTPs, access tokens, or refresh tokens.
- Validate request shape and code format at the Edge Function boundary; enforce CORS and rate limits.
- The login function is public because users are not authenticated yet. Disable gateway JWT verification only for this endpoint; keep the service-role key server-side and perform all credential checks inside the function.

## Session handling

- On application startup, restore the current Supabase session and map the Supabase user to the existing navbar shape (`id`, `email`, `name`).
- Subscribe to Supabase auth state changes so the UI follows login, refresh, and expiration.
- Sign-out must call `supabase.auth.signOut()` before clearing the UI state.

## Scope and files

- Update `src/components/common/AuthModal.jsx` to use Supabase registration confirmation and the two-step password-plus-email-code login; remove the demo code and fake token.
- Update `src/App.jsx` to restore auth state and perform real sign-out.
- Add a Supabase Edge Function for requesting and verifying login codes, a private challenge-table migration, and only the minimal Supabase project configuration needed to deploy it.
- Add deployment notes for the Resend API key, test sender or verified sender, Supabase secrets, migration, function, and Site URL / redirect allow list.

## Out of scope

- Password reset behavior, event booking persistence, and any custom JWT issuer.
- Authenticator-app or phone MFA.
- Changing existing unrelated local edits.

## Acceptance criteria

- The demo code `123456` and generated fake JWT are removed.
- A valid password alone never yields a session in the browser; a valid password plus a fresh email code does.
- Invalid, expired, over-attempted, and replayed codes do not yield a session.
- Registration confirmation yields a Supabase session only after the default confirmation link is verified.
- Reload restores a valid session, and sign-out ends the Supabase session.
- Resend and database service secrets are absent from browser-visible code and tracked files.
