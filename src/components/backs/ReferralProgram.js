import React from 'react';
import { Facebook, Instagram } from 'lucide-react';

const ReferralProgram = () => {
  return (
  <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8">
  {/* Contenedor principal */}
      <div className="max-w-4xl mx-auto">
        {/* Tarjeta con sombra */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Encabezado con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-8 px-6 sm:px-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Programa de Referidos Drophack
            </h1>
            <p className="text-blue-100 text-lg">
              Gana recompensas por recomendar nuestros productos
            </p>
          </div>

          {/* Contenido de dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Columna izquierda - Beneficios */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Beneficios para Clientes Nuevos
                </h2>
                
                <div className="mb-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-500 mr-2">→</span>
                    S/20 de descuento automático
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Se aplica al instante en tu primera compra
                    </li>
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Sin papeleo ni trámites complicados
                    </li>
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Válido para laptops con valor superior a S/2000
                    </li>
                  </ul>
                </div>

                <div className="mb-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-500 mr-2">→</span>
                    +S/10 adicionales
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Comparte tu experiencia en nuestras redes
                    </li>
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Beneficio directo en menos de 48 horas
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                  <p className="text-sm text-gray-700">
                    <strong className="text-blue-600">Importante:</strong> Debes enviar capturas de que compartiste tu <strong>opinion en facebook y seguirnos en nuestras redes </strong> para hacer efectivo el beneficio.
                  </p>
                </div>
                
                {/* Botones de redes sociales */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Síguenos para más beneficios:</p>
                  <div className="flex space-x-4">
                    <a 
                      href="https://www.facebook.com/galactic-market.com/reviews" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Facebook size={16} className="mr-2" />
                      Facebook
                    </a>
                    <a 
                      href="https://www.instagram.com/_galacticmarket_/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <Instagram size={16} className="mr-2" />
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha - Programa de referidos */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Gana por Referir
                </h2>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-500 mr-2">→</span>
                    Recompensas Directas
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Recibe <span className="text-blue-600 font-medium">S/50 por referido</span> que compre</span>
                    </li>
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Pago en 48 horas verificables
                    </li>
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Sin límite de personas recomendadas
                    </li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="text-blue-500 mr-2">→</span>
                    Sistema de Niveles
                  </h3>
                  
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referidos</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Nivel 1</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">1-3</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-600">S/50 c/u</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Nivel 2</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">4-5</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-600">S/55 c/u</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Nivel 3</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">6+</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-600">S/60 c/u</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Válido por compras en los últimos 6 meses</p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                  <p className="text-sm text-gray-700">
                    <strong className="text-blue-600">Requisito:</strong> Tus referidos deben proporcionar <strong>tu DNI</strong> al comprar para que recibas tu recompensa. Asimismo, tu referido debe seguirnos en nuestras redes.
                  </p>
                </div>
                
                {/* Botones de redes sociales */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Síguenos para validar tus referidos:</p>
                  <div className="flex space-x-4">
                    <a 
                      href="https://www.facebook.com/galactic-market.com/reviews" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Facebook size={16} className="mr-2" />
                      Facebook
                    </a>
                    <a 
                      href="https://www.instagram.com/_galacticmarket_/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <Instagram size={16} className="mr-2" />
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;