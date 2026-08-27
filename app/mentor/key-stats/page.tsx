import MentorLayout from '../components/MentorLayout';

export default function KeyStats() {
  return (
    <MentorLayout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-2">Key Stats</h1>
        <p className="text-gray-400 text-sm mb-6">License key performance overview</p>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <p className="text-gray-400 text-sm">Total Keys</p>
            <p className="text-3xl font-bold text-white mt-1">0</p>
          </div>
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <p className="text-gray-400 text-sm">Active Subscriptions</p>
            <p className="text-3xl font-bold text-green-500 mt-1">0</p>
          </div>
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <p className="text-gray-400 text-sm">Expired</p>
            <p className="text-3xl font-bold text-red-500 mt-1">0</p>
          </div>
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <p className="text-gray-400 text-sm">Activation Rate</p>
            <p className="text-3xl font-bold text-white mt-1">0%</p>
          </div>
        </div>

        <div className="border border-red-500/20 rounded-xl p-6 bg-black/30">
          <h3 className="text-white font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-red-500/10 pb-3">
              <span className="text-gray-500">No activity yet</span>
              <span className="text-gray-600 text-sm">—</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">Total keys: 0</p>
        </div>
      </div>
    </MentorLayout>
  );
}