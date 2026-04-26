# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (uses `eslint-config-next`, flat config in `eslint.config.mjs`)

There is no test runner configured.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 · shadcn/ui (style `base-nova`) · Supabase (auth + Postgres + Storage) · Stripe Payment Intents · Resend · Zustand · Zod + react-hook-form.

Path alias: `@/*` → `src/*`. shadcn aliases live in [components.json](components.json).

UI copy, error messages, and inline comments are in **Spanish** — keep new code consistent.

## Architecture

### Route groups

`src/app` is split into three Next.js route groups, each with its own layout:

- **`(store)`** — public storefront wrapped by [src/app/(store)/layout.tsx](src/app/(store)/layout.tsx) (top `Navbar`). Pages: `/` (home/products), `/products/[id]`, `/cart`, `/checkout`, `/orders`, `/orders/[id]`.
- **`(admin)`** — [src/app/(admin)/layout.tsx](src/app/(admin)/layout.tsx) does its own server-side auth + role check (redirects non-admins) and renders `AdminSidebar`. Pages live under `/admin/*`.
- **`(auth)`** — login, register, forgot-password, reset-password.

### Auth & route protection (two layers)

1. Edge middleware in [src/proxy.ts](src/proxy.ts) (note: the file is `proxy.ts` and exports `proxy`, not the conventional `middleware.ts`) refreshes the Supabase session on every request, sets security headers, and gates `/checkout`, `/orders`, `/admin/*`. For `/admin/*` it additionally fetches `profiles.role` from the DB.
2. Server components (e.g. the admin layout) and API routes re-check the session and role server-side. **Never trust the middleware alone** — every protected page/route must call `createClient()` from [src/lib/supabase/server.ts](src/lib/supabase/server.ts) and verify.

Two Supabase clients exist and are not interchangeable:
- [src/lib/supabase/server.ts](src/lib/supabase/server.ts) — `createServerClient` bound to Next `cookies()`. Use in RSCs, Route Handlers, server actions.
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts) — `createBrowserClient`. Use in `'use client'` components.

`useUser` ([src/hooks/useUser.ts](src/hooks/useUser.ts)) is the client-side accessor; it loads session, fetches the `profiles` row, and exposes `isAdmin`.

### Cart (client-only)

[src/hooks/useCart.ts](src/hooks/useCart.ts) is a Zustand store persisted to `localStorage` under key `cart-storage`. Because of SSR, gate any UI that depends on cart contents (e.g. badge counts) on the `_hasHydrated` flag — see the navbar for the pattern. The cart is never written to the DB; it only becomes server state when checkout creates an `orders` row.

### Checkout / payment flow

End-to-end path, important to keep in sync if you touch any of it:

1. Client posts cart items to [src/app/api/checkout/route.ts](src/app/api/checkout/route.ts).
2. Server **re-reads price and stock from the `products` table** and overwrites `item.price` — client-supplied prices are ignored. The total is recomputed from DB prices. Preserve this when editing; it is the only thing preventing trivial price tampering.
3. Server inserts an `orders` row (`status: 'pending'`) + `order_items`, then creates a Stripe `PaymentIntent` with `metadata: { order_id, user_id }`. Returns `clientSecret` + `orderId`.
4. Client confirms with Stripe Elements ([src/app/(store)/checkout/page.tsx](src/app/(store)/checkout/page.tsx)).
5. Stripe calls [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts), which verifies the signature with `STRIPE_WEBHOOK_SECRET`, looks up `metadata.order_id`, sets status to `paid` (or `cancelled` on failure), and triggers a Resend confirmation email via [src/lib/resend/emails.ts](src/lib/resend/emails.ts).

Notes:
- Stripe currency is hardcoded to `usd` in the checkout route while UI prices are formatted as COP — this is intentional for test mode; revisit before going live.
- The webhook uses `supabase.auth.admin.getUserById`, which requires the service-role key — confirm the server client picks up `SUPABASE_SECRET_KEY` if you change auth wiring.

### Database shape

Types in [src/types/index.ts](src/types/index.ts) mirror the Supabase schema: `profiles` (with `role: 'customer' | 'admin'`), `categories`, `products` (`images: string[]`, `active: boolean`, `stock`), `orders` (`status: 'pending' | 'paid' | 'cancelled'`, `stripe_pi_id`), `order_items`. Product images are served from Supabase Storage; [next.config.ts](next.config.ts) only whitelists `*.supabase.co/storage/v1/object/public/**` for `next/image`.

### Validation

All form/API input goes through Zod schemas in [src/lib/validations/](src/lib/validations/) (`auth.ts`, `product.ts`). API routes use `schema.safeParse` and return flattened errors.

## Environment

Required vars (see [.env.example](.env.example)):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` (used in confirmation emails)
- `RESEND_API_KEY`

The Stripe and Resend clients ([src/lib/stripe/client.ts](src/lib/stripe/client.ts), [src/lib/resend/client.ts](src/lib/resend/client.ts)) throw at import time if their keys are missing.
