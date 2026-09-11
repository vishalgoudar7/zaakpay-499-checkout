import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { createChecksum, PAYMENT_AMOUNT_PAISE } from '../../../lib/zaakpay';

export async function POST(request) {
  try {
    const { name, email, phone } = await request.json();
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || !/^\d{10}$/.test(phone || '')) {
      return NextResponse.json({ error: 'Enter a valid name, email and 10-digit phone number.' }, { status: 400 });
    }
    const requiredConfig = ['NEXT_PUBLIC_APP_URL', 'ZAAKPAY_MERCHANT_IDENTIFIER', 'ZAAKPAY_MERCHANT_SALT', 'ZAAKPAY_PAYMENT_URL'];
    const missing = requiredConfig.filter((key) => !process.env[key]);
    if (missing.length) throw new Error(`Missing configuration: ${missing.join(', ')}`);

    const orderId = `ZP${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
    await db().execute(
      'INSERT INTO payment_orders (order_id, customer_name, customer_email, customer_phone) VALUES (?, ?, ?, ?)',
      [orderId, name.trim(), email.trim().toLowerCase(), phone]
    );

    const parts = name.trim().split(/\s+/);
    const fields = {
      merchantIdentifier: process.env.ZAAKPAY_MERCHANT_IDENTIFIER,
      orderId,
      amount: PAYMENT_AMOUNT_PAISE,
      currency: 'INR',
      buyerEmail: email.trim().toLowerCase(),
      buyerFirstName: parts[0].replace(/[^a-z0-9 ]/gi, '').slice(0, 30),
      buyerLastName: (parts.slice(1).join(' ') || 'Customer').replace(/[^a-z0-9 ]/gi, '').slice(0, 30),
      buyerPhoneNumber: phone,
      productDescription: 'Test order 499',
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/payment/callback`,
      txnType: '1',
      zpPayOption: '1',
      mode: '0'
    };
    fields.checksum = createChecksum(fields);
    return NextResponse.json({ action: process.env.ZAAKPAY_PAYMENT_URL, fields });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server configuration or database error.' }, { status: 500 });
  }
}
