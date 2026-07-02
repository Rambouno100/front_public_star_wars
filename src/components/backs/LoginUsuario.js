import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';

const LoginUsuario = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para verificar o crear carrito después del login
  const verificarOCrearCarrito = async () => {
    try {
      // Primero intentar obtener el carrito actual
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/current-cart/`);
      console.log('Carrito existente encontrado:', response.data.name);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // No existe carrito, crear uno nuevo
        try {
          console.log('No hay carrito existente, creando uno nuevo...');
          const { data: { id: customerId } } = await axios.get(`${process.env.REACT_APP_API_URL}/user/`);
          
          const { data: nuevaOrden } = await axios.post(`${process.env.REACT_APP_API_URL}/sales-orders/`, {
            customer: customerId,
            state: 'draft',
            order_type: 'regular',
            salesorderline_set: []
          });
          
          console.log('Nuevo carrito creado:', nuevaOrden.name);
          return nuevaOrden;
        } catch (createError) {
          console.error('Error al crear nuevo carrito:', createError);
          throw new Error('No se pudo crear el carrito');
        }
      } else {
        console.error('Error al verificar carrito:', error);
        throw new Error('Error al verificar el carrito');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Paso 1: Autenticar usuario
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login/`, formData);
      
      if (response.data.access) {
        // Paso 2: Establecer tokens de autenticación
        login(response.data.access, response.data.refresh);
        
        try {
          // Paso 3: Obtener datos del usuario (opcional)
          const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/user/`);
          console.log('Usuario autenticado:', userResponse.data.username);
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          // No es crítico, continuar con el proceso
        }

        try {
          // Paso 4: Verificar o crear carrito
          await verificarOCrearCarrito();
          console.log('Carrito verificado/creado exitosamente');
        } catch (cartError) {
          console.error('Error con el carrito:', cartError);
          // Mostrar advertencia pero permitir continuar
          setError('Advertencia: Hubo un problema al preparar tu carrito. Puedes continuar navegando.');
          // No hacer return aquí, permitir que el usuario acceda
        }

        // Paso 5: Navegar a la página principal
        navigate('/'); 
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'Ocurrió un error durante el inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010409] text-[#F9FCFF] px-4 md:pl-0 md:pb-[60px]">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#F9FCFF] mb-2">Iniciar Sesión</h2>
              <p className="text-gray-400">Accede a tu cuenta</p>
            </div>

            {/* Form Card */}
            <div className="bg-[#0D1117] border border-[#313840] rounded-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className={`border rounded-md p-3 ${
                    error.includes('Advertencia') 
                      ? 'bg-yellow-900/20 border-yellow-700/50' 
                      : 'bg-red-900/20 border-red-700/50'
                  }`}>
                    <p className={`text-sm ${
                      error.includes('Advertencia') ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {error}
                    </p>
                  </div>
                )}

                {/* Username Input */}
                <div className="space-y-2">
                  <label 
                    className="text-xs font-medium uppercase tracking-wide text-gray-400" 
                    htmlFor="username"
                  >
                    Nombre de usuario
                  </label>
                  <input
                    className="w-full bg-[#0D1117] border border-[#313840] rounded-md px-3 py-2 text-[#F9FCFF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="Ingresa tu nombre de usuario"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label 
                    className="text-xs font-medium uppercase tracking-wide text-gray-400" 
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <input
                    className="w-full bg-[#0D1117] border border-[#313840] rounded-md px-3 py-2 text-[#F9FCFF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="Ingresa tu contraseña"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    className="flex-1 bg-[#212830] hover:bg-[#2F3349] border border-[#313840] text-[#F9FCFF] px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Iniciando...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                  <Link 
                    to="/registro" 
                    className={`flex-1 bg-[#0D1117] hover:bg-[#161B22] border border-[#313840] text-[#F9FCFF] px-4 py-2 rounded-md font-medium transition-colors text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLoading ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Registrarse
                  </Link>
                </div>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿Problemas para acceder?{' '}
                <Link 
                  to="/recuperar" 
                  className={`text-blue-400 hover:text-blue-300 transition-colors ${
                    isLoading ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  Recuperar cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUsuario;