/**
 * Interim feature flags — Vins Fins runs in "catalogue" mode while the real
 * retail prices and product photography are being prepared.
 *
 * Online sales are OFF and wine photos are HIDDEN. The underlying data,
 * cart, checkout, Stripe, stock and structured-data code are all left intact
 * — they are simply not rendered while the flags are false.
 *
 * To bring the online SHOP back:
 *   1. Set the real selling prices (priceShop) for every wine.
 *   2. Flip SHOP_ENABLED to true → restores prices, add-to-cart, cart, checkout.
 *
 * To bring WINE PHOTOS back:
 *   1. Replace the placeholder bottle images with real photography.
 *   2. Flip WINE_IMAGES_ENABLED to true → restores wine images + image SEO.
 *
 * Brand imagery (homepage hero, logo, the /a-propos ambiance photo) is NOT
 * gated by these flags and always renders.
 */

// Typed as `boolean` (not the literal `false`) so flipping to `true` needs no
// other code change and guarded branches are never treated as dead code.
export const SHOP_ENABLED: boolean = true;
export const WINE_IMAGES_ENABLED: boolean = true;
