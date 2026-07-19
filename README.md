# Gadget Store

Full-stack e-commerce platform: storefront + admin dashboard.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- NextAuth (email/password + Google)
- Paystack (NGN) + Stripe (international) for payments
- Resend for transactional email

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, auth secrets, payment keys
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

## What's scaffolded so far
- `prisma/schema.prisma` — full data model: users, products, variants,
  categories, brands, orders, payments (dual provider), coupons, reviews,
  wishlists, addresses
- `src/app/layout.tsx` — fonts, SEO metadata defaults
- `src/app/page.tsx` — homepage hero + featured products
- `src/components/ProductCard.tsx` — product card with the site's visual
  signature (monospace "readout" pricing/specs, scanline hover)
- `tailwind.config.ts` — design tokens (see below)
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/format.ts` — currency formatting (NGN/USD)

## Design system
- Background: `ink` (#0B0F14), card surface: `panel` (#161E27)
- Text: `titanium` (primary), `silver` (secondary)
- Accent: `signal` (#39D9C7) — used sparingly for CTAs, prices, active states
- Type: Space Grotesk (display), Inter (body), JetBrains Mono (prices/specs)
- Signature: prices and specs render in monospace like a device's own
  diagnostic readout; product cards get a subtle scanline sweep on hover

## Built so far (beyond the initial scaffold)
- Auth: NextAuth with Credentials (bcrypt) + Google, Prisma adapter,
  role (`CUSTOMER`/`ADMIN`) attached to session via JWT callbacks
  (`src/lib/auth.ts`, `src/app/api/auth/`)
- Middleware (`src/middleware.ts`) gating `/admin/*` to ADMIN role and
  requiring login for `/account` and `/checkout`
- Login and register pages (`src/app/login`, `src/app/register`)
- Product catalog (`src/app/products/page.tsx`): server-rendered,
  filters by category/brand/condition/price range via URL search params
  (`src/components/ProductFilters.tsx`), text search, sort, pagination
- Seed script (`prisma/seed.ts`): only real-photo products — 5 Apple
  (incl. iMac 27" under a new Desktops category), 3 Infinix, 4 Tecno,
  3 Samsung, 4 Nokia (3210, 105, 3310, Lumia 630) — 19 products across
  5 categories (Phones, Laptops, Tablets, Audio, Desktops) and 5
  brands. **This script fully resets the catalog** (deletes all
  products/brands/categories and anything that references them —
  orders, reviews, etc.) before reseeding. Run with `npx prisma db seed`
- `public/placeholder/*.svg`: original line-art device illustrations
  (phone, laptop, tablet, tablet, earbuds, watch, etc.) used as product
  images in the seed data. These are placeholders, not real product
  photos — swap in real photography via the admin product form (or
  Cloudinary once wired up) before this goes live for the client. Real
  manufacturer photos of Apple/Samsung/etc. products are copyrighted,
  so don't pull those in directly — use the client's own product
  photography instead.
- Product detail page (`src/app/products/[slug]/page.tsx`): image
  gallery, variant selector (`ProductVariantSelector.tsx`) that handles
  attribute combinations (storage × color, etc.), reviews section,
  JSON-LD structured data for SEO
- Cart store (`src/lib/cart-store.ts`): Zustand + localStorage
  persistence, wired into the variant selector's "Add to cart"

- Cart page (`src/app/cart/page.tsx`): view/edit quantities, remove items
- Checkout flow: address form (`src/app/api/addresses`), order creation
  with server-side re-pricing and stock validation (`src/app/api/orders`),
  dual payment routing — Paystack redirect flow or Stripe Elements card
  form (`src/components/StripeCheckoutForm.tsx`)
- Payment webhooks (`src/app/api/webhooks/paystack`,
  `/stripe`): verify signatures, mark payment/order as PAID, decrement
  variant stock — this is the source of truth for order status, not the
  client redirect
- Order confirmation page (`src/app/orders/[id]/confirm`): shows order
  status, clears the cart once payment is confirmed
- Admin dashboard (`src/app/admin/*`), gated to `ADMIN` role by both
  middleware and a server-side check in `admin/layout.tsx`:
  - **Overview** — revenue (paid orders), order/customer counts, recent
    orders, low-stock alert list
  - **Products** — list, create, edit (basic fields + a variant editor
    that takes `key=value,key=value` attribute pairs per row)
  - **Orders** — list with an inline status dropdown
    (`OrderStatusSelect.tsx`) that PATCHes `/api/admin/orders/[id]`
  - **Customers** — list with order count and lifetime spend
  - **Promotions** — coupon list + inline create form (percent-off to
    start; amount-off and expiry are in the schema/API, just not in the
    form UI yet)
  - All admin mutations go through `/api/admin/*` routes, each guarded
    by `requireAdmin()` (`src/lib/require-admin.ts`) independent of the
    middleware, so the API isn't relying on the UI having gated access

## Still to build
1. Account area: order history, saved addresses (`/account/orders`,
   linked from the confirmation page, doesn't exist yet)
2. Order tracking page (separate from the confirmation page — for
   checking status after the fact via order number)
3. Email notifications (Resend) — order confirmation, shipping updates
4. Product image upload (currently takes image URLs — wire up
   Cloudinary/S3 upload in the admin product form)
5. Analytics — overview page has the basics; charts (Recharts) for
   revenue-over-time, top products, etc. aren't built yet
6. Sitemap, robots.txt
7. `NEXTAUTH_SECRET`, Paystack/Stripe keys, `STRIPE_WEBHOOK_SECRET` —
   generate/obtain and drop into `.env`
8. To get your first admin user: sign up normally, then update that
   user's `role` to `ADMIN` directly in the database (`npx prisma
   studio` is the easiest way) — there's no self-serve admin signup by
   design

## Payment flow notes
- **Paystack**: `/api/orders` initializes the transaction and returns an
  `authorization_url`; the browser redirects there, Paystack redirects
  back to `/orders/[id]/confirm`, and the *webhook* (not the redirect)
  is what actually marks the order PAID and decrements stock. Point
  Paystack's webhook URL at `/api/webhooks/paystack` in the dashboard.
- **Stripe**: `/api/orders` creates a PaymentIntent and returns a
  `clientSecret`; the checkout page mounts Stripe Elements with it.
  Point Stripe's webhook URL at `/api/webhooks/stripe` and set
  `STRIPE_WEBHOOK_SECRET` from the CLI (`stripe listen --forward-to
  localhost:3000/api/webhooks/stripe` while developing locally).
- Prices are always re-fetched from the DB when the order is created —
  never trust cart totals sent from the browser.
