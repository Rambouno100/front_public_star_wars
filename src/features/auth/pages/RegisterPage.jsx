import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context';
import { Eye, EyeOff } from 'lucide-react';
import client from '../../../shared/api/client';

const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif";

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 28 }}>
    <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#a3a3a3', display: 'block', marginBottom: 8 }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: '1px solid #e5e5e5',
  padding: '12px 0', fontSize: 14, color: '#0a0a0a',
  outline: 'none', fontFamily: font, transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const RegisterPage = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const focus = e => { e.target.style.borderBottomColor = '#0a0a0a'; };
  const blur = e => { e.target.style.borderBottomColor = '#e5e5e5'; };

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await client.post('/registro/', formData);
      const { data } = await client.post('/login/', { username: formData.username, password: formData.password });
      if (data.access) { login(data.access, data.refresh); navigate('/'); }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0]?.msg : detail || 'Error durante el registro. Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: font, padding: '60px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 24, height: 1, background: '#a3a3a3' }} />
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#737373' }}>
            Armalo · Registro
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#0a0a0a', marginBottom: 8 }}>
          Crea tu <strong style={{ fontWeight: 600 }}>cuenta.</strong>
        </h1>
        <p style={{ fontSize: 14, color: '#737373', marginBottom: 40, lineHeight: 1.6 }}>
          Accede a precios exclusivos y seguimiento de tus pedidos.
        </p>

        {error && (
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderLeft: '3px solid #0a0a0a', padding: '12px 16px', marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: '#525252', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Nombres">
              <input style={inputStyle} type="text" name="first_name" value={formData.first_name} onChange={handleChange} required disabled={loading} placeholder="José" onFocus={focus} onBlur={blur} />
            </Field>
            <Field label="Apellidos">
              <input style={inputStyle} type="text" name="last_name" value={formData.last_name} onChange={handleChange} required disabled={loading} placeholder="García" onFocus={focus} onBlur={blur} />
            </Field>
          </div>

          <Field label="Usuario">
            <input style={inputStyle} type="text" name="username" value={formData.username} onChange={handleChange} required disabled={loading} placeholder="josegarcia" onFocus={focus} onBlur={blur} />
          </Field>

          <Field label="Correo electrónico">
            <input style={inputStyle} type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} placeholder="jose@correo.com" onFocus={focus} onBlur={blur} />
          </Field>

          <Field label="Celular">
            <input style={inputStyle} type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={loading} placeholder="+51 987654321" onFocus={focus} onBlur={blur} />
          </Field>

          <Field label="Contraseña">
            <div style={{ position: 'relative' }}>
              <input style={inputStyle} type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required disabled={loading} minLength={6} placeholder="Mínimo 6 caracteres" onFocus={focus} onBlur={blur} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a3a3a3', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px 28px', background: loading ? '#737373' : '#0a0a0a', color: '#fafafa', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', fontFamily: font, transition: 'background 0.2s', marginTop: 8 }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ height: 1, background: '#e5e5e5', margin: '32px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#737373' }}>¿Ya tienes cuenta?</span>
          <Link to="/login" style={{ fontSize: 13, fontWeight: 500, color: '#0a0a0a', textDecoration: 'none' }}>Ingresar →</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
