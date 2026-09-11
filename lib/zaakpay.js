import crypto from 'crypto';

export const PAYMENT_AMOUNT_PAISE = '49900';

function hmac(value) {
  const secret = process.env.ZAAKPAY_MERCHANT_SALT;
  if (!secret) throw new Error('ZAAKPAY_MERCHANT_SALT is not configured');
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function createChecksum(values) {
  const checksumString = Object.keys(values)
    .filter((key) => key !== 'checksum' && values[key] !== '' && values[key] != null)
    .sort()
    .map((key) => `${key}=${values[key]}&`)
    .join('');
  return hmac(checksumString);
}

const RESPONSE_CHECKSUM_FIELDS = [
  'amount', 'bank', 'bankid', 'cardId', 'cardScheme', 'cardToken',
  'cardhashid', 'doRedirect', 'orderId', 'paymentMethod', 'paymentMode',
  'responseCode', 'responseDescription', 'productDescription',
  'product1Description', 'product2Description', 'product3Description',
  'product4Description', 'pgTransId', 'pgTransTime'
];

export function verifyCallback(body) {
  if (!body.orderId || !body.responseCode || !body.checksum) return false;
  const checksumString = RESPONSE_CHECKSUM_FIELDS
    .filter((key) => body[key] !== '' && body[key] != null)
    .map((key) => `${key}=${body[key]}&`)
    .join('');
  const expected = hmac(checksumString);
  const received = String(body.checksum).toLowerCase();
  return received.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
