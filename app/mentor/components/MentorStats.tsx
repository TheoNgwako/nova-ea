export default function MentorStats() {
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
        <p className="text-gray-400 text-sm">Total Licences</p>
        <p className="text-3xl font-bold text-white mt-1">0</p>
        <p className="text-xs text-gray-500 mt-1">All time EA users</p>
      </div>

      <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
        <p className="text-gray-400 text-sm">Active Subscriptions</p>
        <p className="text-3xl font-bold text-green-500 mt-1">0</p>
        <p className="text-xs text-gray-500 mt-1">App users subscribed</p>
      </div>

      <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
        <p className="text-gray-400 text-sm">Total EAs</p>
        <p className="text-3xl font-bold text-white mt-1">0</p>
        <p className="text-xs text-gray-500 mt-1">EAs you are licensing</p>
      </div>

      <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
        <p className="text-gray-400 text-sm">Max Licences</p>
        <p className="text-3xl font-bold text-white mt-1">2,000</p>
        <p className="text-xs text-gray-500 mt-1">Total you can generate</p>
      </div>
    </div>
  );
}