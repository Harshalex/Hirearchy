function StatCard({ title, value, change, icon }) {
  return (
    <div className="flex-1 bg-white rounded-md shadow-md p-5 flex flex-col items-center min-w-[170px] border border-gray-100">
      <div className="flex items-center gap-2 text-gray-500 mb-2 text-base">{icon}<span>{title}</span></div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-600 font-bold' : 'text-gray-500'}`}>{change}</div>
    </div>
  );
}

export default StatCard; 