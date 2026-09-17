'use client';

import { useState } from 'react';

export default function AIVoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [response, setResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  const questions = [
    { q: 'how to start trading', a: 'Press the START button on your dashboard to begin receiving trades from the AI.' },
    { q: 'what is my balance', a: 'Your current balance is shown on the dashboard. Check the BALANCE card for real-time updates.' },
    { q: 'how to connect mt5', a: 'Go to the Metatrader tab and enter your account ID, password, and server name. Your credentials are encrypted.' },
    { q: 'what pairs can i trade', a: 'You can trade any pairs your AI supports. Check the PAIRS section to select your preferred symbols.' },
    { q: 'help', a: 'I\'m here to help! You can ask me about trading, connecting your account, or using the app.' },
    { q: 'profit', a: 'Your profit is shown on the dashboard. Green means profit, red means loss.' },
    { q: 'robot', a: 'ZETAVIA AI is your trading robot. It uses advanced algorithms to analyze the markets and execute trades.' },
  ];

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser. Use Chrome or Safari.');
      return;
    }

    setListening(true);
    setProcessing(true);
    setResponse('');

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('You said:', transcript);

      let found = questions.find(q => transcript.includes(q.q));
      if (!found) {
        found = { q: 'default', a: 'I didn\'t understand that. Try asking about trading, balance, or how to connect MT5.' };
      }

      setResponse(found.a);
      setProcessing(false);
      setListening(false);

      const speech = new SpeechSynthesisUtterance(found.a);
      speech.lang = 'en-US';
      speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
    };

    recognition.onerror = () => {
      setListening(false);
      setProcessing(false);
      setResponse('Sorry, I couldn\'t hear you. Please try again.');
    };

    recognition.start();
  };

  return (
    <div className="bg-black/50 border border-red-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">AI Voice Assistant</h3>
          <p className="text-xs text-gray-400">Tap to ask about your bot</p>
        </div>
        <button
          onClick={handleVoice}
          disabled={listening || processing}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition ${
            listening ? 'bg-red-600 animate-pulse' : 'bg-red-600/50 hover:bg-red-600'
          }`}
        >
          🎤
        </button>
      </div>

      {processing && (
        <div className="flex items-center justify-center py-2">
          <div className="spinner-red w-6 h-6"></div>
          <span className="text-gray-400 text-sm ml-3">Listening...</span>
        </div>
      )}

      {response && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2">
          <p className="text-gray-300 text-sm">{response}</p>
        </div>
      )}
    </div>
  );
}