import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Shield, CreditCard, ChevronDown } from 'lucide-react';

const THEME = {
  themeprimary: '#0095f6',
  background: '#0a0a0a',
  cardBg: '#111111',
  textPrimary: '#EEEEEE',
  textSecondary: '#EEEEEE',
  border: '#343535'
};

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      icon: <Check className="w-6 h-6" />,
      question: "¿Cómo me beneficia la compra grupal? 💰",
      answer: "Las compras grupales te permiten acceder a precios mayoristas sin ser mayorista. El precio disminuye automáticamente mientras más personas se unen, pudiendo alcanzar hasta un <strong>70% de descuento</strong>. Lo mejor: ¡no hay compromiso de compra, tu decides si continuar una vez finalice el tiempo del grupo!",
      highlight: "Ahorra hasta 70%"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      question: "¿Cómo funciona el proceso paso a paso? 🎯",
      answer: `
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 rounded-full" style="background-color: ${THEME.themeprimary}20; color: ${THEME.themeprimary}">1</span>
            <span>Explora los productos disponibles y sus precios objetivo</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 rounded-full" style="background-color: ${THEME.themeprimary}20; color: ${THEME.themeprimary}">2</span>
            <span>Únete al grupo que te interese sin compromiso</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 rounded-full" style="background-color: ${THEME.themeprimary}20; color: ${THEME.themeprimary}">3</span>
            <span>Recibe notificaciones del progreso y descuentos</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 rounded-full" style="background-color: ${THEME.themeprimary}20; color: ${THEME.themeprimary}">4</span>
            <span>Decide si comprar cuando se alcance la fecha de termino del grupo</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 rounded-full" style="background-color: ${THEME.themeprimary}20; color: ${THEME.themeprimary}">5</span>
            <span>Realiza el pago de manera segura</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 rounded-full" style="background-color: ${THEME.themeprimary}20; color: ${THEME.themeprimary}">6</span>
            <span>Recibe tu producto en la puerta de tu casa</span>
          </div>
        </div>
      `,
      highlight: "¡Proceso Simple!"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      question: "¿Qué garantías tengo al comprar? 🛡️",
      answer: "Tu compra está <strong>100% protegida</strong>. Trabajamos solo con vendedores verificados, utilizamos pagos seguros a través de Izipay. Además, recibirás actualizaciones en tiempo real del estado de tu pedido.",
      highlight: "100% Seguro"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      question: "¿Qué sucede si no se alcanza el precio objetivo? ⏳",
      answer: "Tienes <strong>total flexibilidad</strong>: puedes decidir comprar al mejor precio alcanzado, esperar al siguiente grupo, o simplemente no participar. No hay penalización por registrarte y luego no continuar con la compra, pero por el bien de la comunidad, si esta conducta se repite 2 veces seguidas, recibirás una notificación. Si ocurre una tercera vez consecutiva, se restringirá temporalmente tu acceso a nuevas compras grupales.",
      highlight: "Sin Compromiso"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      question: "¿Cuándo se realiza el cobro? 💳",
      answer: "Tu dinero está seguro - solo procesamos el pago cuando: el grupo alcanza su objetivo, confirmas tu participación y autorizas el cargo. <strong>No hay cargos ocultos ni sorpresas</strong>.",
      highlight: "Pago Seguro"
    }
  ];

  return (
    <section id="faq-section" className="py-16 px-4" style={{ backgroundColor: THEME.background }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4" style={{ color: THEME.textPrimary }}>
            Preguntas Frecuentes
          </h2>
          <p style={{ color: THEME.textSecondary }}>
            Todo lo que necesitas saber sobre nuestras compras grupales
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className="overflow-hidden transition-all duration-200"
                style={{ 
                  backgroundColor: THEME.cardBg,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '20px'
                }}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: THEME.themeprimary }}>{faq.icon}</div>
                    <span className="font-semibold text-left" style={{ color: THEME.textPrimary }}>
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5" style={{ color: THEME.textSecondary }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 py-4" style={{ color: THEME.textSecondary }}>
                        <div 
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                        <div 
                          className="mt-4 inline-block px-3 py-1 rounded-full"
                          style={{ 
                            backgroundColor: `${THEME.themeprimary}20`,
                            color: THEME.themeprimary 
                          }}
                        >
                          {faq.highlight}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;