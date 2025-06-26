import React, { useState } from 'react';
import { FaFilter, FaRegBell, FaRegCommentDots, FaRegFileAlt, FaRegLightbulb, FaTag } from 'react-icons/fa';
import { HiOutlineUsers } from 'react-icons/hi';
import TalentFilterDropdown from '../components/TalentFilterDropdown';
import TalentCard from '../components/TalentCard';

const priorities = [
  'Follow up with Sarah',
  'Approve 3 pending candidates',
  'Send 2 contracts today',
];
const notifications = [
  "Michael hasn't replied in 3 days",
  'AI found 5 new UX Designers',
];
const aiAgents = [
  { name: 'Senior Engineer Hunter', candidates: 45, success: 78, status: 'active' },
  { name: 'Product Manager Scout', candidates: 32, success: 85, status: 'active' },
  { name: 'Designer Finder', candidates: 28, success: 72, status: 'paused' },
];
const activity = [
  { text: 'AI found 5 new candidates for Senior Engineer role', time: '2 hours ago' },
  { text: 'Interview scheduled with Sarah Chen', time: '4 hours ago' },
  { text: 'Contract sent to Michael Rodriguez', time: '6 hours ago' },
  { text: 'AI search completed for Product Manager role', time: '8 hours ago' },
];
const selectedTalent = [
  { name: 'Sarah Chen', role: 'Senior Software Engineer', company: 'Google', match: 92 },
  { name: 'Michael Rodriguez', role: 'Product Manager', company: 'Meta', match: 92 },
  { name: 'Emily Johnson', role: 'UX Designer', company: 'Apple', match: 92 },
];

function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(true);
  return (
    <div className="flex w-full gap-6 px-8 py-8 relative">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Top Row: Priorities, Filter, Notifications */}
        <div className="flex gap-6">
          {/* Priorities & Filter */}
          <div className="flex-1 bg-white rounded-md shadow figma-shadow p-6 flex flex-col gap-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <button className="border px-3 py-1 rounded-lg text-sm font-semibold bg-gray-50">Top Priorities</button>
            </div>
            <ul className="text-sm text-gray-700 font-medium list-disc pl-5 space-y-1">
              {priorities.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <div className="flex items-center gap-2 mt-2">
              <FaFilter className="text-gray-400" />
              <span className="text-gray-500 text-sm font-semibold">Filter by:</span>
              <select className="border rounded-lg px-3 py-1 text-sm ml-2 min-w-[120px]">
                <option>All Rolls</option>
                <option>Engineer</option>
                <option>Designer</option>
                <option>Product Manager</option>
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold text-xs">Engineer</button>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-bold text-xs">Designer</button>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-bold text-xs">Product Manager</button>
            </div>
          </div>
          {/* Notifications Popup */}
          {showNotifications && (
            <div className="w-[350px] bg-white rounded-md shadow figma-shadow p-6 border border-gray-100 relative ml-2">
              <button className="absolute top-4 right-4 text-gray-400 text-xl font-bold" onClick={() => setShowNotifications(false)}>&times;</button>
              <div className="font-bold text-xl mb-4">Notifications</div>
              <ul className="text-base text-gray-800 space-y-3">
                {notifications.map((n, i) => <li key={i}>&quot;{n}&quot;</li>)}
              </ul>
            </div>
          )}
        </div>
        {/* AI Agents Status & Recent Activity */}
        <div className="flex gap-6">
          {/* AI Agents Status */}
          <div className="flex-1 bg-white rounded-md shadow figma-shadow p-6 border border-gray-100">
            <div className="font-bold text-xl mb-4 flex items-center gap-2"><HiOutlineUsers className="text-blue-600" /> AI Agents Status</div>
            <div className="space-y-4">
              {aiAgents.map(agent => (
                <div key={agent.name} className="flex items-center justify-between bg-gray-50 rounded-md px-4 py-3">
                  <div>
                    <div className="font-semibold text-base">{agent.name}</div>
                    <div className="text-xs text-gray-500">{agent.candidates} candidates &nbsp; <span className="font-bold">{agent.success}% success</span></div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{agent.status}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Recent Activity */}
          <div className="flex-1 bg-white rounded-md shadow figma-shadow p-6 border border-gray-100">
            <div className="font-bold text-xl mb-2 flex items-center gap-2"><FaRegBell className="text-blue-600" /> Recent Activity</div>
            <div className="text-gray-400 text-sm mb-4">Latest updates from your recruitment activities</div>
            <ul className="space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 text-base text-gray-800">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-lg text-blue-600"><FaRegLightbulb /></span>
                  <span className="flex-1">{a.text}</span>
                  <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Performance Overview Placeholder */}
        <div className="bg-white rounded-md shadow figma-shadow p-6 border border-gray-100 min-h-[120px] mt-2">
          <div className="font-bold text-xl mb-2">Performance Overview</div>
          <div className="text-gray-400 text-base">(Chart or stats here)</div>
        </div>
      </div>
      {/* Right Sidebar: Select Talent */}
      <div className="w-[350px] flex flex-col gap-4">
        <div className="bg-white rounded-md shadow figma-shadow p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-lg flex items-center gap-2"><HiOutlineUsers className="text-blue-600" /> Select Talent <span className="text-xs font-normal">(3)</span></div>
            <TalentFilterDropdown />
          </div>
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
            {selectedTalent.map((talent, i) => (
              <TalentCard key={talent.name} name={talent.name} role={talent.role} company={talent.company} match={talent.match} />
            ))}
          </div>
        </div>
        <button className="w-full bg-blue-500 text-white font-bold py-3 rounded-md shadow hover:bg-blue-600 transition text-lg mt-2">Bulk Actions</button>
      </div>
    </div>
  );
}

export default Dashboard;
