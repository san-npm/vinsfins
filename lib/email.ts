import { Resend } from "resend";
import Stripe from "stripe";
import { enqueueFailedEmail } from "@/lib/email-queue";

/**
 * Stripe moved the collected shipping address to `collected_information` in the
 * 2025-03-31.basil API version, and this site pins a later one.
 */
function shippingOf(session: Stripe.Checkout.Session) {
  return session.collected_information?.shipping_details ?? null;
}

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

export function esc(s: string | undefined | null): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildOrderHtml(
  session: Stripe.Checkout.Session,
  lineItems: OrderItem[],
): string {
  const isPickup = session.metadata?.deliveryMethod === "pickup";
  const shipping = shippingOf(session);

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
    // The Resend SDK RESOLVES on failure with { data: null, error } and only
    // throws on a programming error, so the error field is the real signal.
    // Relying on the catch alone silently dropped every rejected send: a 429,
    // a suppressed recipient or an invalid key looked like success and never
    // reached the retry queue.
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    if (error) throw new Error(`${error.name}: ${error.message}`);
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
    }).catch((spoolErr) => {
      // KV is the thing that is down. Log it: this is the last place the
      // failure is visible at all.
      console.error(
        `[email] spool failed for ${input.sessionId}:${input.kind}: ${errorMessage}`,
        spoolErr instanceof Error ? spoolErr.message : spoolErr,
      );
    });
  }
}

/**
 * Tell the customer their parcel is on its way.
 *
 * Sent by the DPD sync job once DPD issues a parcel number, which only happens
 * after the shop confirms the shipment in Web Parcel. Returns false when the
 * send fails so the caller can leave the order queued and try again.
 */
export async function sendTrackingEmail(input: {
  to: string;
  orderRef: string;
  trackingLinks: { code: string; url: string }[];
}): Promise<boolean> {
  const parcels = input.trackingLinks
    .map(
      (t) =>
        `<li style="margin-bottom:6px"><a href="${esc(t.url)}" style="color:#8B0000">${esc(t.code)}</a></li>`,
    )
    .join("");

  const plural = input.trackingLinks.length > 1;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#333">
      <div style="text-align:center;padding:32px 0 24px;border-bottom:2px solid #8B0000">
        <h1 style="margin:0;font-size:24px;font-weight:300;letter-spacing:2px;color:#8B0000">VINS FINS</h1>
        <p style="margin:8px 0 0;font-size:12px;color:#999;letter-spacing:1px">LUXEMBOURG · GRUND</p>
      </div>
      <div style="padding:32px 0">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:400">
          ${plural ? "Vos colis sont en route" : "Votre colis est en route"}
        </h2>
        <p style="margin:0 0 24px;font-size:14px;color:#666">
          ${plural ? "Your parcels are on their way" : "Your parcel is on its way"}
        </p>
        <p style="font-size:13px;color:#888">
          Commande / Order: <strong style="color:#333">${esc(input.orderRef)}</strong>
        </p>
        <p style="font-size:14px">Suivi DPD / DPD tracking:</p>
        <ul style="font-size:14px;padding-left:20px">${parcels}</ul>
      </div>
      <div style="padding:24px 0;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center">
        <p style="margin:0">Vins Fins · 18 Rue Münster · Grund · Luxembourg</p>
        <p style="margin:4px 0 0">contact@vinsfins.lu</p>
      </div>
    </div>
  `;

  const result = await retrySendEmail({
    to: input.to,
    subject: `Vins Fins — Votre commande #${input.orderRef} est expédiée`,
    html,
  });
  return result.ok;
}

export async function retrySendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    // Resend reports failures in the resolved value, not by throwing.
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    if (error) return { ok: false, error: `${error.name}: ${error.message}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
