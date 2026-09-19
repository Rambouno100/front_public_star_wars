/**
 * Flags de features del negocio.
 *
 * INVOICING_ENABLED — emisión de comprobantes (boleta / factura + RUC).
 *   Hoy en `false`: no se puede emitir, así que la UI de comprobante se oculta
 *   (paso del checkout, badges "Boleta / Factura", RUC en el footer y en la
 *   cotización del admin) y las órdenes se envían sin datos de facturación.
 *   Para reactivarlo cuando ya se pueda emitir: pon `true` y recompila.
 *   El código de la UI sigue en su lugar, solo está condicionado a este flag.
 */
export const INVOICING_ENABLED = false;
