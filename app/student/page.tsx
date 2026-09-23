'use client';

import { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  getNotificationStatus,
} from '../lib/notifications';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';
import { useSignal } from '../lib/SignalContext';
import SettingsPanel from '../components/SettingsPanel';
import BackgroundAnimation, {
  type BackgroundAnimationType,
} from '../components/BackgroundAnimation';
import FloatingTerminal from '../components/FloatingTerminal';
import SmartScreen from '../components/SmartScreen';

import PhoenixLayout from '../components/layouts/PhoenixLayout';
import NovaLayout from '../components/layouts/NovaLayout';
import InfernoLayout from '../components/layouts/InfernoLayout';
import DefaultLayout from '../components/layouts/DefaultLayout';
import MatrixLayout from '../components/layouts/MatrixLayout';
import CrimsonLayout from '../components/layouts/CrimsonLayout';
import NewSchoolLayout from '../components/layouts/NewSchoolLayout';
import PhantomLayout from '../components/layouts/PhantomLayout';
import NavigatorLayout from '../components/layouts/NavigatorLayout';
import SniperLayout from '../components/layouts/SniperLayout';

const SmartIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path
      d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MT5Icon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path
      d="M3 3v18h18"
      strokeLinecap="round"
    />
    <path
      d="M7 14l4-4 3 3 5-6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HomeIcon = ({ color }: { color: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path
      d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 22V12h6v10" />
  </svg>
);

const ScannerIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path
      d="M3 12h2l2-6 3 12 3-9 2 5 2-3h4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function StudentDashboard() {


  const {
    accentColor,
    font,
    layout,
  } = useTheme();

