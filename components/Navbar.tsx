import React, { useState, useEffect } from 'react';
import { AgapeLogo } from '../constants';

interface NavbarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fecha o menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'history', label: 'História' },
    { id: 'schedule', label: 'Agenda' },
    { id: 'events', label: 'Eventos' },
    { id: 'ministries', label: 'Redes' },
    { id: 'cells', label: 'Células' },
    { id: 'teaching', label: 'Ensino' },
    { id: 'booking', label: 'Atendimento' },
    { id: 'donations', label: 'Doações' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => handleLinkClick('home')}
              className="flex items-center focus:outline-none group -ml-2"
              aria-label="Ir para o Início"
            >
              <div className="flex items-center justify-center transition-transform group-hover:scale-105">
                 <AgapeLogo className="h-8 w-auto" />
              </div>
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                className={`px-2 py-1.5 text-[10px] lg:text-[11px] font-bold uppercase tracking-widest transition-all rounded-full ${
                  activeSection === item.id 
                    ? 'text-agape-red bg-red-50' 
                    : 'text-gray-500 hover:text-agape-red hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-agape-red focus:outline-none p-2"
              aria-label={isOpen ? "Fechar Menu" : "Abrir Menu"}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-2xl animate-slideIn">
          <div className="px-4 pt-4 pb-6 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                className={`block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'text-agape-red bg-red-50' 
                    : 'text-gray-600 bg-gray-50/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;