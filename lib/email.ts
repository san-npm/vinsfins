import { Resend } from "resend";
import Stripe from "stripe";
import { enqueueFailedEmail } from "@/lib/email-queue";

// The installed @stripe/stripe-node types omit `shipping_details` on
// Checkout.Session even though the Stripe API returns it. Augment the type
// locally so we don't need an `any` cast at the call sites.
type SessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      postal_code?: string | null;
      country?: string | null;
      state?: string | null;
    } | null;
  } | null;
};

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "Vins Fins <commandes@vinsfins.lu>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@vinsfins.lu";

interface OrderItem {
  description: string;
  quantity: number;
  amount: number; // in cents
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2) + " €";
}

function esc(s: string | undefined | null): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildOrderHtml(
  session: Stripe.Checkout.Session,
  lineItems: OrderItem[],
): string {
  const isPickup = session.metadata?.deliveryMethod === "pickup";
  const shipping = (session as SessionWithShipping).shipping_details ?? null;

  const itemsHtml = lineItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px">${esc(item.description)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;font-size:14px">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px">${formatCents(item.amount * item.quantity)}</td>
        </tr>`,
    )
    .join("");

  const addressHtml = !isPickup && shipping?.address
    ? `<div style="margin-top:20px;padding:16px;background:#f9f7f4;border:1px solid #eee">
        <p style="margin:0 0 4px;font-weight:600;font-size:14px">Adresse de livraison / Delivery address</p>
        <p style="margin:0;font-size:14px;color:#555">
          ${esc(shipping.name)}<br>
          ${esc(shipping.address.line1)}<br>
          ${shipping.address.line2 ? esc(shipping.address.line2) + "<br>" : ""}
          ${esc(shipping.address.postal_code)} ${esc(shipping.address.city)}<br>
          ${esc(shipping.address.country)}
        </p>
      </div>`
    : isPickup
      ? `<div style="margin-top:20px;padding:16px;background:#f9f7f4;border:1px solid #eee">
          <p style="margin:0 0 4px;font-weight:600;font-size:14px">Click & Collect</p>
          <p style="margin:0;font-size:14px;color:#555">
            Vins Fins<br>
            18 Rue Münster, Grund<br>
            Luxembourg
          </p>
        </div>`
      : "";

  return `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#333">
      <div style="text-align:center;padding:32px 0 24px;border-bottom:2px solid #8B0000">
        <h1 style="margin:0;font-size:24px;font-weight:300;letter-spacing:2px;color:#8B0000">VINS FINS</h1>
        <p style="margin:8px 0 0;font-size:12px;color:#999;letter-spacing:1px">LUXEMBOURG · GRUND</p>
      </div>

      <div style="padding:32px 0">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:400">Merci pour votre commande !</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#666">Thank you for your order!</p>

        <p style="font-size:13px;color:#888;margin-bottom:16px">
          Commande / Order: <strong style="color:#333">${session.id.slice(-8).toUpperCase()}</strong>
        </p>

        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="border-bottom:2px solid #333">
              <th style="padding:8px 0;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px">Article</th>
              <th style="padding:8px 0;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px">Qté</th>
              <th style="padding:8px 0;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top:16px;padding-top:16px;border-top:2px solid #333;text-align:right">
          <p style="margin:0;font-size:18px;font-weight:600">
            Total: ${formatCents(session.amount_total || 0)}
          </p>
        </div>

        ${addressHtml}
      </div>

      <div style="padding:24px 0;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center">
        <p style="margin:0">Vins Fins · 18 Rue Münster · Grund · Luxembourg</p>
        <p style="margin:4px 0 0">contact@vinsfins.lu</p>
      </div>
    </div>
  `;
}

export async function sendOrderConfirmation(
  session: Stripe.Checkout.Session,
  lineItems: OrderItem[],
): Promise<void> {
  const customerEmail = session.customer_details?.email;
  if (!customerEmail) {
    console.warn("No customer email found, skipping order confirmation");
    return;
  }

  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping email. Would have sent to:", customerEmail);
    return;
  }

  const html = buildOrderHtml(session, lineItems);
  const orderRef = session.id.slice(-8).toUpperCase();
  const customerSubject = `Vins Fins — Confirmation de commande #${orderRef}`;
  const adminSubject = `Nouvelle commande #${orderRef} — ${customerEmail}`;

  await sendOrSpool({
    sessionId: session.id,
    kind: "customer",
    to: customerEmail,
    subject: customerSubject,
    html,
  });

  await sendOrSpool({
    sessionId: session.id,
    kind: "admin",
    to: ADMIN_EMAIL,
    subject: adminSubject,
    html,
  });
}

async function sendOrSpool(input: {
  sessionId: string;
  kind: "customer" | "admin";
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await enqueueFailedEmail({
      to: input.to,
      from: FROM_EMAIL,
      subject: input.subject,
      html: input.html,
      sessionId: input.sessionId,
      kind: input.kind,
      errorMessage,
    }).catch(() => {
      // Last resort: nothing more we can do here
    });
  }
}

export async function retrySendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
