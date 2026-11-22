import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Heart } from 'lucide-react';
import { useWedding } from '../context/WeddingContext.tsx';

export const AudioPlayer: React.FC = () => {
  const { settings } = useWedding();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  // Canon de Amor Acústico - A progressão mais romântica para casamentos
  // D -> A/C# -> Bm -> F#m -> G -> D/F# -> Em7 -> A7
  const romanticCadence = [
    {
      bass: 73.42, // D2
      pad: [146.83, 220.00, 293.66, 369.99], // D3, A3, D4, F#4
      chords: [146.83, 220.00, 293.66, 369.99, 440.00], // D
      lead: 440.00, // A4
    },
    {
      bass: 69.30, // C#2
      pad: [138.59, 220.00, 277.18, 329.63], // C#3, A3, C#4, E4
      chords: [138.59, 220.00, 277.18, 329.63, 440.00], // A/C#
      lead: 369.99, // F#4
    },
    {
      bass: 61.74, // B1
      pad: [123.47, 185.00, 246.94, 293.66], // B2, F#3, B3, D4
      chords: [123.47, 185.00, 246.94, 293.66, 369.99], // Bm
      lead: 369.99, // F#4
    },
    {
      bass: 55.00, // A1
      pad: [110.00, 164.81, 220.00, 277.18], // A2, E3, A3, C#4
      chords: [110.00, 164.81, 220.00, 293.66, 329.63], // F#m/A
      lead: 329.63, // E4
    },
    {
      bass: 49.00, // G1
      pad: [98.00, 146.83, 196.00, 246.94], // G2, D3, G3, B3
      chords: [98.00, 146.83, 196.00, 246.94, 293.66], // G
      lead: 293.66, // D4
    },
    {
      bass: 46.25, // F#1
      pad: [92.50, 146.83, 185.00, 220.00], // F#2, D3, F#3, A3
      chords: [92.50, 146.83, 185.00, 220.00, 293.66], // D/F#
      lead: 293.66, // D4
    },
    {
      bass: 41.20, // E1
      pad: [82.41, 123.47, 164.81, 196.00], // E2, B2, E3, G3
      chords: [82.41, 123.47, 164.81, 196.00, 246.94], // Em7
      lead: 246.94, // B3
    },
    {
      bass: 55.00, // A1
      pad: [110.00, 164.81, 220.00, 277.18], // A2, E3, A3, C#4
      chords: [110.00, 164.81, 220.00, 277.18, 329.63], // A7
      lead: 277.18, // C#4
    },
  ];

  // Plucked acoustic guitar note with wooden resonance
  const playGuitarPluck = (
    ctx: AudioContext,
    freq: number,
    time: number,
    gainVal = 0.08,
    isLead = false
  ) => {
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isLead ? 2200 : 1700, time);
    filter.Q.setValueAtTime(2.2, time);

    const gainNode = ctx.createGain();
    const osc2Gain = ctx.createGain();

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(gainVal, time + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + (isLead ? 1.8 : 1.2));

    osc2Gain.gain.setValueAtTime(gainVal * 0.35, time);
    osc2Gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);

    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 1.9);
    osc2.stop(time + 1.9);
  };

  // Warm background strings pad note for cinematic romance
  const playWarmStringsNote = (
    ctx: AudioContext,
    freq: number,
    time: number,
    duration: number,
    gainVal = 0.02
  ) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, time);
    filter.Q.setValueAtTime(1.0, time);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(gainVal, time + 0.6); // slow soft attack
    gainNode.gain.setValueAtTime(gainVal, time + duration - 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.5); // long release

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration + 0.6);
  };

  const startMusic = () => {
    // If custom audio URL is set in settings, stream it
    if (settings.musicUrl) {
      if (!htmlAudioRef.current) {
        htmlAudioRef.current = new Audio(settings.musicUrl);
        htmlAudioRef.current.loop = true;
      }
      htmlAudioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('External audio play failed, falling back to romantic synthesis:', e);
          startRomanticMelody();
        });
      return;
    }

    startRomanticMelody();
  };

  const startRomanticMelody = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      let step = 0;
      const bpm = 68; // slow, deeply emotional romantic tempo
      const noteInterval = (60 / bpm) / 2; // eighth notes
      const measureDuration = noteInterval * 8; // 8 eighth notes per chord

      const scheduleNotes = () => {
        if (!audioCtxRef.current) return;
        const now = ctx.currentTime;
        const chordIndex = Math.floor(step / 8) % romanticCadence.length;
        const chordData = romanticCadence[chordIndex];
        const noteInChord = step % 8;

        // When starting a new chord (beat 0 of measure), trigger warm strings pad
        if (noteInChord === 0) {
          chordData.pad.forEach((padFreq) => {
            playWarmStringsNote(ctx, padFreq, now + 0.02, measureDuration, 0.018);
          });
          // Deep acoustic cello bass
          playWarmStringsNote(ctx, chordData.bass, now + 0.02, measureDuration, 0.035);
        }

        // Acoustic guitar fingerpicking arpeggio (P - i - m - a - m - i - m - a)
        const pickingOrder = [0, 1, 2, 3, 4, 3, 2, 1];
        const chordFreq = chordData.chords[pickingOrder[noteInChord] % chordData.chords.length];

        const isBassBeat = noteInChord === 0;
        playGuitarPluck(ctx, chordFreq, now + 0.04, isBassBeat ? 0.12 : 0.055);

        // Lyrical lead acoustic melody note on romantic cadence points
        if (noteInChord === 2 || noteInChord === 6) {
          playGuitarPluck(ctx, chordData.lead, now + 0.05, 0.07, true);
        }

        step++;
        timerRef.current = window.setTimeout(scheduleNotes, noteInterval * 1000);
      };

      scheduleNotes();
      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  const stopMusic = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.suspend();
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (htmlAudioRef.current) htmlAudioRef.current.pause();
    };
  }, []);

  return (
    <button
      onClick={toggleMusic}
      title={isPlaying ? 'Pausar música' : 'Tocar música'}
      aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border transition-all duration-300 shadow-xs backdrop-blur-md ${
        isPlaying
          ? 'btn-pink-coral border-[#EC008C]/40 scale-105'
          : 'bg-[#FDF4F7]/95 text-[#B8005C] border-[#F0C8D8] hover:bg-[#FCE8F0]'
      }`}
    >
      {isPlaying ? (
        <>
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-3 bg-[#FFE1B3] rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-0.5 h-2.5 bg-[#FFE1B3] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-0.5 h-3.5 bg-[#FFE1B3] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <Heart className="w-3.5 h-3.5 ml-0.5 text-[#FFE1B3] fill-current" />
          <span className="text-[11px] sm:text-xs font-serif font-bold whitespace-nowrap">
            Música
          </span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-[#C80064]" />
          <span className="text-[11px] sm:text-xs font-serif font-bold text-[#7A3548] whitespace-nowrap">
            Tocar música
          </span>
        </>
      )}
    </button>
  );
};
