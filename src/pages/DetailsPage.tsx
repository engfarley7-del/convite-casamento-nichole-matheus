import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { PhotoSlot } from '../components/PhotoSlot.tsx';
import { Countdown } from '../components/Countdown.tsx';
import { Monogram } from '../components/Monogram.tsx';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Share2,
  CalendarPlus,
  Shirt,
  Sparkles,
  Check,
} from 'lucide-react';

export const DetailsPage: React.FC = () => {
  const { settings, photos } = useWedding();
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper to generate Google Calendar event link
  const getGoogleCalendarUrl = () => {
    // 18/07/2027 17:30 to 23:59 (BRT = UTC-3 => 20:30 UTC to 03:00 UTC next day)
    const startIso = '20270718T203000Z';
    const endIso = '20270719T030000Z';
    const title = encodeURIComponent(`Casamento ${settings.coupleNames}`);
    const details = encodeURIComponent(
      `Convidamos você para celebrar o nosso casamento (${settings.coupleNames}).\nChegada: ${settings.arrivalTime} | Cerimônia: ${settings.ceremonyTime}\nLocal: ${settings.locationName}`
    );
    const location = encodeURIComponent(`${settings.locationName}, ${settings.locationAddress}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  // Helper to download iCalendar (.ics) file
  const downloadIcsFile = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nichole e Matheus//Casamento 2027//PT',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:casamento-nichole-matheus-2027@casamento.com',
      'DTSTAMP:20270101T000000Z',
      'DTSTART:20270718T203000Z',
      'DTEND:20270719T030000Z',
      `SUMMARY:Casamento ${settings.coupleNames}`,
      `DESCRIPTION:Casamento de ${settings.coupleNames}. Chegada: ${settings.arrivalTime} | Cerimônia: ${settings.ceremonyTime}`,
      `LOCATION:${settings.locationName}, ${settings.locationAddress}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'casamento-nichole-e-matheus.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Helper to share via WhatsApp
  const shareWhatsApp = () => {
    const url = window.location.origin;
    const text = encodeURIComponent(
      `Nichole & Matheus - Convite de Casamento | 18/07/2027\n\nConvidamos você com muito carinho para celebrar o nosso amor no sítio!\nConfira o nosso convite animado, detalhes e lista de presentes:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="w-full min-h-screen pb-12 flex flex-col items-center px-4">
      <div className="w-full max-w-2xl mx-auto space-y-8 pt-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <Monogram size={44} variant="pinkCoral" />
          <span className="block text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B8005C]">
            Informações Importantes
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C24]">
            Detalhes do Grande Dia
          </h1>
          <p className="font-script text-3xl text-[#785E54]">
            {settings.coupleNames}
          </p>
        </div>

        {/* Photo 5: Destaque Detalhes (Vertical 4:5) */}
        <div className="w-full max-w-sm mx-auto">
          <PhotoSlot
            slotId={5}
            imageUrl={photos['5']}
            alt="Detalhes do Grande Dia - Nichole & Matheus"
            priority
            className="w-full shadow-md"
          />
        </div>

        {/* Countdown Card */}
        <div className="w-full p-5 bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl shadow-xs text-center">
          <span className="text-xs font-serif font-bold text-[#B8005C] uppercase tracking-wider block mb-2">
            Falta Pouco Para o Nosso Sim!
          </span>
          <Countdown
            targetDateStr={settings.weddingDate}
            targetTimeStr={settings.ceremonyTime}
          />
        </div>

        {/* Schedule & Timing Card */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#3D2C24]">
            <Clock className="w-5 h-5 text-[#EC008C]" />
            <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
              Programação do Evento
            </h2>
          </div>

          <div className="space-y-4 relative pl-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[#F0D5DC]">
            <div className="relative">
              <span className="absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#EC008C] ring-4 ring-[#FCFBF9]" />
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-base text-[#3D2C24] tabular-nums">
                  {settings.arrivalTime}
                </span>
                <span className="text-xs font-semibold text-[#C80064] uppercase">
                  Recepção dos Convidados
                </span>
              </div>
              <p className="text-xs text-[#6B534B] mt-0.5">
                Recepção calorosa e acomodação com vista para a natureza do sítio.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#FA6800] ring-4 ring-[#FCFBF9]" />
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-base text-[#3D2C24] tabular-nums">
                  {settings.ceremonyTime}
                </span>
                <span className="text-xs font-semibold text-[#D94E00] uppercase">
                  Início Pontual da Cerimônia
                </span>
              </div>
              <p className="text-xs text-[#6B534B] mt-0.5">
                Celebração religiosa e troca de votos ao pôr do sol.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#F59306] ring-4 ring-[#FCFBF9]" />
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-base text-[#3D2C24] tabular-nums">
                  19h00
                </span>
                <span className="text-xs font-semibold text-[#785E54] uppercase">
                  Jantar &amp; Confraternização
                </span>
              </div>
              <p className="text-xs text-[#6B534B] mt-0.5">
                Um delicioso jantar preparado com carinho, comunhão e alegria ao lado de quem amamos.
              </p>
            </div>
          </div>
        </div>

        {/* Location & Map Card */}
        <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#3D2C24]">
            <MapPin className="w-5 h-5 text-[#FA6800]" />
            <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
              Como Chegar ao Sítio
            </h2>
          </div>

          <div>
            <h3 className="font-serif font-bold text-base text-[#3D2C24]">
              {settings.locationName}
            </h3>
            <p className="text-xs text-[#6B534B] mt-0.5">
              {settings.locationAddress}
            </p>
          </div>

          {/* Map Preview Visual Frame */}
          <div className="w-full h-44 rounded-xl overflow-hidden border border-[#F0D5DC] relative bg-[#FAF5F4] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-full btn-pink-coral flex items-center justify-center mb-2 shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="font-serif font-bold text-sm text-[#3D2C24]">
              {settings.locationName}
            </p>
            <p className="text-[11px] text-[#6B534B]">
              Abra as rotas de navegação no Google Maps ou Waze
            </p>
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 btn-pink-coral text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <span>Abrir no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Dress Code / Traje Geral Card */}
        <div className="w-full bg-[#FAF5F4] border border-[#EFE0E5] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#3D2C24]">
            <Shirt className="w-5 h-5 text-[#C80064]" />
            <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
              Traje: Country Elegante / Esporte Fino Rústico
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#5A463C] leading-relaxed">
            Nosso casamento será ao ar livre, no sítio! Queremos que você se sinta
            bonito(a) e muito confortável para celebrar esse dia inesquecível com a gente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-[#FCFBF9] p-4 rounded-xl border border-[#F0D5DC]">
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#B8005C] block mb-1">
                Eles
              </span>
              <ul className="text-xs text-[#6B534B] space-y-1 list-disc list-inside">
                <li>Calça jeans alinhada ou calça de sarja</li>
                <li>Camisa social (manga longa ou curta)</li>
                <li>Bota texana, bota chelsea ou calçado fechado</li>
                <li>Chapéu country e cinto com fivela são muito bem-vindos</li>
              </ul>
            </div>

            <div className="bg-[#FCFBF9] p-4 rounded-xl border border-[#F2D9CB]">
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#D94E00] block mb-1">
                Elas
              </span>
              <ul className="text-xs text-[#6B534B] space-y-1 list-disc list-inside">
                <li>Vestido midi ou longo fluido</li>
                <li>Bota texana/country ou sandália de salto bloco</li>
                <li>Com carinho, pedimos que deixem as cores branca e off-white reservadas exclusivamente para a noiva</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Action Share & Calendar Buttons */}
        <div className="w-full space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Add to Google Calendar */}
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#FCFBF9] hover:bg-[#FDF4F7] text-[#3D2C24] border border-[#F0D5DC] rounded-xl font-serif font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
            >
              <CalendarPlus className="w-4 h-4 text-[#C80064]" />
              <span>Adicionar ao Google Agenda</span>
            </a>

            {/* Download .ics */}
            <button
              onClick={downloadIcsFile}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#FCFBF9] hover:bg-[#FFF5EC] text-[#3D2C24] border border-[#F2D9CB] rounded-xl font-serif font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4 text-[#D94E00]" />
              <span>Baixar Arquivo .ICS (Apple / Outlook)</span>
            </button>
          </div>

          {/* Share on WhatsApp */}
          <button
            onClick={shareWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#25D366] hover:bg-[#20BE5B] text-white rounded-xl font-sans font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar Convite no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
