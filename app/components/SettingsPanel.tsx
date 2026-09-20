'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';

import { useTheme } from '../context/ThemeContext';
import AccentColorWheel from './AccentColorWheel';
import { auth } from '../lib/firebase';
import {
  getNotificationStatus,
  requestNotificationPermission,
} from '../lib/notifications';

const LAYOUTS = [
  { id: 'default', name: 'Default', desc: 'Default 2-column layout' },
  { id: 'matrix', name: 'Matrix', desc: '3 buttons in row layout' },
  { id: 'phoenix', name: 'Phoenix', desc: '3 pill image cards with overlay' },
  { id: 'crimson', name: 'Crimson', desc: 'Double outline with circle controls' },
  { id: 'newschool', name: 'New School', desc: 'Full mentor portrait with action pills' },
  { id: 'inferno', name: 'Inferno', desc: 'Curved card with split image pills' },
  { id: 'phantom', name: 'Phantom', desc: 'Stealth minimal interface' },
  { id: 'navigator', name: 'Navigator', desc: 'Deep blue glow with pill action bar' },
  { id: 'nova', name: 'Nova', desc: 'Circle portrait with PAIRS / START / LOGS bar' },
  { id: 'sniper', name: 'Sniper', desc: 'Minimal trade-focused layout' },
];

const SHAPES = [
  { id: 'classic', name: 'The Classic', desc: 'Circle Shape Interface' },
  { id: 'halo', name: 'The Halo', desc: 'Large Circle With Glow' },
  { id: 'widescreen', name: 'The Widescreen', desc: 'Stretched Rectangle' },
];

const FONTS = [
  { id: 'default', name: 'Default', family: 'system-ui' },
  { id: 'orbitron', name: 'Orbitron', family: 'Orbitron, sans-serif' },
  { id: 'audiowide', name: 'Audiowide', family: 'Audiowide, cursive' },
  { id: 'russo', name: 'Russo One', family: '"Russo One", sans-serif' },
  { id: 'bungee', name: 'Bungee', family: 'Bungee, cursive' },
  { id: 'blackops', name: 'Black Ops One', family: '"Black Ops One", cursive' },
  { id: 'righteous', name: 'Righteous', family: 'Righteous, cursive' },
  { id: 'bebas', name: 'Bebas Neue', family: '"Bebas Neue", sans-serif' },
  { id: 'teko', name: 'Teko', family: 'Teko, sans-serif' },
  { id: 'saira', name: 'Saira Stencil', family: '"Saira Stencil One", cursive' },
  { id: 'michroma', name: 'Michroma', family: 'Michroma, sans-serif' },
  { id: 'bruno', name: 'Bruno Ace', family: '"Bruno Ace", cursive' },
  { id: 'syncopate', name: 'Syncopate', family: 'Syncopate, sans-serif' },
  { id: 'rubikglitch', name: 'Rubik Glitch', family: '"Rubik Glitch", cursive' },
  { id: 'alexbrush', name: 'Alex Brush', family: '"Alex Brush", cursive' },
  { id: 'iceberg', name: 'Iceberg', family: 'Iceberg, cursive' },
  { id: 'wallpoet', name: 'Wallpoet', family: 'Wallpoet, cursive' },
  { id: 'megrim', name: 'Megrim', family: 'Megrim, cursive' },
  { id: 'monoton', name: 'Monoton', family: 'Monoton, cursive' },
];

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NotificationStatus =
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported';

type Notif = {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entry: string;
  tp: string;
  sl: string;
  confidence: number;
  rsi: number;
  timestamp: string;
};

const WHITE_TEXT: React.CSSProperties = {
  color: '#ffffff',
  WebkitTextFillColor: '#ffffff',
};

