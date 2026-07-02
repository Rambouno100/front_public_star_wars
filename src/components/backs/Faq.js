import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, Shield, Package, Clock, Users, ChevronDown } from 'lucide-react';

const FAQ = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      icon: <MapPin className="w-6 h-6" />,
      question: "¿Tienen tienda física? 🏪",
      answer: "Por la coyuntura actual de seguridad en Lima, solo realizamos entregas a <strong>delivery</strong> o <strong>contraentrega en ciertos puntos seguros</strong>. Esto nos permite ofrecerte mejores precios y mayor seguridad.",
      highlight: "Solo Delivery"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      question: "¿Puedo pagar con tarjeta de crédito? 💳",
      answer: "Sí, aceptamos tarjetas de crédito pero se incluye un <strong>recargo del 3.5%</strong>. También aceptamos <strong>transferencias bancarias sin recargo adicional</strong>, lo que te permite ahorrar más.",
      highlight: "Transferencia sin recargo"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      question: "¿Qué cubre la garantía? 🛡️",
      answer: (
        <div>
          Todos nuestros productos incluyen garantía completa. Para conocer todos los detalles específicos de cobertura, términos y condiciones:
          <button 
            onClick={() => navigate('/garantia')} 
            className="ml-2 px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition-opacity bg-gradient-to-r from-[#00ADB5] to-[#008C94] text-white hover:scale-105 hover:shadow-lg hover:shadow-[#00ADB5]/30"
          >
            Ver Garantía
          </button>
        </div>
      ),
      highlight: "Garantía Completa"
    },
    {
      icon: <Package className="w-6 h-6" />,
      question: "¿Tienen catálogo completo? 📱",
      answer: (
        <div>
          ¡Por supuesto! Puedes ver todos nuestros productos disponibles, precios actualizados y especificaciones técnicas:
          <button 
            onClick={() => navigate('/catalogo')} 
            className="ml-2 px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition-opacity bg-gradient-to-r from-[#00ADB5] to-[#008C94] text-white hover:scale-105 hover:shadow-lg hover:shadow-[#00ADB5]/30"
          >
            Ver Catálogo
          </button>
        </div>
      ),
      highlight: "Ver Catálogo"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      question: "¿Cuál es el plazo de entrega? ⏱️",
      answer: "El tiempo de entrega puede ser <strong>inmediato</strong> si tenemos stock disponible, o hasta <strong>7 días hábiles</strong> en caso no tengamos el producto en stock y necesitemos conseguirlo.",
      highlight: "Hasta 7 días"
    },
    {
      icon: <Users className="w-6 h-6" />,
      question: "¿Hay ofertas adicionales? 🎁",
      answer: "¡Sí! Publicamos <strong>ofertas exclusivas</strong> en nuestras redes sociales y por WhatsApp. Es importante seguirnos para acceder a descuentos especiales y promociones limitadas.",
      highlight: "Ofertas Exclusivas"
    }
  ];

  return (
    <section id="faq-section" className="py-16 px-4 bg-black relative overflow-hidden">
      {/* Animated background effects - igual que Hero */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ADB5] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#008C94] rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-[#00ADB5] to-[#008C94] rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay - igual que Hero */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,173,181,0.5) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Preguntas{' '}
            <span className="bg-gradient-to-r from-[#00ADB5] to-[#008C94] bg-clip-text text-transparent relative">
              Frecuentes
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#00ADB5] to-[#008C94] rounded animate-pulse"></div>
            </span>
          </h2>
          <p className="text-gray-300 text-lg">
            Todo lo que necesitas saber sobre nuestros productos y servicios
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
              <div className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#00ADB5] hover:shadow-xl hover:shadow-[#00ADB5]/20 hover:scale-[1.02]">
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-[#00ADB5] group-hover:text-[#008C94] transition-colors duration-300">
                      {faq.icon}
                    </div>
                    <span className="font-semibold text-left text-white group-hover:text-[#00ADB5] transition-colors duration-300">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#00ADB5] transition-colors duration-300" />
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
                      <div className="px-6 py-4 text-gray-300 border-t border-gray-700/50">
                        {typeof faq.answer === 'string' ? (
                          <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        ) : (
                          faq.answer
                        )}
                        <div className="mt-4 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#00ADB5]/20 to-[#008C94]/20 border border-[#00ADB5]/30 text-[#00ADB5] text-sm font-medium">
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

        {/* Indicadores decorativos adicionales - estilo Hero */}
        
      </div>
    </section>
  );
};

export default FAQ;