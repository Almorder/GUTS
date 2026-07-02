import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, BarChart2, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NavBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { to: '/', icon: <Home size={20} />, label: 'QG' },
    { to: '/roadmap', icon: <Map size={20} />, label: 'Roadmap' },
    { to: '/stats', icon: <BarChart2 size={20} />, label: 'Stats' },
    { to: '/planner', icon: <Calendar size={20} />, label: 'Planner' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Params' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-brand-bg/95 backdrop-blur border-b border-brand-border z-30 pt-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-3 relative">
        {links.map((link) => {
          const isActive = currentPath === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative flex flex-col items-center gap-1 p-2 w-16"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-brand-accent/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1, color: isActive ? '#CC460C' : '#8f8c85' }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
                className="relative z-10 flex flex-col items-center gap-1"
              >
                {link.icon}
                <span className="text-[9px] uppercase font-bold tracking-widest">{link.label}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
