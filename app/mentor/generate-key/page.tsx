import MentorLayout from '../components/MentorLayout';

export default function GenerateKey() {
  return (
    <MentorLayout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Generate License</h1>
        <p className="text-gray-400 text-sm mb-6">Create a new license key for a client</p>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Client Name</label>
            <input
              type="text"
              placeholder="Enter client name"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Client Email (optional)</label>
            <input
              type="email"
              placeholder="client@email.com"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Select EA</label>
            <select className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white focus:border-red-500 focus:outline-none transition">
              <option value="">Select an EA</option>
              <option value="zetavia">ZETAVIA AI</option>
              <option value="gold">EA Gold Trader</option>
              <option value="scalper">Aggressive Scalper AI</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Plan Duration</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {['Lifetime', '1 Year', '6 Months', '1 Month', '1 Week'].map((plan) => (
                <button
                  key={plan}
                  className="px-3 py-2 border border-red-500/20 rounded-lg text-gray-400 text-sm hover:border-red-500 hover:text-red-400 transition"
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-red-600 rounded-xl text-white font-bold text-lg hover:bg-red-700 glow-red transition mt-4">
            Generate Key
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4">Total keys generated: 0</p>
      </div>
    </MentorLayout>
  );
}