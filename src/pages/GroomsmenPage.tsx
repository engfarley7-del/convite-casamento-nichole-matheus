import React from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { PhotoSlot } from '../components/PhotoSlot.tsx';
import { Monogram } from '../components/Monogram.tsx';
import { CheckSquare, Clock, Heart, Sparkles, Shield, Compass } from 'lucide-react';

interface GroomsmenPageProps {
  onNavigate: (path: string) => void;
}

export const GroomsmenPage: React.FC<GroomsmenPageProps> = ({ onNavigate }) => {
  const { settings, photos } = useWedding();

  const attireItems = [
    {
      title: 'Blazer Cinza Claro',
      tag: 'Cor Oficial',
      description: 'Corte alinhado, tecido leve em tom cinza claro elegante.',
      tip: 'Harmoniza perfeitamente com a paleta campestre.',
      icon: '👔',
    },
    {
      title: 'Gravata Country',
      tag: 'Obrigatório',
      description: 'Gravata ponta fina ou bolo tie (gravata texana de couro com pingente).',
      tip: 'Toque autêntico e rústico.',
      icon: '🎗️',
    },
    {
      title: 'Chapéu de Cowboy',
      tag: 'Obrigatório',
      description: 'Modelo clássico em feltro ou palha refinada na cor clara, bege ou cinza.',
      tip: 'Indispensável para o cortejo e fotos no campo.',
      icon: '🤠',
    },
    {
      title: 'Bota Country',
      tag: 'Obrigatório',
      description: 'Bota texana ou bota cano médio em couro legítimo limpa e engraxada.',
      tip: 'Conforto total para o gramado do sítio.',
      icon: '👢',
    },
    {
      title: 'Calça Jeans Alinhada',
      tag: 'Obrigatório',
      description: 'Jeans escuro (azul marinho ou índigo tradicional), corte reto, sem rasgos.',
      tip: 'Acompanhada de cinto de couro com fivela discreta.',
      icon: '👖',
    },
  ];

  return (
    <div className="w-full min-h-screen pb-16 flex flex-col items-center px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6 pt-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <Monogram size={44} variant="pinkCoral" />
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#B8005C]">
            Página Exclusiva · Padrinhos
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C24]">
            Padrinhos
          </h1>
          <p className="font-script text-3xl text-[#785E54]">
            {settings.coupleNames}
          </p>
        </div>

        {/* Banner with Photo 13 (fallback Photo 1) */}
        <div className="w-full">
          <PhotoSlot
            slotId={13}
            imageUrl={photos['13'] || photos['1']}
            alt="Banner Padrinhos Nichole & Matheus"
            className="w-full shadow-md"
          />
        </div>

        {/* Gratitude Message from Couple */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#FCE8F0] flex items-center justify-center mx-auto text-[#EC008C]">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <p className="font-serif italic text-base sm:text-lg text-[#3D2C24] leading-relaxed">
            "{settings.groomsmenMessage}"
          </p>
          <p className="font-script text-2xl text-[#C80064]">
            Com gratidão, {settings.coupleNames}
          </p>
        </div>

        {/* Attire Color Highlight Card */}
        <div className="w-full bg-[#FAF5F4] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#B8005C]">
                Paleta Oficial do Padrinho
              </span>
              <h2 className="font-serif font-bold text-xl text-[#3D2C24]">
                Traje: {settings.groomsmenAttireColor || 'Cinza Claro'}
              </h2>
            </div>
            {/* Color Swatch Circle */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#D1D5DB] border-2 border-white shadow-sm ring-1 ring-[#9CA3AF]" title="Cinza Claro" />
              <div className="w-9 h-9 rounded-full bg-[#E5E7EB] border-2 border-white shadow-sm ring-1 ring-[#D1D5DB]" title="Cinza Suave" />
            </div>
          </div>
          <p className="text-xs text-[#5A463C]">
            Escolhemos a tonalidade cinza claro para destacar vocês com sofisticação
            e harmonizar perfeitamente com o Pink e o Coral das nossas madrinhas.
          </p>
        </div>

        {/* Mandatory Items Cards */}
        <div className="w-full space-y-3">
          <div className="text-left">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#D94E00]">
              Checklist de Vestimenta
            </span>
            <h3 className="font-serif font-bold text-lg text-[#3D2C24]">
              5 Itens Obrigatórios
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attireItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-2 hover:border-[#EC008C]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#B8005C]">
                    {item.tag}
                  </span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#3D2C24]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#5A463C] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#EFE0E5] text-[11px] text-[#785E54] font-sans italic">
                  {item.tip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrival Time and Guidelines Card */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#3D2C24]">
            <Clock className="w-5 h-5 text-[#FA6800]" />
            <h3 className="font-serif font-bold text-base text-[#3D2C24]">
              Horário de Chegada e Orientações Extras
            </h3>
          </div>

          <div className="p-3.5 bg-[#FAF5F4] rounded-xl border border-[#EFE0E5] text-xs text-[#5A463C] leading-relaxed whitespace-pre-line">
            {settings.groomsmenGuidelines}
          </div>
        </div>

        {/* RSVP Action Button */}
        <div className="w-full pt-2">
          <button
            onClick={() => onNavigate('/presenca')}
            className="w-full py-4 px-6 btn-pink-coral rounded-2xl font-serif font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckSquare className="w-5 h-5" />
            <span>Confirmar Minha Presença Como Padrinho</span>
          </button>
        </div>
      </div>
    </div>
  );
};
