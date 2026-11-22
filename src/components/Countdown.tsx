import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDateStr?: string; // default 2027-07-18T17:30:00
  targetTimeStr?: string;
}

export const Countdown: React.FC<CountdownProps> = ({
  targetDateStr = '2027-07-18',
  targetTimeStr = '17:30',
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      // 18/07/2027 17:30 BRT (-03:00)
      const targetTime = new Date(`${targetDateStr}T${targetTimeStr}:00-03:00`).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isFinished: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr, targetTimeStr]);

  if (timeLeft.isFinished) {
    return (
      <div className="text-center p-4 bg-[#FDF3F7] rounded-xl border border-[#F2C6D8]">
        <p className="font-script text-3xl text-[#C80064]">O grande dia chegou!</p>
        <p className="text-xs text-[#5B443C] mt-1">Estamos celebrando o nosso amor.</p>
      </div>
    );
  }

  const units = [
    { label: 'Dias', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Seg', value: timeLeft.seconds },
  ];

  return (
    <div className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2">
      {units.map((unit, index) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center justify-center bg-[#FCFBF9] border border-[#F0D5DC] shadow-xs rounded-xl w-16 h-16 sm:w-20 sm:h-20 p-1">
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#3D2C24] tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#C80064] mt-0.5">
              {unit.label}
            </span>
          </div>
          {index < units.length - 1 && (
            <span className="font-serif font-bold text-lg text-[#FA6800] pb-3">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
