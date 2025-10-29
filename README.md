# GIA Agency — Full Project (Tailwind integrated)

This is a ready-to-deploy Next.js project with TailwindCSS and Stripe Checkout (test mode).

## Quick start
1. Copy the files to your GitHub repo `gia-agency`.
2. Add env vars in Vercel (or .env.local for local dev):

```
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
STRIPE_WEBHOOK_SECRET=whsec_xxx  # optional for webhook verification
```

3. Deploy on Vercel (Framework: Next.js). Leave Output Directory empty.
4. Use card 4242 4242 4242 4242 for test payments.

---
