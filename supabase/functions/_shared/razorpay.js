const encoder = new TextEncoder();

export async function hmacSha256Hex(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(value)),
  );
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeEqualHex(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) {
    difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return difference === 0;
}

export async function verifyCheckoutSignature(secret, orderId, paymentId, signature) {
  return safeEqualHex(
    await hmacSha256Hex(secret, `${orderId}|${paymentId}`),
    signature,
  );
}

export async function verifyWebhookSignature(secret, rawBody, signature) {
  return safeEqualHex(await hmacSha256Hex(secret, rawBody), signature);
}
