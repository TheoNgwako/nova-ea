export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-black via-red-950/5 to-black border-t border-red-500/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 border border-red-500/30 rounded-full text-red-400 text-xs tracking-widest mb-4 glow-red">
            GET STARTED
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-white">How it </span>
            <span className="text-red-500 text-glow-red">works</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            A private server you reach from your phone or tablet, hosting your Expert Advisors so they run continuously — independent of your device.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center relative">
            <div className="text-5xl mb-4 text-red-500">📲</div>
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Get the app</h3>
            <p className="text-gray-400 text-sm mt-2">Download NOVA EA for Android or add the iOS web app to your home screen — setup takes under a minute.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center relative">
            <div className="text-5xl mb-4 text-red-500">🔑</div>
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Activate your key</h3>
            <p className="text-gray-400 text-sm mt-2">Enter your Mentor ID and licence key. Each key is single-use and locked to your platform.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center relative">
            <div className="text-5xl mb-4 text-red-500">🔗</div>
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Connect MT4/MT5</h3>
            <p className="text-gray-400 text-sm mt-2">Link your broker account in the app. Your EA is hosted on our servers, not on your phone.</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition text-center relative">
            <div className="text-5xl mb-4 text-red-500">🚀</div>
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">
              4
            </div>
            <h3 className="text-lg font-bold text-white">Trade on autopilot</h3>
            <p className="text-gray-400 text-sm mt-2">Your EA reads market structure and executes 24/7, reporting every entry, stop and target.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full glow-red"></span> Accurate execution
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full glow-red"></span> 99% uptime execution
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full glow-red"></span> MT4 & MT5 supported
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full glow-red"></span> Unlimited access
          </span>
        </div>
      </div>
    </section>
  );
}