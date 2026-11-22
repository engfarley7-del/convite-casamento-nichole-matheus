import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { Monogram } from '../components/Monogram.tsx';
import { GiftItem } from '../types.ts';
import {
  Gift,
  Tv,
  Refrigerator,
  Utensils,
  CookingPot,
  Wind,
  Shirt,
  Sparkles,
  Flame,
  Zap,
  Coffee,
  Copy,
  Check,
  Heart,
  QrCode,
  X,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GiftsPage: React.FC = () => {
  const { settings, gifts, reserveGift } = useWedding();

  const [filterTab, setFilterTab] = useState<'all' | 'available'>('available');
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [guestName, setGuestName] = useState<string>('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);

  // Filtered gifts list
  const filteredGifts = gifts.filter((gift) => {
    if (filterTab === 'available') {
      return !gift.isChosen;
    }
    return true;
  });

  const totalGifts = gifts.length;
  const chosenGiftsCount = gifts.filter((g) => g.isChosen).length;

  // Dedicated illustration renderer for each of the 12 wedding gifts
  const renderGiftIcon = (iconName: string, giftName: string = '') => {
    const nameLower = giftName.toLowerCase();
    const stroke = '#B8005C';

    // 1. Máquina de lavar roupa 13kg
    if (nameLower.includes('lavar') || iconName === 'washing-machine') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="6" width="32" height="36" rx="4" fill="#F5F2EE" />
          <circle cx="24" cy="27" r="10" strokeWidth="2.5" />
          <circle cx="24" cy="27" r="6" strokeDasharray="3 3" />
          <line x1="13" y1="13" x2="21" y2="13" />
          <circle cx="33" cy="13" r="2" fill={stroke} />
        </svg>
      );
    }

    // 2. Geladeira
    if (nameLower.includes('geladeira') || iconName === 'refrigerator') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="11" y="5" width="26" height="38" rx="3" fill="#F5F2EE" />
          <line x1="11" y1="19" x2="37" y2="19" strokeWidth="2" />
          <line x1="16" y1="11" x2="16" y2="15" strokeWidth="2.5" />
          <line x1="16" y1="24" x2="16" y2="31" strokeWidth="2.5" />
        </svg>
      );
    }

    // 3. Forno elétrico
    if (nameLower.includes('forno') || iconName === 'forno') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="10" width="32" height="28" rx="3" fill="#F5F2EE" />
          <rect x="13" y="17" width="18" height="15" rx="1.5" />
          <line x1="13" y1="23" x2="31" y2="23" strokeDasharray="2 2" />
          <circle cx="35" cy="18" r="1.5" fill={stroke} />
          <circle cx="35" cy="24" r="1.5" fill={stroke} />
          <circle cx="35" cy="30" r="1.5" fill={stroke} />
        </svg>
      );
    }

    // 4. Air fryer
    if (nameLower.includes('air fryer') || nameLower.includes('fryer')) {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16 C12 10, 36 10, 36 16 L37 38 C37 41, 33 42, 24 42 C15 42, 11 41, 11 38 Z" fill="#F5F2EE" />
          <path d="M16 23 L32 23 L31 36 C31 37.5, 29 38, 24 38 C19 38, 17 37.5, 17 36 Z" />
          <rect x="22" y="27" width="4" height="6" rx="1" fill={stroke} />
          <circle cx="24" cy="16" r="3" />
        </svg>
      );
    }

    // 5. Liquidificador
    if (nameLower.includes('liquidificador') || iconName === 'blender') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="17,10 31,10 29,29 19,29" fill="#F5F2EE" />
          <line x1="21" y1="15" x2="25" y2="15" strokeWidth="1.5" />
          <line x1="21" y1="19" x2="25" y2="19" strokeWidth="1.5" />
          <line x1="21" y1="23" x2="25" y2="23" strokeWidth="1.5" />
          <path d="M31 14 C35 14, 35 24, 29 24" strokeWidth="2" />
          <path d="M17 29 L14 41 L34 41 L31 29 Z" fill="#F5F2EE" />
          <circle cx="24" cy="35" r="2.5" fill={stroke} />
          <line x1="15" y1="8" x2="33" y2="8" strokeWidth="2" />
        </svg>
      );
    }

    // 6. TV
    if (nameLower.includes('tv') || iconName === 'tv') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="10" width="34" height="24" rx="2" fill="#F5F2EE" />
          <line x1="17" y1="38" x2="31" y2="38" strokeWidth="2.5" />
          <line x1="24" y1="34" x2="24" y2="38" strokeWidth="2" />
          <line x1="10" y1="30" x2="38" y2="30" strokeWidth="1" strokeDasharray="1 3" />
        </svg>
      );
    }

    // 7. Batedeira
    if (nameLower.includes('batedeira')) {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 18 C12 14, 34 14, 36 21 L36 26 L12 26 Z" fill="#F5F2EE" />
          <path d="M18 26 L18 31" strokeWidth="2" />
          <path d="M15 31 C15 35, 21 35, 21 31 Z" fill={stroke} />
          <path d="M22 28 C22 38, 38 38, 38 28 Z" fill="#F5F2EE" />
          <line x1="10" y1="41" x2="40" y2="41" strokeWidth="2.5" />
          <line x1="36" y1="26" x2="36" y2="41" strokeWidth="2" />
        </svg>
      );
    }

    // 8. Ventilador
    if (nameLower.includes('ventilador') || iconName === 'wind') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="20" r="13" fill="#F5F2EE" />
          <circle cx="24" cy="20" r="3" fill={stroke} />
          <path d="M24 17 C28 11, 31 16, 27 20" />
          <path d="M27 21 C33 25, 28 28, 24 24" />
          <path d="M21 21 C15 17, 20 14, 24 20" />
          <line x1="24" y1="33" x2="24" y2="41" strokeWidth="2.5" />
          <line x1="16" y1="41" x2="32" y2="41" strokeWidth="2.5" />
        </svg>
      );
    }

    // 9. Panela de pressão elétrica
    if (nameLower.includes('pressão') || nameLower.includes('panela')) {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="13" y="19" width="22" height="19" rx="3" fill="#F5F2EE" />
          <path d="M11 19 C11 14, 37 14, 37 19 Z" fill="#F5F2EE" />
          <rect x="22" y="9" width="4" height="5" fill={stroke} />
          <line x1="20" y1="14" x2="28" y2="14" strokeWidth="2" />
          <rect x="19" y="25" width="10" height="7" rx="1.5" />
          <line x1="9" y1="21" x2="13" y2="21" strokeWidth="3" />
          <line x1="35" y1="21" x2="39" y2="21" strokeWidth="3" />
        </svg>
      );
    }

    // 10. Ferro de passar roupa
    if (nameLower.includes('ferro') || iconName === 'shirt') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 32 L36 32 C38 32, 40 30, 39 27 L33 16 C31 16, 10 20, 10 32 Z" fill="#F5F2EE" />
          <path d="M15 20 C15 14, 28 14, 28 20" strokeWidth="2" />
          <circle cx="23" cy="25" r="2" fill={stroke} />
          <line x1="8" y1="36" x2="38" y2="36" strokeWidth="2" strokeDasharray="2 3" />
        </svg>
      );
    }

    // 11. Micro-ondas
    if (nameLower.includes('micro') || iconName === 'microwave') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="12" width="32" height="24" rx="3" fill="#F5F2EE" />
          <rect x="12" y="16" width="18" height="16" rx="1" />
          <rect x="32" y="16" width="5" height="4" rx="0.5" fill={stroke} />
          <circle cx="34.5" cy="24" r="1.5" fill={stroke} />
          <circle cx="34.5" cy="28" r="1.5" fill={stroke} />
        </svg>
      );
    }

    // 12. Aspirador de pó
    if (nameLower.includes('aspirador') || iconName === 'sparkles') {
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="30" cy="30" rx="9" ry="7" fill="#F5F2EE" />
          <circle cx="33" cy="33" r="3" fill={stroke} />
          <path d="M23 28 C18 28, 16 16, 21 12 C24 10, 26 12, 26 15 L17 38" strokeWidth="2" />
          <polygon points="12,38 22,38 17,42" fill={stroke} />
        </svg>
      );
    }

    // Fallback Country Gift Box
    return (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="18" width="28" height="22" rx="2" fill="#F5F2EE" />
        <rect x="8" y="13" width="32" height="5" rx="1.5" fill="#F5F2EE" />
        <line x1="24" y1="13" x2="24" y2="40" strokeWidth="2.5" />
        <path d="M24 13 C20 8, 14 10, 18 13 C22 13, 24 13, 24 13 Z" fill={stroke} />
        <path d="M24 13 C28 8, 34 10, 30 13 C26 13, 24 13, 24 13 Z" fill={stroke} />
      </svg>
    );
  };

  const handleOpenModal = (gift: GiftItem) => {
    if (gift.isChosen) return;
    setSelectedGift(gift);
    setGuestName('');
    setStep('form');
    setErrorMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedGift(null);
    setGuestName('');
    setStep('form');
    setErrorMessage(null);
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMessage('Por favor, informe seu nome para continuar.');
      return;
    }
    setErrorMessage(null);
    setStep('confirm');
  };

  const handleConfirmReservation = async () => {
    if (!selectedGift || !guestName.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await reserveGift(selectedGift.id, guestName.trim());
    setIsSubmitting(false);

    if (res.success) {
      setStep('success');
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#EC008C', '#F50087', '#FA6800', '#F59306'],
        });
      } catch (e) {
        // ignore
      }
    } else {
      setErrorMessage(res.message);
      // If concurrent collision, return to form step so they can choose another
      setStep('form');
    }
  };

  const handleCopyPix = () => {
    if (!settings.pixKey) return;
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="w-full min-h-screen pb-12 flex flex-col items-center px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6 pt-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <Monogram size={44} variant="pinkCoral" />
          <span className="block text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B8005C]">
            Montando Nosso Lar no Campo
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C24]">
            Lista de Presentes
          </h1>
          <p className="font-script text-3xl text-[#785E54]">
            {settings.coupleNames}
          </p>
        </div>

        {/* Counter and Filter Controls */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-serif font-bold text-[#3D2C24] block">
              Status dos Presentes
            </span>
            <p className="text-xs text-[#6B534B] mt-0.5 tabular-nums">
              <strong className="text-[#C80064] font-bold">{chosenGiftsCount}</strong> de{' '}
              <strong className="text-[#3D2C24] font-bold">{totalGifts}</strong> presentes já presenteados
            </p>
            {/* Progress bar */}
            <div className="w-full sm:w-48 h-2 bg-[#F2E6EA] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-[#EC008C] to-[#FA6800] transition-all duration-500 rounded-full"
                style={{
                  width: totalGifts > 0 ? `${(chosenGiftsCount / totalGifts) * 100}%` : '0%',
                }}
              />
            </div>
          </div>

          {/* Filter Tabs (Segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-[#F4EAEF] rounded-xl self-start sm:self-center">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 text-xs font-serif font-bold rounded-lg transition-all ${
                filterTab === 'all'
                  ? 'bg-[#FCFBF9] text-[#B8005C] shadow-xs'
                  : 'text-[#6B534B] hover:text-[#3D2C24]'
              }`}
            >
              Todos ({totalGifts})
            </button>
            <button
              onClick={() => setFilterTab('available')}
              className={`px-3 py-1.5 text-xs font-serif font-bold rounded-lg transition-all ${
                filterTab === 'available'
                  ? 'bg-[#FCFBF9] text-[#B8005C] shadow-xs'
                  : 'text-[#6B534B] hover:text-[#3D2C24]'
              }`}
            >
              Disponíveis ({totalGifts - chosenGiftsCount})
            </button>
          </div>
        </div>

        {/* 2-Column Grid on Mobile */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {filteredGifts.map((gift) => (
            <div
              key={gift.id}
              className={`rounded-2xl border p-3.5 sm:p-5 flex flex-col items-center text-center justify-between transition-all relative ${
                gift.isChosen
                  ? 'bg-[#F3ECEF]/80 border-[#EAD9DF] opacity-85'
                  : 'bg-[#FCFBF9] border-[#F0D5DC] shadow-xs hover:border-[#EC008C]/40 hover:shadow-sm'
              }`}
            >
              {/* Chosen Badge Overlay if already chosen */}
              {gift.isChosen ? (
                <div className="w-full flex flex-col items-center justify-center my-auto py-2">
                  <div className="w-12 h-12 rounded-full bg-[#EFE4E8] text-[#8E7A6E] flex items-center justify-center mb-2">
                    {renderGiftIcon(gift.icon, gift.name)}
                  </div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-[#6B534B] line-clamp-2 min-h-[32px] flex items-center">
                    {gift.name}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDF3F7] border border-[#F2C6D8] text-[#B8005C] font-serif font-bold text-[11px] shadow-2xs">
                    <span>Já presenteado</span>
                    <span>💛</span>
                  </div>
                  {/* ZERO BUTTONS on chosen cards per requirement */}
                </div>
              ) : (
                /* Available Card */
                <div className="w-full flex flex-col items-center justify-between h-full space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FDF4F7] border border-[#F2C6D8] text-[#C80064] flex items-center justify-center shadow-2xs">
                    {renderGiftIcon(gift.icon, gift.name)}
                  </div>

                  <div className="flex-1 flex items-center">
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-[#3D2C24] line-clamp-2">
                      {gift.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleOpenModal(gift)}
                    className="w-full py-2.5 px-3 btn-pink-coral font-serif font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] min-h-[40px] flex items-center justify-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Quero presentear</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pix Section: Outras formas de presentear */}
        <div className="w-full bg-[#FAF5F4] border border-[#F0D5DC] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 mt-8">
          <div className="flex items-center gap-2 text-[#3D2C24]">
            <QrCode className="w-5 h-5 text-[#EC008C]" />
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#3D2C24]">
              Outras Formas de Presentear (Pix)
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#5A463C] leading-relaxed">
            Caso prefira nos agraciar com uma contribuição em dinheiro para a nossa lua de mel
            ou reforma do sítio, você pode utilizar a nossa chave Pix oficial abaixo:
          </p>

          <div className="p-3.5 bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="overflow-hidden">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#B8005C] block">
                Nossa Chave Pix
              </span>
              <p className="font-mono text-xs sm:text-sm font-bold text-[#3D2C24] truncate">
                {settings.pixKey || 'nichole.matheus@casamento2027.com.br'}
              </p>
              <span className="text-[11px] text-[#785E54] block mt-0.5">
                Favorecido: {settings.pixRecipient || 'Nichole & Matheus'}
              </span>
            </div>

            <button
              onClick={handleCopyPix}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 btn-pink-coral text-xs font-serif font-bold rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
            >
              {copiedPix ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Chave Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Chave Pix</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MODAL: Reservar Presente */}
        {selectedGift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-6 shadow-2xl relative space-y-4">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FDF3F7] text-[#B8005C] flex items-center justify-center hover:bg-[#FCE8F0]"
              >
                <X className="w-4 h-4" />
              </button>

              {/* STEP 1: Enter Name (Single Required Field, No Email or Phone) */}
              {step === 'form' && (
                <form onSubmit={handleProceedToConfirm} className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#FDF4F7] border border-[#F2C6D8] text-[#C80064] flex items-center justify-center mx-auto mb-2">
                      {renderGiftIcon(selectedGift.icon, selectedGift.name)}
                    </div>
                    <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#B8005C]">
                      Presente Selecionado
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#3D2C24] mt-0.5">
                      {selectedGift.name}
                    </h3>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label
                      htmlFor="donor-name"
                      className="block text-xs font-serif font-bold text-[#3D2C24] uppercase tracking-wider"
                    >
                      Seu Nome *
                    </label>
                    <input
                      id="donor-name"
                      type="text"
                      required
                      autoFocus
                      placeholder="Ex: Seu Nome e Sobrenome"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF5F4] border border-[#EAD4DC] rounded-xl text-sm text-[#3D2C24] placeholder-[#9E8B80] focus:outline-hidden focus:ring-2 focus:ring-[#EC008C]/25 focus:border-[#EC008C]"
                    />
                    <p className="text-[11px] text-[#785E54]">
                      Seu nome ficará salvo em sigilo conosco.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 btn-pink-coral font-serif font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    Avançar
                  </button>
                </form>
              )}

              {/* STEP 2: Confirmation Step: "Você escolheu [item]. Confirmar?" */}
              {step === 'confirm' && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#FDF4F7] border border-[#F2C6D8] text-[#C80064] flex items-center justify-center mx-auto">
                    <Gift className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#3D2C24]">
                    Confirmar Presente?
                  </h3>

                  <p className="text-sm text-[#5A463C] leading-relaxed">
                    Você escolheu{' '}
                    <strong className="text-[#C80064] font-bold">
                      {selectedGift.name}
                    </strong>
                    . Confirmar a escolha em nome de <strong>{guestName}</strong>?
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleConfirmReservation}
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 btn-pink-coral font-serif font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Salvando presente...' : 'Sim, Confirmar Presente'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      disabled={isSubmitting}
                      className="w-full py-2.5 text-xs font-serif text-[#785E54] hover:text-[#C80064]"
                    >
                      Voltar e editar nome
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Thank you view: "Obrigado por presentear Nichole & Matheus!" */}
              {step === 'success' && (
                <div className="space-y-4 text-center py-2 animate-in zoom-in-95 duration-300">
                  <div className="w-14 h-14 rounded-full bg-[#FCE8F0] border border-[#F2C6D8] flex items-center justify-center mx-auto text-[#EC008C]">
                    <Heart className="w-7 h-7 fill-current" />
                  </div>

                  <h3 className="font-serif font-bold text-xl text-[#3D2C24]">
                    Presente Confirmado!
                  </h3>

                  <p className="font-sans text-sm text-[#5A463C] leading-relaxed">
                    Muito obrigado por nos presentear! Sua lembrança fará parte da nossa vida
                    a dois no sítio.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handleCloseModal}
                      className="w-full py-3 px-4 btn-pink-coral font-serif font-bold text-xs rounded-xl shadow-xs"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
