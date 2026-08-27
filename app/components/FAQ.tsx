'use client';

import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is NOVA EA?',
      a: 'NOVA EA is a phone app that trades for you. You pick a robot (EA), connect your trading account, and it keeps trading even when your phone is off.'
    },
    {
      q: 'Do I need to know how to trade?',
      a: 'No. The robot does the trading. You just choose a strategy and watch the results in the app.'
    },
    {
      q: 'Do I need a computer?',
      a: 'No computer needed. Everything runs from your phone — Android or iPhone.'
    },
    {
      q: 'Which trading apps does it work with?',
      a: 'MetaTrader 4 and MetaTrader 5. If your broker uses either one, you\'re good to go.'
    },
    {
      q: 'How do I start?',
      a: 'Download the app, enter the Mentor ID and licence key you were given, link your MT4 or MT5 login, then switch the robot on. It takes a few minutes.'
    },
    {
      q: 'Is my money safe?',
      a: 'Your money stays with your own broker. NOVA EA only sends trades to your account — it never holds or moves your funds.'
    },
    {
      q: 'How do I get support?',
      a: 'Our team is on standby 24/7. Reach us on Telegram for live help, or Instagram for updates and quick questions.'
    }
  ];

  return (
    <section id="faq" className="py-24 px-4 bg-gradient-to-b from-black via-red-950/5 to-black border-t border-red-500/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 border border-red-500/30 rounded-full text-red-400 text-xs tracking-widest mb-4 glow-red">
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-white">Have some </span>
            <span className="text-red-500 text-glow-red">questions?</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-red-500/20 rounded-xl bg-black/50 overflow-hidden glow-red hover:glow-red transition"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:text-red-400 transition"
              >
                <span className="text-white font-medium">{faq.q}</span>
                <span className="text-red-500 text-2xl font-bold ml-4">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-400 text-sm">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}