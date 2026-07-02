import React from 'react';
import { Facebook, Instagram, Shield } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`border border-brand-border bg-brand-surface p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, accent }) => (
  <h2 className={`font-display text-[15px] font-semibold mb-4 pb-3 border-b border-brand-border ${accent ? 'text-brand-red' : 'text-brand-text'}`}>
    {children}
  </h2>
);

const Row = ({ icon, children }) => (
  <li className="flex items-start gap-2 text-[13px] text-brand-muted">
    <span className={`shrink-0 mt-0.5 font-bold ${icon === '✓' ? 'text-brand-accent' : icon === '✗' ? 'text-brand-red' : 'text-brand-faint'}`}>{icon}</span>
    <span>{children}</span>
  </li>
);

const Step = ({ n, title, desc }) => (
  <div className="flex items-start gap-3 bg-brand-panel border border-brand-border p-3">
    <span className="shrink-0 flex h-6 w-6 items-center justify-center bg-brand-accent text-brand-bg text-[11px] font-bold font-mono">{n}</span>
    <div>
      <p className="text-[13px] font-medium text-brand-text">{title}</p>
      <p className="text-[12px] text-brand-muted">{desc}</p>
    </div>
  </div>
);

const SocialBtn = ({ href, bg, icon: Icon, label }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-80"
    style={{ background: bg }}>
    <Icon size={15} />
    {label}
  </a>
);

const WarrantyPage = () => (
  <div style={{ background: '#0A0A0B', minHeight: '100vh' }}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="border border-brand-border bg-brand-panel px-6 sm:px-8 py-8 text-center mb-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand-faint mb-2">Armalo</p>
        <h1 className="font-display text-3xl font-bold text-brand-text tracking-tight mb-2">
          Política de Garantía
        </h1>
        <p className="text-brand-muted text-[15px]">
          Tu satisfacción es nuestra prioridad. Por eso, ofrecemos una garantía de 1 año.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Col izquierda */}
        <div className="space-y-5">
          <Card>
            <CardTitle>¿Qué Cubre Esta Garantía?</CardTitle>

            <div className="mb-5">
              <h3 className="text-[13px] font-semibold text-brand-text mb-2 flex items-center gap-2">
                <span className="text-brand-accent">→</span> Productos no conformes
              </h3>
              <ul className="space-y-1.5 pl-2">
                <Row icon="✓">Productos que no coinciden con la descripción publicada</Row>
              </ul>
            </div>

            <div className="mb-5">
              <h3 className="text-[13px] font-semibold text-brand-text mb-2 flex items-center gap-2">
                <span className="text-brand-accent">→</span> Defectos de fabricación
              </h3>
              <ul className="space-y-1.5 pl-2">
                <Row icon="✓">Defectos de materiales o fabricación bajo condiciones normales de uso</Row>
              </ul>
            </div>

            <div className="mb-5">
              <h3 className="text-[13px] font-semibold text-brand-text mb-2 flex items-center gap-2">
                <span className="text-brand-accent">→</span> Daños en tránsito
              </h3>
              <ul className="space-y-1.5 pl-2">
                <Row icon="✓">Daños en tránsito atribuibles al transporte coordinado por Armalo</Row>
              </ul>
            </div>

            <div className="border-l-2 border-brand-accent bg-brand-panel px-4 py-3 text-[12px] text-brand-muted">
              <span className="font-semibold text-brand-accent">Solución garantizada:</span> Si tu producto presenta alguno de estos problemas, nosotros lo{' '}
              <strong className="text-brand-text">repararemos, reemplazaremos o reembolsaremos</strong> el valor de tu compra, a nuestra discreción.
            </div>

            <div className="mt-5 pt-4 border-t border-brand-border flex justify-center">
              <Shield size={28} className="text-brand-accent" strokeWidth={1.4} />
            </div>
          </Card>

          <Card className="border-brand-red/30 bg-brand-red/5">
            <CardTitle accent>¿Qué NO Cubre Esta Garantía?</CardTitle>
            <p className="text-brand-red/80 text-[12px] mb-3 font-medium">Esta garantía no aplica en los siguientes casos:</p>
            <ul className="space-y-2">
              <Row icon="✗">Daños estéticos menores (rayones, abolladuras, manchas) que no afecten el funcionamiento</Row>
              <Row icon="✗">Desgaste natural por el uso normal del producto</Row>
              <Row icon="✗">Mal uso, accidentes, caídas, negligencia o daños por no seguir instrucciones</Row>
              <Row icon="✗">Modificaciones no autorizadas o reparaciones por terceros no autorizados</Row>
              <Row icon="✗">Fallas por incendios, inundaciones, sobretensiones u otros eventos de fuerza mayor</Row>
              <Row icon="✗">Productos sin comprobante de compra o adquiridos fuera de canales oficiales</Row>
            </ul>
          </Card>
        </div>

        {/* Col derecha */}
        <div className="space-y-5">
          <Card>
            <CardTitle>Requisitos para Hacer Válida la Garantía</CardTitle>
            <ul className="space-y-2.5 mb-5">
              <Row icon="•">Solicitar la garantía dentro de los <strong className="text-brand-text">12 meses</strong> desde la fecha de compra</Row>
              <Row icon="•">Presentar el comprobante de compra (boleta, factura o confirmación de pedido)</Row>
              <Row icon="•">Devolver el producto completo con todos sus accesorios en el estado más cercano al entregado</Row>
              <Row icon="•">Permitirnos la inspección del producto para validar la reclamación</Row>
            </ul>
            <div className="border-l-2 border-brand-accent bg-brand-panel px-4 py-3 text-[12px] text-brand-muted">
              <span className="font-semibold text-brand-accent">Confirmación:</span> Si el defecto es confirmado, el reclamo será procesado inmediatamente.
            </div>
          </Card>

          <Card>
            <CardTitle>Procedimiento de Reclamo</CardTitle>
            <div className="space-y-2.5 mb-5">
              <Step n="1" title="Contacta a nuestro Servicio al Cliente" desc="Explica el problema e incluye tu comprobante de compra" />
              <Step n="2" title="Adjunta evidencia" desc="Fotos o videos del producto y del daño, si fuera necesario" />
              <Step n="3" title="Sigue las instrucciones de devolución" desc="Te enviaremos las instrucciones que necesitas seguir" />
            </div>

            <div className="mb-5">
              <p className="text-[13px] font-medium text-brand-text mb-2">Tras la evaluación, te ofreceremos una solución:</p>
              <ul className="space-y-1.5 pl-2">
                <Row icon="✓">Reparación sin costo</Row>
                <Row icon="✓">Reemplazo por un producto nuevo o equivalente</Row>
                <Row icon="✓">Reembolso total del importe pagado</Row>
              </ul>
            </div>

            <div className="border-t border-brand-border pt-4">
              <p className="text-[12px] text-brand-muted mb-3 font-medium">Contáctanos para activar tu garantía:</p>
              <div className="flex gap-3">
                <SocialBtn href="https://www.facebook.com/armalo.com/reviews" bg="#1877f2" icon={Facebook} label="Facebook" />
                <SocialBtn href="https://www.instagram.com/armalo/" bg="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" icon={Instagram} label="Instagram" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-[14px] font-semibold text-brand-text mb-3">Condiciones Adicionales</h3>
            <ul className="space-y-2">
              <Row icon="•">La reparación o reemplazo no extiende el período original de garantía</Row>
              <Row icon="•">Sin stock para reemplazo, se realizará el reembolso como forma final de resolución</Row>
              <Row icon="•">Armalo se reserva el derecho de rechazar reclamos con incumplimiento de términos</Row>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

export default WarrantyPage;
