import React from 'react';
import { Facebook, Instagram } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`border border-brand-border bg-brand-surface p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children }) => (
  <h2 className="font-display text-[15px] font-semibold text-brand-text mb-4 pb-3 border-b border-brand-border">
    {children}
  </h2>
);

const Row = ({ icon = '✓', children }) => (
  <li className="flex items-start gap-2 text-[13px] text-brand-muted">
    <span className={`shrink-0 mt-0.5 font-bold ${icon === '✓' ? 'text-brand-accent' : 'text-brand-faint'}`}>{icon}</span>
    <span>{children}</span>
  </li>
);

const SubTitle = ({ children }) => (
  <h3 className="text-[13px] font-semibold text-brand-text mb-2.5 flex items-center gap-2">
    <span className="text-brand-accent">→</span>{children}
  </h3>
);

const Note = ({ label, children }) => (
  <div className="border-l-2 border-brand-accent bg-brand-panel px-4 py-3 text-[12px] text-brand-muted">
    <span className="font-semibold text-brand-accent">{label}:</span> {children}
  </div>
);

const SocialBtn = ({ href, bg, icon: Icon, label }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-80"
    style={{ background: bg }}>
    <Icon size={15} />{label}
  </a>
);

const LevelBadge = ({ label }) => (
  <span className="px-2 py-0.5 font-mono text-[10px] bg-brand-accent/10 text-brand-accent">{label}</span>
);

const ReferralPage = () => (
  <div style={{ background: '#0A0A0B', minHeight: '100vh' }}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="border border-brand-border bg-brand-panel px-6 sm:px-8 py-8 text-center mb-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand-faint mb-2">Armalo</p>
        <h1 className="font-display text-3xl font-bold text-brand-text tracking-tight mb-2">
          Programa de Referidos
        </h1>
        <p className="text-brand-muted text-[15px]">
          Gana recompensas por recomendar nuestros productos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Col izquierda — beneficios para nuevos */}
        <div className="space-y-5">
          <Card>
            <CardTitle>Beneficios para Clientes Nuevos</CardTitle>

            <div className="mb-5">
              <SubTitle>S/20 de descuento automático</SubTitle>
              <ul className="space-y-1.5 pl-2">
                <Row>Se aplica al instante en tu primera compra</Row>
                <Row>Sin papeleo ni trámites complicados</Row>
                <Row>Válido para laptops con valor superior a S/2000</Row>
              </ul>
            </div>

            <div className="mb-5">
              <SubTitle>+S/10 adicionales</SubTitle>
              <ul className="space-y-1.5 pl-2">
                <Row>Comparte tu experiencia en nuestras redes</Row>
                <Row>Beneficio directo en menos de 48 horas</Row>
              </ul>
            </div>

            <Note label="Importante">
              Debes enviar capturas de que compartiste tu{' '}
              <strong className="text-brand-text">opinión en Facebook y seguirnos en nuestras redes</strong>{' '}
              para hacer efectivo el beneficio.
            </Note>

            <div className="mt-5 pt-4 border-t border-brand-border">
              <p className="text-[12px] text-brand-muted mb-3 font-medium">Síguenos para más beneficios:</p>
              <div className="flex gap-3 flex-wrap">
                <SocialBtn href="https://www.facebook.com/armalo.com/reviews" bg="#1877f2" icon={Facebook} label="Facebook" />
                <SocialBtn href="https://www.instagram.com/armalo/" bg="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" icon={Instagram} label="Instagram" />
              </div>
            </div>
          </Card>
        </div>

        {/* Col derecha — gana por referir */}
        <div className="space-y-5">
          <Card>
            <CardTitle>Gana por Referir</CardTitle>

            <div className="mb-5">
              <SubTitle>Recompensas Directas</SubTitle>
              <ul className="space-y-1.5 pl-2">
                <Row>Recibe <span className="text-brand-accent font-semibold">S/50 por referido</span> que compre</Row>
                <Row>Pago en 48 horas verificables</Row>
                <Row>Sin límite de personas recomendadas</Row>
              </ul>
            </div>

            <div className="mb-5">
              <SubTitle>Sistema de Niveles</SubTitle>
              <div className="border border-brand-border overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-brand-panel border-b border-brand-border">
                      <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.12em] text-brand-faint font-normal">Nivel</th>
                      <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.12em] text-brand-faint font-normal">Referidos</th>
                      <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.12em] text-brand-faint font-normal">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { nivel: 'Nivel 1', rango: '1 – 3', ganancia: 'S/50 c/u' },
                      { nivel: 'Nivel 2', rango: '4 – 5', ganancia: 'S/55 c/u' },
                      { nivel: 'Nivel 3', rango: '6+',    ganancia: 'S/60 c/u' },
                    ].map(r => (
                      <tr key={r.nivel} className="border-b border-brand-border last:border-0">
                        <td className="px-3 py-2.5"><LevelBadge label={r.nivel} /></td>
                        <td className="px-3 py-2.5 text-brand-muted">{r.rango}</td>
                        <td className="px-3 py-2.5 text-brand-text font-semibold">{r.ganancia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-brand-faint mt-1.5">* Válido por compras en los últimos 6 meses</p>
            </div>

            <Note label="Requisito">
              Tus referidos deben proporcionar <strong className="text-brand-text">tu DNI</strong> al comprar para que recibas tu recompensa. Asimismo, tu referido debe seguirnos en nuestras redes.
            </Note>

            <div className="mt-5 pt-4 border-t border-brand-border">
              <p className="text-[12px] text-brand-muted mb-3 font-medium">Síguenos para validar tus referidos:</p>
              <div className="flex gap-3 flex-wrap">
                <SocialBtn href="https://www.facebook.com/armalo.com/reviews" bg="#1877f2" icon={Facebook} label="Facebook" />
                <SocialBtn href="https://www.instagram.com/armalo/" bg="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" icon={Instagram} label="Instagram" />
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  </div>
);

export default ReferralPage;
