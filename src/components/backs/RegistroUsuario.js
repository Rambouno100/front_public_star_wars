import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { User, Mail, Phone, Lock, Upload, Eye, EyeOff } from 'lucide-react';

const RegistroUsuario = () => {
 const { login } = useContext(AuthContext);
 const [formData, setFormData] = useState({
   username: '', email: '', password: '', phone: '', countrycode: '+51',
   first_name: '', last_name: '',
 });
 const [selectedImage, setSelectedImage] = useState(null);
 const [previewUrl, setPreviewUrl] = useState('');
 const [error, setError] = useState('');
 const [imageError, setImageError] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();

 const handleChange = (e) => {
   setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const validateImage = (file) => {
   const maxSize = 5 * 1024 * 1024;
   const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
   
   if (!allowedTypes.includes(file.type)) {
     setImageError('Formato debe ser JPG, PNG o WebP');
     return false;
   }
   if (file.size > maxSize) {
     setImageError('Imagen no debe superar 5MB');
     return false;
   }
   setImageError('');
   return true;
 };

 const handleImageChange = (e) => {
   const file = e.target.files[0];
   if (file && validateImage(file)) {
     setSelectedImage(file);
     setPreviewUrl(URL.createObjectURL(file));
   } else {
     e.target.value = '';
     setSelectedImage(null);
     setPreviewUrl('');
   }
 };

 const handlePhoneChange = (e) => {
   const { name, value } = e.target;
   if (name === 'countrycode' && /^\+?\d*$/.test(value) && value.length <= 4) {
     setFormData({ ...formData, countrycode: value });
   } else if (name === 'phone' && /^\d*$/.test(value) && value.length <= 9) {
     setFormData({ ...formData, phone: value });
   }
 };

 // Función para verificar o crear carrito después del registro/login
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
   setLoading(true);
   
   if (selectedImage && !validateImage(selectedImage)) {
     setLoading(false);
     return;
   }

   const submitFormData = new FormData();
   Object.keys(formData).forEach(key => submitFormData.append(key, formData[key]));
   if (selectedImage) submitFormData.append('img', selectedImage);

   try {
     // Paso 1: Registrar usuario
     const registroResponse = await axios.post(
       `${process.env.REACT_APP_API_URL}/registro/`,
       submitFormData,
       { headers: { 'Content-Type': 'multipart/form-data' } }
     );

     if (registroResponse.data) {
       // Paso 2: Login automático
       const loginResponse = await axios.post(
         `${process.env.REACT_APP_API_URL}/login/`,
         { username: formData.username, password: formData.password }
       );

       if (loginResponse.data.access) {
         // Paso 3: Establecer tokens de autenticación
         login(loginResponse.data.access, loginResponse.data.refresh);
         
         try {
           // Paso 4: Obtener datos del usuario (opcional)
           const userResponse = await axios.get(
             `${process.env.REACT_APP_API_URL}/user/`,
             { headers: { 'Authorization': `Bearer ${loginResponse.data.access}` } }
           );
           console.log('Usuario registrado y autenticado:', userResponse.data.username);
         } catch (userError) {
           console.error('Error fetching user data:', userError);
           // No es crítico, continuar con el proceso
         }

         try {
           // Paso 5: Verificar o crear carrito
           await verificarOCrearCarrito();
           console.log('Carrito verificado/creado exitosamente');
         } catch (cartError) {
           console.error('Error con el carrito:', cartError);
           // Mostrar advertencia pero permitir continuar
           setError('Advertencia: Hubo un problema al preparar tu carrito. Puedes continuar navegando.');
           // No hacer return aquí, permitir que el usuario acceda
         }

         // Paso 6: Navegar a la página principal
         navigate('/');
       }
     }
   } catch (error) {
     setError(error.response?.data?.error || 'Error durante el registro');
   } finally {
     setLoading(false);
   }
 };

 return (
   <div className="min-h-screen bg-[#010409] text-[#F9FCFF]">
     <div className="max-w-2xl mx-auto p-4">
       <div className="mb-6">
         <h1 className="text-2xl font-semibold text-[#F9FCFF]">Registro de Usuario</h1>
         <p className="text-gray-400 mt-1">Crea tu cuenta para comenzar</p>
       </div>

       <div className="bg-[#0D1117] border border-[#313840] rounded-lg">
         <form onSubmit={handleSubmit} className="p-6 space-y-6">
           {error && (
             <div className={`border rounded-lg p-3 ${
               error.includes('Advertencia') 
                 ? 'bg-yellow-900/20 border-yellow-800' 
                 : 'bg-red-900/20 border-red-800'
             }`}>
               <p className={`text-sm ${
                 error.includes('Advertencia') ? 'text-yellow-400' : 'text-red-400'
               }`}>
                 {error}
               </p>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                 Username
               </label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                   type="text"
                   name="username"
                   value={formData.username}
                   onChange={handleChange}
                   required
                   disabled={loading}
                   placeholder="Nombre de usuario"
                   className="w-full pl-10 pr-3 py-2 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                 Email
               </label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                   type="email"
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                   required
                   disabled={loading}
                   placeholder="ejemplo@correo.com"
                   className="w-full pl-10 pr-3 py-2 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                 />
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                 Nombres
               </label>
               <input
                 type="text"
                 name="first_name"
                 value={formData.first_name}
                 onChange={handleChange}
                 required
                 disabled={loading}
                 placeholder="Nombres"
                 className="w-full px-3 py-2 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
               />
             </div>

             <div className="space-y-2">
               <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                 Apellidos
               </label>
               <input
                 type="text"
                 name="last_name"
                 value={formData.last_name}
                 onChange={handleChange}
                 required
                 disabled={loading}
                 placeholder="Apellidos"
                 className="w-full px-3 py-2 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
               Celular
             </label>
             <div className="flex gap-2">
               <div className="relative w-24">
                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                   type="text"
                   name="countrycode"
                   value={formData.countrycode}
                   onChange={handlePhoneChange}
                   maxLength="4"
                   required
                   disabled={loading}
                   placeholder="+51"
                   className="w-full pl-10 pr-3 py-2 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                 />
               </div>
               <input
                 type="text"
                 name="phone"
                 value={formData.phone}
                 onChange={handlePhoneChange}
                 maxLength="9"
                 required
                 disabled={loading}
                 placeholder="999999999"
                 className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
               Contraseña
             </label>
             <div className="relative">
               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type={showPassword ? "text" : "password"}
                 name="password"
                 value={formData.password}
                 onChange={handleChange}
                 required
                 disabled={loading}
                 placeholder="Contraseña"
                 className="w-full pl-10 pr-10 py-2 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 disabled={loading}
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#F9FCFF] transition-colors disabled:opacity-50"
               >
                 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               </button>
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
               Imagen de perfil
             </label>
             <div className="relative">
               <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type="file"
                 name="img"
                 accept="image/jpeg,image/png,image/webp"
                 onChange={handleImageChange}
                 disabled={loading}
                 className="w-full pl-10 pr-3 py-2 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#212830] file:text-[#F9FCFF] file:text-sm hover:file:bg-[#2F3349] transition-colors disabled:opacity-50"
               />
             </div>
             {imageError && (
               <p className="text-red-400 text-sm">{imageError}</p>
             )}
             {previewUrl && (
               <div className="mt-3">
                 <img 
                   src={previewUrl} 
                   alt="Vista previa" 
                   className="w-24 h-24 object-cover rounded-lg border border-[#313840]"
                 />
               </div>
             )}
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-3 px-4 bg-[#212830] hover:bg-[#2F3349] border border-[#313840] rounded-lg text-[#F9FCFF] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
           >
             {loading ? (
               <>
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                 Registrando...
               </>
             ) : (
               'Registrarse'
             )}
           </button>
         </form>
       </div>
     </div>
   </div>
 );
};

export default RegistroUsuario;