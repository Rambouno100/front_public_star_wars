import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '../hooks/useAuth';

const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const LoginPage = () => {
  const navigate = useNavigate();
  const googleBtn = useRef(null);
  const [error, setError] = useState('');
  const { mutate: googleLogin, isPending } = useGoogleLogin();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => {
        setError('');
        googleLogin(credential, {
          onSuccess: () => navigate('/'),
          onError: () => setError('No se pudo iniciar sesión. Intenta de nuevo.'),
        });
      },
    });
    window.google.accounts.id.renderButton(googleBtn.current, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'signin_with',
      shape: 'rectangular',
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#fafafa', fontFamily: font,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 24, height: 1, background: '#a3a3a3' }} />
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#737373' }}>
            Armalo · Acceso
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#0a0a0a', marginBottom: 8 }}>
          Bienvenido <strong style={{ fontWeight: 600 }}>de vuelta.</strong>
        </h1>
        <p style={{ fontSize: 14, color: '#737373', marginBottom: 40, lineHeight: 1.6 }}>
          Ingresa con tu cuenta de Google para ver tus pedidos.
        </p>

        {error && (
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderLeft: '3px solid #0a0a0a', padding: '12px 16px', marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: '#525252', margin: 0 }}>{error}</p>
          </div>
        )}

        {!GOOGLE_CLIENT_ID ? (
          <div style={{ padding: '16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, fontSize: 13, color: '#856404' }}>
            Configura <code>REACT_APP_GOOGLE_CLIENT_ID</code> en tu <code>.env</code> para habilitar el login.
          </div>
        ) : (
          <div ref={googleBtn} style={{ width: '100%', minHeight: 44, opacity: isPending ? 0.6 : 1, pointerEvents: isPending ? 'none' : 'auto' }} />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
