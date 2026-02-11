import React from 'react';
import { GlassPane } from './GlassPane';
import { UserCircle, Sun, Moon, Sparkles } from 'lucide-react';

interface NavbarProps {
  theme?: 'default' | 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme = 'default', onToggleTheme }) => {
  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={18} className="text-amber-400" />;
      case 'dark': return <Moon size={18} className="text-blue-200" />;
      default: return <Sparkles size={18} className="text-purple-400" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Midnight';
      default: return 'Liquid';
    }
  };

  return (
    <GlassPane className="h-12 rounded-xl flex items-center justify-between px-6 sticky top-0 z-50 mb-4 mx-4 mt-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white tracking-widest text-[10px] uppercase opacity-60">Handl</span>
      </div>
      
      <div className="flex items-center gap-4">
        {onToggleTheme && (
          <button 
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/5 group"
            title={`Current Theme: ${getThemeLabel()}`}
          >
            <span className="group-hover:rotate-12 transition-transform duration-300">
              {getThemeIcon()}
            </span>
            <span className="text-[10px] text-glass-muted uppercase tracking-wider font-medium min-w-[50px] text-center">
              {getThemeLabel()}
            </span>
          </button>
        )}
        <div className="h-4 w-px bg-white/10"></div>
        <button className="text-glass-muted hover:text-white transition-colors">
          <UserCircle className="w-5 h-5" />
        </button>
      </div>
    </GlassPane>
  );
};