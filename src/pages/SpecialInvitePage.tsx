import React, { useState, useEffect } from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { HonoreeInvite } from '../types.ts';
import { Monogram } from '../components/Monogram.tsx';
import { EnvelopeOpening } from '../components/EnvelopeOpening.tsx';
import {
  CheckSquare,
  Clock,
  Heart,
  MapPin,
  Sparkles,
  ExternalLink,
  Crown,
} from 'lucide-react';

interface SpecialInvitePageProps {
  slug?: string;
  honoreeOverride?: HonoreeInvite;
  onNavigate: (path: string) => void;
  embeddedPreview?: boolean;
}

export const SpecialInvitePage: React.FC<SpecialInvitePageProps> = ({
  slug,
  honoreeOverride,
  onNavigate,
  embeddedPreview = false,
}) => {
  const { settings, photos } = useWedding();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState<boolean>(false);

  const honoree: HonoreeInvite | undefined =
    honoreeOverride ||
    settings.honorees?.find((h) => h.slug.toLowerCase() === (slug || '').toLowerCase());

  // Reset envelope to closed state whenever viewing a different individual invite
  useEffect(() => {
    setIsEnvelopeOpen(false);
  }, [slug, honoreeOverride?.id]);

  if (!honoree) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-8 shadow-sm space-y-4">
          <Monogram size={48} variant="pinkCoral" />
          <h1 className="font-serif text-2xl font-bold text-[#3D2C24]">
            Convite Especial
          </h1>
          <p className="text-sm text-[#6B534B]">
            Não encontramos este convite personalizado. Você pode acessar o convite principal do nosso casamento abaixo.
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="w-full py-3 px-5 btn-pink-coral rounded-xl font-serif font-bold text-sm shadow-sm"
          >
            Ir para o Convite Principal
          </button>
        </div>
      </div>
    );
  }

  const isCouple = honoree.type === 'couple';
  const isPink = honoree.bridesmaidColor === 'pink';

  const pinkColors = settings.palettes?.pink?.colors || ['#EC008C', '#F50087', '#E3006C'];
  const coralColors = settings.palettes?.coral?.colors || ['#F59306', '#FA6800', '#F2380F'];
  const activeColors = isPink ? pinkColors : coralColors;

  const dressColorTitle = isPink ? 'Pink' : 'Laranja (Coral)';
  const lookbookImage = isPink
    ? '/assets/aistudio/WhatsApp_Image_2026-10-25_at_21.56.45_c2f9d9a8.jpeg'
    : '/assets/aistudio/WhatsApp_Image_2026-10-25_at_21.56.45__1__8674b38d.jpeg';

  const bannerImage = isCouple
    ? photos['13'] || photos['1']
    : photos['14'] || photos['6'] || photos['1'];

  const groomsmanItems = [
    'Blazer Cinza Claro',
    'Gravata Country ou Bolo Tie',
    'Chapéu de Cowboy (claro/bege)',
    'Bota Country / Texana limpa',
    'Calça Jeans Escura alinhada',
  ];

  const rsvpPath = `/presenca?nome=${encodeURIComponent(honoree.names)}&pessoas=${isCouple ? 2 : 1}`;

  return (
    <div className={`w-full ${embeddedPreview ? 'pb-8' : 'min-h-screen pb-16'} flex flex-col items-center bg-[#F4F1EF]`}>
      {/* Hero / Envelope Section — identical closed envelope & drag-up logic as HomePage */}
      <section className="w-full flex flex-col items-center pt-0.5 sm:pt-3">
        <EnvelopeOpening
          settings={settings}
          coverPhotoUrl={bannerImage}
          photoSlotId={isCouple ? 13 : 14}
          envelopeRecipientLabel={honoree.names}
          cardEyebrow={isCouple ? 'Convite Exclusivo · Padrinhos' : 'Convite Exclusivo · Madrinha'}
          cardSubtitle={
            isCouple
              ? 'Com muito carinho, convidamos vocês para serem nossos padrinhos!'
              : 'Com muito carinho, convidamos você para ser nossa madrinha!'
          }
          cardHeadline={honoree.names}
          cardCoupleSubline={`Casamento de ${settings.coupleNames}`}
          arrivalTimeOverride="16:00"
          signoffText={isCouple ? 'Esperamos por vocês!' : 'Esperamos por você!'}
          postOpenHint="Role para ver sua paleta oficial ↓"
          isOpen={isEnvelopeOpen}
          setIsOpen={setIsEnvelopeOpen}
          compactMode={embeddedPreview}
        />

        {/* Quick Preview Shortcut inside Admin Preview Modal ONLY */}
        {embeddedPreview && !isEnvelopeOpen && (
          <button
            type="button"
            onClick={() => setIsEnvelopeOpen(true)}
            className="mt-2 text-xs font-serif font-semibold text-[#B8005C] hover:text-[#3D2C24] underline"
          >
            Pré-visualizar conteúdo do convite aberto
          </button>
        )}
      </section>

      {/* Personalized Details Below Envelope (Unlocked after dragging seal up to open) */}
      {isEnvelopeOpen && (
        <div className="w-full max-w-xl mx-auto space-y-5 pt-6 px-3 sm:px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Personalized Top Ribbon & Greeting */}
          <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-5 sm:p-7 shadow-xs text-center space-y-3 relative overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                isPink
                  ? 'bg-gradient-to-r from-[#EC008C] via-[#F50087] to-[#E3006C]'
                  : 'bg-gradient-to-r from-[#F59306] via-[#FA6800] to-[#F2380F]'
              }`}
            />

            <div className="pt-1 flex flex-col items-center">
              <Monogram size={42} variant="pinkCoral" />
              <span
                className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.18em] border ${
                  isPink
                    ? 'bg-[#FDF1F6] text-[#B8005C] border-[#F2C6D8]'
                    : 'bg-[#FFF4EA] text-[#D94E00] border-[#F7D1B3]'
                }`}
              >
                <Crown className="w-3 h-3" />
                {isCouple ? 'Convite Exclusivo · Padrinhos' : 'Convite Exclusivo · Madrinha'}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-serif italic text-[#785E54]">
                {isCouple ? 'Queridos Padrinhos,' : 'Querida Madrinha,'}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C24]">
                {honoree.names}
              </h2>
              <p className="font-script text-2xl sm:text-3xl text-[#C80064]">
                {settings.coupleNames}
              </p>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-[#785E54]">
                18 de Julho de 2027 · {settings.locationName}
              </p>
            </div>
          </div>

          {/* Heartfelt Message */}
          <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-5 sm:p-7 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FCE8F0] flex items-center justify-center mx-auto text-[#EC008C]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <p className="font-serif italic text-sm sm:text-base text-[#3D2C24] leading-relaxed">
              "{isCouple ? settings.groomsmenMessage : settings.bridesmaidsMessage}"
            </p>
            <p className="text-xs text-[#6B534B] leading-relaxed">
              {isCouple
                ? 'Vocês fazem parte da nossa história e será uma honra imensa tê-los abençoando o nosso amor no altar!'
                : 'Sua amizade e carinho tornam o nosso grande dia ainda mais luminoso. Será uma alegria termos você conosco no nosso altar!'}
            </p>
          </div>

          {/* Assigned Dress Code Section */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B8005C]">
                Manual do Traje Exclusivo
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3D2C24]">
                Sua Paleta de Cores Oficial
              </h2>
              <p className="text-xs text-[#6B534B] mt-0.5">
                Definimos com carinho para a harmonia do nosso cortejo: <strong>{honoree.colorLabel}</strong>
              </p>
            </div>

          {/* Card for Groomsman (only for Couples) */}
          {isCouple && (
            <div className="bg-[#FCFBF9] border border-[#E2E4E8] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#EFEFEF] pb-3">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#6B534B]">
                    Para Ele · Padrinho
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#3D2C24]">
                    Traje: Cinza Claro
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-9 h-9 rounded-full bg-[#D1D5DB] border-2 border-white shadow-sm ring-1 ring-[#9CA3AF]"
                    title="Cinza Claro"
                  />
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5A463C]">
                {groomsmanItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 bg-[#F7F6F5] px-3 py-2 rounded-xl border border-[#EAE6E3]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] shrink-0" />
                    <span className="font-medium text-[#3D2C24]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Card for Bridesmaid (Always rendered: Pink OR Coral/Laranja) */}
          <div className="bg-[#F2F0EE] border border-[#E5D7DB] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-baseline justify-between border-b border-[#E5D7DB] pb-2.5">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#785E54] block">
                  {isCouple ? 'Para Ela · Madrinha' : 'Seu Traje Oficial · Madrinha'}
                </span>
                <span className="font-script text-3xl text-[#785E54] leading-none">
                  {isPink ? 'Pink' : 'Coral'}
                </span>
                <span className="ml-2 text-xs font-serif font-bold text-[#3D2C24]">
                  ({dressColorTitle})
                </span>
              </div>
              <span
                className={`text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full ${
                  isPink
                    ? 'bg-[#FCE8F0] text-[#B8005C]'
                    : 'bg-[#FFF0E2] text-[#D94E00]'
                }`}
              >
                Paleta Oficial
              </span>
            </div>

            {/* 3 Swatches + Attached Lookbook Reference */}
            <div className="flex items-stretch gap-3.5">
              <div className="flex flex-col justify-between gap-2 shrink-0 py-1">
                {activeColors.map((hex, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className="w-11 h-11 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                    <span className="font-mono text-[10px] text-[#6E584E] uppercase tabular-nums">
                      {hex}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex-1 rounded-2xl overflow-hidden border border-[#DFD7CE] bg-[#EAE6E1] shadow-xs min-h-[190px]">
                <img
                  src={lookbookImage}
                  alt={`Referência paleta ${dressColorTitle}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            <div className="bg-[#FCFBF9] border border-[#EFE0E5] rounded-2xl p-3.5 text-xs text-[#5A463C] space-y-1.5">
              <div className="flex items-center gap-1.5 font-serif font-bold text-[#3D2C24]">
                <Sparkles className={`w-4 h-4 ${isPink ? 'text-[#EC008C]' : 'text-[#FA6800]'}`} />
                <span>Vestido Longo Liso + Bota Country</span>
              </div>
              <p className="leading-relaxed">
                Escolha um modelo longo e fluido em tom liso dentro da paleta{' '}
                <strong>{dressColorTitle}</strong> (sem estampas) combinado com{' '}
                <strong>bota country/texana</strong> para total conforto no gramado do sítio.
              </p>
            </div>
          </div>
        </div>

        {/* Schedule & Arrival Card */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#3D2C24]">
            <Clock className="w-5 h-5 text-[#FA6800]" />
            <h3 className="font-serif font-bold text-base text-[#3D2C24]">
              Horário Especial &amp; Local
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-[#FAF5F4] p-3 rounded-xl border border-[#EFE0E5]">
              <span className="block text-[10px] uppercase font-bold text-[#B8005C]">
                Chegada Padrinhos
              </span>
              <strong className="font-serif text-base text-[#3D2C24]">16h00</strong>
              <span className="block text-[11px] text-[#6B534B]">Fotos &amp; cortejo</span>
            </div>
            <div className="bg-[#FAF5F4] p-3 rounded-xl border border-[#F2D9CB]">
              <span className="block text-[10px] uppercase font-bold text-[#D94E00]">
                Cerimônia Pontual
              </span>
              <strong className="font-serif text-base text-[#3D2C24]">{settings.ceremonyTime}</strong>
              <span className="block text-[11px] text-[#6B534B]">18/07/2027</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-start gap-2 text-[#5A463C]">
              <MapPin className="w-4 h-4 text-[#EC008C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#3D2C24] block">{settings.locationName}</strong>
                <span className="text-[11px] text-[#785E54]">{settings.locationAddress}</span>
              </div>
            </div>
            {!embeddedPreview && (
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FDF3F7] text-[#B8005C] font-bold text-[11px] border border-[#F2C6D8]"
              >
                <span>Mapa</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Confirm Presence CTA */}
        <div className="w-full pt-1">
          <button
            type="button"
            onClick={() => {
              if (!embeddedPreview) {
                onNavigate(rsvpPath);
              }
            }}
            className="w-full py-4 px-6 btn-pink-coral rounded-2xl font-serif font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckSquare className="w-5 h-5" />
            <span>
              {isCouple
                ? 'Confirmar Nossa Presença'
                : 'Confirmar Minha Presença'}
            </span>
          </button>
          {embeddedPreview && (
            <p className="text-[11px] text-center text-[#785E54] mt-2">
              Ao clicar, o convidado é direcionado para confirmar presença já com o nome preenchido.
            </p>
          )}
        </div>
        </div>
      )}
    </div>
  );
};
