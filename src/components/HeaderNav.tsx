import React, { useState } from 'react';
import { Monogram } from './Monogram.tsx';
import { AudioPlayer } from './AudioPlayer.tsx';
import { Menu, X, Home, Heart, Calendar, CheckSquare, Gift } from 'lucide-react';

interface HeaderNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  coupleNames?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentPath,
  onNavigate,
  coupleNames = 'Nichole & Matheus',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Início', shortLabel: 'Início', icon: Home },
    { path: '/nossa-historia', label: 'Nossa História', shortLabel: 'História', icon: Heart },
    { path: '/detalhes', label: 'Detalhes & Local', shortLabel: 'Detalhes', icon: Calendar },
    { path: '/presenca', label: 'Presença (RSVP)', shortLabel: 'Presença', icon: CheckSquare },
    { path: '/presentes', label: 'Lista de Presentes', shortLabel: 'Presentes', icon: Gift },
  ];

  const handleMobileNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const isHiddenRoute =
    currentPath === '/padrinhos' ||
    currentPath === '/madrinhas' ||
    currentPath === '/admin' ||
    currentPath.startsWith('/convite/');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FCFBF9]/95 backdrop-blur-md border-b border-[#EAD9DF] shadow-2xs">
      {/* Primary Top Bar (Compact height on mobile to fit full envelope on 1 screen) */}
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 h-12 sm:h-15 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Brand Wordmark with Monogram */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 select-none group py-0.5"
        >
          <Monogram size={28} variant="pinkCoral" />
          <span className="font-script text-xl sm:text-3xl font-bold tracking-wide text-[#3D2C24] group-hover:text-[#C80064] transition-colors whitespace-nowrap">
            {coupleNames}
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6B534B]">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path)}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                currentPath === link.path
                  ? 'text-[#C80064] font-semibold'
                  : 'hover:text-[#C80064]'
              }`}
            >
              {link.shortLabel}
              {currentPath === link.path && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#EC008C] to-[#FA6800] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Audio Control & Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <AudioPlayer />

          {/* Desktop RSVP CTA Button */}
          <button
            onClick={() => onNavigate('/presenca')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold btn-pink-coral rounded-full shadow-sm transition-all whitespace-nowrap"
          >
            Confirmar Presença
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#FDF3F7] border border-[#F2C6D8] text-[#B8005C] hover:bg-[#FCE6F0] active:scale-95 transition-all shadow-2xs shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-[#C80064]" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Top Mobile Menu Bar (5 columns fitting 100% width cleanly) */}
      {!isHiddenRoute && (
        <div className="md:hidden w-full border-t border-[#EFE3E6] bg-[#FAF6F4]/95 px-1.5 py-1">
          <div className="grid grid-cols-5 gap-1 w-full max-w-lg mx-auto">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleMobileNav(link.path)}
                  className={`w-full py-1 px-0.5 rounded-lg text-[11px] font-serif font-bold text-center transition-all flex flex-col items-center justify-center min-w-0 ${
                    isActive
                      ? 'btn-pink-coral shadow-xs'
                      : 'bg-[#F1EAE7] text-[#5B443C] hover:bg-[#FCE8F1] hover:text-[#B8005C]'
                  }`}
                >
                  <span className="truncate w-full block text-center leading-tight">
                    {link.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Mobile Dropdown Drawer (Expanded Menu) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAD9DF] bg-[#FCFBF9] shadow-xl animate-in slide-in-from-top-2 duration-200 px-4 py-4 space-y-2">
          <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#B8005C] px-2 mb-1">
            Menu do Convite
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleMobileNav(link.path)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-sm font-serif transition-colors ${
                    isActive
                      ? 'bg-[#FDF1F6] text-[#B8005C] font-bold border border-[#F2C6D8]'
                      : 'text-[#4F382C] hover:bg-[#FDF5F2]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isActive ? 'btn-pink-coral' : 'bg-[#F5EBE8] text-[#C84B00]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 font-semibold">{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#EFE3E6] flex items-center justify-between text-xs text-[#785E54] px-2">
            <span className="font-script text-xl text-[#3D2C24]">{coupleNames}</span>
            <span className="font-medium text-[#C84B00]">18 de Julho de 2027</span>
          </div>
        </div>
      )}
    </header>
  );
};
