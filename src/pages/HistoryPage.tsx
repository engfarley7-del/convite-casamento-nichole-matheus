import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { PhotoSlot } from '../components/PhotoSlot.tsx';
import { Monogram } from '../components/Monogram.tsx';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { settings, photos } = useWedding();
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // Carousel uses Photo 2, 3, 4
  const carouselSlotIds = [2, 3, 4];

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? carouselSlotIds.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === carouselSlotIds.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full min-h-screen pb-12 flex flex-col items-center px-4">
      <div className="w-full max-w-2xl mx-auto space-y-8 pt-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <Monogram size={44} variant="pinkCoral" />
          <span className="block text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B8005C]">
            Do Começo ao Altar
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C24]">
            Nossa História
          </h1>
          <p className="font-script text-3xl text-[#785E54]">
            {settings.coupleNames}
          </p>
        </div>

        {/* Carousel (Photos 2, 3, 4) */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-[4/5] overflow-hidden rounded-2xl shadow-md">
            <PhotoSlot
              slotId={carouselSlotIds[carouselIndex]}
              imageUrl={photos[String(carouselSlotIds[carouselIndex])]}
              alt={`Foto da história ${carouselIndex + 1}`}
              className="w-full h-full"
            />

            {/* Navigation buttons */}
            <button
              onClick={handlePrev}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FCFBF9]/90 text-[#C80064] flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FCFBF9]/90 text-[#C80064] flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex items-center gap-2 mt-4">
            {carouselSlotIds.map((slotId, idx) => (
              <button
                key={slotId}
                onClick={() => setCarouselIndex(idx)}
                className={`transition-all rounded-full ${
                  carouselIndex === idx
                    ? 'w-6 h-2 bg-gradient-to-r from-[#EC008C] to-[#FA6800]'
                    : 'w-2 h-2 bg-[#DFC8D0] hover:bg-[#C80064]'
                }`}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-[#785E54] font-sans mt-1.5">
            Foto {carouselIndex + 1} de 3 · Momentos marcantes
          </span>
        </div>

        {/* Romantic Story Prose */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#C80064]">
            <Heart className="w-5 h-5 fill-current opacity-90" />
            <h2 className="font-serif font-bold text-lg text-[#3D2C24]">Como Tudo Começou</h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-[#5A463C] leading-relaxed whitespace-pre-line">
            {settings.storyText}
          </p>

          <div className="pt-4 border-t border-[#EFE0E5] flex items-center justify-between text-xs text-[#785E54]">
            <span className="font-script text-xl text-[#C80064]">
              "O amor nunca falha."
            </span>
            <span className="font-serif italic text-[#D94E00]">1 Coríntios 13:8</span>
          </div>
        </div>

        {/* Couple Gallery (Photos 7 to 12 - 2x3 Grid) */}
        <div className="w-full space-y-3">
          <div className="text-center">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[#D94E00]">
              Álbum de Memórias
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D2C24]">
              Nossa Galeria
            </h2>
            <p className="text-xs text-[#785E54] mt-1">
              Momentos especiais que contam a nossa trajetória
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[7, 8, 9, 10, 11, 12].map((slotId) => (
              <PhotoSlot
                key={slotId}
                slotId={slotId}
                imageUrl={photos[String(slotId)]}
                alt={`Nossa galeria ${slotId}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
