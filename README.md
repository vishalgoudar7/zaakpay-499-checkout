# Zaakpay ₹499 Next.js test checkout

This project collects a customer's name, email, and mobile number, creates an
order in MySQL, and posts it to Zaakpay's V13 hosted checkout. It is configured
for Zaakpay's staging environment and uses the public sandbox credentials.

## Run a test payment

1. Create the database: `mysql -u root -p < sql/schema.sql`
2. Copy `.env.example` to `.env.local` and update `DATABASE_URL`.
3. Set `NEXT_PUBLIC_APP_URL` to a public HTTPS tunnel URL. Zaakpay cannot
   return a payment result to `localhost`.
4. Run `npm install`, then `npm run dev`.
5. Open the app, enter test customer details, and pay through the sandbox.
   Zaakpay's current sandbox instructions say to use password `1234` to
   complete a successful test transaction.

The payment amount sent to Zaakpay is `49900` paise (₹499). Request and
callback checksums use HMAC-SHA256 with the configured merchant secret.

## Before production

- Replace the public sandbox merchant identifier and secret with your live
  merchant credentials.
- Change `ZAAKPAY_PAYMENT_URL` to
  `https://api.zaakpay.com/api/paymentTransact/V13`.
- Register the website and callback URL in the Zaakpay dashboard.
