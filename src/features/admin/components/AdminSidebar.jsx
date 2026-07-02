import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, FileText, LogOut, LayoutGrid, Sparkles } from 'lucide-react';
import { useMe, useLogout } from '../../auth/hooks/useAuth';

const NAV = [
  { to: '/admin/productos', icon: Package,     label: 'Productos'    },
  { to: '/admin/ordenes',   icon: ShoppingBag, label: 'Órdenes'      },
  { to: '/admin/cotizar',   icon: FileText,    label: 'Cotizar'      },
  { to: '/admin/asistente', icon: Sparkles,    label: 'Asistente IA' },
];

const AdminSidebar = () => {
  const { data: user } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  const initials = (user?.full_name || user?.username || 'A')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-56 flex-col bg-brand-panel border-r border-brand-border select-none shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-brand-border">
        <div className="flex h-7 w-7 items-center justify-center bg-brand-accent">
          <LayoutGrid size={14} className="text-brand-bg" />
        </div>
        <span className="font-display text-[13px] font-semibold text-brand-text tracking-tight">
          Drop<strong>Hack</strong> Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
        <p className="px-2 pb-1 pt-2 font-mono text-[9px] tracking-[0.18em] uppercase text-brand-faint">
          Panel
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent'
                  : 'text-brand-muted hover:bg-white/5 hover:text-brand-text'
              }`
            }
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="my-3 border-t border-brand-border" />
        <p className="px-2 pb-1 font-mono text-[9px] tracking-[0.18em] uppercase text-brand-faint">
          Tienda
        </p>
        <a
          href="/catalogo"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium text-brand-muted hover:bg-white/5 hover:text-brand-text transition-colors"
        >
          <LayoutGrid size={15} strokeWidth={1.8} />
          Ver tienda
        </a>
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-2.5 border-t border-brand-border p-3">
        {/* Avatar */}
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-brand-border-md">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.full_name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-surface font-mono text-[11px] font-semibold text-brand-text">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[12px] font-medium text-brand-text">
            {user?.full_name || user?.username}
          </span>
          <span className="truncate text-[11px] text-brand-muted">{user?.email}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Salir"
          className="rounded p-1.5 text-brand-muted transition-colors hover:bg-white/8 hover:text-brand-red"
        >
          <LogOut size={14} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
