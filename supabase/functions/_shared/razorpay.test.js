import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

let helpers;
try {
  helpers = await import('./razorpay.js');
} catch {
  helpers = null;
}

const signature = (secret, value) =>
  createHmac('sha256', secret).update(value).digest('hex');

test('checkout signature validates order_id|payment_id', async () => {
  assert.equal(typeof helpers?.verifyCheckoutSignature, 'function');
  const value = 'order_123|pay_456';
  assert.equal(
    await helpers.verifyCheckoutSignature('secret', 'order_123', 'pay_456', signature('secret', value)),
    true,
  );
  assert.equal(
    await helpers.verifyCheckoutSignature('secret', 'order_123', 'pay_456', signature('secret', 'order_123|pay_999')),
    false,
  );
});

test('webhook signature validates the exact raw request body', async () => {
  assert.equal(typeof helpers?.verifyWebhookSignature, 'function');
  const raw = '{"event":"payment.captured","payload":{}}';
  assert.equal(
    await helpers.verifyWebhookSignature('secret', raw, signature('secret', raw)),
    true,
  );
  assert.equal(
    await helpers.verifyWebhookSignature('secret', raw, signature('secret', `${raw} `)),
    false,
  );
});
