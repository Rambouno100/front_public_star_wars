import FAQ from './Faq';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Clock, Check, ArrowRight, MessageCircle, ChevronDown, CreditCard } from 'lucide-react';
import AuthButtons from './AuthButtons';
import { Link } from 'react-router-dom';

const THEME = {
  themeprimary: '#0095f6',
  background: '#0a0a0a',
  cardBg: '#111111',
  textPrimary: '#EEEEEE',
  textSecondary: '#EEEEEE',
  border: '#343535'
};

const FEATURES = [
  {
    icon: <Users size={24} />,
    title: "Únete a un Grupo",
    subtitle: "Comienza a Ahorrar",
    description: "Encuentra el producto que te interesa y únete a un grupo de compra.",
    benefits: ["Sin compromiso inicial", "Monitorea el precio en tiempo real", "Decide cuando el precio te conviene"],
    media: {
      url: "/api/placeholder/400/300"
    }
  },
  {
    icon: <Clock size={24} />,
    title: "Espera y Ahorra",
    subtitle: "El Precio Baja",
    description: "Observa cómo el precio disminuye mientras más personas se unen al grupo.",
    steps: [
      { number: "01", text: "Monitorea el progreso" },
      { number: "02", text: "Recibe actualizaciones" },
      { number: "03", text: "Decide cuándo comprar" }
    ],
    media: {
      url: "/api/placeholder/400/300"
    }
  },
  {
    icon: <Shield size={24} />,
    title: "Compra Seguro",
    subtitle: "100% Garantizado",
    description: "Realiza tu compra con total seguridad cuando alcances el precio deseado.",
    guarantees: [
      "Pago seguro garantizado",
      "Envío protegido",
      "Soporte dedicado"
    ],
    media: {
      url: "/api/placeholder/400/300"
    }
  }
];

const WhatsAppButton = () => (
  <motion.a
    href="https://wa.me/message/ONY777G2RHHEK1"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg"
    style={{ 
      backgroundColor: '#25D366',
      color: '#FFFFFF'
    }}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    <span className="font-medium">¡Ahorra Ahora!</span>
  </motion.a>
);

const HeroBanner = ({ isLoggedIn, username, setIsLoggedIn }) => {
  const scrollToFAQ = () => {
    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen flex items-center justify-center text-center px-4"
      >
        <div className="max-w-4xl">
          <motion.h1 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-4xl md:text-7xl font-bold mb-6"
            style={{ color: THEME.textPrimary }}
          >
            Compremos Juntos,{' '}
            <span style={{ color: THEME.themeprimary }}>Paguemos Menos</span>
          </motion.h1>
          
          <p className="text-lg md:text-2xl mb-8" style={{ color: THEME.textSecondary }}>
            El poder de la compra grupal en tus manos
          </p>

          <div className="flex flex-col items-center md:flex-row gap-4 justify-center mb-8">
            <Link to="/pulls" className="w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto px-6 py-3 rounded-lg text-lg font-medium transition-colors flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: THEME.themeprimary,
                  color: THEME.textPrimary
                }}
              >
                Explorar Productos <ArrowRight size={20} />
              </motion.button>
            </Link>
            
            <motion.button
              onClick={scrollToFAQ}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-auto px-6 py-3 rounded-lg text-lg font-medium transition-colors flex items-center justify-center gap-2"
              style={{ 
                border: `1px solid ${THEME.themeprimary}`,
                color: THEME.themeprimary
              }}
            >
              ¿Cómo Funciona? <ChevronDown size={18} />
            </motion.button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-8"
            style={{ color: THEME.textSecondary }}
          >
            <div>
              <div className="text-2xl font-bold" style={{ color: THEME.themeprimary }}>20%</div>
              <div className="text-sm">Ahorro Promedio</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: THEME.themeprimary }}>100%</div>
              <div className="text-sm">Satisfacción</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: THEME.themeprimary }}>100%</div>
              <div className="text-sm">Seguro</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, subtitle, description, benefits, steps, guarantees, media }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="relative p-6 rounded-xl overflow-hidden"
    style={{ 
      backgroundColor: THEME.cardBg,
      border: `1px solid ${THEME.border}`,
      borderRadius: '20px'
    }}
  >
    <div className="relative z-10 space-y-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
        style={{ 
          backgroundColor: `${THEME.themeprimary}20`,
          color: THEME.themeprimary 
        }}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold" style={{ color: THEME.textPrimary }}>{title}</h3>
      <h4 className="text-lg" style={{ color: THEME.themeprimary }}>{subtitle}</h4>
      <p style={{ color: THEME.textSecondary }}>{description}</p>
      
      {benefits && (
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2" style={{ color: THEME.textSecondary }}>
              <Check size={16} style={{ color: THEME.themeprimary }} />
              {benefit}
            </li>
          ))}
        </ul>
      )}
      
      {steps && (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <span style={{ color: THEME.themeprimary }} className="font-bold">{step.number}</span>
              <span style={{ color: THEME.textSecondary }}>{step.text}</span>
            </div>
          ))}
        </div>
      )}
      
      {guarantees && (
        <ul className="space-y-2">
          {guarantees.map((guarantee, index) => (
            <li key={index} className="flex items-center gap-2" style={{ color: THEME.textSecondary }}>
              <Shield size={16} style={{ color: THEME.themeprimary }} />
              {guarantee}
            </li>
          ))}
        </ul>
      )}
    </div>
  </motion.div>
);

const FinalCTA = () => (
  <section className="py-16 px-4" style={{ backgroundColor: THEME.themeprimary }}>
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-4" style={{ color: THEME.textPrimary }}>
        Únete Hoy y Comienza a Ahorrar
      </h2>
      <p className="text-lg mb-8" style={{ color: THEME.textPrimary }}>
        Aprovecha el poder de la compra grupal y accede a precios increíbles.
      </p>
      <Link to="/pulls">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-lg text-lg font-medium"
          style={{ 
            backgroundColor: THEME.background,
            color: THEME.textPrimary
          }}
        >
          Ver Grupos Activos
        </motion.button>
      </Link>
    </div>
  </section>
);
const Footer = () => (
  <footer className="py-6 px-4" style={{ backgroundColor: THEME.cardBg }}>
    <div className="max-w-7xl mx-auto text-center">
      <div className="text-sm" style={{ color: THEME.textSecondary }}>
        © {new Date().getFullYear()} Galactic Market | RUC: 20613999818
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: THEME.background
    }}>
      <WhatsAppButton />

      <HeroBanner 
        isLoggedIn={isLoggedIn} 
        username={username}
        setIsLoggedIn={setIsLoggedIn} 
      />
      
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: THEME.textPrimary }}>
          Comprar en Grupo Nunca Fue Tan Fácil
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;