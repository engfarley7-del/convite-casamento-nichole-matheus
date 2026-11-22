import React, { useState, useEffect } from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { PhotoSlot } from '../components/PhotoSlot.tsx';
import { Monogram } from '../components/Monogram.tsx';
import { Heart, Send, Users, User, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RsvpPage: React.FC = () => {
  const { settings, photos, submitRsvp } = useWedding();

  const [name, setName] = useState('');
  const [attending, setAttending] = useState<boolean>(true);
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [companionNames, setCompanionNames] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prefill from ?nome=...&pessoas=... when arriving from personalized Padrinhos/Madrinhas invites
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramNome = params.get('nome');
    const paramPessoas = params.get('pessoas');
    if (paramNome && !name) {
      setName(paramNome);
    }
    if (paramPessoas) {
      const parsed = Number(paramPessoas);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 6) {
        setGuestsCount(parsed);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, preencha o seu nome completo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitRsvp({
      name: name.trim(),
      attending,
      guestsCount: attending ? Number(guestsCount) : 0,
      companionNames: attending && guestsCount > 1 ? companionNames.trim() : '',
      message: message.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmittedMessage(res.message);
      if (attending) {
        try {
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#EC008C', '#F50087', '#FA6800', '#F59306', '#F2380F'],
          });
        } catch (e) {
          // ignore if canvas blocked
        }
      }
    } else {
      setErrorMessage(res.message || 'Erro ao enviar confirmação. Tente novamente.');
    }
  };

  return (
    <div className="w-full min-h-screen pb-12 flex flex-col items-center px-4">
      <div className="w-full max-w-xl mx-auto space-y-6 pt-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <Monogram size={44} variant="pinkCoral" />
          <span className="block text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B8005C]">
            RSVP
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C24]">
            Confirmação de Presença
          </h1>
          <p className="font-script text-3xl text-[#785E54]">
            {settings.coupleNames}
          </p>
        </div>

        {/* Photo 6: Slot Presença (Vertical 4:5) */}
        <div className="w-full max-w-sm mx-auto">
          <PhotoSlot
            slotId={6}
            imageUrl={photos['6']}
            alt="Foto confirmação de presença"
            className="w-full shadow-md"
          />
        </div>

        {/* Intro Card */}
        <div className="w-full p-4 bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl text-center space-y-1">
          <p className="text-xs sm:text-sm font-serif text-[#5A463C]">
            Sua presença é o maior presente para nós! Por favor, confirme até{' '}
            <strong className="text-[#C80064]">18 de Junho de 2027</strong> para organizarmos tudo com carinho no sítio.
          </p>
        </div>

        {/* Success View */}
        {submittedMessage ? (
          <div className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-14 h-14 rounded-full bg-[#FCE8F0] border border-[#F2C6D8] flex items-center justify-center mx-auto text-[#EC008C] shadow-sm">
              <Heart className="w-7 h-7 fill-current" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#3D2C24]">
              {attending ? 'Presença Confirmada!' : 'Resposta Registrada'}
            </h2>

            <p className="font-sans text-sm text-[#5A463C] leading-relaxed">
              {submittedMessage}
            </p>

            <div className="pt-4 border-t border-[#EFE0E5]">
              <p className="font-script text-2xl text-[#C80064]">
                Com carinho, {settings.coupleNames}
              </p>
            </div>

            <button
              onClick={() => {
                setSubmittedMessage(null);
                setName('');
                setCompanionNames('');
                setMessage('');
              }}
              className="mt-2 text-xs font-serif text-[#785E54] hover:text-[#C80064] underline py-1"
            >
              Enviar outra confirmação
            </button>
          </div>
        ) : (
          /* RSVP Form */
          <form
            onSubmit={handleSubmit}
            className="w-full bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
          >
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
                {errorMessage}
              </div>
            )}

            {/* Attendance Choice */}
            <div className="space-y-2">
              <label className="block text-xs font-serif font-bold text-[#3D2C24] uppercase tracking-wider">
                Você poderá comparecer ao nosso casamento? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-serif font-bold transition-all ${
                    attending
                      ? 'btn-pink-coral border-[#C80064] shadow-sm'
                      : 'bg-[#FAF5F4] text-[#5A463C] border-[#EFE0E5] hover:bg-[#FDF1F6]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sim, com certeza!</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-serif font-bold transition-all ${
                    !attending
                      ? 'bg-[#D94E00] text-white border-[#D94E00] shadow-sm'
                      : 'bg-[#FAF5F4] text-[#5A463C] border-[#EFE0E5] hover:bg-[#FFF5EC]'
                  }`}
                >
                  <span>Infelizmente não poderei</span>
                </button>
              </div>
            </div>

            {/* Guest Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="guest-name"
                className="block text-xs font-serif font-bold text-[#3D2C24] uppercase tracking-wider"
              >
                Seu Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8005C]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="guest-name"
                  type="text"
                  required
                  placeholder="Ex: Ana Clara Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF5F4] border border-[#EAD4DC] rounded-xl text-sm text-[#3D2C24] placeholder-[#9E8B80] focus:outline-hidden focus:ring-2 focus:ring-[#EC008C]/25 focus:border-[#EC008C]"
                />
              </div>
            </div>

            {/* If Attending: Guests count & Companions */}
            {attending && (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="guests-count"
                    className="block text-xs font-serif font-bold text-[#3D2C24] uppercase tracking-wider"
                  >
                    Quantidade Total de Pessoas (incluindo você)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D94E00]">
                      <Users className="w-4 h-4" />
                    </div>
                    <select
                      id="guests-count"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF5F4] border border-[#EAD4DC] rounded-xl text-sm text-[#3D2C24] focus:outline-hidden focus:ring-2 focus:ring-[#EC008C]/25 focus:border-[#EC008C]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'pessoa' : 'pessoas'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {guestsCount > 1 && (
                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    <label
                      htmlFor="companion-names"
                      className="block text-xs font-serif font-bold text-[#3D2C24] uppercase tracking-wider"
                    >
                      Nome dos Acompanhantes
                    </label>
                    <input
                      id="companion-names"
                      type="text"
                      placeholder="Ex: João Silva e Lucas Silva"
                      value={companionNames}
                      onChange={(e) => setCompanionNames(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF5F4] border border-[#EAD4DC] rounded-xl text-sm text-[#3D2C24] placeholder-[#9E8B80] focus:outline-hidden focus:ring-2 focus:ring-[#EC008C]/25 focus:border-[#EC008C]"
                    />
                    <p className="text-[11px] text-[#785E54]">
                      Importante para a listagem de recepção no sítio.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Sweet Message */}
            <div className="space-y-1.5">
              <label
                htmlFor="guest-message"
                className="block text-xs font-serif font-bold text-[#3D2C24] uppercase tracking-wider"
              >
                Mensagem para Nós (opcional)
              </label>
              <div className="relative">
                <textarea
                  id="guest-message"
                  rows={3}
                  placeholder="Deixe um recado especial para nós..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF5F4] border border-[#EAD4DC] rounded-xl text-sm text-[#3D2C24] placeholder-[#9E8B80] focus:outline-hidden focus:ring-2 focus:ring-[#EC008C]/25 focus:border-[#EC008C]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 btn-pink-coral rounded-xl font-serif font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 min-h-[50px]"
            >
              {isSubmitting ? (
                <span>Gravando confirmação...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Confirmação</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
