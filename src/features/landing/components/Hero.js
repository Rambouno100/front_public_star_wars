import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Agregar esta importación

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const navigate = useNavigate();
  const scrollToProcess = () => {
    const processSection = document.querySelector('[data-section="process"]');
    if (processSection) {
      processSection.scrollIntoView({ behavior: 'smooth' });
    }
};
  const features = [
    { number: "50", unit: "PEN", text: "Descuento Nuevo Cliente" },
    { number: "1", unit: "Año", text: "Garantía Completa" },
    { number: "100", unit: "%", text: "Pago Seguro" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen bg-black relative flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ADB5] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#008C94] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,173,181,0.5) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        
        {/* Main heading */}
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-semibold text-white mb-6 leading-tight">
            Laptops{' '}
            <span className="bg-gradient-to-r from-[#00ADB5] to-[#008C94] bg-clip-text text-transparent relative">
              Premium
            </span>
            <br />
            <span className="text-[#00ADB5] relative">
              Precios Únicos
              <div className="absolute -top-4 -right-8 w-3 h-3 bg-[#00ADB5] rounded-full animate-ping"></div>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light">
            Encuentra la laptop perfecta para tu trabajo con garantía completa,
            entregas seguras y los mejores precios del mercado.
          </p>
        </div>

        {/* CTA buttons */}
        <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button 
            onClick={() => navigate('/catalogo')}
            className="group relative bg-gradient-to-r from-[#00ADB5] to-[#008C94] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00ADB5]/30 overflow-hidden">
              <span className="relative z-10">Ver Catálogo</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#008C94] to-[#00ADB5] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <a 
              href="#proceso"
              className="group border border-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:border-[#00ADB5] hover:text-[#00ADB5] hover:scale-105 hover:shadow-xl hover:shadow-[#00ADB5]/20 inline-block text-center no-underline">
              ¿Cómo Comprar?
            </a>
          </div>
        </div>

        {/* Features */}
        <div className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-gray-900/50 backdrop-blur-sm border rounded-lg p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  currentFeature === index 
                    ? 'border-[#00ADB5] shadow-xl shadow-[#00ADB5]/30 bg-gray-900/70' 
                    : 'border-gray-700 hover:border-[#00ADB5] hover:shadow-[#00ADB5]/20'
                }`}
              >
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#00ADB5] to-[#008C94] bg-clip-text text-transparent">
                    {feature.number}
                  </span>
                  <span className="text-lg text-gray-400 ml-1 group-hover:text-[#00ADB5] transition-colors duration-300">
                    {feature.unit}
                  </span>
                </div>
                <p className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional info */}
        <div className={`transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2 hover:text-[#00ADB5] transition-colors duration-300">
              <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-pulse"></div>
              Contraentrega disponible
            </span>
            <span className="flex items-center gap-2 hover:text-[#00ADB5] transition-colors duration-300">
              <div className="w-2 h-2 bg-[#008C94] rounded-full animate-pulse delay-500"></div>
              Soporte técnico incluido
            </span>
            <span className="flex items-center gap-2 hover:text-[#00ADB5] transition-colors duration-300">
              <div className="w-2 h-2 bg-gradient-to-r from-[#00ADB5] to-[#008C94] rounded-full animate-pulse delay-1000"></div>
              Envíos a todo el país
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;