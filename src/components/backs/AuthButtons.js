import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Flame, ShoppingCart, Package, UserPlus, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { cn } from '../lib/utils';
import axios from 'axios';

const navigationConfig = [
  { path: '/', icon: Home, label: 'Inicio', ariaLabel: 'Ir a inicio' },
  { path: '/pulls', icon: Flame, label: 'Pulls', ariaLabel: 'Ver pulls' },
  { path: '/carrito', icon: ShoppingCart, label: 'Carrito', ariaLabel: 'Ver carrito' },
  { path: '/mis-pedidos', icon: Package, label: 'Pedidos', ariaLabel: 'Ver mis pedidos' }
];

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  exit: { opacity: 0, scale: 0.95 }
};

const menuVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: { 
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

// Memoized NavLink component for performance
const NavLink = memo(({ to, icon: Icon, label, ariaLabel, onClick }) => (
  <motion.button
    variants={buttonVariants}
    whileHover="hover"
    whileTap="tap"
    initial="initial"
    className={cn(
      "flex items-center gap-2 p-3 rounded-lg",
      "transition-colors duration-200",
      "hover:bg-gray-800/50 focus:outline-none focus:ring-2",
      "focus:ring-blue-500 focus:ring-opacity-50"
    )}
    onClick={() => onClick(to)}
    aria-label={ariaLabel}
  >
    <Icon size={24} className="text-gray-200" />
    <span className="md:hidden font-medium">{label}</span>
  </motion.button>
));

NavLink.displayName = 'NavLink';

// Memoized AuthButton component for performance
const AuthButton = memo(({ icon: Icon, label, onClick, variant = 'default' }) => (
  <motion.button
    variants={buttonVariants}
    whileHover="hover"
    whileTap="tap"
    initial="initial"
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg",
      "transition-all duration-200 font-medium",
      "focus:outline-none focus:ring-2 focus:ring-blue-500",
      variant === 'primary' && "bg-blue-600 hover:bg-blue-700 text-white",
      variant === 'default' && "bg-gray-800 hover:bg-gray-700 text-gray-200"
    )}
    aria-label={label}
  >
    <Icon size={20} />
    <span>{label}</span>
  </motion.button>
));

AuthButton.displayName = 'AuthButton';

const AuthButtons = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleNavigation = useCallback((path) => {
    navigate(path);
    setIsMenuOpen(false);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(false);
      setUsername('');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [navigate]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const storedUsername = localStorage.getItem('username');

      if (!accessToken) {
        setIsLoggedIn(false);
        return;
      }

      if (storedUsername) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/`,
          { headers: { 'Authorization': `Bearer ${accessToken}` }}
        );
        setIsLoggedIn(true);
        setUsername(response.data.username);
        localStorage.setItem('username', response.data.username);
      } catch (error) {
        handleLogout();
      }
    };

    checkAuthStatus();
  }, [handleLogout]);

  // Close menu when screen size changes
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="relative flex items-center gap-4">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        {navigationConfig.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            icon={item.icon}
            label={item.label}
            ariaLabel={item.ariaLabel}
            onClick={handleNavigation}
          />
        ))}
      </div>

      {/* Desktop Auth */}
      <div className="hidden md:flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <span className="text-lg font-medium text-gray-200">
              {username}
            </span>
            <AuthButton
              icon={LogOut}
              label="Salir"
              onClick={handleLogout}
            />
          </>
        ) : (
          <>
            <AuthButton
              icon={UserPlus}
              label="Registro"
              onClick={() => handleNavigation('/registro')}
            />
            <AuthButton
              icon={LogIn}
              label="Login"
              onClick={() => handleNavigation('/login')}
              variant="primary"
            />
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          initial="initial"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            "p-2 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "bg-gray-800 hover:bg-gray-700"
          )}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: 90 }}
              >
                <X size={24} className="text-gray-200" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: -90 }}
              >
                <Menu size={24} className="text-gray-200" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute right-0 top-16 w-64 p-4 rounded-lg shadow-lg z-50",
              "bg-gray-900 border border-gray-800"
            )}
            role="dialog"
            aria-label="Menú de navegación"
          >
            <div className="flex flex-col gap-2">
              {navigationConfig.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  ariaLabel={item.ariaLabel}
                  onClick={handleNavigation}
                />
              ))}
              
              <div className="border-t border-gray-800 my-2" />
              
              {isLoggedIn ? (
                <>
                  <div className="px-2 py-1">
                    <span className="text-lg font-medium text-gray-200">
                      {username}
                    </span>
                  </div>
                  <AuthButton
                    icon={LogOut}
                    label="Salir"
                    onClick={handleLogout}
                  />
                </>
              ) : (
                <>
                  <AuthButton
                    icon={UserPlus}
                    label="Registro"
                    onClick={() => handleNavigation('/registro')}
                  />
                  <AuthButton
                    icon={LogIn}
                    label="Login"
                    onClick={() => handleNavigation('/login')}
                    variant="primary"
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(AuthButtons);