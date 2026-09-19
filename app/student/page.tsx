'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission, getNotificationStatus } from '../lib/notifications';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';
import { useSignal } from '../lib/SignalContext';
import SettingsPanel from '../components/SettingsPanel';
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MT5Icon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 3v18h18" strokeLinecap="round" />
    <path d="M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HomeIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ScannerIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 12h2l2-6 3 12 3-9 2 5 2-3h4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettingsIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function StudentDashboard() {
  const { accentColor, font, layout } = useTheme();
  const { isStarted, isConnected, terminalLogs, tradeCount, startRobot, stopRobot, clearLogs } = useSignal();

  const [balance, setBalance] = useState('10133.10');
  const [equity, setEquity] = useState('10134.41');
  const [profit, setProfit] = useState('+1.31');
  const [mentorImage, setMentorImage] = useState<string | null>(null);
  const [mentorVideo, setMentorVideo] = useState<string | null>(null);
  const [mentorName, setMentorName] = useState('ZETAVIA');
  const [mentorTagline, setMentorTagline] = useState('Intelligent, disciplined, and precise forex trading AI');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [smartOpen, setSmartOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [notifLoading, setNotifLoading] = useState(false);

  const getFontFamily = () => {
    const fonts: Record<string, string> = {
      default: 'system-ui',
      orbitron: 'Orbitron, sans-serif',
      audiowide: 'Audiowide, cursive',
      russo: '"Russo One", sans-serif',
      bungee: 'Bungee, cursive',
      blackops: '"Black Ops One", cursive',
      righteous: 'Righteous, cursive',
      bebas: '"Bebas Neue", sans-serif',
      teko: 'Teko, sans-serif',
      saira: '"Saira Stencil One", cursive',
      michroma: 'Michroma, sans-serif',
      bruno: '"Bruno Ace", cursive',
      syncopate: 'Syncopate, sans-serif',
      rubikglitch: '"Rubik Glitch", cursive',
      alexbrush: '"Alex Brush", cursive',
      iceberg: 'Iceberg, cursive',
      wallpoet: 'Wallpoet, cursive',
      megrim: 'Megrim, cursive',
      monoton: 'Monoton, cursive',
    };
    return fonts[font] || 'system-ui';
  };

  useEffect(() => {
    setNotifStatus(getNotificationStatus());
  }, []);

  useEffect(() => {
    const fetchMentorMedia = async () => {
      try {
        const studentData = JSON.parse(localStorage.getItem('student_demo') || '{}');
        const mentorId = studentData.mentorId;
        if (!mentorId) return;

        const mediaDoc = await getDoc(doc(db, 'mentor_media', mentorId));
        if (mediaDoc.exists()) {
          const data = mediaDoc.data();
          if (data.imageUrl) setMentorImage(data.imageUrl);
          if (data.videoUrl) setMentorVideo(data.videoUrl);
          if (data.robotName) setMentorName(data.robotName);
          if (data.robotTagline) setMentorTagline(data.robotTagline);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchMentorMedia();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 15;
      setBalance(prev => (parseFloat(prev) + change).toFixed(2));
      setEquity(prev => (parseFloat(prev) + change * 0.95).toFixed(2));
      const profitVal = (Math.random() * 30 - 10).toFixed(2);
      setProfit((parseFloat(profitVal) >= 0 ? '+' : '') + profitVal);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (!isStarted) {
      startRobot();
      setTerminalOpen(true);
    } else {
      stopRobot();
      setTerminalOpen(false);
    }
  };

  const handleEnableNotifications = async () => {
    setNotifLoading(true);
    await requestNotificationPermission();
    setNotifStatus(getNotificationStatus());
    setNotifLoading(false);
  };

  const handleRemove = () => {
    clearLogs();
    stopRobot();
    setTerminalOpen(false);
    alert('Terminal cleared & robot reset');
  };

  const renderLayout = () => {
    const props = {
      mentorImage,
      mentorName,
      mentorTagline,
      isStarted,
      isConnected,
      terminalLogs,
      onToggle: handleToggle,
      onRemove: handleRemove,
      getFontFamily,
    };

    switch (layout) {
      case 'default': return <DefaultLayout {...props} />;
      case 'matrix': return <MatrixLayout {...props} />;
      case 'crimson': return <CrimsonLayout {...props} />;
      case 'newschool': return <NewSchoolLayout {...props} />;
      case 'phantom': return <PhantomLayout {...props} />;
      case 'navigator': return <NavigatorLayout {...props} />;
      case 'sniper': return <SniperLayout {...props} />;
      case 'nova': return <NovaLayout {...props} />;
      case 'inferno': return <InfernoLayout {...props} />;
      case 'phoenix':
      default:
        return <PhoenixLayout {...props} />;
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      {mentorVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="fixed inset-0 w-full h-full object-cover z-0"
          src={mentorVideo}
        />
      ) : mentorImage ? (
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${mentorImage})` }} />
      ) : (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-red-900/40 via-black to-black" />
      )}

      <div className="fixed inset-0 bg-black/75 z-0" />

      <div className="relative z-10">
        <header
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.6)', borderBottom: `1px solid ${accentColor}30` }}
        >
          <div className="text-lg font-black tracking-wider" style={{ color: accentColor, textShadow: `0 0 15px ${accentColor}80` }}>
            NOVA EA
          </div>
          <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? '● VPS Connected' : '● VPS Offline'}
          </span>
        </header>

        <div className="pt-20 pb-32 px-4 max-w-md mx-auto">
          {renderLayout()}

          {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
            <div className="mt-6">
              <button
                onClick={handleEnableNotifications}
                disabled={notifLoading}
                className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                  border: `1.5px solid ${accentColor}`,
                  color: accentColor,
                  boxShadow: `0 0 25px ${accentColor}60`,
                }}
              >
                <BellIcon color={accentColor} />
                {notifLoading ? 'ENABLING...' : 'ENABLE NOTIFICATIONS'}
              </button>
              <p className="text-center text-[10px] text-white/40 mt-2">
                Get alerts when a signal fires even when app is closed
              </p>
            </div>
          )}

          {notifStatus === 'granted' && (
            <div className="mt-6 p-3 rounded-xl text-center" style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}40` }}>
              <p className="text-xs font-bold" style={{ color: accentColor }}>
                🔔 NOTIFICATIONS ENABLED
              </p>
            </div>
          )}
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${accentColor}30` }}
        >
          <button onClick={() => setSmartOpen(true)} className="flex flex-col items-center py-2 flex-1">
            <SmartIcon color="rgba(255,255,255,0.4)" />
            <span className="text-[9px] mt-1 tracking-wider text-white/40">SMART</span>
          </button>

          <Link href="/student/metatrader" className="flex flex-col items-center py-2 flex-1">
            <MT5Icon color="rgba(255,255,255,0.4)" />
            <span className="text-[9px] mt-1 tracking-wider text-white/40">MT5</span>
          </Link>

          <Link href="/student" className="flex flex-col items-center flex-1 relative">
            <div
              className="w-14 h-14 rounded-full -mt-6 flex items-center justify-center"
              style={{ background: '#000', border: `2px solid ${accentColor}`, boxShadow: `0 0 20px ${accentColor}` }}
            >
              <HomeIcon color={accentColor} />
            </div>
            <span className="text-[9px] tracking-wider mt-0.5" style={{ color: accentColor }}>HOME</span>
          </Link>

          <Link href="/student" className="flex flex-col items-center py-2 flex-1">
            <ScannerIcon color="rgba(255,255,255,0.4)" />
            <span className="text-[9px] mt-1 tracking-wider text-white/40">SCANNER</span>
          </Link>

          <button onClick={() => setSettingsOpen(true)} className="flex flex-col items-center py-2 flex-1">
            <SettingsIcon color="rgba(255,255,255,0.4)" />
            <span className="text-[9px] mt-1 tracking-wider text-white/40">SETTINGS</span>
          </button>
        </div>
      </div>

      <FloatingTerminal
        isOpen={terminalOpen && isStarted}
        onClose={() => setTerminalOpen(false)}
        logs={terminalLogs}
        mentorName={mentorName}
        accentColor={accentColor}
      />

      {isStarted && !terminalOpen && (
        <button
          onClick={() => setTerminalOpen(true)}
          className="fixed bottom-24 right-4 z-[75] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition hover:scale-105 active:scale-95"
          style={{
            background: accentColor,
            color: '#000',
            boxShadow: `0 0 25px ${accentColor}, 0 0 50px ${accentColor}60`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          Open Terminal
        </button>
      )}

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SmartScreen isOpen={smartOpen} onClose={() => setSmartOpen(false)} />
    </div>
  );
}