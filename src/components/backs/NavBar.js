import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';

const useBreakpoint = () => {
  const [bp, setBp] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  useEffect(() => {
    const handler = () => setBp(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile: bp < 640 };
};

const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif";

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/mis-pedidos', label: 'Pedidos' },
];

const NavLink = ({ to, label, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: font,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: hovered ? '#fafafa' : 'rgba(255,255,255,0.45)',
        textDecoration: 'none',
        transition: 'color 0.2s',
      }}
    >
      {label}
    </Link>
  );
};

const NavBar = () => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartItemCount, updateCartCount, clearCartCount } = useCart();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    delete axios.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
    setUsername('');
    clearCartCount();
    navigate('/');
  }, [navigate, clearCartCount]);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('username');
      if (token && storedUser) {
        setIsLoggedIn(true);
        setUsername(storedUser);
        setIsInitialized(true);
        setTimeout(() => updateCartCount(), 100);
      } else if (token) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsLoggedIn(true);
          setUsername(res.data.username);
          localStorage.setItem('username', res.data.username);
          setIsInitialized(true);
          setTimeout(() => updateCartCount(), 100);
        } catch {
          handleLogout();
          setIsInitialized(true);
        }
      } else {
        clearCartCount();
        setIsInitialized(true);
      }
    };
    check();
  }, [handleLogout, updateCartCount, clearCartCount]);

  useEffect(() => {
    if (!isLoggedIn || !isInitialized) return;
    const id = setInterval(() => updateCartCount(), 30000);
    return () => clearInterval(id);
  }, [isLoggedIn, isInitialized, updateCartCount]);

  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  return (
    <>
      <nav style={{
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

            <span style={{
              fontFamily: font,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#fafafa',
            }}>
              Galactic Market
            </span>
          </Link>

          {/* Nav links — desktop */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              {NAV_LINKS.map(l => <NavLink key={l.to} to={l.to} label={l.label} />)}
            </div>
          )}

          {/* Derecha */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

            {/* Carrito */}
            <Link to="/carrito" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M6 2L3 6v14h18V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartItemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -7,
                  background: '#fafafa', color: '#0a0a0a',
                  fontFamily: font, fontSize: 9, fontWeight: 700,
                  minWidth: 15, height: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 2px',
                }}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth — desktop */}
            {!isMobile && (
              isLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: font, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.71)' }}>
                    {username}
                  </span>
                  <button
                    onClick={handleLogout}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                    style={{ fontFamily: font, fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                  >
                    Salir →
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    onClick={() => navigate('/login')}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                    style={{ fontFamily: font, fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/registro')}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    style={{ fontFamily: font, fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', background: '#fafafa', color: '#0a0a0a', border: 'none', padding: '8px 16px', cursor: 'pointer', transition: 'opacity 0.2s' }}
                  >
                    Registro
                  </button>
                </div>
              )
            )}

            {/* Hamburger — mobile */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {menuOpen
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"><line x1="2" y1="2" x2="14" y2="14" /><line x1="14" y1="2" x2="2" y2="14" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"><line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="12" x2="14" y2="12" /></svg>
                }
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Dropdown mobile */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 53, left: 0, right: 0,
          background: '#0a0a0a',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          zIndex: 49,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.2s, transform 0.2s',
          padding: '20px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NAV_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} label={l.label} onClick={() => setMenuOpen(false)} />
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
          {isLoggedIn ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: font, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>{username}</span>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ fontFamily: font, fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Salir →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{ fontFamily: font, fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '9px 0', cursor: 'pointer', flex: 1 }}>
                Login
              </button>
              <button onClick={() => { navigate('/registro'); setMenuOpen(false); }} style={{ fontFamily: font, fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', background: '#fafafa', color: '#0a0a0a', border: 'none', padding: '9px 0', cursor: 'pointer', flex: 1 }}>
                Registro
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NavBar;