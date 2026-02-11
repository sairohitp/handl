import React from 'react';

interface GlassPaneProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassPane: React.FC<GlassPaneProps> = ({ children, className = '' }) => {
  return (
    <div className={`backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transform-gpu ${className}`}>
      {children}
    </div>
  );
};

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ 
  children, 
  className = '', 
  variant = 'secondary',
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium tracking-wide";
  const variants = {
    primary: "bg-blue-500/80 hover:bg-blue-500/90 text-white shadow-lg shadow-blue-500/20 backdrop-blur-md border border-blue-400/20",
    secondary: "bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] hover:border-white/[0.2]"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};