'use client';
import { useState } from 'react';
export default function CheckoutForm() {
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('');
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await r.json();
    if (!r.ok) { setError(data.error || 'Unable to start payment'); setLoading(false); return; }
    const f = document.createElement('form'); f.method = 'POST'; f.action = data.action;
    Object.entries(data.fields).forEach(([key, value]) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = key; i.value = value; f.appendChild(i); });
    document.body.appendChild(f); f.submit();
  }
  return <form onSubmit={submit}><label>Full name<input name="name" required minLength="2" placeholder="Your full name" /></label><label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label><label>Phone number<input name="phone" required inputMode="numeric" pattern="[0-9]{10}" placeholder="10-digit mobile number" /></label>{error && <p className="error">{error}</p>}<button disabled={loading}>{loading ? 'Redirecting…' : 'Pay ₹499 securely'}</button><p className="note">You will be redirected to Zaakpay to complete payment.</p></form>;
}
