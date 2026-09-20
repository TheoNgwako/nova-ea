'use client';

import { useEffect, useMemo, useState } from 'react';

export type BackgroundAnimationType =
  | 'none'
  | 'profit-rain'
  | 'colour-matrix'
  | 'hackers'
  | 'candle-chart'
  | 'forex-ticker'
  | 'market-pulse'
  | 'pip-storm'
  | 'robot-video';

type BackgroundAnimationProps = {
  type: BackgroundAnimationType;
  accentColor: string;
  mentorImage: string | null;
  mentorVideo: string | null;
};

type RainItem = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  text: string;
};

type MatrixColumn = {
  id: number;
  left: number;
  delay: number;
  duration: number;
};

type Candle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  height: number;
  wick: number;
  width: number;
  opacity: number;
};

type TickerRow = {
  id: number;
  top: number;
  delay: number;
  duration: number;
  direction: 1 | -1;
};

type PulseNode = {
  id: number;
  left: number;
  top: number;
  delay: number;
  size: number;
  label: string;
};

const PROFIT_TEXT = ['+$', 'PROFIT', '+PIPS', '$', 'BUY', 'SELL', '+', 'TP'];

const HACKER_TEXT = [
  '10110101',
  '00101101',
  '11001010',
  '01010111',
  '10011001',
  '01101010',
  '11010100',
  '00110111',
];

const FOREX_PAIRS = [
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'XAUUSD',
  'AUDUSD',
  'USDCAD',
  'GBPJPY',
  'EURJPY',
];

const TICKER_TEXT = [
  'EURUSD 1.1842 ▲ +12.4 PIPS',
  'XAUUSD 4386.84 ▲ +24.8 PIPS',
  'GBPUSD 1.3471 ▼ -4.2 PIPS',
  'USDJPY 149.82 ▲ +8.7 PIPS',
  'AUDUSD 0.6924 ▲ +5.1 PIPS',
  'USDCAD 1.3816 ▼ -6.3 PIPS',
];

const PIP_TEXT = [
  '+12.4 PIPS',
  '+28.7 PIPS',
  'BUY EURUSD',
  'SELL XAUUSD',
  'TP HIT',
  '+$84.20',
  '+16.9 PIPS',
  'BUY GBPUSD',
  'PROFIT',
  '+41.3 PIPS',
];

