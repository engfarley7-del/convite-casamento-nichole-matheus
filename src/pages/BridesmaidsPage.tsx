import React from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { PhotoSlot } from '../components/PhotoSlot.tsx';
import { Monogram } from '../components/Monogram.tsx';
import { CheckSquare, Clock, Heart, Sparkles } from 'lucide-react';

interface BridesmaidsPageProps {
  onNavigate: (path: string) => void;
}

export const BridesmaidsPage: React.FC<BridesmaidsPageProps> = ({ onNavigate }) => {
  const { settings, photos } = useWedding();

  const pinkPalette = settings.palettes?.pink || {
    name: 'Pink',
    enabled: true,
    colors: ['#EC008C', '#F50087', '#E3006C'],
  };

  const coralPalette = settings.palettes?.coral || {
    name: 'Coral',
    enabled: true,
    colors: ['#F59306', '#FA6800', '#F2380F'],
  };

  return (
    <div className="w-full min-h-screen pb-16 flex flex-col items-center px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6 pt-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <Monogram size={44} variant="pinkCoral" />
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#B8005C]">
            Convite Especial · Madrinhas
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C24]">
            Madrinhas
          </h1>
          <p className="font-script text-3xl text-[#785E54]">
            {settings.coupleNames}
          </p>
        </div>

        {/* Banner with Photo 14 (fallback Photo 6) */}
        <div className="w-full">
          <PhotoSlot
            slotId={14}
            imageUrl={photos['14'] || photos['6']}
            alt="Banner Madrinhas Nichole & Matheus"
            className="w-full shadow-md"
          />
        </div>

        {/* Gratitude Message from Couple */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#FCE8F0] flex items-center justify-center mx-auto text-[#EC008C]">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <p className="font-serif italic text-base sm:text-lg text-[#3D2C24] leading-relaxed">
            "{settings.bridesmaidsMessage}"
          </p>
          <p className="font-script text-2xl text-[#C80064]">
            Com todo carinho, {settings.coupleNames}
          </p>
        </div>

        {/* Dress & Boots Requirement Banner */}
        <div className="w-full bg-[#FAF5F4] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-[#3D2C24]">
            <Sparkles className="w-5 h-5 text-[#EC008C]" />
            <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
              Traje Obrigatório: Bota + Vestido na Paleta
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5A463C] leading-relaxed">
            Para compor o nosso visual country elegante no campo, convidamos todas as nossas madrinhas a usarem{' '}
            <strong>vestido longo fluido em tom liso</strong> (nas paletas <strong>Pink</strong> ou{' '}
            <strong>Coral</strong> que escolhemos) combinado com <strong>bota country/texana</strong>.
          </p>
        </div>

        {/* Color Palettes & Inspiration Reference Cards */}
        <div className="w-full space-y-4">
          <div className="text-left">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-[#B8005C]">
              Cores do Altar
            </span>
            <h3 className="font-serif font-bold text-xl text-[#3D2C24] mt-0.5">
              Paletas Oficiais: Pink &amp; Coral
            </h3>
            <p className="text-xs text-[#6E584E] mt-1">
              Escolha a tonalidade que mais combina com você dentro das paletas oficiais abaixo:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PINK PALETTE CARD */}
            {pinkPalette.enabled && (
              <div className="bg-[#F2F0EE] border border-[#E3DBD2] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-baseline justify-between border-b border-[#E3DBD2] pb-2">
                  <span className="font-script text-3xl text-[#785E54] leading-none">
                    Pink
                  </span>
                  <span className="text-[11px] font-sans font-medium text-[#A92266]">
                    Paleta Oficial
                  </span>
                </div>

                {/* Color Swatches + Lookbook Reference */}
                <div className="flex items-stretch gap-3.5">
                  <div className="flex flex-col justify-between gap-2 shrink-0 py-1">
                    {pinkPalette.colors.map((hex, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div
                          className="w-11 h-11 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10 transition-transform hover:scale-105"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                        <span className="font-mono text-[10px] text-[#6E584E] uppercase tabular-nums">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 rounded-2xl overflow-hidden border border-[#DFD7CE] bg-[#EAE6E1] shadow-xs">
                    <img
                      src="/assets/aistudio/WhatsApp_Image_2026-10-25_at_21.56.45_c2f9d9a8.jpeg"
                      alt="Referência paleta Pink para madrinhas"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>

                <p className="text-xs text-[#5A463C] leading-relaxed">
                  Tons vibrantes e românticos de pink e magenta, ideais para tecidos fluidos como crepe, mousseline ou chiffon.
                </p>
              </div>
            )}

            {/* CORAL PALETTE CARD */}
            {coralPalette.enabled && (
              <div className="bg-[#F2F0EE] border border-[#E3DBD2] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-baseline justify-between border-b border-[#E3DBD2] pb-2">
                  <span className="font-script text-3xl text-[#785E54] leading-none">
                    Coral
                  </span>
                  <span className="text-[11px] font-sans font-medium text-[#C8530E]">
                    Paleta Oficial
                  </span>
                </div>

                {/* Color Swatches + Lookbook Reference */}
                <div className="flex items-stretch gap-3.5">
                  <div className="flex flex-col justify-between gap-2 shrink-0 py-1">
                    {coralPalette.colors.map((hex, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div
                          className="w-11 h-11 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10 transition-transform hover:scale-105"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                        <span className="font-mono text-[10px] text-[#6E584E] uppercase tabular-nums">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 rounded-2xl overflow-hidden border border-[#DFD7CE] bg-[#EAE6E1] shadow-xs">
                    <img
                      src="/assets/aistudio/WhatsApp_Image_2026-10-25_at_21.56.45__1__8674b38d.jpeg"
                      alt="Referência paleta Coral para madrinhas"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>

                <p className="text-xs text-[#5A463C] leading-relaxed">
                  Tons solares de coral e laranja quente, perfeitos para iluminar a cerimônia ao pôr do sol no sítio.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footwear & Style Advice */}
        <div className="w-full bg-[#FAF5F4] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-3">
          <span className="font-serif font-bold text-sm text-[#3D2C24] block">
            Dicas Especiais para a Bota Country
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5A463C]">
            <div className="bg-[#FCFBF9] p-3.5 rounded-xl border border-[#EFE0E5]">
              <strong className="block text-[#B8005C] mb-1">Estilo e Cor da Bota</strong>
              Bota texana, bota de montaria ou cano curto/médio em tons marrom, caramelo, café ou off-white combinam perfeitamente com o vestido.
            </div>
            <div className="bg-[#FCFBF9] p-3.5 rounded-xl border border-[#F2D9CB]">
              <strong className="block text-[#D94E00] mb-1">Conforto na Grama</strong>
              A bota dá firmeza e conforto no sítio, evitando que saltos finos afundem na grama ou na terra batida.
            </div>
          </div>
        </div>

        {/* Arrival Time and Guidelines Card */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#3D2C24]">
            <Clock className="w-5 h-5 text-[#FA6800]" />
            <h3 className="font-serif font-bold text-base text-[#3D2C24]">
              Orientações Extras e Horário de Chegada
            </h3>
          </div>

          <div className="p-4 bg-[#FAF5F4] rounded-xl border border-[#EFE0E5] text-xs sm:text-sm text-[#5A463C] leading-relaxed whitespace-pre-line">
            {settings.bridesmaidsGuidelines}
          </div>
        </div>

        {/* RSVP Action Button */}
        <div className="w-full pt-2">
          <button
            onClick={() => onNavigate('/presenca')}
            className="w-full py-4 px-6 btn-pink-coral rounded-2xl font-serif font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckSquare className="w-5 h-5" />
            <span>Confirmar Minha Presença Como Madrinha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