const {
  isStarted,
  isConnected,
  tradingMode,
  maxAutoTrades,
  terminalLogs,
  tradeCount,
  startRobot,
  stopRobot,
  setTradingMode,
  setMaxAutoTrades,
  clearLogs,
} = useSignal();
  /*
   * These values are still the existing
   * dashboard demo values.
   *
   * We will replace them with real MT5
   * account information when the EA bridge
   * is implemented.
   */
  const [balance, setBalance] =
    useState('10133.10');

  const [equity, setEquity] =
    useState('10134.41');

  const [profit, setProfit] =
    useState('+1.31');

  const [
    mentorImage,
    setMentorImage,
  ] =
    useState<string | null>(
      null
    );

  const [
    mentorVideo,
    setMentorVideo,
  ] =
    useState<string | null>(
      null
    );

  const [
    mentorName,
    setMentorName,
  ] =
    useState('ZETAVIA');

  const [
    mentorTagline,
    setMentorTagline,
  ] = useState(
    'Intelligent, disciplined, and precise forex trading AI'
  );

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [
    smartOpen,
    setSmartOpen,
  ] = useState(false);

  const [
    terminalOpen,
    setTerminalOpen,
  ] = useState(false);

  const [
    notifStatus,
    setNotifStatus,
  ] = useState<
    | 'granted'
    | 'denied'
    | 'default'
    | 'unsupported'
  >('default');

  const [
    notifLoading,
    setNotifLoading,
  ] = useState(false);

  const [
    backgroundAnimation,
    setBackgroundAnimation,
  ] =
    useState<BackgroundAnimationType>(
      'none'
    );

  const getFontFamily = () => {
    const fonts: Record<
      string,
      string
    > = {
      default: 'system-ui',
      orbitron:
        'Orbitron, sans-serif',
      audiowide:
        'Audiowide, cursive',
      russo:
        '"Russo One", sans-serif',
      bungee:
        'Bungee, cursive',
      blackops:
        '"Black Ops One", cursive',
      righteous:
        'Righteous, cursive',
      bebas:
        '"Bebas Neue", sans-serif',
      teko:
        'Teko, sans-serif',
      saira:
        '"Saira Stencil One", cursive',
      michroma:
        'Michroma, sans-serif',
      bruno:
        '"Bruno Ace", cursive',
      syncopate:
        'Syncopate, sans-serif',
      rubikglitch:
        '"Rubik Glitch", cursive',
      alexbrush:
        '"Alex Brush", cursive',
      iceberg:
        'Iceberg, cursive',
      wallpoet:
        'Wallpoet, cursive',
      megrim:
        'Megrim, cursive',
      monoton:
        'Monoton, cursive',
    };

    return (
      fonts[font] ||
      'system-ui'
    );
  };

  useEffect(() => {
    setNotifStatus(
      getNotificationStatus()
    );
  }, []);

  useEffect(() => {
    const loadAnimation =
      () => {
        const saved =
          (localStorage.getItem(
            'nova_background_animation'
          ) as
            | BackgroundAnimationType
            | null) ||
          'none';

        setBackgroundAnimation(
          saved
        );
      };

    loadAnimation();

    const handleAnimationChange =
      (event: Event) => {
        const customEvent =
          event as CustomEvent<BackgroundAnimationType>;

        setBackgroundAnimation(
          customEvent.detail
        );
      };

    window.addEventListener(
      'nova-background-animation-change',
      handleAnimationChange
    );

    window.addEventListener(
      'storage',
      loadAnimation
    );

    return () => {
      window.removeEventListener(
        'nova-background-animation-change',
        handleAnimationChange
      );

      window.removeEventListener(
        'storage',
        loadAnimation
      );
    };
  }, []);

  useEffect(() => {
    const fetchMentorMedia =
      async () => {
        try {
          const studentData =
            JSON.parse(
              localStorage.getItem(
                'student_demo'
              ) || '{}'
            );

          const mentorId =
            studentData.mentorId;

          if (!mentorId) {
            return;
          }

          const mediaDoc =
            await getDoc(
              doc(
                db,
                'mentor_media',
                mentorId
              )
            );

          if (
            mediaDoc.exists()
          ) {
            const data =
              mediaDoc.data();

            if (
              data.imageUrl
            ) {
              setMentorImage(
                data.imageUrl
              );
            }

            if (
              data.videoUrl
            ) {
              setMentorVideo(
                data.videoUrl
              );
            }

            if (
              data.robotName
            ) {
              setMentorName(
                data.robotName
              );
            }

            if (
              data.robotTagline
            ) {
              setMentorTagline(
                data.robotTagline
              );
            }
          }
        } catch (error) {
          console.error(
            'Error:',
            error
          );
        }
      };

    fetchMentorMedia();
  }, []);


const handleToggle = async () => {
  if (!isStarted) {
    await startRobot();
  } else {
    await stopRobot();
    setTerminalOpen(false);
  }
};

  const handleEnableNotifications =
    async () => {
      setNotifLoading(true);

      await requestNotificationPermission();

      setNotifStatus(
        getNotificationStatus()
      );

      setNotifLoading(false);
    };

