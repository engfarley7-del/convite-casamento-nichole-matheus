import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Monogram } from './Monogram.tsx';
import { PhotoSlot } from './PhotoSlot.tsx';
import { WeddingSettings } from '../types.ts';

interface EnvelopeOpeningProps {
  settings: WeddingSettings;
  coverPhotoUrl?: string | null;
  onOpenComplete?: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  photoSlotId?: number;
  envelopeRecipientLabel?: string;
  cardEyebrow?: string;
  cardSubtitle?: string;
  cardHeadline?: string;
  cardCoupleSubline?: string;
  arrivalTimeOverride?: string;
  signoffText?: string;
  postOpenHint?: string;
  compactMode?: boolean;
}

type SequenceStage = {
  isAnimating: boolean;
  bowUntied: boolean;
  cordLoose: boolean;
  topOpen: boolean;
  rightOpen: boolean;
  leftOpen: boolean;
  bottomOpen: boolean;
  cardRaised: boolean;
};

const INITIAL_SEQUENCE: SequenceStage = {
  isAnimating: false,
  bowUntied: false,
  cordLoose: false,
  topOpen: false,
  rightOpen: false,
  leftOpen: false,
  bottomOpen: false,
  cardRaised: false,
};

export const EnvelopeOpening: React.FC<EnvelopeOpeningProps> = ({
  settings,
  coverPhotoUrl,
  onOpenComplete,
  isOpen,
  setIsOpen,
  photoSlotId = 1,
  envelopeRecipientLabel,
  cardEyebrow,
  cardSubtitle,
  cardHeadline,
  cardCoupleSubline,
  arrivalTimeOverride,
  signoffText,
  postOpenHint,
  compactMode = false,
}) => {
  const [dragProgress, setDragProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [seq, setSeq] = useState<SequenceStage>(
    isOpen
      ? {
          isAnimating: false,
          bowUntied: true,
          cordLoose: true,
          topOpen: true,
          rightOpen: true,
          leftOpen: true,
          bottomOpen: true,
          cardRaised: true,
        }
      : INITIAL_SEQUENCE
  );

  const startYRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Sync if parent toggles or resets isOpen
  useEffect(() => {
    if (!isOpen && !seq.isAnimating && seq.cardRaised) {
      setSeq(INITIAL_SEQUENCE);
      setDragProgress(0);
    } else if (isOpen && !seq.isAnimating && !seq.cardRaised) {
      setSeq({
        isAnimating: false,
        bowUntied: true,
        cordLoose: true,
        topOpen: true,
        rightOpen: true,
        leftOpen: true,
        bottomOpen: true,
        cardRaised: true,
      });
      setDragProgress(1);
    }
  }, [isOpen, seq.isAnimating, seq.cardRaised]);

  const startOpeningSequence = () => {
    if (seq.isAnimating || isOpen) return;
    clearTimers();
    setIsDragging(false);
    setDragProgress(1);

    // Stage 1: Untie silk bow gently
    setSeq({
      isAnimating: true,
      bowUntied: true,
      cordLoose: false,
      topOpen: false,
      rightOpen: false,
      leftOpen: false,
      bottomOpen: false,
      cardRaised: false,
    });

    // Stage 2: Loosen X cord
    timersRef.current.push(
      window.setTimeout(() => {
        setSeq((prev) => ({ ...prev, cordLoose: true }));
      }, 240)
    );

    // Stage 3: Open Top Flap
    timersRef.current.push(
      window.setTimeout(() => {
        setSeq((prev) => ({ ...prev, topOpen: true }));
      }, 480)
    );

    // Stage 4: Open Right Flap
    timersRef.current.push(
      window.setTimeout(() => {
        setSeq((prev) => ({ ...prev, rightOpen: true }));
      }, 720)
    );

    // Stage 5: Open Left Flap
    timersRef.current.push(
      window.setTimeout(() => {
        setSeq((prev) => ({ ...prev, leftOpen: true }));
      }, 940)
    );

    // Stage 6: Open Bottom Flap
    timersRef.current.push(
      window.setTimeout(() => {
        setSeq((prev) => ({ ...prev, bottomOpen: true }));
      }, 1160)
    );

    // Stage 7: Reveal Wedding Card smoothly
    timersRef.current.push(
      window.setTimeout(() => {
        setSeq((prev) => ({ ...prev, cardRaised: true, isAnimating: false }));
        setIsOpen(true);
        if (onOpenComplete) onOpenComplete();
      }, 1460)
    );
  };

  const handleCloseEnvelope = () => {
    clearTimers();
    setIsOpen(false);
    setDragProgress(0);
    setSeq(INITIAL_SEQUENCE);
  };

  // Pointer drag exclusively on the wax seal handle (preserves normal page scroll elsewhere)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isOpen || seq.isAnimating) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isOpen || seq.isAnimating) return;
    const deltaY = startYRef.current - e.clientY;

    if (deltaY > 6) {
      const progress = Math.min(Math.max((deltaY - 6) / 86, 0), 1);
      setDragProgress(progress);

      if (progress >= 0.8) {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        startOpeningSequence();
      }
    } else {
      setDragProgress(0);
    }
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isOpen || seq.isAnimating) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    if (dragProgress >= 0.78) {
      startOpeningSequence();
    } else {
      // Smooth spring back to initial position
      setDragProgress(0);
    }
  };

  const envelopeClosedVisible = !isOpen;
  const sealOffsetPx = seq.bowUntied ? -82 : -dragProgress * 64;
  const sealOpacity = seq.cordLoose ? 0 : 1;

  return (
    <div className="w-full flex flex-col items-center justify-center py-1 px-2.5 sm:py-3 sm:px-4">
      <div
        className="relative w-full max-w-[390px] sm:max-w-[430px] select-none"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Envelope Shell sized to fit 100% inside mobile viewport without scrolling */}
        <div
          className={`relative w-full ${
            compactMode
              ? 'h-[calc(90dvh-105px)] min-h-[430px] max-h-[580px]'
              : 'h-[calc(100dvh-98px)] min-h-[455px] max-h-[640px]'
          } rounded-3xl overflow-hidden transition-all duration-700 ${
            isOpen
              ? 'shadow-[0_18px_40px_rgba(196,0,98,0.14)] ring-1 ring-[#EAD3DA] bg-[#FCFBF9]'
              : 'shadow-[0_22px_48px_rgba(61,44,36,0.22)] bg-[#E7DFDA] border border-[#D4C3BC]'
          }`}
        >
          {/* Inner Envelope Backing Texture when closed / animating */}
          {envelopeClosedVisible && (
            <div className="absolute inset-0 bg-[#E6DDD8] paper-texture pointer-events-none" />
          )}

          {/* MAIN POCKET & INVITATION CARD (100% single-screen fit on mobile) */}
          <div className="relative w-full h-full p-2 sm:p-3 flex flex-col items-center justify-center">
            {/* Inner Invitation Card */}
            <div
              className={`w-full h-full rounded-2xl bg-[#FCFBF9] border border-[#EFE0E5] p-2.5 sm:p-4 shadow-xl transition-all duration-700 ease-out flex flex-col items-center text-center relative ${
                isOpen
                  ? 'translate-y-0 opacity-100 scale-100 z-20 pointer-events-auto'
                  : seq.bottomOpen
                  ? 'translate-y-1 opacity-100 scale-[0.99] z-10 pointer-events-none'
                  : 'translate-y-8 opacity-0 scale-[0.94] z-0 pointer-events-none'
              }`}
            >
              {/* Delicate Ornamental Pink-Coral Frame */}
              <div className="w-full h-full border border-[#F3DCE3] rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 flex flex-col items-center justify-between overflow-hidden">
                {/* Top Monogram + Blessing */}
                <div className="flex flex-col items-center shrink-0">
                  <Monogram size={32} variant="pinkCoral" />
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-sans font-semibold text-[#B8005C] mt-0.5 leading-tight">
                    {cardEyebrow || 'Com a bênção de Deus e de nossos pais,'}
                  </div>
                  <div className="text-[11px] font-serif italic text-[#785E54] leading-tight px-1">
                    {cardSubtitle || 'convidamos você para o nosso casamento'}
                  </div>
                </div>

                {/* Couple Names or Honoree Names */}
                <div className="shrink-0 flex flex-col items-center">
                  <h1 className="font-script text-[30px] sm:text-[40px] text-[#3D2C24] leading-[1.05]">
                    {cardHeadline || settings.coupleNames}
                  </h1>
                  {cardCoupleSubline && (
                    <span className="text-[10px] sm:text-[11px] font-serif font-semibold text-[#B8005C] tracking-wide mt-0.5">
                      {cardCoupleSubline}
                    </span>
                  )}
                </div>

                {/* Compact Date & Time Strip */}
                <div className="w-full max-w-[270px] py-1.5 px-2 border-y border-[#F2DCE3] flex items-center justify-center gap-3 text-[#3D2C24] shrink-0 bg-[#FFF9FB]/70 rounded-lg">
                  <div className="text-right leading-tight">
                    <span className="block text-[9px] font-sans uppercase tracking-wider text-[#B8005C] font-semibold">
                      Domingo
                    </span>
                    <span className="font-serif font-bold text-sm sm:text-base text-[#3D2C24]">
                      18 JUL 2027
                    </span>
                  </div>
                  <div className="w-px h-6 bg-[#EBD0D9]" />
                  <div className="text-left leading-tight text-[10px] sm:text-[11px] font-sans">
                    <span className="block text-[#6B534B]">
                      Chegada: <strong className="text-[#3D2C24]">{arrivalTimeOverride || settings.arrivalTime}</strong>
                    </span>
                    <span className="block text-[#6B534B]">
                      Cerimônia: <strong className="text-[#D94E00]">{settings.ceremonyTime}</strong>
                    </span>
                  </div>
                </div>

                {/* Location Line */}
                <div className="text-[11px] sm:text-xs text-[#6B534B] font-serif leading-tight px-1 shrink-0">
                  <p className="font-bold text-[#3D2C24] truncate max-w-[290px]">
                    {settings.locationName}
                  </p>
                  <p className="text-[10px] text-[#785E54] truncate max-w-[290px]">
                    {settings.locationAddress}
                  </p>
                </div>

                {/* Photo Slot: Scales smoothly inside remaining height so whole card fits on 1 screen */}
                <div className="flex-1 min-h-[108px] max-h-[235px] w-full flex items-center justify-center my-1 overflow-hidden">
                  <div className="h-full max-h-full aspect-[4/5] mx-auto">
                    <PhotoSlot
                      slotId={photoSlotId}
                      imageUrl={coverPhotoUrl}
                      alt={`Convite ${cardHeadline || settings.coupleNames}`}
                      priority
                      className="h-full w-full"
                    />
                  </div>
                </div>

                {/* Signoff + Close Envelope inside bottom edge */}
                <div className="shrink-0 flex flex-col items-center">
                  <p className="font-script text-xl sm:text-2xl text-[#C80064] leading-none">
                    {signoffText || 'Esperamos por você!'}
                  </p>
                  {postOpenHint && (
                    <span className="text-[10px] font-sans font-semibold text-[#D94E00] mt-0.5">
                      {postOpenHint}
                    </span>
                  )}
                  <button
                    onClick={handleCloseEnvelope}
                    className="text-[10px] font-sans font-medium text-[#785E54] hover:text-[#C80064] underline mt-0.5 leading-tight"
                  >
                    Fechar envelope
                  </button>
                </div>
              </div>
            </div>

            {/* 4-FLAP ENVELOPE WITH X-CORD, SCULPTED SATIN BOW & PINK-CORAL WAX SEAL */}
            {envelopeClosedVisible && (
              <div
                className="absolute inset-0 z-20 overflow-hidden rounded-3xl"
                style={{
                  touchAction: 'pan-y',
                  perspective: '1400px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Envelope Interior Pocket Lining (visible as flaps open) */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#DFCFD3] via-[#EBE2E4] to-[#E0D2CE] pointer-events-none" />

                {/* FLAP 1: BOTTOM FLAP (Aba Inferior - large realistic envelope overlap) */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    transformOrigin: 'bottom center',
                    transform: seq.bottomOpen
                      ? 'rotateX(-165deg) translateY(24px)'
                      : 'rotateX(0deg)',
                    opacity: seq.bottomOpen ? 0 : 1,
                    zIndex: 11,
                  }}
                >
                  <div
                    className="w-full h-full bg-gradient-to-t from-[#DFD1D4] via-[#EBE2E4] to-[#F2ECEE] paper-texture"
                    style={{
                      clipPath: 'polygon(0 100%, 100% 100%, 50% 34%)',
                      filter: 'drop-shadow(0 -5px 8px rgba(61,44,36,0.14))',
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      points="0,100 50,34 100,100"
                      fill="none"
                      stroke="#C9A8B2"
                      strokeWidth="0.6"
                      opacity="0.7"
                    />
                  </svg>
                </div>

                {/* FLAP 2: LEFT FLAP (Aba Esquerda) */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    transformOrigin: 'left center',
                    transform: seq.leftOpen
                      ? 'rotateY(-165deg) translateX(-20px)'
                      : 'rotateY(0deg)',
                    opacity: seq.leftOpen ? 0 : 1,
                    zIndex: 12,
                  }}
                >
                  <div
                    className="w-full h-full bg-gradient-to-r from-[#E4D6D9] via-[#EEE6E8] to-[#E6D9DC] paper-texture"
                    style={{
                      clipPath: 'polygon(0 0, 56% 50%, 0 100%)',
                      filter: 'drop-shadow(4px 0 6px rgba(61,44,36,0.13))',
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      points="0,0 56,50 0,100"
                      fill="none"
                      stroke="#C9A8B2"
                      strokeWidth="0.6"
                      opacity="0.65"
                    />
                  </svg>
                </div>

                {/* FLAP 3: RIGHT FLAP (Aba Direita) */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    transformOrigin: 'right center',
                    transform: seq.rightOpen
                      ? 'rotateY(165deg) translateX(20px)'
                      : 'rotateY(0deg)',
                    opacity: seq.rightOpen ? 0 : 1,
                    zIndex: 13,
                  }}
                >
                  <div
                    className="w-full h-full bg-gradient-to-l from-[#E2D4D7] via-[#ECE3E5] to-[#E4D6D9] paper-texture"
                    style={{
                      clipPath: 'polygon(100% 0, 44% 50%, 100% 100%)',
                      filter: 'drop-shadow(-4px 0 6px rgba(61,44,36,0.13))',
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      points="100,0 44,50 100,100"
                      fill="none"
                      stroke="#C9A8B2"
                      strokeWidth="0.6"
                      opacity="0.65"
                    />
                  </svg>
                </div>

                {/* FLAP 4: TOP FLAP (Aba Superior) */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    transformOrigin: 'top center',
                    transform: seq.topOpen
                      ? 'rotateX(170deg) translateY(-14px)'
                      : `rotateX(${dragProgress * 18}deg)`,
                    opacity: seq.topOpen ? 0 : 1,
                    zIndex: 14,
                  }}
                >
                  <div
                    className="w-full h-full bg-gradient-to-b from-[#FAF6F5] via-[#F2E9EA] to-[#E5D4D8] paper-texture"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 50% 62%)',
                      filter: 'drop-shadow(0 8px 12px rgba(61,44,36,0.18))',
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line
                      x1="0"
                      y1="0"
                      x2="50"
                      y2="62"
                      stroke="#D3A8B6"
                      strokeWidth="0.65"
                      opacity="0.75"
                    />
                    <line
                      x1="100"
                      y1="0"
                      x2="50"
                      y2="62"
                      stroke="#D3A8B6"
                      strokeWidth="0.65"
                      opacity="0.75"
                    />
                  </svg>
                </div>

                {/* Couple Title & Date on Top Flap */}
                <div
                  className="absolute top-4 sm:top-5 left-0 right-0 z-20 text-center pointer-events-none px-4 transition-all duration-400"
                  style={{
                    opacity: seq.topOpen ? 0 : 1,
                    transform: seq.topOpen ? 'translateY(-16px)' : 'translateY(0)',
                  }}
                >
                  <span className="font-script text-3xl sm:text-4xl text-[#3D2C24] drop-shadow-2xs block">
                    {settings.coupleNames}
                  </span>
                  <p className="text-[11px] font-sans tracking-[0.26em] uppercase text-[#B8005C] mt-0.5 font-semibold">
                    18 · 07 · 2027
                  </p>
                  {envelopeRecipientLabel && (
                    <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-[#FCFBF9]/90 border border-[#E5C6D0] text-[11px] font-serif font-bold text-[#3D2C24] shadow-2xs">
                      Para: {envelopeRecipientLabel}
                    </span>
                  )}
                </div>

                {/* THIN RUSTIC COUNTRY CORD IN AN X CROSSING OVER THE 4 FLAPS */}
                <svg
                  viewBox="0 0 400 500"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full z-25 pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    opacity: seq.cordLoose ? 0 : 1 - dragProgress * 0.15,
                    transform: seq.cordLoose ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  <defs>
                    <filter id="cordShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#3D2C24" floodOpacity="0.24" />
                    </filter>
                    <linearGradient id="twineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C49A6C" />
                      <stop offset="50%" stopColor="#9D7348" />
                      <stop offset="100%" stopColor="#B88E60" />
                    </linearGradient>
                  </defs>
                  {/* Diagonal 1 */}
                  <g filter="url(#cordShadow)">
                    <path
                      d={
                        seq.cordLoose
                          ? 'M -10 -10 Q 170 270 410 510'
                          : `M -10 -10 Q ${200 - dragProgress * 12} ${250 - dragProgress * 14} 410 510`
                      }
                      stroke="url(#twineGrad)"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={
                        seq.cordLoose
                          ? 'M -10 -10 Q 170 270 410 510'
                          : `M -10 -10 Q ${200 - dragProgress * 12} ${250 - dragProgress * 14} 410 510`
                      }
                      stroke="#EAD3B8"
                      strokeWidth="0.9"
                      strokeDasharray="3 3"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.8"
                    />
                  </g>

                  {/* Diagonal 2 */}
                  <g filter="url(#cordShadow)">
                    <path
                      d={
                        seq.cordLoose
                          ? 'M 410 -10 Q 230 270 -10 510'
                          : `M 410 -10 Q ${200 + dragProgress * 12} ${250 - dragProgress * 14} -10 510`
                      }
                      stroke="url(#twineGrad)"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={
                        seq.cordLoose
                          ? 'M 410 -10 Q 230 270 -10 510'
                          : `M 410 -10 Q ${200 + dragProgress * 12} ${250 - dragProgress * 14} -10 510`
                      }
                      stroke="#EAD3B8"
                      strokeWidth="0.9"
                      strokeDasharray="3 3"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.8"
                    />
                  </g>
                </svg>

                {/* DELICATE NATURAL CORD BOW (LAÇO FINO DA CORDA) ALIGNED EXACTLY ON THE X-CORD CENTER */}
                <div
                  className="absolute top-1/2 left-1/2 z-30 pointer-events-none transition-all duration-400 ease-out"
                  style={{
                    opacity: seq.cordLoose ? 0 : 1,
                    transform: seq.bowUntied
                      ? 'translate(-50%, -44%) scale(1.1)'
                      : `translate(-50%, ${-50 - dragProgress * 6}%)`,
                  }}
                >
                  <svg
                    width="196"
                    height="176"
                    viewBox="0 0 196 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_2px_4px_rgba(61,44,36,0.22)]"
                  >
                    {/* Center of bow knot is exactly (98, 88) matching top-1/2 left-1/2 */}
                    {/* Natural Flowing Hanging Cord Tails framing the drag hint */}
                    <path
                      d={
                        seq.bowUntied
                          ? 'M94 91 C82 114, 68 140, 56 168'
                          : 'M94 91 C84 114, 72 138, 62 164'
                      }
                      stroke="#9D7348"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    <path
                      d={
                        seq.bowUntied
                          ? 'M94 91 C82 114, 68 140, 56 168'
                          : 'M94 91 C84 114, 72 138, 62 164'
                      }
                      stroke="#EAD3B8"
                      strokeWidth="0.8"
                      strokeDasharray="2.5 2.5"
                      strokeLinecap="round"
                      opacity="0.75"
                      className="transition-all duration-300"
                    />

                    <path
                      d={
                        seq.bowUntied
                          ? 'M102 91 C114 114, 128 140, 140 168'
                          : 'M102 91 C112 114, 124 138, 134 164'
                      }
                      stroke="#9D7348"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    <path
                      d={
                        seq.bowUntied
                          ? 'M102 91 C114 114, 128 140, 140 168'
                          : 'M102 91 C112 114, 124 138, 134 164'
                      }
                      stroke="#EAD3B8"
                      strokeWidth="0.8"
                      strokeDasharray="2.5 2.5"
                      strokeLinecap="round"
                      opacity="0.75"
                      className="transition-all duration-300"
                    />

                    {/* Delicate Left Cord Loop emerging symmetrically behind the wax seal */}
                    <path
                      d={
                        seq.bowUntied
                          ? 'M95 85 C70 64, 34 70, 36 86 C38 102, 72 98, 95 90'
                          : 'M95 85 C68 58, 30 66, 32 85 C34 104, 72 97, 95 90'
                      }
                      stroke="#A4794D"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-300"
                    />
                    <path
                      d={
                        seq.bowUntied
                          ? 'M95 85 C70 64, 34 70, 36 86 C38 102, 72 98, 95 90'
                          : 'M95 85 C68 58, 30 66, 32 85 C34 104, 72 97, 95 90'
                      }
                      stroke="#EED9BF"
                      strokeWidth="0.85"
                      strokeDasharray="2.5 2.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.82"
                      className="transition-all duration-300"
                    />

                    {/* Delicate Right Cord Loop emerging symmetrically behind the wax seal */}
                    <path
                      d={
                        seq.bowUntied
                          ? 'M101 85 C126 64, 162 70, 160 86 C158 102, 124 98, 101 90'
                          : 'M101 85 C128 58, 166 66, 164 85 C162 104, 124 97, 101 90'
                      }
                      stroke="#A4794D"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-300"
                    />
                    <path
                      d={
                        seq.bowUntied
                          ? 'M101 85 C126 64, 162 70, 160 86 C158 102, 124 98, 101 90'
                          : 'M101 85 C128 58, 166 66, 164 85 C162 104, 124 97, 101 90'
                      }
                      stroke="#EED9BF"
                      strokeWidth="0.85"
                      strokeDasharray="2.5 2.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.82"
                      className="transition-all duration-300"
                    />

                    {/* Small Cord Knot at Exact Center (beneath Wax Seal) */}
                    <circle cx="98" cy="88" r="4.5" fill="#8C633B" stroke="#DEC2A1" strokeWidth="1" />
                  </svg>
                </div>

                {/* INTERACTIVE PINK-CORAL WAX SEAL CENTERED EXACTLY OVER THE BOW KNOT & X-CORD */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 cursor-grab active:cursor-grabbing select-none p-4"
                  style={{ touchAction: 'none' }}
                  aria-label="Selo de cera: segure e arraste para cima para abrir o convite"
                >
                  <div
                    className={`wax-seal rounded-full p-1.5 ring-2 ring-[#FFE7D1]/80 ${
                      isDragging ? 'transition-none' : 'transition-all duration-300 ease-out'
                    }`}
                    style={{
                      transform: `translateY(${sealOffsetPx}px) scale(${1 - dragProgress * 0.08})`,
                      opacity: sealOpacity,
                    }}
                  >
                    <Monogram size={46} variant="wax" />
                  </div>
                </div>

                {/* VISUAL DRAG HINT POSITIONED CLEANLY BENEATH THE WAX SEAL */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  className={`absolute top-[calc(50%+46px)] left-1/2 z-40 flex flex-col items-center cursor-grab active:cursor-grabbing select-none px-4 py-2 ${
                    isDragging ? 'transition-none' : 'transition-all duration-300 ease-out'
                  }`}
                  style={{
                    touchAction: 'none',
                    transform: `translate(-50%, ${-dragProgress * 26}px)`,
                    opacity: seq.bowUntied ? 0 : 1,
                  }}
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#FCFBF9]/95 text-[#D94E00] shadow-sm border border-[#F7D1B3] animate-bounce mb-1 pointer-events-none">
                    <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                  </div>

                  <span className="text-[11px] font-serif font-semibold tracking-wide text-[#3D2C24] bg-[#FCFBF9]/95 border border-[#F7D1B3] px-3.5 py-1 rounded-full shadow-sm whitespace-nowrap pointer-events-none">
                    {dragProgress > 0.12 ? 'Continue subindo...' : 'Arraste para cima'}
                  </span>

                  <div
                    className={`w-28 h-1.5 bg-[#3D2C24]/15 rounded-full overflow-hidden mt-1.5 transition-opacity duration-150 pointer-events-none ${
                      dragProgress > 0.04 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#EC008C] to-[#FA6800] rounded-full transition-all duration-75"
                      style={{ width: `${dragProgress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
