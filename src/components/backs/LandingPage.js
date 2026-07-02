import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Users, Zap, ShoppingBag, ChevronRight } from 'lucide-react';


const FEATURES = [
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "Compras Grupales Inteligentes",
    description: "Únete a grupos de compra para obtener descuentos exclusivos. Cuantos más seamos, más ahorraremos.",
    stats: "Ahorra hasta un 70%",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Comunidad Activa",
    description: "Únete a una comunidad de compradores inteligentes. Comparte experiencias y maximiza tu ahorro.",
    stats: "50K+ miembros activos",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Ofertas Relámpago",
    description: "Accede a ofertas exclusivas por tiempo limitado. Los mejores precios para los más rápidos.",
    stats: "Nuevas ofertas cada hora",
  }
];

const Header = () => (
  <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center">
          <ShoppingBag className="w-8 h-8 text-[#24292e]" />
          <span className="ml-2 text-xl font-semibold text-[#24292e]">CompraGrupal</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          {['Producto', 'Soluciones', 'Código Abierto', 'Precios'].map((item) => (
            <a key={item} href="#" className="text-[#24292e] hover:text-[#0366d6]">
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center space-x-4">

        </div>
      </div>
    </div>
  </header>
);

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.section 
      style={{ opacity }}
      className="relative bg-[#f6f8fa] py-20 overflow-hidden"
    >
      <motion.div 
        style={{ y }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-[#24292e] mb-6">
          Compra Mejor, Ahorra Más
        </h1>
        <p className="text-xl text-[#586069] mb-8 max-w-2xl mx-auto">
          Descubre una nueva forma de comprar en grupo. Une fuerzas con otros compradores 
          y accede a los mejores descuentos.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">

        </div>
      </motion.div>
    </motion.section>
  );
};

const FeatureCard = ({ feature, index }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div 
      style={{ y, opacity }}
      className="bg-white p-6 rounded-lg shadow-md"
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-[#f6f8fa] mr-4">
          {feature.icon}
        </div>
        <h3 className="text-lg font-semibold text-[#24292e]">{feature.title}</h3>
      </div>
      <p className="text-[#586069] mb-4">{feature.description}</p>
      <p className="text-sm font-medium text-[#0366d6]">{feature.stats}</p>
    </motion.div>
  );
};

const FeaturesSection = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-[#24292e] mb-12">
        Características principales
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="bg-[#f6f8fa] py-20">
    <div className="max-w-4xl mx-auto text-center px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#24292e]">
        Únete a la revolución de las compras grupales
      </h2>
      <p className="text-xl text-[#586069] mb-8">
        Sé parte de una comunidad que está cambiando la forma de comprar.
      </p>

    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#f6f8fa] border-t border-gray-200 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {['Producto', 'Recursos', 'Compañía', 'Social'].map((category) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-[#24292e] mb-4">{category}</h3>
            <ul className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#586069] hover:text-[#0366d6] text-sm">
                    {category} Link {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
        <p className="text-[#586069] text-sm">
          © 2024 CompraGrupal, Inc. Todos los derechos reservados.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          {['Términos', 'Privacidad', 'Seguridad', 'Estado', 'Ayuda'].map((item) => (
            <a key={item} href="#" className="text-[#586069] hover:text-[#0366d6] text-sm">
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-white text-[#24292e]">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#0366d6] transform origin-left z-50"
        style={{ scaleX }}
      />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}