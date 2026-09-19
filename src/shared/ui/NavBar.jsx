import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useCart } from '../../features/cart/hooks/useCart';
import { useAuthContext } from '../../features/auth/context';
import { useMe } from '../../features/auth/hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import logoUrl from '../../assets/logo.svg';   // ← LOGO DE ORIGEN ÚNICO (cámbialo aquí)

/* ── Design tokens (temáticos — ver src/index.css) ─────────────── */
const INK      = 'var(--bg-ink)';
const HAIRLINE = 'var(--hairline)';
const HAIRLINE_STRONG = 'var(--hairline-strong)';
const CREAM    = 'var(--color-cream)';
const MUTED    = 'var(--color-muted)';
const FAINT    = 'var(--color-faint)';
const ACCENT   = 'var(--accent)';

const fDisplay = "'Space Grotesk', system-ui, sans-serif";
const fBody    = "'Inter', system-ui, sans-serif";

const NAV_HEIGHT = 60;

/* ── Hook breakpoint ─────────────────────────────────────────── */
const useBreakpoint = () => {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 820 };
};

const NAV_LINKS = [
  { to: '/',            label: 'Inicio' },
  { to: '/catalogo',    label: 'Catálogo' },
  { to: '/mis-pedidos', label: 'Pedidos' },
];

/* ── Logo: imagen de origen único (src/assets/logo.svg), sin wordmark ── */
const Logo = () => (
  <Link
    to="/"
    style={{
      textDecoration: 'none', flexShrink: 0,
      display: 'flex', alignItems: 'center',
    }}
  >
    <img src={logoUrl} alt="Armalo" width="86" height="33"
      style={{ display: 'block', flexShrink: 0 }} />
  </Link>
);

/* ── Nav link (Inter, peso 500, hairline acento al activar) ──── */
const NavItem = ({ to, label, isActive, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: fBody, fontSize: 14, fontWeight: 500,
        letterSpacing: '-0.005em',
        color: isActive ? CREAM : (hov ? CREAM : MUTED),
        textDecoration: 'none',
        padding: `0 16px`, height: NAV_HEIGHT,
        display: 'inline-flex', alignItems: 'center',
        position: 'relative',
        transition: 'color 0.2s',
      }}
    >
      {label}
      <span style={{
        position: 'absolute', left: 16, right: 16, bottom: -1,
        height: 2, background: ACCENT,
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left center',
        transition: 'opacity 0.2s, transform 0.2s',
      }} />
    </Link>
  );
};

/* ── Action button (Inter weight 500) ────────────────────────── */
const ActionBtn = ({ onClick, children, primary = false }) => {
  const [hov, setHov] = useState(false);
  const base = {
    fontFamily: fBody, fontSize: 13, fontWeight: 500,
    letterSpacing: '-0.005em',
    cursor: 'pointer',
    transition: 'all 0.2s',
    height: 34, padding: '0 18px',
    display: 'inline-flex', alignItems: 'center',
  };
  const style = primary
    ? {
        ...base,
        background: hov ? ACCENT : CREAM,
        color: INK, border: 'none',
        fontWeight: 600,
      }
    : {
        ...base,
        background: 'transparent',
        color: hov ? CREAM : MUTED,
        border: 'none',
      };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={style}
    >
      {children}
    </button>
  );
};

