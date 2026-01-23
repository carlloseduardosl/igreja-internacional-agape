
import React, { useState } from 'react';
import { AgapeLogo } from '../constants';

interface NavbarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'history', label: 'História' },
    { id: 'schedule', label: 'Programação' },
    { id: 'events', label: 'Eventos' },
    { id: 'ministries', label: 'Ministérios' },
    { id: 'cells', label: 'Células' },
    { id: 'teaching', label: 'Ensino' },
    { id: 'booking', label: 'Atendimento' },
    { id: 'donations', label: 'Doações' },
  ];

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center focus:outline-none group -ml-2"
            >
              <div className="flex items-center justify-center transition-transform group-hover:scale-105">
                 <AgapeLogo className="h-10 w-auto" />
              </div>
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 overflow-x-auto lg:overflow-visible">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-2 lg:px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSection === item.id ? 'text-agape-red border-b-2 border-agape-red font-bold' : 'text-gray-600 hover:text-agape-red'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-agape-red focus:outline-none"
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

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-slideIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 text-base font-semibold ${
                  activeSection === item.id ? 'text-agape-red bg-red-50' : 'text-gray-600'
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
