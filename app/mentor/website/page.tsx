import MentorLayout from '../components/MentorLayout';

export default function Website() {
  return (
    <MentorLayout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-2">Website</h1>
        <p className="text-gray-400 text-sm mb-6">Create a public sales page for your trading robot</p>

        <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            ⚠️ Website is a Tier 1 perk. Reach <strong>10 active subscribers</strong> to unlock your public sales page.
          </p>
          <p className="text-gray-400 text-sm mt-2">Active subscribers: 0 / 10</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Robot Name</label>
            <input
              type="text"
              placeholder="e.g. Gold Scalper Pro"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              disabled
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">Tagline</label>
            <input
              type="text"
              placeholder="e.g. High-precision gold trading bot"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              disabled
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-gray-400 text-sm block mb-2">Colour Theme</label>
          <div className="flex flex-wrap gap-3">
            {['Red', 'Blue', 'Green', 'Purple', 'Orange', 'Gold', 'Cyber', 'Neon'].map((color) => (
              <button
                key={color}
                className="px-4 py-2 border border-red-500/20 rounded-lg text-gray-400 text-sm hover:border-red-500 hover:text-red-400 transition disabled:opacity-50"
                disabled
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 border border-red-500/20 rounded-xl bg-black/30 text-center">
          <p className="text-gray-500 text-sm">🔒 Unlock at 10 active subscribers</p>
        </div>
      </div>
    </MentorLayout>
  );
}