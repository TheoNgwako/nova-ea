import MentorLayout from '../components/MentorLayout';

export default function CopyTrading() {
  return (
    <MentorLayout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-2">Copy Trading</h1>
        <p className="text-gray-400 text-sm mb-6">Send your trades to all connected clients in real time</p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <p className="text-gray-400 text-sm">Active Subscribers</p>
            <p className="text-3xl font-bold text-green-500 mt-1">0</p>
          </div>
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <p className="text-gray-400 text-sm">Total Signals Sent</p>
            <p className="text-3xl font-bold text-white mt-1">0</p>
          </div>
        </div>

        <div className="border border-red-500/20 rounded-xl p-6 bg-black/30">
          <h3 className="text-white font-bold mb-4">Telegram Integration</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="https://t.me/yourchannel"
              className="flex-1 px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
            />
            <button className="px-6 py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 glow-red transition">
              Connect
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-3">Send trade signals to your Telegram channel automatically</p>
        </div>

        <div className="mt-6 p-4 border border-red-500/20 rounded-xl bg-black/30">
          <p className="text-gray-400 text-sm">⏳ Copy trading is not started. Press START to begin receiving trades.</p>
        </div>
      </div>
    </MentorLayout>
  );
}