/* ── Shopping bag icon (más limpio que el cart) ──────────────── */
const BagIcon = ({ size = 19 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 7h14l-1.2 13.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 7z"/>
    <path d="M9 7V5.5a3 3 0 0 1 6 0V7"/>
  </svg>
);

/* ── Toggle de tema claro/oscuro ─────────────────────────────── */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [hov, setHov] = useState(false);
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? CREAM : MUTED, transition: 'color 0.2s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {isDark ? <Sun size={18} strokeWidth={1.6} /> : <Moon size={18} strokeWidth={1.6} />}
    </button>
  );
};

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { logout } = useAuthContext();
  const { data: user } = useMe();
  const isLoggedIn = !!user;
  const username   = user?.username || localStorage.getItem('username') || '';
  const { cartItemCount } = useCart();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setMenuOpen(false);
  }, [logout, navigate]);

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const active = p => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: NAV_HEIGHT,
        background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: `1px solid ${scrolled ? HAIRLINE_STRONG : HAIRLINE}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 40px)',
          height: '100%',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
        }}>

          {/* Logo */}
          <Logo />

          {/* Center links — desktop */}
          {!isMobile && (
            <div style={{
              display: 'flex', alignItems: 'center',
              position: 'absolute', left: '50%',
              transform: 'translateX(-50%)',
              height: '100%',
            }}>
              {NAV_LINKS.map(l => (
                <NavItem key={l.to} to={l.to} label={l.label} isActive={active(l.to)} />
              ))}
            </div>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexShrink: 0 }}>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Auth — desktop */}
            {!isMobile && (
              isLoggedIn ? (
                <>
                  {/* Avatar */}
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0,
                    border: `1px solid ${HAIRLINE_STRONG}`,
                  }}>
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={username}
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--hairline-strong)',
                        fontFamily: fBody, fontSize: 11, fontWeight: 600, color: CREAM,
                      }}>
                        {username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontFamily: fBody, fontSize: 13, fontWeight: 400,
                    color: FAINT,
                  }}>
                    {username}
                  </span>
                  <ActionBtn onClick={handleLogout}>Salir</ActionBtn>
                </>
              ) : (
                <>
                  <ActionBtn onClick={() => navigate('/login')}>Login</ActionBtn>
                  <ActionBtn primary onClick={() => navigate('/registro')}>Registro</ActionBtn>
                </>
              )
            )}

            {/* Cart */}
            <Link
              to="/carrito"
              aria-label="Carrito"
              style={{
                position: 'relative', color: MUTED,
                display: 'flex', alignItems: 'center',
                textDecoration: 'none',
                transition: 'color 0.2s',
                height: 36, padding: '0 6px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = CREAM}
              onMouseLeave={e => e.currentTarget.style.color = MUTED}
            >
              <BagIcon />
              {cartItemCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: -4,
                  background: ACCENT, color: INK,
                  fontFamily: fBody, fontSize: 10, fontWeight: 700,
                  minWidth: 18, height: 18, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px',
                  letterSpacing: 0,
                  border: `2px solid ${scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)'}`,
                  boxSizing: 'content-box',
                }}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Hamburger — mobile */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menú"
                style={{
                  background: 'none', border: 'none', color: MUTED,
                  cursor: 'pointer', padding: 0, display: 'flex',
                  height: 36, width: 36, alignItems: 'center', justifyContent: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = CREAM}
                onMouseLeave={e => e.currentTarget.style.color = MUTED}
              >
                {menuOpen ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <line x1="3" y1="3" x2="15" y2="15"/>
                    <line x1="15" y1="3" x2="3" y2="15"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <line x1="3" y1="5" x2="15" y2="5"/>
                    <line x1="3" y1="13" x2="15" y2="13"/>
                  </svg>
                )}
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: NAV_HEIGHT }} />

      {/* Mobile dropdown */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: NAV_HEIGHT, left: 0, right: 0, zIndex: 199,
          background: 'var(--nav-bg-scrolled)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.2s, transform 0.2s',
          padding: '8px 0 24px',
          borderBottom: `1px solid ${HAIRLINE_STRONG}`,
        }}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: fBody, fontSize: 16, fontWeight: 500,
                color: active(l.to) ? CREAM : MUTED,
                textDecoration: 'none',
                padding: '18px 24px',
                borderBottom: `1px solid ${HAIRLINE}`,
              }}
            >
              {l.label}
              {active(l.to) && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: ACCENT,
                }} />
              )}
            </Link>
          ))}
          <div style={{ padding: '20px 24px 0', display: 'flex', gap: 10 }}>
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => { navigate('/login'); setMenuOpen(false); }}
                  style={{
                    flex: 1, fontFamily: fBody, fontSize: 14, fontWeight: 500,
                    color: CREAM, background: 'transparent',
                    border: `1px solid ${HAIRLINE_STRONG}`,
                    padding: '14px 0', cursor: 'pointer',
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => { navigate('/registro'); setMenuOpen(false); }}
                  style={{
                    flex: 1, fontFamily: fBody, fontSize: 14, fontWeight: 600,
                    background: CREAM, color: INK,
                    border: 'none',
                    padding: '14px 0', cursor: 'pointer',
                  }}
                >
                  Registro
                </button>
              </>
            ) : (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', width: '100%',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0,
                    border: `1px solid ${HAIRLINE_STRONG}`,
                  }}>
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={username}
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--hairline-strong)',
                        fontFamily: fBody, fontSize: 10, fontWeight: 600, color: CREAM,
                      }}>
                        {username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span style={{ fontFamily: fBody, fontSize: 13, color: FAINT }}>{username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    fontFamily: fBody, fontSize: 14, fontWeight: 500,
                    color: MUTED, background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0,
                  }}
                >
                  Salir →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
