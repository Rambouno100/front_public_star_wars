import React from 'react';
import { Facebook, Instagram, Shield } from 'lucide-react';

const Garantia = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8">
      {/* Contenedor principal */}
      <div className="max-w-4xl mx-auto">
        {/* Tarjeta con sombra */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Encabezado con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-8 px-6 sm:px-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Política de Garantía Drophack
            </h1>
            <p className="text-blue-100 text-lg">
              Tu satisfacción es nuestra prioridad. Por eso, ofrecemos una garantía de 1 año.
            </p>
          </div>

          {/* Contenido de dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Columna izquierda - Qué cubre la garantía */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  ¿Qué Cubre Esta Garantía?
                </h2>
                
                <div className="mb-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-500 mr-2">→</span>
                    Productos no conformes
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Productos que no coinciden con la descripción publicada
                    </li>
                  </ul>
                </div>

                <div className="mb-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-500 mr-2">→</span>
                    Defectos de fabricación
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Defectos de materiales o fabricación bajo condiciones normales de uso
                    </li>
                  </ul>
                </div>

                <div className="mb-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-500 mr-2">→</span>
                    Daños en tránsito
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Daños en tránsito atribuibles al transporte coordinado por Drophack
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                  <p className="text-sm text-gray-700">
                    <strong className="text-blue-600">Solución garantizada:</strong> Si tu producto presenta alguno de estos problemas, nosotros lo <strong>repararemos, reemplazaremos o reembolsaremos</strong> el valor de tu compra, a nuestra discreción.
                  </p>
                </div>

                {/* Iconos decorativos */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
                  <Shield size={32} className="text-blue-500" />
                </div>
              </div>

              {/* Qué NO cubre */}
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h2 className="text-xl font-semibold text-red-800 mb-4 pb-3 border-b border-red-200">
                  ¿Qué NO Cubre Esta Garantía?
                </h2>
                <p className="text-red-700 mb-4 font-medium">Esta garantía no aplica en los siguientes casos:</p>
                <ul className="space-y-2 text-sm text-red-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Daños estéticos menores (rayones, abolladuras, manchas, etc.) que no afecten el funcionamiento al 100% del producto
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Desgaste natural por el uso normal del producto
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Mal uso, accidentes, caídas, negligencia, manipulación incorrecta o daños causados por no seguir las instrucciones del producto
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Modificaciones no autorizadas o reparaciones realizadas por terceros no autorizados
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Fallas por condiciones externas como incendios, inundaciones, sobretensiones eléctricas u otros eventos de fuerza mayor
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Productos sin comprobante de compra válido o adquiridos fuera de nuestros canales oficiales
                  </li>
                </ul>
              </div>
            </div>

            {/* Columna derecha - Requisitos y procedimiento */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Requisitos para Hacer Válida la Garantía
                </h2>

                <ul className="space-y-3 mb-6">
                  <li className="text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Solicitar la garantía dentro del plazo de 12 meses desde la fecha de compra
                  </li>
                  <li className="text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Presentar el comprobante de compra (boleta, factura o confirmación de pedido)
                  </li>
                  <li className="text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Devolver el producto completo en el estado más cercano en el que fue entregado y dentro del plazo establecido, incluyendo todos los accesorios
                  </li>
                  <li className="text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Permitirnos la inspección del producto para validar la reclamación
                  </li>
                </ul>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                  <p className="text-sm text-gray-700">
                    <strong className="text-green-600">Confirmación:</strong> Si el defecto es confirmado, el reclamo será procesado inmediatamente.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Procedimiento de Reclamo
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start bg-gray-50 p-3 rounded">
                    <span className="bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                    <div>
                      <p className="text-gray-800 font-medium">Contacta a nuestro Servicio al Cliente</p>
                      <p className="text-gray-600 text-sm">Explica el problema e incluye tu comprobante de compra</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-gray-50 p-3 rounded">
                    <span className="bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                    <div>
                      <p className="text-gray-800 font-medium">Adjunta evidencia</p>
                      <p className="text-gray-600 text-sm">Fotos o videos del producto y del daño, si fuera necesario</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-gray-50 p-3 rounded">
                    <span className="bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                    <div>
                      <p className="text-gray-800 font-medium">Sigue las instrucciones de devolución</p>
                      <p className="text-gray-600 text-sm">Te enviaremos las instrucciones que necesitas seguir</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Tras la evaluación, te ofreceremos una de estas soluciones:</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Reparación sin costo
                    </li>
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Reemplazo por un producto nuevo o equivalente
                    </li>
                    <li className="text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Reembolso total del importe pagado
                    </li>
                  </ul>
                </div>

                {/* Botones de redes sociales */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Contáctanos para activar tu garantía:</p>
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

              {/* Condiciones adicionales */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Condiciones Adicionales</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    La reparación o reemplazo no extiende el período original de garantía
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    En caso de no contar con stock para reemplazo, se realizará el reembolso como forma final de resolución
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    Drophack se reserva el derecho de rechazar reclamos en los que se determine incumplimiento de los términos de esta garantía
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Garantia;