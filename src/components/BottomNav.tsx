import React from 'react';
import { Home, Heart, Calendar, CheckSquare, Gift } from 'lucide-react';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath, onNavigate }) => {
  // If we are on /padrinhos, /madrinhas, or /admin, do not render or adapt appropriately
  const isHiddenPage = currentPath === '/padrinhos' || currentPath === '/madrinhas' || currentPath === '/admin';

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/nossa-historia', label: 'História', icon: Heart },
    { path: '/detalhes', label: 'Detalhes', icon: Calendar },
    { path: '/presenca', label: 'Presença', icon: CheckSquare },
    { path: '/presentes', label: 'Presentes', icon: Gift },
  ];

  if (isHiddenPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF8F3]/95 backdrop-blur-md border-t border-[#E8DEC7] px-4 py-2 sm:hidden flex items-center justify-between safe-area-bottom">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1.5 text-xs font-medium text-[#5C3A21] hover:text-[#8B2626] py-1"
        >
          <Home className="w-4 h-4" />
          <span>Voltar ao Convite Principal</span>
        </button>
        {currentPath === '/admin' ? (
          <span className="text-[11px] text-[#8C6D58] font-medium">Painel Admin</span>
        ) : (
          <button
            onClick={() => onNavigate('/presenca')}
            className="px-3 py-1 text-xs font-semibold bg-[#5C3A21] text-[#FDFBF7] rounded-full shadow-xs"
          >
            Confirmar Presença
          </button>
        )}
      </div>
    );
  }

  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#E8DDD0] shadow-[0_-4px_20px_rgba(92,58,33,0.06)] md:hidden"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
                isActive ? 'text-[#8B2626]' : 'text-[#7D6453] hover:text-[#4A2F1B]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.7]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#8B2626]" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-all ${
                  isActive ? 'font-bold text-[#8B2626]' : 'text-[#7D6453]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
