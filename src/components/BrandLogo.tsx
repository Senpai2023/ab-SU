import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  // Dimension and typography presets based on size
  const config = {
    sm: {
      text: 'text-2xl',
      barWidth: 'w-[4px]',
      barHeight: 'h-[18px]',
      dotSize: 'w-[4.5px] h-[4.5px]',
      gap: 'gap-[2.5px]',
      margin: 'mx-[1.5px]',
      container: 'h-8',
    },
    md: {
      text: 'text-3xl sm:text-4xl',
      barWidth: 'w-[5.5px]',
      barHeight: 'h-[24px] sm:h-[28px]',
      dotSize: 'w-[6px] h-[6px]',
      gap: 'gap-[3px]',
      margin: 'mx-[2px]',
      container: 'h-10 sm:h-12',
    },
    lg: {
      text: 'text-5xl sm:text-6xl',
      barWidth: 'w-[8px] sm:w-[9px]',
      barHeight: 'h-[36px] sm:h-[44px]',
      dotSize: 'w-[9px] h-[9px]',
      gap: 'gap-[4px]',
      margin: 'mx-[3px]',
      container: 'h-16 sm:h-20',
    },
    xl: {
      text: 'text-6xl sm:text-7xl',
      barWidth: 'w-[10px] sm:w-[12px]',
      barHeight: 'h-[46px] sm:h-[56px]',
      dotSize: 'w-[11px] h-[11px]',
      gap: 'gap-[5px]',
      margin: 'mx-[4px]',
      container: 'h-20 sm:h-24',
    },
    hero: {
      text: 'text-7xl sm:text-8xl md:text-9xl',
      barWidth: 'w-[13px] sm:w-[16px]',
      barHeight: 'h-[60px] sm:h-[76px]',
      dotSize: 'w-[15px] h-[15px]',
      gap: 'gap-[6px]',
      margin: 'mx-[5px]',
      container: 'h-24 sm:h-32',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center font-['Outfit'] select-none tracking-tight font-extrabold ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ letterSpacing: '-0.03em' }}
      aria-label="Ab!SU Logo"
    >
      <span className={`${config.text} text-neutral-950 font-black`}>Ab</span>
      
      {/* The iconic Red Exclamation Mark that serves as the exclamation / 'i' */}
      <span className={`inline-flex flex-col items-center justify-center ${config.margin} ${config.gap} shrink-0`}>
        <span
          className={`block ${config.barWidth} ${config.barHeight} bg-[#D00000] rounded-[1.5px] shadow-xs`}
        />
        <span
          className={`block ${config.dotSize} bg-[#D00000] rounded-full shadow-xs`}
        />
      </span>

      <span className={`${config.text} text-neutral-950 font-black`}>SU</span>
    </div>
  );
};
