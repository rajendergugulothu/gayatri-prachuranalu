# Production Notes

## Protected Books

The current static site can hide paid download links, but static files under `assets/` are still publicly reachable if someone knows the URL.

Before launch:

1. Upload cover images to Firebase Storage under `covers/`.
2. Upload book PDFs to Firebase Storage under `books/{bookId}/`.
3. Deploy `storage.rules`.
4. Replace local `readUrl` values in `index.html` with protected Firebase Storage download URLs or a backend reader endpoint.
5. After payment integration, tighten book download access with server-side purchase verification.

Current `storage.rules`:

- Covers are public read-only.
- Books require Firebase sign-in.
- Public writes are blocked.

## Payments

Payment gateway is intentionally set to pending:

```js
const PAYMENT_GATEWAY = 'pending';
```

When Razorpay or another provider is ready, replace the pending handler with:

1. Create order on backend.
2. Open checkout on frontend.
3. Verify payment signature on backend.
4. Store `{ uid, bookId, paymentId }`.
5. Unlock PDF download only after verified payment.

## Legal Copy

Privacy Policy, Terms of Use, FAQ, and Refund Policy are starter copy. Review them before accepting payments.

Before launch, confirm:

1. Business/legal name and contact email are correct.
2. Refund window and digital-goods terms match your actual operations.
3. Payment provider terms are reflected accurately.
4. Any copyright/licensing rights for uploaded books are documented.
5. A qualified professional reviews the final policies before money is collected.