export default function BackgroundAnimation({
  type,
  accentColor,
  mentorImage,
  mentorVideo,
}: BackgroundAnimationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rainItems = useMemo<RainItem[]>(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        id: index,
        left: (index * 17.3) % 100,
        delay: -((index * 0.47) % 8),
        duration: 5 + ((index * 0.73) % 6),
        size: 10 + ((index * 3) % 11),
        text: PROFIT_TEXT[index % PROFIT_TEXT.length],
      })),
    []
  );

  const matrixColumns = useMemo<MatrixColumn[]>(
    () =>
      Array.from({ length: 46 }, (_, index) => ({
        id: index,
        left: (index * 2.23) % 100,
        delay: -((index * 0.63) % 9),
        duration: 4 + ((index * 0.41) % 5),
      })),
    []
  );

  const candles = useMemo<Candle[]>(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: index,
        left: (index * 4.7) % 105,
        delay: -((index * 0.39) % 7),
        duration: 4.5 + ((index * 0.31) % 4),
        height: 45 + ((index * 19) % 135),
        wick: 80 + ((index * 23) % 180),
        width: 10 + ((index * 7) % 10),
        opacity: 0.28 + ((index % 5) * 0.08),
      })),
    []
  );

  const tickerRows = useMemo<TickerRow[]>(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        id: index,
        top: 12 + index * 15,
        delay: -(index * 2.2),
        duration: 18 + index * 2,
        direction: index % 2 === 0 ? 1 : -1,
      })),
    []
  );

  const pulseNodes = useMemo<PulseNode[]>(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        id: index,
        left: 8 + ((index * 17) % 84),
        top: 12 + ((index * 23) % 72),
        delay: -((index * 0.55) % 5),
        size: 4 + (index % 4) * 2,
        label: FOREX_PAIRS[index % FOREX_PAIRS.length],
      })),
    []
  );

  if (!mounted || type === 'none') return null;

  const MentorPhoto = ({ darkness = 0.38 }: { darkness?: number }) => (
    <>
      {mentorImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${mentorImage})`,
            filter: 'brightness(0.72) saturate(0.85)',
            transform: 'scale(1.01)',
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${accentColor}35 0%, #000000 70%)`,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${darkness})` }}
      />
    </>
  );

  if (type === 'robot-video') {
    if (!mentorVideo) return null;

    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={mentorVideo}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>
    );
  }

  if (type === 'profit-rain') {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <MentorPhoto darkness={0.42} />

        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${accentColor}55 0%, transparent 58%)`,
          }}
        />

        {rainItems.map((item) => (
          <span
            key={item.id}
            className="absolute top-[-80px] font-black whitespace-nowrap select-none nova-profit-rain"
            style={{
              left: `${item.left}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.duration}s`,
              fontSize: `${item.size}px`,
              color: accentColor,
              WebkitTextFillColor: accentColor,
              textShadow: `0 0 8px ${accentColor}, 0 0 16px ${accentColor}80`,
              opacity: 0.78,
            }}
          >
            {item.text}
          </span>
        ))}

        <style jsx>{`
          .nova-profit-rain {
            animation-name: novaProfitFall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
          @keyframes novaProfitFall {
            0% { transform: translate3d(0,-10vh,0); opacity: 0; }
            10% { opacity: .85; }
            90% { opacity: .7; }
            100% { transform: translate3d(0,115vh,0); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'colour-matrix') {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <MentorPhoto darkness={0.46} />

        <div
          className="absolute inset-0 nova-matrix-glow"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, ${accentColor}45, transparent 38%),
              radial-gradient(circle at 80% 65%, ${accentColor}30, transparent 42%),
              radial-gradient(circle at 50% 100%, ${accentColor}40, transparent 48%)
            `,
          }}
        />

        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: `
              linear-gradient(${accentColor}18 1px, transparent 1px),
              linear-gradient(90deg, ${accentColor}18 1px, transparent 1px)
            `,
            backgroundSize: '35px 35px',
          }}
        />

        {matrixColumns.slice(0, 18).map((column) => (
          <div
            key={column.id}
            className="absolute top-0 bottom-0 w-px nova-matrix-line"
            style={{
              left: `${column.left}%`,
              background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
              boxShadow: `0 0 10px ${accentColor}`,
              animationDelay: `${column.delay}s`,
              animationDuration: `${column.duration}s`,
            }}
          />
        ))}

        <style jsx>{`
          .nova-matrix-glow {
            animation: novaMatrixPulse 5s ease-in-out infinite alternate;
          }
          .nova-matrix-line {
            animation-name: novaMatrixMove;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
          @keyframes novaMatrixPulse {
            from { opacity: .3; transform: scale(1); }
            to { opacity: .78; transform: scale(1.1); }
          }
          @keyframes novaMatrixMove {
            from { transform: translateY(-100%); opacity: 0; }
            20% { opacity: .8; }
            80% { opacity: .8; }
            to { transform: translateY(100%); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'hackers') {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <MentorPhoto darkness={0.5} />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${accentColor}55, transparent 65%)`,
          }}
        />

        {matrixColumns.map((column) => (
          <pre
            key={column.id}
            className="absolute top-[-520px] m-0 font-mono text-[11px] leading-[15px] font-bold select-none nova-hacker-column"
            style={{
              left: `${column.left}%`,
              color: accentColor,
              WebkitTextFillColor: accentColor,
              textShadow: `0 0 7px ${accentColor}, 0 0 14px ${accentColor}70`,
              animationDelay: `${column.delay}s`,
              animationDuration: `${column.duration + 3}s`,
              opacity: 0.68,
            }}
          >
            {Array.from(
              { length: 9 },
              (_, index) =>
                HACKER_TEXT[(column.id + index) % HACKER_TEXT.length]
            ).join('\n')}
          </pre>
        ))}

        <style jsx>{`
          .nova-hacker-column {
            animation-name: novaHackerFall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
          @keyframes novaHackerFall {
            from { transform: translateY(-20vh); opacity: 0; }
            12% { opacity: .78; }
            85% { opacity: .62; }
            to { transform: translateY(155vh); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'candle-chart') {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 35%, ${accentColor}30 0%, transparent 50%),
              linear-gradient(to bottom, #000000 0%, #050505 100%)
            `,
          }}
        />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(${accentColor}18 1px, transparent 1px),
              linear-gradient(90deg, ${accentColor}18 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="absolute inset-0 nova-candle-track">
          {candles.map((candle, index) => (
            <div
              key={candle.id}
              className="absolute nova-candle"
              style={{
                left: `${candle.left}%`,
                top: `${10 + ((index * 17) % 72)}%`,
                width: `${candle.width}px`,
                height: `${candle.height}px`,
                background: accentColor,
                border: `1px solid ${accentColor}`,
                boxShadow: `0 0 10px ${accentColor}80`,
                opacity: candle.opacity,
                animationDelay: `${candle.delay}s`,
                animationDuration: `${candle.duration}s`,
              }}
            >
              <span
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  width: '1px',
                  height: `${candle.wick}px`,
                  top: `-${Math.max(15, (candle.wick - candle.height) / 2)}px`,
                  background: accentColor,
                  boxShadow: `0 0 5px ${accentColor}`,
                }}
              />
            </div>
          ))}
        </div>

        <style jsx>{`
          .nova-candle-track { animation: novaChartDrift 18s linear infinite; }
          .nova-candle {
            animation-name: novaCandlePulse;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
            animation-direction: alternate;
          }
          @keyframes novaChartDrift {
            from { transform: translateX(0); }
            to { transform: translateX(-9%); }
          }
          @keyframes novaCandlePulse {
            from { transform: translateY(-8px) scaleY(.9); filter: brightness(.7); }
            to { transform: translateY(8px) scaleY(1.12); filter: brightness(1.4); }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'forex-ticker') {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <MentorPhoto darkness={0.48} />

        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `linear-gradient(${accentColor}22 1px, transparent 1px)`,
            backgroundSize: '100% 54px',
          }}
        />

        {tickerRows.map((row) => {
          const text = `${TICKER_TEXT.join('     •     ')}     •     ${TICKER_TEXT.join('     •     ')}`;
          return (
            <div
              key={row.id}
              className={`absolute whitespace-nowrap font-mono font-black tracking-wider nova-ticker ${
                row.direction === -1 ? 'nova-ticker-reverse' : ''
              }`}
              style={{
                top: `${row.top}%`,
                color: accentColor,
                WebkitTextFillColor: accentColor,
                textShadow: `0 0 9px ${accentColor}`,
                opacity: 0.68,
                fontSize: row.id % 2 === 0 ? '12px' : '10px',
                animationDelay: `${row.delay}s`,
                animationDuration: `${row.duration}s`,
              }}
            >
              {text}
            </div>
          );
        })}

        <style jsx>{`
          .nova-ticker {
            left: 0;
            animation-name: novaTickerMove;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
          .nova-ticker-reverse {
            animation-name: novaTickerMoveReverse;
          }
          @keyframes novaTickerMove {
            from { transform: translateX(-35%); }
            to { transform: translateX(5%); }
          }
          @keyframes novaTickerMoveReverse {
            from { transform: translateX(5%); }
            to { transform: translateX(-35%); }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'market-pulse') {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <MentorPhoto darkness={0.5} />

        <svg
          className="absolute inset-0 w-full h-full opacity-70"
          viewBox="0 0 1200 700"
          preserveAspectRatio="none"
        >
          <path
            d="M0 430 C90 390 130 455 220 405 S360 340 430 395 S560 480 640 390 S770 300 850 365 S1010 450 1200 325"
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            style={{
              filter: `drop-shadow(0 0 7px ${accentColor})`,
              strokeDasharray: '18 10',
              animation: 'novaPulseLine 7s linear infinite',
            }}
          />
          <path
            d="M0 500 C120 470 170 520 270 475 S430 410 520 455 S680 530 760 450 S920 370 1200 410"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            opacity="0.45"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: '10 14',
              animation: 'novaPulseLine 10s linear infinite reverse',
            }}
          />
        </svg>

        {pulseNodes.map((node) => (
          <div
            key={node.id}
            className="absolute nova-pulse-node"
            style={{
              left: `${node.left}%`,
              top: `${node.top}%`,
              animationDelay: `${node.delay}s`,
            }}
          >
            <span
              className="block rounded-full"
              style={{
                width: `${node.size}px`,
                height: `${node.size}px`,
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}, 0 0 18px ${accentColor}`,
              }}
            />
            <span
              className="absolute left-3 -top-1 text-[8px] font-mono font-bold whitespace-nowrap"
              style={{
                color: accentColor,
                WebkitTextFillColor: accentColor,
                textShadow: `0 0 6px ${accentColor}`,
              }}
            >
              {node.label}
            </span>
          </div>
        ))}

        <style jsx>{`
          .nova-pulse-node { animation: novaNodePulse 2.2s ease-in-out infinite alternate; }
          @keyframes novaNodePulse {
            from { opacity: .35; transform: scale(.8); }
            to { opacity: 1; transform: scale(1.35); }
          }
          @keyframes novaPulseLine {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -280; }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'pip-storm') {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <MentorPhoto darkness={0.46} />

        {Array.from({ length: 38 }, (_, index) => {
          const left = (index * 19.7) % 100;
          const top = 8 + ((index * 29) % 82);
          const delay = -((index * 0.37) % 8);
          const duration = 5 + ((index * 0.43) % 5);
          const size = 9 + (index % 5) * 2;
          const text = PIP_TEXT[index % PIP_TEXT.length];

          return (
            <span
              key={index}
              className="absolute font-mono font-black whitespace-nowrap nova-pip-storm"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                color: accentColor,
                WebkitTextFillColor: accentColor,
                textShadow: `0 0 8px ${accentColor}`,
                fontSize: `${size}px`,
                opacity: 0.72,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            >
              {text}
            </span>
          );
        })}

        <style jsx>{`
          .nova-pip-storm {
            animation-name: novaPipFloat;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
            animation-direction: alternate;
          }
          @keyframes novaPipFloat {
            from { transform: translate3d(-20px,25px,0) scale(.9); opacity: .25; }
            45% { opacity: .85; }
            to { transform: translate3d(35px,-55px,0) scale(1.12); opacity: .55; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