const handleRemove = async () => {
  await stopRobot();

  clearLogs();
  setTerminalOpen(false);

  alert(
    'Terminal cleared & robot reset'
  );
};
  const renderLayout = () => {
    const props = {
      mentorImage,
      mentorName,
      mentorTagline,
      isStarted,
      isConnected,
      terminalLogs,
      onToggle:
        handleToggle,
      onRemove:
        handleRemove,
      getFontFamily,
    };

    switch (layout) {
      case 'default':
        return (
          <DefaultLayout
            {...props}
          />
        );

      case 'matrix':
        return (
          <MatrixLayout
            {...props}
          />
        );

      case 'crimson':
        return (
          <CrimsonLayout
            {...props}
          />
        );

      case 'newschool':
        return (
          <NewSchoolLayout
            {...props}
          />
        );

      case 'phantom':
        return (
          <PhantomLayout
            {...props}
          />
        );

      case 'navigator':
        return (
          <NavigatorLayout
            {...props}
          />
        );

      case 'sniper':
        return (
          <SniperLayout
            {...props}
          />
        );

      case 'nova':
        return (
          <NovaLayout
            {...props}
          />
        );

      case 'inferno':
        return (
          <InfernoLayout
            {...props}
          />
        );

      case 'phoenix':
      default:
        return (
          <PhoenixLayout
            {...props}
          />
        );
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* BACKGROUND */}
      {backgroundAnimation ===
      'none' ? (
        <>
          {mentorImage ? (
            <div
              className="fixed inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  `url(${mentorImage})`,
              }}
            />
          ) : (
            <div
              className="fixed inset-0 z-0"
              style={{
                background:
                  `radial-gradient(circle at 50% 30%, ${accentColor}30 0%, #000000 65%)`,
              }}
            />
          )}

          <div className="fixed inset-0 bg-black/75 z-0" />
        </>
      ) : (
        <BackgroundAnimation
          type={
            backgroundAnimation
          }
          accentColor={
            accentColor
          }
          mentorImage={
            mentorImage
          }
          mentorVideo={
            mentorVideo
          }
        />
      )}

      <div className="relative z-10">
        {/* HEADER */}
        <header
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between backdrop-blur-md"
          style={{
            background:
              'rgba(0,0,0,0.6)',
            borderBottom:
              `1px solid ${accentColor}30`,
          }}
        >
          <div
            className="text-lg font-black tracking-wider"
            style={{
              color:
                accentColor,
              textShadow:
                `0 0 15px ${accentColor}80`,
            }}
          >
            PIXEL FORGE
          </div>

          <span
            className={`text-xs ${
              isConnected
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {isConnected
              ? '● VPS Connected'
              : '● VPS Offline'}
          </span>
        </header>

        <div className="pt-20 pb-32 px-4 max-w-md mx-auto">
          {renderLayout()}
{/* TRADING MODE */}
<div
  className="mt-6 p-4 rounded-2xl"
  style={{
    background:
      'rgba(0,0,0,0.65)',

    border:
      `1px solid ${accentColor}50`,

    boxShadow:
      `0 0 25px ${accentColor}15`,
  }}
>
  {/* HEADER */}
  <div className="flex items-center justify-between mb-3">
    <div>
      <p
        className="text-xs font-black tracking-wider"
        style={{
          color: '#ffffff',

          WebkitTextFillColor:
            '#ffffff',
        }}
      >
        TRADING MODE
      </p>

      <p
        className="text-[10px] mt-1"
        style={{
          color:
            'rgba(255,255,255,0.65)',

          WebkitTextFillColor:
            'rgba(255,255,255,0.65)',
        }}
      >
        Choose how PIXEL FORGE
        handles new signals
      </p>
    </div>

    <span
      className="text-[10px] font-black"
      style={{
        color:
          accentColor,

        WebkitTextFillColor:
          accentColor,
      }}
    >
      {tradingMode}
    </span>
  </div>


  {/* MANUAL / AUTO */}
  <div className="grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() =>
        setTradingMode(
          'MANUAL'
        )
      }
      className="py-3 rounded-xl text-xs font-black transition active:scale-95"
      style={{
        background:
          tradingMode ===
          'MANUAL'
            ? '#f2f2f2'
            : 'rgba(255,255,255,0.06)',

        color:
          tradingMode ===
          'MANUAL'
            ? '#000000'
            : '#ffffff',

        WebkitTextFillColor:
          tradingMode ===
          'MANUAL'
            ? '#000000'
            : '#ffffff',

        border:
          tradingMode ===
          'MANUAL'
            ? `1px solid ${accentColor}`
            : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      MANUAL
    </button>


    <button
      type="button"
      onClick={() =>
        setTradingMode(
          'AUTO'
        )
      }
      className="py-3 rounded-xl text-xs font-black transition active:scale-95"
      style={{
        background:
          tradingMode ===
          'AUTO'
            ? '#f2f2f2'
            : 'rgba(255,255,255,0.06)',

        color:
          tradingMode ===
          'AUTO'
            ? '#000000'
            : '#ffffff',

        WebkitTextFillColor:
          tradingMode ===
          'AUTO'
            ? '#000000'
            : '#ffffff',

        border:
          tradingMode ===
          'AUTO'
            ? `1px solid ${accentColor}`
            : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      AUTO
    </button>
  </div>


  {/* AUTO SETTINGS */}
  {tradingMode ===
  'AUTO' ? (
    <div className="mt-4">
      <p
        className="text-[10px] leading-relaxed"
        style={{
          color:
            'rgba(255,255,255,0.75)',

          WebkitTextFillColor:
            'rgba(255,255,255,0.75)',
        }}
      >
        AUTO allows the paired
        PIXEL FORGE MT5 EA to
        execute approved signals
        automatically.
      </p>


      {/* MAX AUTO TRADES */}
      <div
        className="mt-4 p-4 rounded-xl"
        style={{
          background:
            'rgba(255,255,255,0.06)',

          border:
            '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-black tracking-wider"
              style={{
                color:
                  '#ffffff',

                WebkitTextFillColor:
                  '#ffffff',
              }}
            >
              AUTO TRADES
            </p>

            <p
              className="text-[9px] mt-1"
              style={{
                color:
                  'rgba(255,255,255,0.6)',

                WebkitTextFillColor:
                  'rgba(255,255,255,0.6)',
              }}
            >
              Maximum simultaneous
              PIXEL FORGE positions
            </p>
          </div>

          <span
            className="text-2xl font-black"
            style={{
              color:
                accentColor,

              WebkitTextFillColor:
                accentColor,
            }}
          >
            {maxAutoTrades}
          </span>
        </div>


        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={
            maxAutoTrades
          }
          onChange={event => {
            void setMaxAutoTrades(
              Number(
                event.target.value
              )
            );
          }}
          className="w-full mt-4"
          style={{
            accentColor:
              accentColor,
          }}
        />


        <div
          className="flex justify-between mt-1 text-[9px]"
          style={{
            color:
              'rgba(255,255,255,0.65)',

            WebkitTextFillColor:
              'rgba(255,255,255,0.65)',
          }}
        >
          <span>0</span>

          <span>10</span>
        </div>


        <p
          className="text-[10px] mt-3 leading-relaxed"
          style={{
            color:
              maxAutoTrades ===
              0
                ? '#facc15'
                : '#ffffff',

            WebkitTextFillColor:
              maxAutoTrades ===
              0
                ? '#facc15'
                : '#ffffff',
          }}
        >
          {maxAutoTrades ===
          0
            ? 'AUTO entries are disabled. No new trades will be opened.'
            : `PIXEL FORGE may keep up to ${maxAutoTrades} AUTO trade${maxAutoTrades === 1 ? '' : 's'} open at the same time.`}
        </p>
      </div>


      <p
        className="text-[9px] mt-3"
        style={{
          color:
            'rgba(255,255,255,0.55)',

          WebkitTextFillColor:
            'rgba(255,255,255,0.55)',
        }}
      >
        A higher limit does not
        automatically create trades.
        A valid signal must still
        pass the execution and risk
        checks.
      </p>
    </div>
  ) : (
    <div className="mt-3">
      <p
        className="text-[10px] leading-relaxed"
        style={{
          color:
            'rgba(255,255,255,0.75)',

          WebkitTextFillColor:
            'rgba(255,255,255,0.75)',
        }}
      >
        MANUAL sends trading signals
        to you without automatically
        opening MT5 trades.
      </p>

      <p
        className="text-[9px] mt-2"
        style={{
          color:
            'rgba(255,255,255,0.5)',

          WebkitTextFillColor:
            'rgba(255,255,255,0.5)',
        }}
      >
        AUTO TRADES settings only
        apply when AUTO mode is
        selected.
      </p>
    </div>
  )}
</div>
</div>
        {/* BOTTOM NAVIGATION */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2"
          style={{
            background:
              'rgba(0,0,0,0.85)',

            backdropFilter:
              'blur(12px)',

            borderTop:
              `1px solid ${accentColor}30`,
          }}
        >
          <button
            onClick={() =>
              setSmartOpen(true)
            }
            className="flex flex-col items-center py-2 flex-1"
          >
            <SmartIcon color="#ffffff" />

            <span
              className="text-[9px] mt-1 tracking-wider"
              style={{
                color: '#ffffff',
                WebkitTextFillColor:
                  '#ffffff',
              }}
            >
              SMART
            </span>
          </button>

          {/* MT5 - OLD PAGE FOR NOW */}
          <Link
            href="/student/metatrader"
            className="flex flex-col items-center py-2 flex-1"
          >
            <MT5Icon color="#ffffff" />

            <span
              className="text-[9px] mt-1 tracking-wider"
              style={{
                color: '#ffffff',
                WebkitTextFillColor:
                  '#ffffff',
              }}
            >
              MT5
            </span>
          </Link>

          <Link
            href="/student"
            className="flex flex-col items-center flex-1 relative"
          >
            <div
              className="w-14 h-14 rounded-full -mt-6 flex items-center justify-center"
              style={{
                background:
                  '#000',

                border:
                  `2px solid ${accentColor}`,

                boxShadow:
                  `0 0 20px ${accentColor}`,
              }}
            >
              <HomeIcon
                color={
                  accentColor
                }
              />
            </div>

            <span
              className="text-[9px] tracking-wider mt-0.5"
              style={{
                color: '#ffffff',
                WebkitTextFillColor:
                  '#ffffff',
              }}
            >
              HOME
            </span>
          </Link>

          <Link
            href="/student"
            className="flex flex-col items-center py-2 flex-1"
          >
            <ScannerIcon color="#ffffff" />

            <span
              className="text-[9px] mt-1 tracking-wider"
              style={{
                color: '#ffffff',
                WebkitTextFillColor:
                  '#ffffff',
              }}
            >
              SCANNER
            </span>
          </Link>

          <button
            onClick={() =>
              setSettingsOpen(
                true
              )
            }
            className="flex flex-col items-center py-2 flex-1"
          >
            <SettingsIcon color="#ffffff" />

            <span
              className="text-[9px] mt-1 tracking-wider"
              style={{
                color: '#ffffff',
                WebkitTextFillColor:
                  '#ffffff',
              }}
            >
              SETTINGS
            </span>
          </button>
        </div>
      </div>

      {/* FLOATING TERMINAL */}
      <FloatingTerminal
        isOpen={
          terminalOpen &&
          isStarted
        }
        onClose={() =>
          setTerminalOpen(
            false
          )
        }
        logs={terminalLogs}
        mentorName={
          mentorName
        }
        accentColor={
          accentColor
        }
      />

      {/* REOPEN TERMINAL */}
      {isStarted &&
        !terminalOpen && (
          <button
            onClick={() =>
              setTerminalOpen(
                true
              )
            }
            className="fixed bottom-24 right-4 z-[75] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition hover:scale-105 active:scale-95"
            style={{
              background:
                accentColor,

              color: '#000',

              boxShadow:
                `0 0 25px ${accentColor}, 0 0 50px ${accentColor}60`,
            }}
          >
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />

            Open Terminal
          </button>
        )}

      <SettingsPanel
        isOpen={
          settingsOpen
        }
        onClose={() =>
          setSettingsOpen(
            false
          )
        }
      />

      <SmartScreen
        isOpen={
          smartOpen
        }
        onClose={() =>
          setSmartOpen(
            false
          )
        }
      />
    </div>
  );
}