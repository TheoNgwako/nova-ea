export default function MobileAccess() {
  return (
    <section className="py-24 px-4 bg-black border-t border-red-500/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 border border-red-500/30 rounded-full text-red-400 text-xs tracking-widest mb-4 glow-red">
            MOBILE ACCESS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-white">Get NOVA EA on your </span>
            <span className="text-red-500 text-glow-red">device.</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Run everything from your phone — install the Android build or add the iOS web app to your home screen in under a minute.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="p-8 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <div className="text-5xl mb-4 text-red-500"></div>
            <h3 className="text-2xl font-bold text-white mb-2">Android</h3>
            <p className="text-gray-400 text-sm mb-6">Install the app</p>
            <p className="text-gray-500 text-sm mb-6">
              Tap the button below to get the NOVA EA app, then sign in with your Mentor ID and licence key.
            </p>
            <button className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 glow-red transition">
              Download Android
            </button>
          </div>

          <div className="p-8 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <div className="text-5xl mb-4 text-red-500"></div>
            <h3 className="text-2xl font-bold text-white mb-2">iOS</h3>
            <p className="text-gray-400 text-sm mb-6">Add to Home Screen</p>
            <ol className="text-gray-400 text-sm space-y-3 text-left list-decimal list-inside">
              <li>Open nova-ea.com in Safari.</li>
              <li>Tap the Share button at the bottom.</li>
              <li>Scroll and tap Add to Home Screen.</li>
              <li>Tap Add in the top right to confirm.</li>
              <li>Launch the icon — it opens full screen, like a native app.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}