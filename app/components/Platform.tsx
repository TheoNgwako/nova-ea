export default function Platform() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-red-950/5 to-black border-t border-red-500/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 border border-red-500/30 rounded-full text-red-400 text-xs tracking-widest mb-4 glow-red">
            THE PLATFORM
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-white">Built for </span>
            <span className="text-red-500 text-glow-red">performance.</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            An automated trading ecosystem engineered for speed, precision and uptime — so opportunities get executed the moment they appear.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center">
            <div className="text-4xl mb-3 text-red-500">⚡</div>
            <h3 className="text-lg font-bold text-white">Fast execution</h3>
            <p className="text-gray-400 text-sm mt-2">Ultra-low latency order routing that fires on real-time market conditions.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center">
            <div className="text-4xl mb-3 text-red-500">🤖</div>
            <h3 className="text-lg font-bold text-white">AI automation</h3>
            <p className="text-gray-400 text-sm mt-2">Smart Trade reads structure and adapts its bias as the market shifts.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center">
            <div className="text-4xl mb-3 text-red-500">📊</div>
            <h3 className="text-lg font-bold text-white">Smart analytics</h3>
            <p className="text-gray-400 text-sm mt-2">Chart Scanner returns entry, stop loss, take profit and confidence instantly.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center">
            <div className="text-4xl mb-3 text-red-500">🔒</div>
            <h3 className="text-lg font-bold text-white">Secure infrastructure</h3>
            <p className="text-gray-400 text-sm mt-2">Encrypted sessions, platform-locked keys and hardened hosting.</p>
          </div>
        </div>
      </div>
    </section>
  );
}