import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { verifyCallback } from '../../../../lib/zaakpay';

async function handle(request) {
  const type = request.headers.get('content-type') || '';
  const body = request.method === 'GET'
    ? Object.fromEntries(new URL(request.url).searchParams.entries())
    : type.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  if (!verifyCallback(body)) return NextResponse.redirect(new URL('/payment/failed', request.url), 303);
  const success = String(body.responseCode) === '100';
  await db().execute('UPDATE payment_orders SET status=?, zaakpay_txn_id=?, response_code=?, gateway_message=?, callback_payload=?, paid_at=IF(?="SUCCESS", NOW(), paid_at) WHERE order_id=?', [success ? 'SUCCESS' : 'FAILED', body.pgTransId || null, String(body.responseCode), body.responseDescription || null, JSON.stringify(body), success ? 'SUCCESS' : 'FAILED', body.orderId]);
  return NextResponse.redirect(new URL(success ? `/payment/success?order=${encodeURIComponent(body.orderId)}` : `/payment/failed?order=${encodeURIComponent(body.orderId)}`, request.url), 303);
}
export async function POST(request) { return handle(request); }
export async function GET(request) { return handle(request); }
