import { NavLink } from 'react-router-dom';
import { Home, Map, BarChart2, Calendar, Settings } from 'lucide-react';

export default function NavBar() {
  const links = [
    { to: '/', icon: <Home size={20} />, label: 'QG' },
    { to: '/roadmap', icon: <Map size={20} />, label: 'Roadmap' },
    { to: '/stats', icon: <BarChart2 size={20} />, label: 'Stats' },
    { to: '/planner', icon: <Calendar size={20} />, label: 'Planner' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Params' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-brand-bg/95 backdrop-blur border-t border-brand-border z-30 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${
                isActive ? 'text-brand-accent' : 'text-brand-text/40 hover:text-brand-text/80'
              }`
            }
          >
            {link.icon}
            <span className="text-[9px] uppercase font-bold tracking-widest">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
