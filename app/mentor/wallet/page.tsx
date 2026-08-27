import MentorLayout from '../components/MentorLayout';

export default function Wallet() {
  return (
    <MentorLayout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-gray-400 text-sm mb-6">Manage your earnings and withdrawals</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <p className="text-gray-400 text-sm">Available Balance</p>
            <p className="text-4xl font-bold text-green-500 mt-1">R0.00</p>
            <button className="mt-4 px-6 py-2 border border-red-500/50 rounded-lg text-red-400 text-sm hover:bg-red-500/10 glow-red transition">
              Request Withdrawal
            </button>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 glow-red hover:glow-red transition">
            <p className="text-gray-400 text-sm">Account Status</p>
            <p className="text-yellow-500 font-bold mt-1">Pending Verification</p>
            <p className="text-gray-500 text-xs mt-2">Verify your details to unlock withdrawals</p>
          </div>
        </div>

        <div className="border border-red-500/20 rounded-xl p-6 bg-black/30">
          <h3 className="text-white font-bold mb-4">Transaction History</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-red-500/10 pb-3">
              <span className="text-green-500">+ R0.00</span>
              <span className="text-gray-400">No transactions yet</span>
              <span className="text-gray-600 text-sm">—</span>
            </div>
          </div>
        </div>
      </div>
    </MentorLayout>
  );
}