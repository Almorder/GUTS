import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Activity, BarChart2, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NavBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { to: '/', icon: <Home size={22} strokeWidth={2.5} /> },
    { to: '/roadmap', icon: <Map size={22} strokeWidth={2.5} /> },
    { to: '/bodymap', icon: <Activity size={22} strokeWidth={2.5} /> },
    { to: '/stats', icon: <BarChart2 size={22} strokeWidth={2.5} /> },
    { to: '/planner', icon: <Calendar size={22} strokeWidth={2.5} /> },
    { to: '/settings', icon: <Settings size={22} strokeWidth={2.5} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-brand-bg/85 backdrop-blur-xl border-b border-brand-border/50 z-30 pt-safe transition-colors duration-300">
      <div className="max-w-md mx-auto flex flex-col px-5 py-3">
        {/* Logo Section */}
        <div className="flex justify-between items-end mb-4">
          <h1 className="font-serif text-3xl font-bold tracking-tighter leading-none">
            G<span className="text-brand-accent">.</span>U<span className="text-brand-accent">.</span>T<span className="text-brand-accent">.</span>S
          </h1>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-text/30 mb-1">
            Zero Gravity
          </span>
        </div>
        
        {/* Navigation Links */}
        <div className="flex items-center justify-between relative px-2">
          {links.map((link) => {
            const isActive = currentPath === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className="relative p-2 rounded-full flex flex-col items-center justify-center outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bubble"
                    className="absolute inset-0 bg-brand-text/5 dark:bg-brand-text/10 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
                  className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-brand-accent' : 'text-brand-text/30'}`}
                >
                  {link.icon}
                </motion.div>
                {isActive && (
                   <motion.div 
                     layoutId="nav-indicator"
                     className="absolute -bottom-3 w-1 h-1 bg-brand-accent rounded-full"
                     transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                   />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
