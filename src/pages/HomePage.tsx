import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { EnvelopeOpening } from '../components/EnvelopeOpening.tsx';
import { Countdown } from '../components/Countdown.tsx';
import { Monogram } from '../components/Monogram.tsx';
import { CheckSquare, Gift, MapPin, Heart } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { settings, photos } = useWedding();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState<boolean>(false);

  return (
    <div className="w-full min-h-screen pb-12 flex flex-col items-center">
      {/* Hero / Envelope Section — fits inside initial 100dvh mobile viewport */}
      <section className="w-full flex flex-col items-center pt-0.5 sm:pt-3">
        <EnvelopeOpening
          settings={settings}
          coverPhotoUrl={photos['1']}
          isOpen={isEnvelopeOpen}
          setIsOpen={setIsEnvelopeOpen}
        />
      </section>

      {/* Additional Wedding Details Below the Fold */}
      <section className="w-full max-w-xl mx-auto px-4 mt-8 flex flex-col items-center text-center space-y-6">
        {/* Monogram & Title */}
        <div className="flex flex-col items-center">
          <Monogram size={46} variant="pinkCoral" />
          <h2 className="font-script text-4xl sm:text-5xl text-[#3D2C24] mt-2">
            {settings.coupleNames}
          </h2>
          <div className="flex items-center gap-2 text-xs font-serif text-[#785E54] mt-1">
            <span>18 de Julho de 2027</span>
            <span className="text-[#EC008C]" aria-hidden="true">·</span>
            <span>Cerimônia às {settings.ceremonyTime}</span>
          </div>
        </div>

        {/* Romantic Bible / Country Quote */}
        <div className="w-full p-5 bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl shadow-xs relative">
          <Heart className="w-5 h-5 text-[#EC008C] mx-auto mb-2 opacity-90 fill-current" />
          <blockquote className="font-serif italic text-sm sm:text-base text-[#3D2C24] leading-relaxed">
            "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito."
          </blockquote>
          <cite className="block text-[11px] font-sans font-semibold tracking-wider text-[#B8005C] uppercase mt-2 not-italic">
            Colossenses 3:14
          </cite>
        </div>

        {/* Live Countdown */}
        <div className="w-full flex flex-col items-center py-2">
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#785E54] mb-2">
            Contagem Regressiva para o Nosso "Sim"
          </span>
          <Countdown
            targetDateStr={settings.weddingDate}
            targetTimeStr={settings.ceremonyTime}
          />
        </div>

        {/* Action Cards (Mobile-first large touch targets in Pink & Coral) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => onNavigate('/presenca')}
            className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-4 btn-pink-coral rounded-2xl shadow-md transition-all active:scale-[0.98] min-h-[56px]"
          >
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="text-left sm:text-center">
              <span className="block font-serif font-bold text-sm">Confirmar Presença</span>
              <span className="text-[11px] text-white/90">RSVP até 18/06/2027</span>
            </div>
            <span className="text-xs sm:hidden font-bold">→</span>
          </button>

          <button
            onClick={() => onNavigate('/presentes')}
            className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-4 bg-[#FCFBF9] hover:bg-[#FDF4F7] text-[#3D2C24] border border-[#F0D5DC] rounded-2xl shadow-xs transition-all active:scale-[0.98] min-h-[56px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#FCE8F0] flex items-center justify-center shrink-0 text-[#C80064]">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-left sm:text-center">
              <span className="block font-serif font-bold text-sm">Lista de Presentes</span>
              <span className="text-[11px] text-[#785E54]">Escolha um item especial</span>
            </div>
            <span className="text-xs sm:hidden text-[#C80064] font-bold">→</span>
          </button>

          <button
            onClick={() => onNavigate('/detalhes')}
            className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-4 bg-[#FCFBF9] hover:bg-[#FFF5EC] text-[#3D2C24] border border-[#F2D9CB] rounded-2xl shadow-xs transition-all active:scale-[0.98] min-h-[56px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#FFF0E2] flex items-center justify-center shrink-0 text-[#D94E00]">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-left sm:text-center">
              <span className="block font-serif font-bold text-sm">Como Chegar</span>
              <span className="text-[11px] text-[#785E54]">Local, mapa e horários</span>
            </div>
            <span className="text-xs sm:hidden text-[#D94E00] font-bold">→</span>
          </button>
        </div>

        {/* Footer info */}
        <footer className="w-full pt-8 pb-4 border-t border-[#EAD9DF] text-center text-[#785E54] space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="font-script text-2xl text-[#3D2C24]">{settings.coupleNames}</span>
          </div>
          <p className="text-[11px]">
            18 de Julho de 2027 · {settings.locationName}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/admin')}
              className="text-[11px] text-[#B8005C] hover:text-[#3D2C24] underline"
            >
              Área Administrativa (Noivos)
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};