export default function SettingsPanel({
  isOpen,
  onClose,
}: SettingsPanelProps) {
  const {
    accentColor,
    layout,
    setLayout,
    font,
    setFont,
    shape,
    setShape,
  } = useTheme();

  const [openSection, setOpenSection] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [notifStatus, setNotifStatus] =
    useState<NotificationStatus>('default');

  const [notifLoading, setNotifLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const loadSignalHistory = () => {
    try {
      const history = JSON.parse(
        localStorage.getItem('notif_history') || '[]'
      );

      if (!Array.isArray(history)) {
        setNotifs([]);
        return;
      }

      const sorted = [...history].sort((a, b) => {
        const aTime = new Date(a.timestamp || 0).getTime();
        const bTime = new Date(b.timestamp || 0).getTime();

        return bTime - aTime;
      });

      setNotifs(sorted.slice(0, 10));
    } catch (error) {
      console.error('Failed to load notification history:', error);
      setNotifs([]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    try {
      const studentData = JSON.parse(
        localStorage.getItem('student_demo') || '{}'
      );

      setEmail(studentData.email || auth.currentUser?.email || '');
    } catch {
      setEmail(auth.currentUser?.email || '');
    }

    setNotifStatus(getNotificationStatus());
    loadSignalHistory();
  }, [isOpen]);

  const handleEnableNotifications = async () => {
    setNotifLoading(true);

    try {
      const token = await requestNotificationPermission();

      setNotifStatus(getNotificationStatus());

      if (!token && getNotificationStatus() !== 'granted') {
        console.log('Notification permission was not enabled.');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setNotifStatus(getNotificationStatus());
    } finally {
      setNotifLoading(false);
    }
  };

  const deleteNotif = (id: string) => {
    try {
      const history = JSON.parse(
        localStorage.getItem('notif_history') || '[]'
      );

      const updated = Array.isArray(history)
        ? history.filter((notif: Notif) => notif.id !== id)
        : [];

      localStorage.setItem(
        'notif_history',
        JSON.stringify(updated)
      );

      loadSignalHistory();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAll = () => {
    if (!window.confirm('Delete all notifications?')) return;

    localStorage.setItem('notif_history', '[]');
    setNotifs([]);
  };

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    localStorage.removeItem('student_logged_in');
    localStorage.removeItem('student_demo');
    localStorage.removeItem('fcm_token');

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase logout error:', error);
    }

    window.location.href = '/student-entry';
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);

      if (Number.isNaN(date.getTime())) {
        return timestamp;
      }

      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getNotificationLabel = () => {
    switch (notifStatus) {
      case 'granted':
        return 'Enabled';

      case 'denied':
        return 'Blocked';

      case 'unsupported':
        return 'Unsupported';

      default:
        return 'Not Enabled';
    }
  };

  const getNotificationDescription = () => {
    switch (notifStatus) {
      case 'granted':
        return 'Signal & execution alerts are enabled';

      case 'denied':
        return 'Notifications are blocked in your browser';

      case 'unsupported':
        return 'Notifications are not supported on this device';

      default:
        return 'Enable alerts for signals & execution';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black/80 z-[100]"
        onClick={onClose}
      />

      {/* Settings panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md z-[101] overflow-y-auto"
        style={{
          background:
            'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 bg-black/95 backdrop-blur-md border-b z-10 flex items-center justify-between px-5 py-4"
          style={{
            borderColor: `${accentColor}30`,
          }}
        >
          <h1
            className="text-2xl font-black tracking-wider"
            style={{
              color: accentColor,
              WebkitTextFillColor: accentColor,
              textShadow: `0 0 20px ${accentColor}80`,
            }}
          >
            SETTINGS
          </h1>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl transition"
            style={{
              borderColor: accentColor,
              color: accentColor,
              WebkitTextFillColor: accentColor,
              boxShadow: `0 0 15px ${accentColor}80`,
            }}
          >
            ✕
          </button>
        </div>

        {/* SETTINGS CONTENT */}
        <div
          className="p-4 space-y-3"
          style={{
            color: '#ffffff',
            WebkitTextFillColor: '#ffffff',
          }}
        >
          {/* Account */}
          <Section
            title="Account"
            icon="●"
            isOpen={openSection === 'account'}
            onToggle={() => toggleSection('account')}
            accentColor={accentColor}
          >
            <div className="pt-2">
              <div
                className="rounded-2xl bg-white/5 px-4 py-4"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5">
                  <span
                    className="text-xs flex-shrink-0"
                    style={WHITE_TEXT}
                  >
                    Email
                  </span>

                  <span
                    className="text-xs font-semibold text-right break-all"
                    style={WHITE_TEXT}
                  >
                    {email || 'Student'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span
                    className="text-xs"
                    style={WHITE_TEXT}
                  >
                    Plan
                  </span>

                  <span
                    className="text-xs font-bold"
                    style={{
                      color: '#22c55e',
                      WebkitTextFillColor: '#22c55e',
                    }}
                  >
                    ● Active
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* Select Main Interface */}
          <Section
            title="Select Main Interface"
            icon="▦"
            isOpen={openSection === 'interface'}
            onToggle={() => toggleSection('interface')}
            accentColor={accentColor}
          >
            <div className="space-y-2 pt-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayout(l.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                    layout === l.id ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  style={{
                    border:
                      layout === l.id
                        ? `1px solid ${accentColor}`
                        : '1px solid rgba(255,255,255,0.05)',
                    boxShadow:
                      layout === l.id
                        ? `0 0 20px ${accentColor}40`
                        : undefined,
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={WHITE_TEXT}
                      >
                        {l.name}
                      </p>

                      <p
                        className="text-xs mt-0.5"
                        style={WHITE_TEXT}
                      >
                        {l.desc}
                      </p>
                    </div>

                    {layout === l.id && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: accentColor }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: '#000000',
                            WebkitTextFillColor: '#000000',
                          }}
                        >
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Select Shape */}
          <Section
            title="Select Shape"
            icon="◯"
            isOpen={openSection === 'shape'}
            onToggle={() => toggleSection('shape')}
            accentColor={accentColor}
          >
            <div className="space-y-2 pt-2">
              {SHAPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                    shape === s.id ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  style={{
                    border:
                      shape === s.id
                        ? `1px solid ${accentColor}`
                        : '1px solid rgba(255,255,255,0.05)',
                    boxShadow:
                      shape === s.id
                        ? `0 0 20px ${accentColor}40`
                        : undefined,
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                  }}
                >
                  <p
                    className="font-bold text-sm"
                    style={WHITE_TEXT}
                  >
                    {s.name}
                  </p>

                  <p
                    className="text-xs mt-0.5"
                    style={WHITE_TEXT}
                  >
                    {s.desc}
                  </p>
                </button>
              ))}
            </div>
          </Section>

          {/* Select Colour */}
          <Section
            title="Select Colour"
            icon="◐"
            isOpen={openSection === 'colour'}
            onToggle={() => toggleSection('colour')}
            accentColor={accentColor}
          >
            <AccentColorWheel />
          </Section>

          {/* Select Font */}
          <Section
            title="Select Font"
            icon="T"
            isOpen={openSection === 'font'}
            onToggle={() => toggleSection('font')}
            accentColor={accentColor}
          >
            <div className="space-y-2 pt-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                    font === f.id ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  style={{
                    border:
                      font === f.id
                        ? `1px solid ${accentColor}`
                        : '1px solid rgba(255,255,255,0.05)',
                    boxShadow:
                      font === f.id
                        ? `0 0 20px ${accentColor}40`
                        : undefined,
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                  }}
                >
                  <p
                    className="text-lg font-bold"
                    style={{
                      fontFamily: f.family,
                      color: '#ffffff',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  >
                    {f.name}
                  </p>

                  <p
                    className="text-xs mt-0.5"
                    style={WHITE_TEXT}
                  >
                    EA Name Font Style
                  </p>
                </button>
              ))}
            </div>
          </Section>

          {/* Notifications */}
          <Section
            title="Notifications"
            icon="◉"
            isOpen={openSection === 'notifications'}
            onToggle={() => toggleSection('notifications')}
            accentColor={accentColor}
          >
            <div className="space-y-3 pt-2">
              {/* Notification permission */}
              <div
                className="rounded-2xl bg-white/5 p-4"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={WHITE_TEXT}
                    >
                      Push Notifications
                    </p>

                    <p
                      className="text-xs mt-1"
                      style={WHITE_TEXT}
                    >
                      {getNotificationDescription()}
                    </p>
                  </div>

                  <span
                    className="text-xs font-bold flex-shrink-0"
                    style={{
                      color:
                        notifStatus === 'granted'
                          ? '#22c55e'
                          : notifStatus === 'denied'
                            ? '#ef4444'
                            : accentColor,
                      WebkitTextFillColor:
                        notifStatus === 'granted'
                          ? '#22c55e'
                          : notifStatus === 'denied'
                            ? '#ef4444'
                            : accentColor,
                    }}
                  >
                    {getNotificationLabel()}
                  </span>
                </div>

                {notifStatus === 'default' && (
                  <button
                    onClick={handleEnableNotifications}
                    disabled={notifLoading}
                    className="w-full mt-4 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50"
                    style={{
                      background: accentColor,
                      color: '#000000',
                      WebkitTextFillColor: '#000000',
                      boxShadow: `0 0 20px ${accentColor}40`,
                    }}
                  >
                    {notifLoading
                      ? 'Enabling...'
                      : 'Enable Notifications'}
                  </button>
                )}

                {notifStatus === 'denied' && (
                  <p
                    className="text-xs mt-3"
                    style={WHITE_TEXT}
                  >
                    Notifications are blocked. Allow notifications
                    for NOVA EA in your browser settings, then
                    reopen this panel.
                  </p>
                )}

                {notifStatus === 'unsupported' && (
                  <p
                    className="text-xs mt-3"
                    style={WHITE_TEXT}
                  >
                    Push notifications are not supported by this
                    browser or device.
                  </p>
                )}
              </div>

              {/* Signal history heading */}
              <div className="flex items-center justify-between px-1 pt-2">
                <div>
                  <p
                    className="font-bold text-sm"
                    style={WHITE_TEXT}
                  >
                    Signal History
                  </p>

                  <p
                    className="text-xs mt-0.5"
                    style={WHITE_TEXT}
                  >
                    Your latest 10 signals
                  </p>
                </div>

                {notifs.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-bold px-3 py-2 rounded-xl"
                    style={{
                      border: '1px solid rgba(239,68,68,0.5)',
                      color: '#ef4444',
                      WebkitTextFillColor: '#ef4444',
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* No signals */}
              {notifs.length === 0 ? (
                <div
                  className="rounded-2xl bg-white/5 p-6 text-center"
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={WHITE_TEXT}
                  >
                    No notifications yet
                  </p>

                  <p
                    className="text-xs mt-2"
                    style={WHITE_TEXT}
                  >
                    Signals will appear here when they fire.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifs.map((notif) => (
                    <div
                      key={notif.id}
                      className="bg-white/5 rounded-2xl p-4 relative"
                      style={{
                        border:
                          notif.action === 'BUY'
                            ? '1px solid rgba(34,197,94,0.35)'
                            : '1px solid rgba(239,68,68,0.35)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span
                            className="font-bold text-sm"
                            style={{
                              color:
                                notif.action === 'BUY'
                                  ? '#22c55e'
                                  : '#ef4444',
                              WebkitTextFillColor:
                                notif.action === 'BUY'
                                  ? '#22c55e'
                                  : '#ef4444',
                            }}
                          >
                            {notif.action} {notif.symbol}
                          </span>

                          <p
                            className="text-[10px] mt-1"
                            style={WHITE_TEXT}
                          >
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteNotif(notif.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition"
                          style={{
                            border:
                              '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            WebkitTextFillColor: '#ffffff',
                          }}
                          aria-label="Delete signal"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div
                          className="rounded-xl bg-black/30 p-2"
                          style={{
                            border:
                              '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <p
                            className="text-[9px]"
                            style={WHITE_TEXT}
                          >
                            ENTRY
                          </p>

                          <p
                            className="text-xs font-mono font-bold mt-1"
                            style={WHITE_TEXT}
                          >
                            {notif.entry}
                          </p>
                        </div>

                        <div
                          className="rounded-xl bg-black/30 p-2"
                          style={{
                            border:
                              '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <p
                            className="text-[9px]"
                            style={WHITE_TEXT}
                          >
                            TP
                          </p>

                          <p
                            className="text-xs font-mono font-bold mt-1"
                            style={{
                              color: '#22c55e',
                              WebkitTextFillColor: '#22c55e',
                            }}
                          >
                            {notif.tp}
                          </p>
                        </div>

                        <div
                          className="rounded-xl bg-black/30 p-2"
                          style={{
                            border:
                              '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <p
                            className="text-[9px]"
                            style={WHITE_TEXT}
                          >
                            SL
                          </p>

                          <p
                            className="text-xs font-mono font-bold mt-1"
                            style={{
                              color: '#ef4444',
                              WebkitTextFillColor: '#ef4444',
                            }}
                          >
                            {notif.sl}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <span
                          className="text-[10px]"
                          style={WHITE_TEXT}
                        >
                          Confidence
                        </span>

                        <span
                          className="text-xs font-bold"
                          style={WHITE_TEXT}
                        >
                          {notif.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Chart Scanner */}
          <button
            className="w-full flex items-center justify-between px-5 py-4 rounded-3xl bg-white/5"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-lg"
                style={{
                  color: accentColor,
                  WebkitTextFillColor: accentColor,
                }}
              >
                ▤
              </span>

              <span
                className="font-semibold text-sm"
                style={WHITE_TEXT}
              >
                Chart Scanner
              </span>
            </div>

            <span style={WHITE_TEXT}>›</span>
          </button>

          {/* Back Animation */}
          <Section
            title="Back Animation"
            icon="◨"
            isOpen={openSection === 'back'}
            onToggle={() => toggleSection('back')}
            accentColor={accentColor}
          >
            <div
              className="pt-3 text-sm"
              style={WHITE_TEXT}
            >
              Background animations coming soon.
            </div>
          </Section>

          {/* Music */}
          <Section
            title="Music"
            icon="♫"
            isOpen={openSection === 'music'}
            onToggle={() => toggleSection('music')}
            accentColor={accentColor}
          >
            <div
              className="pt-3 text-sm"
              style={WHITE_TEXT}
            >
              Music coming soon.
            </div>
          </Section>

          {/* Tokens */}
          <div
            className="w-full flex items-center justify-between px-5 py-4 rounded-3xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,80,200,0.3), rgba(0,40,120,0.5))',
              border: '1px solid rgba(100,150,255,0.3)',
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-2xl"
                style={WHITE_TEXT}
              >
                ⬢
              </span>

              <div>
                <p
                  className="text-xs tracking-wider"
                  style={WHITE_TEXT}
                >
                  TOKENS
                </p>

                <p
                  className="font-bold text-lg"
                  style={WHITE_TEXT}
                >
                  34 available
                </p>
              </div>
            </div>

            <span style={WHITE_TEXT}>›</span>
          </div>

          {/* Live Chart */}
          <button
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-3xl bg-white/5"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
            }}
          >
            <span
              className="text-lg"
              style={{
                WebkitTextFillColor: 'initial',
              }}
            >
              📈
            </span>

            <span
              className="font-semibold text-sm"
              style={WHITE_TEXT}
            >
              Live Chart
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-3xl transition disabled:opacity-50"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.5)',
              color: '#ef4444',
              WebkitTextFillColor: '#ef4444',
              boxShadow: '0 0 20px rgba(239,68,68,0.08)',
            }}
          >
            <span
              className="font-bold text-sm"
              style={{
                color: '#ef4444',
                WebkitTextFillColor: '#ef4444',
              }}
            >
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>

        <div className="h-20" />
      </div>
    </>
  );
}

function Section({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  accentColor,
}: {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-3xl bg-white/5 overflow-hidden transition-all"
      style={{
        border: isOpen
          ? `1px solid ${accentColor}`
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isOpen
          ? `0 0 20px ${accentColor}30`
          : undefined,
        color: '#ffffff',
        WebkitTextFillColor: '#ffffff',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4"
        style={{
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-lg"
            style={{
              color: accentColor,
              WebkitTextFillColor: accentColor,
            }}
          >
            {icon}
          </span>

          <span
            className="font-semibold text-sm"
            style={{
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
            }}
          >
            {title}
          </span>
        </div>

        <span
          className="transition-transform"
          style={{
            color: '#ffffff',
            WebkitTextFillColor: '#ffffff',
            transform: isOpen
              ? 'rotate(180deg)'
              : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className="px-3 pb-3"
          style={{
            color: '#ffffff',
            WebkitTextFillColor: '#ffffff',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}