import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { PHOTO_SLOTS_DEF } from '../types.ts';

interface PhotoSlotProps {
  slotId: number;
  imageUrl?: string | null;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export const PhotoSlot: React.FC<PhotoSlotProps> = ({
  slotId,
  imageUrl,
  className = '',
  alt,
  priority = false,
}) => {
  const slotDef = PHOTO_SLOTS_DEF.find((s) => s.id === slotId) || {
    id: slotId,
    label: `FOTO ${slotId}`,
    page: 'Casamento',
    aspectRatio: '4:5',
    description: 'Espaço reservado para foto dos noivos',
  };

  const getAspectClass = () => {
    switch (slotDef.aspectRatio) {
      case '16:9':
        return 'aspect-[16/9]';
      case '1:1':
        return 'aspect-square';
      case '3:4':
        return 'aspect-[3/4]';
      case '4:5':
      default:
        return 'aspect-[4/5]';
    }
  };

  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#EBE4E6] shadow-sm border border-[#EED9E0] group ${getAspectClass()} ${className}`}
      >
        <img
          src={imageUrl}
          alt={alt || `Foto ${slotId} - Nichole & Matheus`}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[center_22%] transition-transform duration-700 group-hover:scale-105"
        />
        {/* Subtle decorative grain vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Placeholder when no photo is uploaded yet
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed border-[#DFB9C7] bg-gradient-to-b from-[#FCF9FA] to-[#F4EAEF] p-4 flex flex-col items-center justify-center text-center shadow-inner group ${getAspectClass()} ${className}`}
    >
      {/* Background watermark icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Camera className="w-28 h-28 text-[#C80064]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center max-w-[85%]">
        <div className="w-12 h-12 rounded-full bg-[#FCE8F0] border border-[#F2C6D8] flex items-center justify-center mb-2.5 text-[#C80064] shadow-xs">
          <ImageIcon className="w-6 h-6 stroke-[1.8]" />
        </div>

        <span className="font-serif font-bold text-sm tracking-wider text-[#3D2C24] uppercase">
          {slotDef.label}
        </span>

        <span className="text-[11px] font-medium text-[#785E54] mt-1 line-clamp-1">
          {slotDef.description}
        </span>

        <div className="mt-2 text-[10px] font-medium tracking-wide text-[#B8005C]">
          Proporção {slotDef.aspectRatio}
        </div>
      </div>
    </div>
  );
};
