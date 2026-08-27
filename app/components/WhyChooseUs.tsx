export default function WhyChooseUs() {
  return (
    <section className="py-24 px-4 bg-black border-t border-red-500/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 border border-red-500/30 rounded-full text-red-400 text-xs tracking-widest mb-4 glow-red">
            WHY CHOOSE US
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-white">Why </span>
            <span className="text-red-500 text-glow-red">NOVA EA.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center">
            <div className="text-5xl mb-4 text-red-500">01</div>
            <h3 className="text-xl font-bold text-white mb-3">Advanced AI systems</h3>
            <p className="text-gray-400 text-sm">
              Market analysis driven by structure-aware automation that keeps refining its read as price develops — not a fixed set of rules.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center">
            <div className="text-5xl mb-4 text-red-500">02</div>
            <h3 className="text-xl font-bold text-white mb-3">Secure infrastructure</h3>
            <p className="text-gray-400 text-sm">
              End-to-end encryption, single-use platform-locked license keys and isolated MT4/MT5 sessions per account.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center">
            <div className="text-5xl mb-4 text-red-500">03</div>
            <h3 className="text-xl font-bold text-white mb-3">Optimised performance</h3>
            <p className="text-gray-400 text-sm">
              Built for speed and stability — 99% uptime execution and continuous hosting, whether your phone is on or off.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}