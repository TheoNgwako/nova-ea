import MentorLayout from '../components/MentorLayout';

export default function ManageEAs() {
  return (
    <MentorLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage EAs</h1>
            <p className="text-gray-400 text-sm">Create and manage your Expert Advisors</p>
          </div>
          <button className="px-6 py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 glow-red transition">
            + Create EA
          </button>
        </div>

        <div className="border border-red-500/20 rounded-xl p-4 mb-4 bg-black/30">
          <p className="text-gray-400 text-sm">Current Tier — 0 EAs · 0/1 used</p>
        </div>

        <div className="border border-red-500/20 rounded-xl p-8 bg-black/30 text-center">
          <p className="text-gray-500">No EAs created yet. Click "Create EA" to get started.</p>
        </div>
      </div>
    </MentorLayout>
  );
}