
import React from 'react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  logoSrcs: string[];
}

const Navbar: React.FC<NavbarProps> = ({ logoSrcs }) => {
  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-slate-300 dark:bg-gray-900/70 dark:border-slate-700 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center py-3">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
            {logoSrcs.map((src, index) => (
              <img 
                key={index} 
                src={src} 
                alt={`Logo ${index + 1}`} 
                style={{ width: 75, height: 'auto', maxWidth: '100%' }}
                className="h-7 sm:h-8 md:h-10 object-contain" 
              />
            ))}
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <a href="#/" className="text-md sm:text-lg md:text-xl font-bold text-primary whitespace-nowrap hover:opacity-80 transition-opacity">
              Analisis Faktor Skor Peserta
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;