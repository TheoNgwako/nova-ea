export default function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-black border-t border-red-500/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 border border-red-500/30 rounded-full text-red-400 text-xs tracking-widest mb-4 glow-red">
            FEATURES
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-white">Everything you need to </span>
            <span className="text-red-500 text-glow-red">automate.</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            From your first license key to a full client base — the whole toolkit lives in one app.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <div className="text-3xl mb-3 text-red-500">&lt;/&gt;</div>
            <h3 className="text-xl font-bold text-white">No coding required</h3>
            <p className="text-gray-400 text-sm mt-2">Link an Expert Advisor and go live — nothing to compile, nothing to script.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <div className="text-3xl mb-3 text-red-500">📊</div>
            <h3 className="text-xl font-bold text-white">Mentor dashboard</h3>
            <p className="text-gray-400 text-sm mt-2">Issue licence keys, track clients and manage every EA from one clean panel.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <div className="text-3xl mb-3 text-red-500">☁️</div>
            <h3 className="text-xl font-bold text-white">Cloud hosting access</h3>
            <p className="text-gray-400 text-sm mt-2">Your automation runs on our infrastructure — not on your handset.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <div className="text-3xl mb-3 text-red-500">⚡</div>
            <h3 className="text-xl font-bold text-white">Strategy customisation</h3>
            <p className="text-gray-400 text-sm mt-2">Fine-tune pair, timeframe, lot size and strategy signature per session.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <div className="text-3xl mb-3 text-red-500"></div>
            <h3 className="text-xl font-bold text-white">Beginner-friendly setup</h3>
            <p className="text-gray-400 text-sm mt-2">Guided activation takes a new trader from install to live in minutes.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <div className="text-3xl mb-3 text-red-500">💬</div>
            <h3 className="text-xl font-bold text-white">24/7 support</h3>
            <p className="text-gray-400 text-sm mt-2">Real people on Telegram whenever the markets move or setup stalls.</p>
          </div>
        </div>
      </div>
    </section>
  );
}